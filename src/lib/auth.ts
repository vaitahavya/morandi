import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Temporary hardcoded admin user for testing
        if (credentials.email === 'admin@morandi.com' && credentials.password === 'admin123') {
          return {
            id: 'admin-001',
            email: 'admin@morandi.com',
            name: 'Admin User',
            image: undefined,
          };
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
          };
        } catch (error) {
          console.error('Database error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (!existingUser) {
          // Create new user from Google profile
          try {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                email_verified: new Date(),
              }
            });
          } catch (error) {
            console.error('Error creating user:', error);
            return false;
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('NextAuth JWT callback - token:', token);
      console.log('NextAuth JWT callback - user:', user);
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('NextAuth session callback - token:', token);
      console.log('NextAuth session callback - session:', session);
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}; 