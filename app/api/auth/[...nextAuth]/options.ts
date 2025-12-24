import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { EmailServices } from "@/services/email.services";

export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            id : "credentials",
            name : "Credentials",
            credentials : {
                email : {
                    label : "Email",
                    type : "email"
                },
                password : {
                    label : "Password",
                    type : "password"
                }
            },
            async authorize(credentials : any) : Promise<any> {
                try {
                    const user = await prisma.user.findUnique({
                        where : {
                            email : credentials.email
                        }
                    })

                    if (!user) {
                        throw new Error("No user found with the provided email");
                    }

                    if (!user.emailVerified) {
                        // Generate new verification code
                        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                        const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 MIN EXPIRY

                        // Update user with new verification code
                        await prisma.user.update({
                            where: {
                                email: credentials.email
                            },
                            data: {
                                verificationCode,
                                verificationCodeExpiry: codeExpiry
                            }
                        });

                        // Send verification email
                        try {
                            const emailService = new EmailServices();
                            await emailService.sendVerificationCode(credentials.email, verificationCode);
                        } catch (emailError) {
                            console.error("Error sending verification email:", emailError);
                        }

                        throw new Error(`UNVERIFIED:${credentials.email}`);
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordValid) {
                        return user;
                    } else {
                        throw new Error("Invalid password");
                    }
                } catch (error) {
                    throw new Error((error as Error).message);
                }
            }
        })
    ],
    callbacks : {
        async jwt({token,user}) {

            if (user) {
                token.id = user.id?.toString();
                token.name = user.name;
                token.email = user.email;
                token.emailVerified = user.emailVerified instanceof Date ? true : (user.emailVerified ?? false);
            }

            return token;
        },
        async session({session, token}) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.emailVerified = token.emailVerified;
            }
            return session;
        }
    },
    session : {
        strategy : "jwt"
    } , 
    secret : process.env.NEXTAUTH_SECRET,
    pages : {
        signIn : "/signin"
    }
}