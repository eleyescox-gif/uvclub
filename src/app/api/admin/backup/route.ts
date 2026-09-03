import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "অনুমোদিত নয় (Unauthorized)" }, { status: 401 });
    }

    const userMobile = (session.user as any).mobile;
    const role = (session.user as any).role;
    const isController = userMobile === "01812000109" || role === "CONTROLLER";
    const isAdmin = role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY" || role === "CASHIER" || isController;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "শুধুমাত্র অ্যাডমিন বা কন্ট্রোলার ডেটা ব্যাকআপ ডাউনলোড করতে পারবেন।" },
        { status: 403 }
      );
    }

    // Fetch all tables in parallel
    const [
      users,
      invoices,
      transactions,
      projects,
      notices,
      clubSettings,
      votingEvents,
      committees,
      bankReconciliations,
      exitRequests,
      reportRequests
    ] = await Promise.all([
      prisma.user.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          nameBn: true,
          nameEn: true,
          fatherName: true,
          motherName: true,
          address: true,
          mobile: true,
          nid: true,
          dob: true,
          profilePicture: true,
          nomineeName: true,
          nomineeDob: true,
          nomineeAge: true,
          nomineeNid: true,
          nomineeMobile: true,
          nomineeRelation: true,
          nomineeRatio: true,
          role: true,
          joinDate: true,
          activeStatus: true,
          balance: true,
          createdAt: true,
          updatedAt: true,
          lastActiveAt: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.invoice.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }]
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.notice.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.clubSettings.findUnique({
        where: { id: "singleton" }
      }),
      prisma.votingEvent.findMany({
        include: {
          options: {
            include: {
              votes: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.committee.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.bankReconciliation.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.exitRequest.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.reportRequest.findMany({
        orderBy: { createdAt: "desc" }
      })
    ]);

    const backupDate = new Date();
    const formattedDateStr = backupDate.toISOString().split("T")[0];

    const backupPayload = {
      meta: {
        application: "United Vision Club (ইউনাইটেড ভিশন ক্লাব)",
        version: "2.0.0",
        backupType: "FULL_DATABASE_JSON",
        exportedAt: backupDate.toISOString(),
        exportedBy: (session.user as any).name || (session.user as any).nameBn || userMobile,
        exportedByMobile: userMobile,
        summary: {
          totalUsers: users.length,
          totalInvoices: invoices.length,
          totalTransactions: transactions.length,
          totalProjects: projects.length,
          totalNotices: notices.length,
          totalVotingEvents: votingEvents.length,
          totalCommittees: committees.length,
          totalBankReconciliations: bankReconciliations.length,
          totalExitRequests: exitRequests.length,
          totalReportRequests: reportRequests.length
        }
      },
      data: {
        users,
        invoices,
        transactions,
        projects,
        notices,
        clubSettings,
        votingEvents,
        committees,
        bankReconciliations,
        exitRequests,
        reportRequests
      }
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const fileName = `uvclub-database-backup-${formattedDateStr}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error: any) {
    console.error("Backup generation error:", error);
    return NextResponse.json(
      { error: "ব্যাকআপ তৈরি করতে সমস্যা হয়েছে: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
