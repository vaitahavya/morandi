-- Migration: Separate Product Attributes and Variations
-- This migration restructures the product attribute system to properly separate
-- attribute definitions (what attributes exist) from variant attributes (which values each variant has)

-- Step 1: Create the new junction table for variant attributes
CREATE TABLE "product_variant_attributes" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "product_variant_attributes_pkey" PRIMARY KEY ("id")
);

-- Step 2: Add new columns to product_attributes table
-- We'll keep the old columns temporarily for data migration
ALTER TABLE "product_attributes" ADD COLUMN IF NOT EXISTS "values" TEXT;
ALTER TABLE "product_attributes" ADD COLUMN IF NOT EXISTS "display_order" INTEGER DEFAULT 0;
ALTER TABLE "product_attributes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "product_attributes" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Migrate existing product_attributes data
-- Group by product_id and name, collect all values into a JSON array
-- This creates attribute definitions from the old name-value pairs
DO $$
DECLARE
    attr_record RECORD;
    attr_values TEXT[];
    new_id TEXT;
BEGIN
    -- For each unique product_id + name combination, create a new attribute definition
    FOR attr_record IN 
        SELECT DISTINCT product_id, name 
        FROM product_attributes 
        WHERE product_id IS NOT NULL
    LOOP
        -- Collect all values for this attribute
        SELECT ARRAY_AGG(value ORDER BY value) INTO attr_values
        FROM product_attributes
        WHERE product_id = attr_record.product_id AND name = attr_record.name;
        
        -- Generate new ID
        new_id := gen_random_uuid()::TEXT;
        
        -- Insert new attribute definition with values as JSON array
        INSERT INTO product_attributes (id, product_id, name, values, display_order, created_at, updated_at)
        VALUES (
            new_id,
            attr_record.product_id,
            attr_record.name,
            json_build_array(unnest(attr_values))::TEXT,
            0,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Step 4: Migrate variant attributes from JSON string to junction table
-- Parse the attributes JSON from product_variants and create junction records
DO $$
DECLARE
    variant_record RECORD;
    attr_json JSONB;
    attr_key TEXT;
    attr_value TEXT;
    attribute_id TEXT;
BEGIN
    FOR variant_record IN 
        SELECT id, product_id, attributes
        FROM product_variants
        WHERE attributes IS NOT NULL AND attributes != ''
    LOOP
        BEGIN
            -- Parse the attributes JSON
            attr_json := variant_record.attributes::JSONB;
            
            -- For each attribute in the variant
            FOR attr_key, attr_value IN SELECT * FROM jsonb_each_text(attr_json)
            LOOP
                -- Find the corresponding attribute definition
                SELECT id INTO attribute_id
                FROM product_attributes
                WHERE product_id = variant_record.product_id 
                  AND name = attr_key
                LIMIT 1;
                
                -- If attribute definition exists, create junction record
                IF attribute_id IS NOT NULL THEN
                    INSERT INTO product_variant_attributes (id, variant_id, attribute_id, value)
                    VALUES (
                        gen_random_uuid()::TEXT,
                        variant_record.id,
                        attribute_id,
                        attr_value
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        EXCEPTION WHEN OTHERS THEN
            -- Skip variants with invalid JSON
            CONTINUE;
        END;
    END LOOP;
END $$;

-- Step 5: Remove old product_attributes records (the name-value pairs)
-- Keep only the new attribute definitions
DELETE FROM product_attributes 
WHERE values IS NULL OR values = '';

-- Step 6: Update product_attributes constraints
-- Remove the old unique constraint and add the new one
ALTER TABLE "product_attributes" DROP CONSTRAINT IF EXISTS "product_attributes_product_id_name_value_key";
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_name_key" UNIQUE ("product_id", "name");

-- Step 7: Make product_id NOT NULL in product_attributes (since attributes must belong to a product)
ALTER TABLE "product_attributes" ALTER COLUMN "product_id" SET NOT NULL;

-- Step 8: Add foreign key constraints
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_variant_id_fkey" 
    FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_attribute_id_fkey" 
    FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Add unique constraint to prevent duplicate variant-attribute combinations
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_variant_id_attribute_id_key" 
    UNIQUE ("variant_id", "attribute_id");

-- Step 10: Remove the old attributes column from product_variants
ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "attributes";

-- Step 11: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "product_variant_attributes_variant_id_idx" ON "product_variant_attributes"("variant_id");
CREATE INDEX IF NOT EXISTS "product_variant_attributes_attribute_id_idx" ON "product_variant_attributes"("attribute_id");
CREATE INDEX IF NOT EXISTS "product_attributes_product_id_idx" ON "product_attributes"("product_id");
