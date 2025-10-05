import { 
  userRepository, 
  CreateUserInput, 
  UpdateUserInput, 
  UserFilters,
  FindManyOptions,
  PaginatedResult 
} from '@/repositories';
import { User } from '@prisma/client';

/**
 * User Service - Business logic layer
 * This service contains business logic and orchestrates repository operations
 */
export class UserService {
  /**
   * Create a new user with business validation
   */
  async createUser(userData: CreateUserInput): Promise<User> {
    // Business validation
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    return await userRepository.create(userData);
  }

  /**
   * Get user by ID with business logic
   */
  async getUserById(id: string): Promise<User | null> {
    if (!id) {
      throw new Error('User ID is required');
    }

    return await userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new Error('Email is required');
    }

    return await userRepository.findByEmail(email);
  }

  /**
   * Get paginated users with filters
   */
  async getUsers(filters?: UserFilters, options?: FindManyOptions): Promise<PaginatedResult<User>> {
    return await userRepository.findMany(filters, options);
  }

  /**
   * Update user with business validation
   */
  async updateUser(id: string, userData: UpdateUserInput): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    return await userRepository.update(id, userData);
  }

  /**
   * Delete user with business validation
   */
  async deleteUser(id: string): Promise<void> {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Additional business logic could be added here
    // e.g., check for existing orders, etc.

    await userRepository.delete(id);
  }

  /**
   * Verify user email
   */
  async verifyUserEmail(id: string): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    return await userRepository.verifyEmail(id);
  }

  /**
   * Update user password with validation
   */
  async updateUserPassword(id: string, newPassword: string): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    return await userRepository.updatePassword(id, newPassword);
  }

  /**
   * Authenticate user with business logic
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return await userRepository.authenticate(email, password);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    adminUsers: number;
    customerUsers: number;
  }> {
    const [totalResult, verifiedResult, adminResult] = await Promise.all([
      userRepository.findMany(),
      userRepository.findMany({ emailVerified: true }),
      userRepository.findMany({ role: 'admin' }),
    ]);

    return {
      totalUsers: totalResult.pagination.total,
      verifiedUsers: verifiedResult.pagination.total,
      unverifiedUsers: totalResult.pagination.total - verifiedResult.pagination.total,
      adminUsers: adminResult.pagination.total,
      customerUsers: totalResult.pagination.total - adminResult.pagination.total,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
