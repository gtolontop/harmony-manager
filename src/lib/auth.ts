import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

// Super-admin Discord IDs
const SUPERADMIN_IDS = ["849326197351776316", "788452602286964796"];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      displayName?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    discordId: string;
    username: string;
    displayName?: string | null;
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as never,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordProfile = profile as {
          id: string;
          username: string;
          global_name?: string;
          email?: string;
          avatar?: string;
        };

        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { discordId: discordProfile.id },
        });

        if (existingUser) {
          // Update existing user
          await db.user.update({
            where: { discordId: discordProfile.id },
            data: {
              username: discordProfile.username,
              displayName: discordProfile.global_name || discordProfile.username,
              email: discordProfile.email,
              image: discordProfile.avatar
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : null,
            },
          });
        } else {
          // Determine role for new user
          const role = SUPERADMIN_IDS.includes(discordProfile.id) ? "superadmin" : "client";

          // Create new user
          await db.user.create({
            data: {
              discordId: discordProfile.id,
              username: discordProfile.username,
              displayName: discordProfile.global_name || discordProfile.username,
              email: discordProfile.email,
              image: discordProfile.avatar
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : null,
              role,
            },
          });
        }
      }
      return true;
    },

    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
      });

      if (dbUser) {
        Object.assign(session.user, {
          id: dbUser.id,
          discordId: dbUser.discordId,
          username: dbUser.username,
          displayName: dbUser.displayName,
          email: dbUser.email,
          image: dbUser.image,
          role: dbUser.role,
        });
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
