export interface IAuthService {
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
  register(userData: RegisterData): Promise<AuthResult>;
  validateToken(token: string): Promise<User | null>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(userId: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
  resetPassword(email: string): Promise<boolean>;
  verifyEmail(token: string): Promise<boolean>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  image?: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'admin' | 'moderator';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<(User & { password?: string }) | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  verifyEmail(id: string): Promise<void>;
}

export interface CreateUserData {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  image?: string;
  role?: UserRole;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  image?: string;
  role?: UserRole;
  emailVerified?: boolean;
}
