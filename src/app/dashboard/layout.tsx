import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import BottomNav from "@/components/dashboard/BottomNav";
import prisma from "@/lib/prisma";
import { getClubInfo } from "@/lib/clubInfo";

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
  let effectiveRole = role;
  let formattedNotices: any[] = [];
  let collectionStats = { paid: 0, due: 0 };
  let totalMembersCount = 0;

  // Use getClubInfo() for dynamic admin-uploaded logo across dashboard
  const clubInfoData = await getClubInfo();
  let clubSettings = { name: clubInfoData.name, logo: clubInfoData.logo, address: clubInfoData.address };

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Fetch settings and parallelize DB queries
    const [settings, activeNotices, memberCount, paidInvoicesCount] = await Promise.all([
      (prisma as any).clubSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
      prisma.notice.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }).catch(() => []),
      prisma.user.count({ where: { activeStatus: true, isDeleted: false } }).catch(() => 0),
      prisma.invoice.count({
        where: { month: currentMonth, year: currentYear, status: 'PAID' }
      }).catch(() => 0)
    ]);

    const noCommitteeMode = settings?.noCommitteeMode ?? false;

    // IF noCommitteeMode is TRUE: Only CONTROLLER or ADMIN retains admin powers, all others become 'MEMBER'
    effectiveRole = noCommitteeMode
      ? (role === "CONTROLLER" || role === "ADMIN" ? role : "MEMBER")
      : role;

    totalMembersCount = memberCount;

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
      if (r === 'CONTROLLER') return 'কন্ট্রোলার';
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
      {/* Sidebar - fixed width on desktop */}
      <Sidebar role={effectiveRole} user={{ ...session.user, role: effectiveRole }} totalMembersCount={totalMembersCount} />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="card-wrapper">
          <TopNav user={{ ...session.user, role: effectiveRole }} activeNoticesCount={formattedNotices.length} clubSettings={clubSettings} notices={formattedNotices} collectionStats={collectionStats} />
          <div style={{ flex: 1 }}>
            {children}
          </div>
        </div>
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <BottomNav role={effectiveRole} user={{ ...session.user, role: effectiveRole }} />
    </div>
  );
}
