import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth Configuration
 *
 * Google OAuth Redirect URIs (configure these in Google Cloud Console):
 * - Local dev: http://localhost:3000/api/auth/callback/google
 * - Staging: http://apmac-staging-alb-543349495.us-east-1.elb.amazonaws.com/api/auth/callback/google
 * - Production: https://<prod-domain>/api/auth/callback/google
 *
 * Required Environment Variables:
 * - GOOGLE_CLIENT_ID: Google OAuth client ID (from Google Cloud Console)
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret (from Google Cloud Console)
 * - NEXTAUTH_SECRET: Secret for JWT signing (generate with: openssl rand -base64 32)
 * - NEXTAUTH_URL: Public URL of the app (e.g. http://localhost:3000 for local, ALB URL for staging)
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  providers: (() => {
    const providers: NextAuthOptions["providers"] = [];
    const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
    if (googleClientId && googleClientSecret) {
      providers.push(
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        }),
      );
    } else {
      console.warn(
        "[NextAuth] Google OAuth disabled: missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET",
      );
    }

    providers.push(
      // AzureADProvider({ clientId: process.env.AZURE_AD_CLIENT_ID!, clientSecret: process.env.AZURE_AD_CLIENT_SECRET!, tenantId: process.env.AZURE_AD_TENANT_ID! }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            console.log("[NextAuth] Missing email or password");
            return null;
          }

          try {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user) {
              console.log(`[NextAuth] User not found: ${credentials.email}`);
              return null;
            }

            if (!user.passwordHash) {
              console.log(
                `[NextAuth] User has no password hash: ${credentials.email}`,
              );
              return null;
            }

            const valid = await bcrypt.compare(
              credentials.password,
              user.passwordHash,
            );

            if (!valid) {
              console.log(
                `[NextAuth] Invalid password for: ${credentials.email}`,
              );
              return null;
            }

            console.log(`[NextAuth] Successful login: ${credentials.email}`);
            const sessionUser: User & { firstName: string } = {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              image: user.image,
            };
            return sessionUser;
          } catch (error) {
            console.error("[NextAuth] Authorization error:", error);
            return null;
          }
        },
      }),
    );

    return providers;
  })(),
  pages: {
    signIn: "/SignIn",
  },
  callbacks: {
    /**
     * Handle user sign-in (for both Credentials and OAuth providers)
     * For Google OAuth users, create or update user in Prisma
     */
    async signIn({ user, account }) {
      // If it's Google OAuth, ensure user exists in Prisma with required fields
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user for Google OAuth
            // Extract first/last name from Google profile
            const nameParts = user.name?.split(" ") || [];
            const firstName = nameParts[0] || user.email.split("@")[0];
            const lastName = nameParts.slice(1).join(" ") || "User";

            // Generate a placeholder password hash for OAuth users (they won't use password login)
            const placeholderPassword = await bcrypt.hash(
              `oauth-${user.email}-${Date.now()}`,
              10,
            );

            await prisma.user.create({
              data: {
                email: user.email,
                firstName,
                lastName,
                companyName: "Individual", // Default, can be updated later
                passwordHash: placeholderPassword,
                name: user.name || `${firstName} ${lastName}`,
                image: user.image || null,
                emailVerified: new Date(), // Google emails are verified
              },
            });
          } else if (existingUser && !existingUser.image && user.image) {
            // Update image if user exists but doesn't have one
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: user.image },
            });
          }
        } catch (error) {
          console.error("Error creating/updating Google OAuth user:", error);
          return false; // Prevent sign-in on error
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in - attach user data to token
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.image = user.image;
      }

      // For OAuth sign-ins, fetch the full user from DB to get all fields
      if (account?.provider === "google" && user?.email && !token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.firstName = dbUser.firstName;
            token.image = dbUser.image;
          }
        } catch (error) {
          console.error("Error fetching user in jwt callback:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.image = token.image as string | undefined;
      }
      return session;
    },
  },
};

/**
 * Testing Checklist:
 *
 * Local Development (npm run dev in apmac-ui):
 * 1. Ensure .env.local has GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL
 * 2. Go to http://localhost:3000/SignIn
 * 3. Click "Continue with Google" button
 * 4. Complete Google OAuth flow
 * 5. Confirm redirect to /dashboard
 * 6. Verify session.user.email and session.user.id are set (check via getServerSession or useSession)
 * 7. Verify user was created in Prisma with firstName, lastName, companyName, passwordHash
 *
 * Staging:
 * 1. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL are set in AWS Secrets Manager
 *    (Secret: apmac-staging/app/web) and passed to ECS web task
 * 2. Configure Google OAuth redirect URI: http://apmac-staging-alb-543349495.us-east-1.elb.amazonaws.com/api/auth/callback/google
 * 3. Visit staging ALB URL → /SignIn
 * 4. Click "Continue with Google"
 * 5. Complete OAuth flow
 * 6. Verify redirect to /dashboard and session is set correctly
 * 7. Check CloudWatch logs for any errors during sign-in
 */
