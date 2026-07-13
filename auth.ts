import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import User from "./models/user.model";
import { UserRole } from "./types/global";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !account) return false;

      try {
        const response = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/signin-with-oauth`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            }),
          }
        );

        if (!response.ok) {
          return false;
        }

        return true;
      } catch (error) {
        console.error("OAuth Sync Error:", error);
        return false;
      }
    },
    async jwt({ token }) {
      if (!token.email) return token;

      const user = await User.findOne({ email: token.email });

      if (!user) return token;

      token.id = user._id.toString();
      token.role = user.role;
      token.isActive = user.isActive;

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.isActive = token.isActive as boolean;

      return session;
    },
  },
});
