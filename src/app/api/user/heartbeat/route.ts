import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ active: false }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastActiveAt: true }
      });

      const now = new Date();
      // Only execute DB write if lastActiveAt is missing or updated >3 mins ago
      if (!user?.lastActiveAt || (now.getTime() - new Date(user.lastActiveAt).getTime() > 180000)) {
        await prisma.user.update({
          where: { id: userId },
          data: { lastActiveAt: now }
        });
      }
    }

    return NextResponse.json({ active: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
