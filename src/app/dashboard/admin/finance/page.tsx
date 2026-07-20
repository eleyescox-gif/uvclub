import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllMembersForSelect } from "@/actions/finance";
import styles from "./finance-admin.module.css";
import PostPaymentForm from "./PostPaymentForm";
import ProfitDistributionForm from "./ProfitDistributionForm";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { FileText } from "lucide-react";
import RecentTransactionsList from "./RecentTransactionsList";

export default async function AdminFinancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "CASHIER" && role !== "PRESIDENT" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  const members = await getAllMembersForSelect();

  // Fetch active projects for profit distribution dropdown
  const activeProjects = await prisma.project.findMany({
    where: { status: { in: ['ACTIVE', 'PROPOSED'] } },
    select: { id: true, title: true, status: true },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, mobile: true, nameBn: true },
      },
    },
  });

  const txData = recentTransactions.map(tx => ({
    id: tx.id,
    userName: tx.user.nameBn || tx.user.name,
    userMobile: tx.user.mobile,
    amount: tx.amount,
    type: tx.type,
    createdAt: tx.createdAt.toISOString(),
    receiptNo: `UVC-${tx.id.substring(0, 8).toUpperCase()}`,
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>অ্যাডমিন ফাইন্যান্স প্যানেল</h1>
        <p className={styles.subtitle}>সদস্যদের চাঁদা পোস্টিং, প্রফিট ডিস্ট্রিবিউশন ও রিপোর্ট</p>
      </header>

      <div className={styles.grid}>
        {/* Left Column: Post Payment & Profit Distribution Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <PostPaymentForm members={members} />
          <ProfitDistributionForm activeProjects={activeProjects} />
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={`glass ${styles.card}`}>
            <h2 className={styles.cardTitle}>মাসিক রিপোর্ট</h2>
            <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
              প্রতি মাসের সদস্যদের পেমেন্টের তালিকা এবং টাকার পরিমাণ প্রিন্ট করতে নিচের বাটনে ক্লিক করুন।
            </p>
            <Link
              href="/dashboard/admin/finance/report"
              className="btn btn-primary"
              style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}
            >
              <FileText size={20} />
              <span>মাসিক রিপোর্ট তৈরি করুন</span>
            </Link>
          </div>

          {/* Recent Transactions with WhatsApp buttons */}
          <RecentTransactionsList transactions={txData} />
        </div>
      </div>
    </div>
  );
}
