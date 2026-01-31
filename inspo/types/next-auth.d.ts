import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      firstName?: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    firstName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    firstName?: string;
    image?: string | null;
  }
}
