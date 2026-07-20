import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/applications/emergency
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { amount, reason, medicalDetails } = await req.json();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "সঠিক টাকার পরিমাণ দিন" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: "জরুরি সহায়তার কারণ আবশ্যক" }, { status: 400 });
    }

    // Record as notice or request for President review
    const newNotice = await prisma.notice.create({
      data: {
        title: `🚨 জরুরি চিকিৎসা/আর্থিক সহায়তার আবেদন (৳${amountNum})`,
        content: `মেম্বার ID: ${userId}\nআবেদনের কারণ: ${reason}\nবিস্তারিত বিবরণ: ${medicalDetails || "N/A"}\nপ্রয়োজনীয় অর্থ: ৳${amountNum}`,
        createdBy: userId,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "আপনার জরুরি আর্থিক সহায়তার আবেদনটি সফলভাবে সভাপতি ও পরিচালনা পর্ষদের কাছে প্রেরণ করা হয়েছে।"
    });
  } catch (error) {
    console.error("POST /api/applications/emergency error:", error);
    return NextResponse.json({ error: "আবেদন জমা দিতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
