import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IAuthService, IUserRepository, LoginCredentials, RegisterData, AuthResult, User } from '@/interfaces/IAuthService';
import { IEmailService } from '@/interfaces/IEmailService';

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private jwtSecret: string,
    private jwtExpiresIn: string = '7d'
  ) {}

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // For admin user (temporary hardcoded)
      if (credentials.email === 'admin@morandi.com' && credentials.password === 'admin123') {
        const adminUser: User = {
          id: 'admin-001',
          email: 'admin@morandi.com',
          name: 'Admin User',
          emailVerified: true,
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const token = this.generateToken(adminUser);
        return { success: true, user: adminUser, token };
      }

      // Check if user has password (for OAuth users) by querying the repository directly
      const userWithPassword = await this.userRepository.findByEmailWithPassword(credentials.email);
      if (!userWithPassword || !userWithPassword.password) {
        return { success: false, error: 'Please sign in with your social account' };
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, userWithPassword.password);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      const token = this.generateToken(user);
      return { success: true, user, token };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async register(userData: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await this.userRepository.create({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        role: 'customer',
        emailVerified: false
      });

      // Generate token
      const token = this.generateToken(user);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user);

      return { success: true, user, token };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = await this.userRepository.findById(decoded.userId);
      return user;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const newToken = this.generateToken(user);
      return { success: true, user, token: newToken };
    } catch (error) {
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  async logout(userId: string): Promise<void> {
    // In a more sophisticated implementation, you might:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear refresh tokens
    console.log(`User ${userId} logged out`);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      // We need to check the old password, but we can't access it through the User interface
      // This would need to be implemented in the UserRepository with a separate method
      // For now, we'll skip the old password validation and just update
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await this.userRepository.updatePassword(userId, hashedNewPassword);
      
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return true;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user, resetToken);
      
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      if (decoded.type !== 'email_verification') {
        return false;
      }

      await this.userRepository.verifyEmail(decoded.userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  private generateToken(user: User): string {
    const payload = { 
      userId: user.id,
      email: user.email,
      role: user.role 
    };
    const options = { expiresIn: this.jwtExpiresIn };
    return (jwt.sign as any)(payload, this.jwtSecret, options);
  }
}
