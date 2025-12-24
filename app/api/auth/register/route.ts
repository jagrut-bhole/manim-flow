import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { EmailServices } from "@/services/email.services";

export async function POST(request:Request) {
    try {
        const {name, email, password} = await request.json();

        if (!name || !email || !password) {
            return Response.json({
                success : false,
                message : "All fields are required"
            }, {
                status : 400
            })
        }

        const existingUser = await prisma.user.findUnique({
            where : {
                email
            }
        })

        if (existingUser) {
            return Response.json({
                success : false,
                message : "User with this email already exists"
            }, {
                status : 400
            })
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 MIN EXPIRY  

        const hashedPasword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data : {
                name, 
                email,
                password : hashedPasword,
                emailVerified : false,
                verificationCode,
                verificationCodeExpiry : codeExpiry
            }
        })

        try {
            const emailService = new EmailServices();
            await emailService.sendVerificationCode(email,verificationCode)
        } catch (error) {
            console.log("Email sending error: ",error)
        }

        return Response.json({
            success : true,
            message : "Registration successful! Check your email for verification code.",
            data : {
                email : user.email,
                name : user.name
            }
        },
    {
        status : 201
    })

    } catch (error : unknown) {
        console.log("Error in registration route: ", error);

        if(error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return new Response(JSON.stringify({
                success : false,
                message : "User with this email already exists"
            }), { status : 400 });
        }

        return new Response(JSON.stringify({
            success : false,
            message : "Internal Server Error"
        }), { status : 500 });
    }
}