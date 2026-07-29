import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { Types } from "mongoose";
import User from "./models/user.model";
import connectToDatabase from "./database/mongodb";
import { synchronizeOAuthUser } from "./lib/services/oauth-user.service";

function invalidateAuthorizationClaims(token: JWT): JWT {
  delete token.id;
  delete token.role;
  token.isActive = false;

  return token;
}

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
        await synchronizeOAuthUser({
          email: user.email,
          image: user.image ?? undefined,
          provider: account.provider,
          providerId: account.providerAccountId,
        });

        return true;
      } catch (error) {
        console.error("OAuth Sync Error:", error);
        return false;
      }
    },
    async jwt({ account, token }) {
      const email = token.email?.trim().toLowerCase();

      if (!email) {
        return invalidateAuthorizationClaims(token);
      }

      const existingUserId = token.id;
      const isInitialSignIn = Boolean(account);

      if (
        (existingUserId && !Types.ObjectId.isValid(existingUserId)) ||
        (!existingUserId && !isInitialSignIn)
      ) {
        return invalidateAuthorizationClaims(token);
      }

      await connectToDatabase();

      const user = await User.findOne({
        email,
        ...(existingUserId ? { _id: existingUserId } : {}),
      })
        .select("_id role isActive")
        .lean();

      if (!user || !user.isActive || !user.role) {
        return invalidateAuthorizationClaims(token);
      }

      token.id = user._id.toString();
      token.role = user.role;
      token.isActive = true;

      return token;
    },
    async session({ session, token }) {
      const isAuthorized = Boolean(
        token.id && token.role && token.isActive
      );

      session.user.id = isAuthorized ? token.id! : "";
      session.user.role = isAuthorized ? token.role : undefined;
      session.user.isActive = isAuthorized;

      return session;
    },
  },
});
