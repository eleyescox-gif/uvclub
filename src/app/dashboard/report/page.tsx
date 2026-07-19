import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import ReportView from "./ReportView";

export default async function ReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Fetch user data with all transactions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      transactions: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!user) {
    return <div>User not found</div>;
  }

  // Fetch approved deposit transactions for receipt list
  const receiptTransactions = await prisma.transaction.findMany({
    where: { userId, status: "APPROVED", type: "DEPOSIT" },
    orderBy: { createdAt: 'desc' },
    select: { id: true, amount: true, createdAt: true }
  });

  return (
    <div style={{ padding: '1rem', height: '100%' }}>
      <ReportView 
        user={{ name: user.name, mobile: user.mobile, role: user.role }} 
        transactions={user.transactions}
        receiptTransactions={receiptTransactions}
      />
    </div>
  );
}
