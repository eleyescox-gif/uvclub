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

    const { presidentId, secretaryId, cashierId, vicePresidentId, jointSecretaryId } = await req.json();

    if (!presidentId && !secretaryId && !cashierId) {
      return NextResponse.json({ error: "অন্তত মূল ৩টি পদের (সভাপতি, সাধারণ সম্পাদক, ক্যাশিয়ার) সদস্য সিলেক্ট করুন।" }, { status: 400 });
    }

    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    await prisma.$transaction(async (tx) => {
      // 1. President
      if (presidentId) {
        await tx.committee.upsert({
          where: { userId: presidentId },
          create: { userId: presidentId, designation: "সভাপতি", termStart: today, termEnd: nextYear },
          update: { designation: "সভাপতি", termStart: today, termEnd: nextYear }
        });
        await tx.user.update({ where: { id: presidentId }, data: { role: "PRESIDENT" } });
      }

      // 2. Secretary
      if (secretaryId) {
        await tx.committee.upsert({
          where: { userId: secretaryId },
          create: { userId: secretaryId, designation: "সাধারণ সম্পাদক", termStart: today, termEnd: nextYear },
          update: { designation: "সাধারণ সম্পাদক", termStart: today, termEnd: nextYear }
        });
        await tx.user.update({ where: { id: secretaryId }, data: { role: "SECRETARY" } });
      }

      // 3. Cashier
      if (cashierId) {
        await tx.committee.upsert({
          where: { userId: cashierId },
          create: { userId: cashierId, designation: "ক্যাশিয়ার", termStart: today, termEnd: nextYear },
          update: { designation: "ক্যাশিয়ার", termStart: today, termEnd: nextYear }
        });
        await tx.user.update({ where: { id: cashierId }, data: { role: "CASHIER" } });
      }

      // 4. Vice President (Optional)
      if (vicePresidentId) {
        await tx.committee.upsert({
          where: { userId: vicePresidentId },
          create: { userId: vicePresidentId, designation: "সহ-সভাপতি", termStart: today, termEnd: nextYear },
          update: { designation: "সহ-সভাপতি", termStart: today, termEnd: nextYear }
        });
        await tx.user.update({ where: { id: vicePresidentId }, data: { role: "MEMBER" } });
      }

      // 5. Joint Secretary (Optional)
      if (jointSecretaryId) {
        await tx.committee.upsert({
          where: { userId: jointSecretaryId },
          create: { userId: jointSecretaryId, designation: "সহ-সাধারণ সম্পাদক", termStart: today, termEnd: nextYear },
          update: { designation: "সহ-সাধারণ সম্পাদক", termStart: today, termEnd: nextYear }
        });
        await tx.user.update({ where: { id: jointSecretaryId }, data: { role: "MEMBER" } });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bulk committee update error:", error);
    return NextResponse.json({ error: error.message || "পরিচালনা কমিটি আপডেট করতে ব্যর্থ" }, { status: 500 });
  }
}
