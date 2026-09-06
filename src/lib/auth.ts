import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Debug: Log if NEXTAUTH_SECRET is missing
if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "⚠️ NEXTAUTH_SECRET is not set! This will cause authentication errors.",
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            vipLevel: user.vipLevel,
            country: user.country,
            role: user.role || "USER",
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.vipLevel = (user as any).vipLevel;
        token.country = (user as any).country;
        token.role = (user as any).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).vipLevel = token.vipLevel;
        (session.user as any).country = token.country;
        (session.user as any).role = token.role || "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login", // Redirect to login on error
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-change-me",
  debug: process.env.NODE_ENV === "development",
};
