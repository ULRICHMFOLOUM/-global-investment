import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      vipLevel?: number;
      country?: string;
    };
  }

  interface User {
    id: string;
    vipLevel?: number;
    country?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    vipLevel?: number;
    country?: string;
  }
}
