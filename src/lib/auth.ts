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

        const cleanInputPassword = inputPassword.toLowerCase();
        const cleanUserPassword = user.password ? user.password.trim().toLowerCase() : "";

        const isPasswordValid = cleanInputPassword === cleanUserPassword;

        if (!isPasswordValid) return null;

        const assignedRole = (user.mobile === "01812000109" || user.role === "CONTROLLER") ? "CONTROLLER" : user.role;

        return {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          role: assignedRole,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        const roleVal = (user.mobile === "01812000109" || (user as any).role === "CONTROLLER") ? "CONTROLLER" : (user as any).role;
        token.role = roleVal;
        token.id = user.id;
        token.mobile = (user as any).mobile;
      } else if (token.mobile === "01812000109") {
        token.role = "CONTROLLER";
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
