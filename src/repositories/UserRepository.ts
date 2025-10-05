import { PrismaClient } from '@prisma/client';
import { IUserRepository, User, CreateUserData, UpdateUserData } from '@/interfaces/IAuthService';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: undefined, // Phone field doesn't exist in User model
        role: 'customer' as 'admin' | 'customer', // Role field doesn't exist in User model, default to customer
        emailVerified: !!user.email_verified,
        image: user.image || undefined,
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: user.updated_at?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: undefined, // Phone field doesn't exist in User model
        role: 'customer' as 'admin' | 'customer', // Role field doesn't exist in User model, default to customer
        emailVerified: !!user.email_verified,
        image: user.image || undefined,
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: user.updated_at?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findByEmailWithPassword(email: string): Promise<(User & { password?: string }) | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: undefined, // Phone field doesn't exist in User model
        role: 'customer' as 'admin' | 'customer', // Role field doesn't exist in User model, default to customer
        emailVerified: !!user.email_verified,
        image: user.image || undefined,
        password: user.password || undefined, // Include password for authentication
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: user.updated_at?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error finding user by email with password:', error);
      return null;
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          email_verified: userData.emailVerified ? new Date() : null
        }
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: undefined, // Phone field doesn't exist in User model
        role: 'customer' as 'admin' | 'customer', // Role field doesn't exist in User model, default to customer
        emailVerified: !!user.email_verified,
        image: user.image || undefined,
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: user.updated_at?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(userData.name !== undefined && { name: userData.name }),
          ...(userData.image !== undefined && { image: userData.image }),
          updated_at: new Date()
        }
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: undefined, // Phone field doesn't exist in User model
        role: 'customer' as 'admin' | 'customer', // Role field doesn't exist in User model, default to customer
        emailVerified: !!user.email_verified,
        image: user.image || undefined,
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: user.updated_at?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async verifyEmail(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          email_verified: new Date(),
          updated_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async findMany(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}): Promise<{ users: User[]; total: number }> {
    try {
      const { page = 1, limit = 20, search, role } = options;
      const offset = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { created_at: 'desc' }
        }),
        this.prisma.user.count({ where })
      ]);

      const transformedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: undefined, // Phone field doesn't exist in User model
        role: 'customer' as 'admin' | 'customer', // Role field doesn't exist in User model, default to customer
        emailVerified: !!user.email_verified,
        image: user.image || undefined,
        createdAt: user.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: user.updated_at?.toISOString() || new Date().toISOString()
      }));

      return { users: transformedUsers, total };
    } catch (error) {
      console.error('Error finding users:', error);
      return { users: [], total: 0 };
    }
  }
}
