import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./report.module.css";
import PrintButton from "./PrintButton";
import { getClubInfo } from "@/lib/clubInfo";

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "CASHIER" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  const club = await getClubInfo();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const month = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month) : currentMonth;
  const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year) : currentYear;

  // Find all DEPOSIT transactions for this month and year
  // In our DB, we are saving date as DateTime. We can filter by date range.
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      type: "DEPOSIT",
      createdAt: {
        gte: startDate,
        lt: endDate,
      }
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
        <Link href="/dashboard/admin/finance" className={`btn ${styles.btnBack}`}>
          <ArrowLeft size={16} /> ফিরে যান
        </Link>
        <PrintButton />
      </div>

      <div className={styles.reportPaper} id="print-area" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Watermark */}
        {club.watermarkLogo && (
          <div className={styles.watermarkWrapper}>
            <img src={club.watermarkLogo} alt="" className={styles.watermarkImage} />
          </div>
        )}
        <div className={styles.reportHeader} style={{ position: 'relative', zIndex: 1 }}>
          {/* Club Logo */}
          {club.logo && (
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <img src={club.logo} alt="logo" style={{ height: '55px', objectFit: 'contain' }} />
            </div>
          )}
          <h1 className={styles.clubName}>{club.name}</h1>
          <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0' }}>{club.address}</p>
          <h2 className={styles.reportTitle}>মাসিক চাঁদা কালেকশন রিপোর্ট</h2>
          <p className={styles.reportMeta}>মাস: {monthNames[month - 1]} | বছর: {year}</p>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>সদস্যের নাম</th>
              <th>মোবাইল নম্বর</th>
              <th>তারিখ</th>
              <th style={{textAlign: 'right'}}>পরিমাণ (৳)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={tx.id}>
                <td>{idx + 1}</td>
                <td>{tx.user.name}</td>
                <td>{tx.user.mobile}</td>
                <td>{new Date(tx.createdAt).toLocaleDateString('bn-BD')}</td>
                <td style={{textAlign: 'right'}}>{tx.amount.toLocaleString('bn-BD')}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} style={{textAlign: 'center', color: '#6b7280'}}>এই মাসে কোনো কালেকশন হয়নি</td>
              </tr>
            )}
          </tbody>
          {transactions.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4} style={{textAlign: 'right', fontWeight: 'bold'}}>সর্বমোট:</td>
                <td style={{textAlign: 'right', fontWeight: 'bold'}}>৳ {totalAmount.toLocaleString('bn-BD')}</td>
              </tr>
            </tfoot>
          )}
        </table>

        <div className={styles.signatures}>
          <div className={styles.sigBox}>
            <div className={styles.sigLine}></div>
            <p>ক্যাশিয়ার</p>
          </div>
          <div className={styles.sigBox}>
            <div className={styles.sigLine}></div>
            <p>সভাপতি / সেক্রেটারি</p>
          </div>
        </div>
      </div>
    </div>
  );
}
