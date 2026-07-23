import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/admin/members/toggle-suspend
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "PRESIDENT" && role !== "ADMIN" && role !== "SECRETARY" && role !== "CONTROLLER") {
      return NextResponse.json({ error: "পারমিশন নেই" }, { status: 403 });
    }

    const { userId, activeStatus } = await req.json();

    if (!userId || typeof activeStatus !== "boolean") {
      return NextResponse.json({ error: "ইউজার আইডি ও নতুন স্ট্যাটাস আবশ্যক" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { activeStatus }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: activeStatus ? "সদস্যের হিসাব সক্রিয় করা হয়েছে" : "সদস্যের হিসাব স্থগিত করা হয়েছে"
    });
  } catch (error) {
    console.error("PATCH /api/admin/members/toggle-suspend error:", error);
    return NextResponse.json({ error: "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
