import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role || "MEMBER";

  let formattedNotices: any[] = [];
  let clubSettings = { name: "United Vision", logo: null, address: "Dhaka, Bangladesh" };
  let collectionStats = { paid: 0, due: 0 };

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Parallelized DB queries for ultra-fast response
    const [activeNotices, settings, totalMembersCount, paidInvoicesCount] = await Promise.all([
      prisma.notice.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }).catch(() => []),
      (prisma && (prisma as any).clubSettings) ? (prisma as any).clubSettings.findUnique({
        where: { id: "singleton" }
      }).catch(() => null) : Promise.resolve(null),
      prisma.user.count({ where: { activeStatus: true, isDeleted: false } }).catch(() => 0),
      prisma.invoice.count({
        where: { month: currentMonth, year: currentYear, status: 'PAID' }
      }).catch(() => 0)
    ]);

    if (settings) clubSettings = settings;

    const noticeCreatorIds = activeNotices.map(n => n.createdBy);
    const noticeCreators = noticeCreatorIds.length > 0 
      ? await prisma.user.findMany({
          where: { id: { in: noticeCreatorIds } },
          select: { id: true, name: true, nameBn: true, role: true }
        }).catch(() => [])
      : [];

    const creatorsMap: Record<string, typeof noticeCreators[0]> = {};
    noticeCreators.forEach(c => {
      creatorsMap[c.id] = c;
    });

    const getRoleName = (r: string) => {
      if (r === 'PRESIDENT') return 'সভাপতি';
      if (r === 'SECRETARY') return 'সাধারণ সম্পাদক';
      if (r === 'CASHIER') return 'ক্যাশিয়ার';
      if (r === 'ADMIN') return 'অ্যাডমিন';
      return 'সদস্য';
    };

    formattedNotices = activeNotices.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      creatorName: creatorsMap[n.createdBy]?.nameBn || creatorsMap[n.createdBy]?.name || "ইউজার",
      creatorRole: getRoleName(creatorsMap[n.createdBy]?.role || "MEMBER")
    }));

    const dueInvoicesCount = Math.max(0, totalMembersCount - paidInvoicesCount);
    collectionStats = { paid: paidInvoicesCount, due: dueInvoicesCount };
  } catch (err) {
    console.error("DashboardLayout: Could not fetch initial layout data from DB:", err);
  }

  return (
    <div className="layout-container">
      {/* Sidebar - fixed width */}
      <Sidebar role={role} user={session.user} />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="card-wrapper">
          <TopNav user={session.user} activeNoticesCount={formattedNotices.length} clubSettings={clubSettings} notices={formattedNotices} collectionStats={collectionStats} />
          <div style={{ flex: 1 }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
