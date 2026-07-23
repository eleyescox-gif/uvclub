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

    const userId = (session.user as any).id;
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "সকল পাসওয়ার্ড ফিল্ড পূরণ করা বাধ্যতামূলক।" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।" }, { status: 400 });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: "ব্যবহারকারী পাওয়া যায়নি।" }, { status: 404 });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: "আপনার দেওয়া বর্তমান (পুরাতন) পাসওয়ার্ডটি ভুল!" }, { status: 400 });
    }

    // Update to new password
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });

    return NextResponse.json({ success: true, message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: error.message || "পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।" }, { status: 500 });
  }
}
