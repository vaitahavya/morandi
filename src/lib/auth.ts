import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendVerificationRequest } from '@/lib/email';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        },
        allowDangerousEmailAccountLinking: true,
      })
    ] : []),

    // Email Provider for magic links
    ...(process.env.EMAIL_SERVER_HOST ? [
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
        sendVerificationRequest,
      })
    ] : []),

    // Credentials Provider for email/password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          console.log('🔍 Looking for user:', credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null;
          }

          console.log('✅ User found:', user.email, 'Role:', user.role);

          // For OAuth users without password
          if (!user.password) {
            console.log('❌ No password set for user');
            throw new Error('Please sign in with your social account');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔐 Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Authentication successful for:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow email verification
      if (account?.provider === 'email') {
        return true;
      }

      // Handle OAuth providers - Let PrismaAdapter do its job
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true } // Include accounts to check linking
          });

          // REMOVE THE MANUAL USER CREATION
          // PrismaAdapter will handle this automatically
          
          // Only set role if it's a new user (no existing user found)
          if (!existingUser) {
            // The adapter will create the user, we just ensure role is set
            // This will be handled in the jwt callback
            return true;
          }

          // If user exists, just update their info
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              emailVerified: existingUser.emailVerified || new Date(),
            }
          });

          return true;
        } catch (error) {
          console.error('Error handling OAuth sign in:', error);
          return false;
        }
      }

      return true;
    },
    
    async jwt({ token, user, account, trigger }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      if (user) {
        token.id = user.id;
        
        // Get the user's role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        });
        
        token.role = dbUser?.role || 'customer';
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
      
      // Set default role for new OAuth users
      if (isNewUser && account?.provider !== 'credentials') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'customer' }
        });
      }
    },
    async signOut({ session, token }) {
      console.log(`User ${session?.user?.email} signed out`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
};