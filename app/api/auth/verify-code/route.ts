import prisma from "@/lib/prisma";

export async function POST(request : Request) {
    try {
        const {email, code}= await request.json();

        const decodeEmail = decodeURIComponent(email);

        if (!decodeEmail || !code) {
            return Response.json({
                success : false,
                message : "Email and code are required"
            }, {
                status : 400
            })
        }

        const user = await prisma.user.findUnique({
            where : {
                email : decodeEmail
            },
        })

        if(!user) {
            return Response.json({
                success : false,
                message : "User not found"
            },{
                status : 404
            })
        }

        const isCodeValid = user.verificationCode === code;
        const isCodeExpired = user.verificationCodeExpiry 
                                    ? user.verificationCodeExpiry < new Date() 
                                    : true;

        if (isCodeValid && !isCodeExpired) {
            await prisma.user.update({
                where : {
                    email: decodeEmail
                },
                data : {
                    verificationCode : null,
                    verificationCodeExpiry : null,
                    emailVerified : true
                }
            })

            return Response.json({
                success : true,
                message : "Email verified successfully. Please sign in to continue."
            },{
                status : 200
            })
        } else if (!isCodeValid) {
            return Response.json({
                success : false,
                message : "Invalid verification code"
            },{
                status : 400
            })
        } else if (isCodeExpired) {
            return Response.json({
                success : false,
                message : "Verification code has expired"
            },{
                status : 400
            })
        } else {
            return Response.json({
                success : false,
                message : "Unable to verify email"
            },{
                status : 400
            })
        }

    } catch (error) {
        console.error("Error in verify-code route: ", error);
        return Response.json({
            success : false,
            message : "Internal Server Error"
        }, {
            status : 500
        })
    }
}