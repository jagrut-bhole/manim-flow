import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { EmailServices } from "@/services/emailServices";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
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
        if (!credentials.email || !credentials.password) {
          throw new Error("Email and Password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              name: true,
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
              await emailService.sendVerificationCode(
                credentials.email,
                verificationCode,
              );
            } catch (emailError) {
              console.error("Error sending verification email:", emailError);
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
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          throw new Error((error as Error).message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id?.toString();
        token.name = user.name;
        token.email = user.email;
        token.emailVerified = !!user.emailVerified;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};
