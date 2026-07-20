import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/exit-requests/approve
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয়" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "PRESIDENT" && role !== "ADMIN") {
      return NextResponse.json({ error: "কেবল সভাপতি সদস্যপদ বাতিল অনুমোদন করতে পারবেন" }, { status: 403 });
    }

    const { exitRequestId, deductionAmount } = await req.json();

    const deductionNum = parseFloat(deductionAmount || "0");
    if (isNaN(deductionNum) || deductionNum < 0) {
      return NextResponse.json({ error: "সঠিক কর্তনকৃত টাকার পরিমাণ দিন" }, { status: 400 });
    }

    const exitRequest = await prisma.exitRequest.findUnique({
      where: { id: exitRequestId },
      include: { user: true }
    });

    if (!exitRequest) {
      return NextResponse.json({ error: "আবেদন পাওয়া যায়নি" }, { status: 404 });
    }

    if (exitRequest.status === "APPROVED") {
      return NextResponse.json({ error: "এই আবেদনটি ইতিমধ্যেই অনুমোদিত হয়েছে" }, { status: 400 });
    }

    // Check if Voting Event exists and has passed 75% YES votes
    if (exitRequest.votingEventId) {
      const votingEvent = await prisma.votingEvent.findUnique({
        where: { id: exitRequest.votingEventId },
        include: {
          options: {
            include: {
              _count: { select: { votes: true } }
            }
          },
          _count: { select: { votes: true } }
        }
      });

      if (votingEvent) {
        const totalMembersCount = await prisma.user.count({ where: { activeStatus: true } });
        const yesOption = votingEvent.options.find(o => o.text.includes("হ্যাঁ") || o.text.includes("Yes") || o.text.includes("অনুমোদন"));
        const yesVotesCount = yesOption?._count?.votes || 0;
        const percentage = totalMembersCount > 0 ? (yesVotesCount / totalMembersCount) * 100 : 0;

        if (percentage < 75) {
          return NextResponse.json({ 
            error: `ভোটের হার ${percentage.toFixed(1)}%, সর্বনিম্ন ৭৫% 'হ্যাঁ' ভোট না পাওয়ায় সভাপতি অনুমোদন করতে পারবেন না।` 
          }, { status: 400 });
        }
      }
    }

    const targetUser = exitRequest.user;
    const currentBalance = targetUser.balance;
    const netRefundAmount = Math.max(0, currentBalance - deductionNum);

    // Calculate years of membership
    const joinDate = new Date(targetUser.joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    const isWithin5Years = diffYears <= 5.0;

    await prisma.$transaction(async (tx) => {
      // If deducted within 5 years, distribute deduction amount equally to all other active members
      if (deductionNum > 0 && isWithin5Years) {
        const otherActiveMembers = await tx.user.findMany({
          where: {
            activeStatus: true,
            isDeleted: false,
            id: { not: targetUser.id }
          },
          select: { id: true, balance: true }
        });

        if (otherActiveMembers.length > 0) {
          const perActiveMemberShare = Math.round((deductionNum / otherActiveMembers.length) * 100) / 100;

          for (const member of otherActiveMembers) {
            await tx.transaction.create({
              data: {
                userId: member.id,
                type: "PROFIT_POSTING",
                amount: perActiveMemberShare,
                status: "APPROVED",
                approvedBy: (session.user as any).id,
                date: new Date()
              }
            });

            await tx.user.update({
              where: { id: member.id },
              data: { balance: member.balance + perActiveMemberShare }
            });
          }
        }
      }

      // Update target user's balance to net refund amount & deactivate user
      await tx.user.update({
        where: { id: targetUser.id },
        data: {
          balance: netRefundAmount,
          activeStatus: false,
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      // Update ExitRequest status
      await tx.exitRequest.update({
        where: { id: exitRequestId },
        data: {
          status: "APPROVED",
          deductionAmount: deductionNum,
          refundAmount: netRefundAmount,
          approvedBy: (session.user as any).id
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `সদস্যপদ বাতিল অনুমোদন করা হয়েছে। মোট জমার ৳${currentBalance} টাকার মধ্যে ৳${deductionNum} টাকা কর্তন করে ৳${netRefundAmount} টাকা ফেরত হিসাব প্রস্তুত করা হয়েছে।`
    });

  } catch (error) {
    console.error("POST /api/admin/exit-requests/approve error:", error);
    return NextResponse.json({ error: "সদস্যপদ বাতিল অনুমোদন করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
