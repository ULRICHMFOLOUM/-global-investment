import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Debug: Log if NEXTAUTH_SECRET is missing
if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "⚠️ NEXTAUTH_SECRET is not set! This will cause authentication errors."
  );
}

const providers: NextAuthOptions["providers"] = [
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
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
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
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-placeholder",
    clientSecret:
      process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-placeholder",
  }),
];

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          const email = user.email.toLowerCase().trim();
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            const randomPassword = await bcrypt.hash(
              Math.random().toString(36).slice(-10) + Date.now().toString(),
              10
            );
            dbUser = await prisma.user.create({
              data: {
                name: user.name || "Utilisateur Google",
                email,
                phone: `GGL-${Date.now().toString().slice(-7)}`,
                password: randomPassword,
                country: "CM",
                balance: 0,
                role: "USER",
              },
            });
          }

          user.id = dbUser.id;
          (user as any).vipLevel = dbUser.vipLevel;
          (user as any).country = dbUser.country;
          (user as any).role = dbUser.role || "USER";
          return true;
        } catch (err) {
          console.error("Google sign-in database error:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.vipLevel = (user as any).vipLevel ?? 0;
        token.country = (user as any).country ?? "CM";
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
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-change-me",
  debug: process.env.NODE_ENV === "development",
};
