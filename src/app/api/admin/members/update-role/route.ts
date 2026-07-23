import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const currentRole = (session.user as any).role;
    if (currentRole !== "ADMIN" && currentRole !== "PRESIDENT" && currentRole !== "SECRETARY" && currentRole !== "CONTROLLER") {
      return NextResponse.json({ error: "পারমিশন নেই" }, { status: 403 });
    }

    const { userId, role, committeeDesignation } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "সদস্য এবং রোল নির্বাচন করুন" }, { status: 400 });
    }

    // Update user primary system role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    // Update or upsert committee record if designation provided
    if (committeeDesignation) {
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      await prisma.committee.upsert({
        where: { userId },
        create: {
          userId,
          designation: committeeDesignation,
          termStart: today,
          termEnd: nextYear
        },
        update: {
          designation: committeeDesignation,
          termStart: today
        }
      });
    } else if (role === "MEMBER") {
      // Remove from committee if downgraded to plain MEMBER
      await prisma.committee.deleteMany({ where: { userId } }).catch(() => {});
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: error.message || "রোল আপডেট করতে ব্যর্থ" }, { status: 500 });
  }
}
