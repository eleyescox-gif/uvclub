import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import UnifiedFinanceView from "./UnifiedFinanceView";

export const dynamic = "force-dynamic";

export default async function MemberFinancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Parallelized DB queries for maximum speed
  const [user, pendingInvoices, transactions, paidInvoices, settings] = await Promise.all([
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
    // Fetch PAID invoices to show payment history with correct month names
    prisma.invoice.findMany({
      where: { userId, status: "PAID" },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    }).catch(() => []),
    (prisma as any).clubSettings.findUnique({
      where: { id: "singleton" }
    }).catch(() => null)
  ]);

  if (!user) {
    redirect("/login");
  }

  // Find current month paid invoice (if any)
  const currentMonthPaid = paidInvoices.find(
    (inv) => inv.month === currentMonth && inv.year === currentYear
  );

  const gatewayActive = settings?.paymentGatewayActive || false;
  const clubLogo = settings?.logo || "/logo.jpg";

  return (
    <UnifiedFinanceView 
      user={user}
      pendingInvoices={pendingInvoices}
      paidInvoices={paidInvoices}
      transactions={transactions}
      gatewayActive={gatewayActive}
      clubLogo={clubLogo}
      currentMonth={currentMonth}
      currentYear={currentYear}
      currentMonthPaid={!!currentMonthPaid}
      currentMonthPaidAmount={currentMonthPaid ? currentMonthPaid.amount : 0}
      currentMonthPaidDate={currentMonthPaid ? currentMonthPaid.updatedAt ?? currentMonthPaid.createdAt : null}
    />
  );
}
