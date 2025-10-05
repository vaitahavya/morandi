import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * User creation input type
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  role?: string;
  phone?: string;
}

/**
 * User update input type
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  role?: string;
  phone?: string;
  emailVerified?: Date | null;
}

/**
 * User filter input type
 */
export interface UserFilters {
  email?: string;
  role?: string;
  name?: string;
  emailVerified?: boolean;
}

/**
 * User repository interface
 */
export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filters?: UserFilters, options?: FindManyOptions): Promise<PaginatedResult<User>>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  verifyEmail(id: string): Promise<User>;
  updatePassword(id: string, newPassword: string): Promise<User>;
  authenticate(email: string, password: string): Promise<User | null>;
}

/**
 * User repository implementation
 */
export class UserRepository extends BaseRepository<User, CreateUserInput, UpdateUserInput, UserFilters> 
  implements IUserRepository {

  async create(data: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    return await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        image: data.image,
        role: data.role || 'customer',
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        phone: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        phone: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        phone: true,
      },
    });
  }

  async findMany(filters: UserFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<User>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build where clause
    const where: any = {};
    
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified ? { not: null } : null;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          phone: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const updateData: any = { ...data };
    
    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        phone: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async verifyEmail(id: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        phone: true,
      },
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    return await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        phone: true,
      },
    });
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}

// Export singleton instance
export const userRepository = new UserRepository(new PrismaClient());