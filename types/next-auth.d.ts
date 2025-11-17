import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
  }
  
  interface Account {
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: string;
  }
}
