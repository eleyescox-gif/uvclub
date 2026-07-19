import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mobile, profilePicture } = body;

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    // Optional: add validation to ensure profilePicture is not too massive 
    // or validate it's actually an image string if necessary.

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        mobile,
        profilePicture
      }
    });

    return NextResponse.json({ success: true, user: { id: updatedUser.id, mobile: updatedUser.mobile } });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
