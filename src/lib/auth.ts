import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "মোবাইল নম্বর", type: "text", placeholder: "017XXXXXXXX" },
        password: { label: "পাসওয়ার্ড", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) return null;

        const inputId = credentials.mobile.trim();
        const inputPassword = credentials.password.trim();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { mobile: inputId },
              { name: inputId },
              { nid: inputId }
            ],
            isDeleted: false
          }
        });

        if (!user) return null;

        const isPasswordValid = inputPassword === (user.password ? user.password.trim() : "");

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.mobile = (user as any).mobile;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).mobile = token.mobile;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: "/login"
  }
};
