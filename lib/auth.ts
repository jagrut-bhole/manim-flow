import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { EmailServices } from "@/services/emailServices";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials: any): Promise<any> {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            emailVerified: true,
          },
        });

        if (!user) {
          throw new Error("No user found with the provided email");
        }

        if (!user.emailVerified) {
          const verificationCode = Math.floor(
            100000 + Math.random() * 900000,
          ).toString();
          const codeExpiry = new Date(Date.now() + 15 * 60 * 1000);

          await prisma.user.update({
            where: {
              email: credentials.email,
            },
            data: {
              verificationCode,
              verificationCodeExpiry: codeExpiry,
            },
          });

          try {
            const emailService = new EmailServices();
            emailService.sendVerificationCode(
              credentials.email,
              verificationCode,
            );
          } catch (error) {
            console.error("Error sending verification email: ", error);
          }

          throw new Error(`UNVERIFIED:${credentials.email}`);
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.emailVerified = !!(user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
