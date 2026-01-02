import prisma from "@/lib/prisma";
import { EmailServices } from "@/services/emailServices";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        {
          exists: false,
          verified: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return Response.json({
        exists: false,
        verified: false,
      });
    }

    // If user exists but is not verified, send a new verification code
    if (!user.emailVerified) {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const codeExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { email },
        data: {
          verificationCode,
          verificationCodeExpiry: codeExpiry,
        },
      });

      try {
        const emailService = new EmailServices();
        await emailService.sendVerificationCode(email, verificationCode);
      } catch (error) {
        console.error("Error sending verification email: ", error);
      }
    }

    return Response.json({
      exists: true,
      verified: user.emailVerified,
    });
  } catch (error) {
    console.error("Error in check-user route: ", error);
    return Response.json(
      {
        exists: false,
        verified: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
