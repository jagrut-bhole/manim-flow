import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPasword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPasword,
        credits: 10,
        plan: "FREE",
      },
    });

    return Response.json(
      {
        success: true,
        message: "Registration successful!",
        data: {
          email: user.email,
          name: user.name,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.log("Error in registration route: ", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User with this email already exists",
        }),
        { status: 400 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Internal Server Error while registering user",
      },
      {
        status: 500,
      },
    );
  }
}
