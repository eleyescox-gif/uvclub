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

  // Fetch active notices and their authors
  const activeNotices = await prisma.notice.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const noticeCreatorIds = activeNotices.map(n => n.createdBy);
  const noticeCreators = await prisma.user.findMany({
    where: { id: { in: noticeCreatorIds } },
    select: { id: true, name: true, nameBn: true, role: true }
  });

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

  const formattedNotices = activeNotices.map(n => ({
    id: n.id,
    title: n.title,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    creatorName: creatorsMap[n.createdBy]?.nameBn || creatorsMap[n.createdBy]?.name || "ইউজার",
    creatorRole: getRoleName(creatorsMap[n.createdBy]?.role || "MEMBER")
  }));

  let settings = null;
  // Defensive check in case Prisma client hasn't been generated yet
  if (prisma.clubSettings) {
    settings = await (prisma.clubSettings as any).findUnique({
      where: { id: "singleton" }
    });
  }
  const clubSettings = settings || { name: "United Vision", logo: null, address: "Dhaka, Bangladesh" };

  // Calculate current month collection stats for TopNav compact badge
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const totalMembersCount = await prisma.user.count({ where: { activeStatus: true, isDeleted: false } });
  const paidInvoicesCount = await prisma.invoice.count({
    where: { month: currentMonth, year: currentYear, status: 'PAID' }
  });
  const collectionStats = { paid: paidInvoicesCount, total: totalMembersCount };

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
