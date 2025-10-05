import { PrismaClient } from '@prisma/client';

/**
 * Base repository interface defining common CRUD operations
 */
export interface IBaseRepository<T, CreateInput, UpdateInput, WhereInput> {
  create(data: CreateInput): Promise<T>;
  findById(id: string): Promise<T | null>;
  findMany(where?: WhereInput, options?: FindManyOptions): Promise<PaginatedResult<T>>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * Pagination options for findMany operations
 */
export interface FindManyOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Abstract base repository implementing common functionality
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput, WhereInput> 
  implements IBaseRepository<T, CreateInput, UpdateInput, WhereInput> {
  
  constructor(protected prisma: PrismaClient) {}

  abstract create(data: CreateInput): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findMany(where?: WhereInput, options?: FindManyOptions): Promise<PaginatedResult<T>>;
  abstract update(id: string, data: UpdateInput): Promise<T>;
  abstract delete(id: string): Promise<void>;

  /**
   * Helper method to build pagination parameters
   */
  protected buildPaginationOptions(options: FindManyOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Helper method to build orderBy clause
   */
  protected buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
    if (!sortBy) return undefined;
    
    // Handle nested sorting (e.g., 'user.name')
    if (sortBy.includes('.')) {
      const [relation, field] = sortBy.split('.');
      return { [relation]: { [field]: sortOrder } };
    }
    
    return { [sortBy]: sortOrder };
  }

  /**
   * Helper method to calculate pagination metadata
   */
  protected buildPaginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}
