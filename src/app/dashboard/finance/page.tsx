import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import UnifiedFinanceView from "./UnifiedFinanceView";

export default async function MemberFinancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Parallelized DB queries for maximum speed
  const [user, pendingInvoices, transactions, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, nameBn: true, mobile: true, role: true, activeStatus: true }
    }).catch(() => null),
    prisma.invoice.findMany({
      where: { userId, status: "PENDING" },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    }).catch(() => []),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []),
    prisma.clubSettings.findUnique({
      where: { id: "singleton" }
    }).catch(() => null)
  ]);

  if (!user) {
    redirect("/login");
  }

  const gatewayActive = settings?.paymentGatewayActive || false;
  const clubLogo = settings?.logo || "/logo.jpg";

  return (
    <UnifiedFinanceView 
      user={user}
      pendingInvoices={pendingInvoices}
      transactions={transactions}
      gatewayActive={gatewayActive}
      clubLogo={clubLogo}
    />
  );
}
