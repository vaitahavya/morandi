# WooCommerce Integration Guide

## 🛒 Overview

This guide will help you integrate your WooCommerce store with your morandi-ecommerce application. The integration allows you to:

- **Sync Products**: Import all products from WooCommerce to your Supabase database
- **Real-time Updates**: Keep your local database in sync with your WooCommerce store
- **Unified Management**: Manage products from both WooCommerce and your local database

## 🚀 Quick Start

### 1. Get WooCommerce API Credentials

#### Step 1: Access Your WordPress Admin
1. Go to your WordPress admin dashboard
2. Navigate to **WooCommerce** → **Settings** → **Advanced** → **REST API**

#### Step 2: Create API Keys
1. Click **"Add Key"**
2. Fill in the details:
   - **Description**: `morandi-ecommerce-sync`
   - **User**: Select your admin user
   - **Permissions**: Choose **"Read/Write"**
3. Click **"Generate API Key"**
4. **Save the credentials**:
   - **Consumer Key**: `ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Consumer Secret**: `cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Update Environment Variables

Edit your `.env.local` file and add your WooCommerce credentials:

```env
# WooCommerce API
WORDPRESS_API_URL="https://your-wordpress-site.com/wp-json"
WC_CONSUMER_KEY="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WC_CONSUMER_SECRET="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the admin dashboard**:
   - Go to: http://localhost:3001/admin
   - Click **"Test Connection"** to verify your WooCommerce API credentials

3. **Sync your products**:
   - Click **"Sync Products"** to import all products from WooCommerce
   - Monitor the sync progress and results

## 📊 What Gets Synced

### Product Data
- **Basic Info**: Name, description, price, SKU
- **Images**: All product images and galleries
- **Categories**: Product categories and tags
- **Stock Status**: In-stock/out-of-stock status
- **Variations**: Product variations (size, color, etc.)

### Data Transformation
The sync process transforms WooCommerce data to match your Supabase schema:

```typescript
// WooCommerce Product → Supabase Product
{
  id: product.id.toString(),
  name: product.name,
  description: product.description,
  price: parseFloat(product.price),
  images: product.images.map(img => img.src),
  category: product.categories[0]?.name || 'uncategorized',
  tags: product.tags.map(tag => tag.name),
  in_stock: product.stock_status === 'instock'
}
```

## 🔧 API Endpoints

### Test Connection
```bash
GET /api/woocommerce/sync-products
```
Tests the WooCommerce API connection and returns product counts.

### Sync Products
```bash
POST /api/woocommerce/sync-products
```
Imports all products from WooCommerce to your Supabase database.

## 🎛️ Admin Dashboard

Visit http://localhost:3001/admin to access the WooCommerce sync interface:

### Features
- **Connection Testing**: Verify your API credentials
- **Product Sync**: Import all products from WooCommerce
- **Status Monitoring**: Real-time sync status and results
- **Error Handling**: Detailed error messages and troubleshooting

### Usage
1. **Test Connection**: Verify your WooCommerce API credentials
2. **Sync Products**: Import all products to your local database
3. **Monitor Results**: View sync statistics and sample products

## 🔄 Sync Process

### What Happens During Sync
1. **Fetch Products**: Retrieves up to 100 products from WooCommerce
2. **Transform Data**: Converts WooCommerce format to Supabase format
3. **Clear Existing**: Removes old products (optional)
4. **Insert New**: Adds all products to your Supabase database
5. **Report Results**: Returns sync statistics and sample data

### Sync Options
- **Full Sync**: Replaces all existing products
- **Incremental Sync**: Only adds new products (future feature)
- **Selective Sync**: Sync specific categories (future feature)

## 🛠️ Troubleshooting

### Common Issues

#### 1. "WooCommerce credentials not configured"
**Solution**: Update your `.env.local` file with correct credentials

#### 2. "Connection failed"
**Possible causes**:
- Incorrect API URL
- Invalid consumer key/secret
- WordPress site not accessible
- WooCommerce not installed

**Solutions**:
- Verify your WordPress site URL
- Regenerate API keys in WooCommerce
- Check if WooCommerce is installed and activated

#### 3. "Sync failed"
**Possible causes**:
- Network connectivity issues
- Supabase database errors
- Invalid product data

**Solutions**:
- Check your internet connection
- Verify Supabase database is accessible
- Check WooCommerce product data format

### Debug Mode
Enable detailed logging by adding to `.env.local`:
```env
DEBUG="woocommerce:*"
```

## 🔒 Security Considerations

### API Key Security
- **Never commit** API keys to version control
- **Use environment variables** for all credentials
- **Rotate keys regularly** for production use
- **Limit permissions** to read-only if possible

### Data Privacy
- **Product data** is stored in your Supabase database
- **No customer data** is synced (orders, users, etc.)
- **Images** are referenced, not downloaded
- **Pricing** is synced but can be modified locally

## 📈 Production Deployment

### Environment Setup
1. **Update URLs**: Change to production WordPress URL
2. **Secure Keys**: Use production API keys
3. **Database**: Ensure Supabase is properly configured
4. **Monitoring**: Set up error monitoring and logging

### Automated Sync
For production, consider setting up automated sync:
- **Cron jobs** for regular sync
- **Webhooks** for real-time updates
- **Error notifications** for failed syncs

## 🔗 Useful Links

- **WooCommerce REST API**: https://woocommerce.github.io/woocommerce-rest-api-docs/
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ohipggwnmnypiubsbcvu
- **Admin Dashboard**: http://localhost:3001/admin

## 🎯 Next Steps

After setting up WooCommerce integration:

1. **Test the sync** with a few products
2. **Verify data** in your Supabase dashboard
3. **Customize the sync** process if needed
4. **Set up automated sync** for production
5. **Monitor performance** and optimize as needed

---

## 🎉 Success!

Your WooCommerce integration is now ready! You can sync products from your WordPress store to your local database and manage them through your morandi-ecommerce application. 