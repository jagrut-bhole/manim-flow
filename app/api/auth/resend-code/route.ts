import prisma from "@/lib/prisma";
import { EmailServices } from "@/services/email.services";

export async function POST(request : Request) {
    try {
        const {email}= await request.json();

        if (!email) {
            return Response.json({
                success : false,
                message : "Email not found"
            },{ status : 400})
        }

        const decodeEmail = decodeURIComponent(email);

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); 

        const user = await prisma.user.findUnique({
            where : {
                email : decodeEmail
            }
        })

        if (!user) {
            return Response.json({
                success : false,
                message : "User not found"
            },{ status : 404})
        }

        await prisma.user.update({
            where : {
                email : decodeEmail
            },
            data : {
                verificationCode : code,
                verificationCodeExpiry : codeExpiry
            }
        })


        const emailService = new EmailServices();
        await emailService.sendVerificationCode(decodeEmail,code);

        return Response.json({
            success : true,
            message : "Verification code resent successfully. Please check your email.",
        },{
            status : 200
        })

    } catch (error) {
        console.error("Error in resend code: ",error);
        return Response.json({
            success : false,
            message : "Internal Server Error"
        },{
            status : 500
        })
    }
}