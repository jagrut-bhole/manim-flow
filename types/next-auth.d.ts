import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      emailVerified?: boolean;
      email?: string;
      name?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    emailVerified?: boolean;
    email?: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerified?: boolean;
    email?: string;
    name?: string;
  }
}
