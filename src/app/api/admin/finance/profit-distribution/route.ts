import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/finance/profit-distribution
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "CASHIER" && role !== "PRESIDENT" && role !== "SECRETARY") {
      return NextResponse.json({ error: "কেবল ক্যাশিয়ার বা অ্যাডমিন লাভ্যাংশ/ব্যয় ডিস্ট্রিবিউট করতে পারবেন" }, { status: 403 });
    }

    const { type, totalAmount, description } = await req.json();

    const amountNum = parseFloat(totalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "সঠিক টাকার পরিমাণ প্রদান করুন" }, { status: 400 });
    }

    // Determine if credit (income/profit) or debit (expense/loss)
    const isCredit = type === "PROJECT_PROFIT" || type === "BANK_INTEREST" || type === "OTHER_INCOME";
    const txType = isCredit ? "PROFIT_POSTING" : "LOSS_POSTING";

    // Fetch ONLY ACTIVE members (activeStatus: true, isDeleted: false)
    const activeMembers = await prisma.user.findMany({
      where: { activeStatus: true, isDeleted: false },
      select: { id: true, balance: true, name: true }
    });

    if (activeMembers.length === 0) {
      return NextResponse.json({ error: "কোনো সক্রিয় সদস্য পাওয়া যায়নি" }, { status: 400 });
    }

    const activeCount = activeMembers.length;
    const perMemberShare = Math.round((amountNum / activeCount) * 100) / 100;

    // Perform atomic transaction updates
    await prisma.$transaction(async (tx) => {
      // 1. Create audit record in BankReconciliation
      await tx.bankReconciliation.create({
        data: {
          transactionType: type,
          amount: amountNum,
          description: description || `${type} সমহারে ডিস্ট্রিবিউশন (${activeCount} জন সক্রিয় সদস্য)`
        }
      });

      // 2. Loop active members and distribute equal share
      for (const member of activeMembers) {
        // Create transaction record for member
        await tx.transaction.create({
          data: {
            userId: member.id,
            type: txType,
            amount: perMemberShare,
            status: "APPROVED",
            approvedBy: (session.user as any).id,
            date: new Date()
          }
        });

        // Update member balance
        const newBalance = isCredit ? member.balance + perMemberShare : Math.max(0, member.balance - perMemberShare);
        await tx.user.update({
          where: { id: member.id },
          data: { balance: newBalance }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `সফলভাবে ৳${amountNum} টাকা ${activeCount} জন সক্রিয় সদস্যের মাঝে সমহারে (${perMemberShare} টাকা/সদস্য) বন্টন করা হয়েছে।`,
      perMemberShare,
      activeMembersCount: activeCount
    });

  } catch (error) {
    console.error("POST /api/admin/finance/profit-distribution error:", error);
    return NextResponse.json({ error: "লাভ্যাংশ/ব্যয় ডিস্ট্রিবিউট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
