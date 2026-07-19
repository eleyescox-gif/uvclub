import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import styles from "./finance-member.module.css";
import { FileText, Clock, AlertCircle } from "lucide-react";
import OnlinePaymentCard from "./OnlinePaymentCard";

const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default async function MemberFinancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // 1. Fetch pending invoices for the user
  const pendingInvoices = await prisma.invoice.findMany({
    where: { userId, status: "PENDING" },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  // 2. Fetch all transactions for this user
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Fetch settings to check if automated payment gateway is active
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "singleton" }
  });
  const gatewayActive = settings?.paymentGatewayActive || false;

  return (
    <div className={styles.container} style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 0.85rem' }}>
      <header className={styles.header} style={{ marginBottom: '1.75rem' }}>
        <h1 className={styles.title} style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--foreground)' }}>অর্থ ও পেমেন্ট বিবরণী</h1>
        <p className={styles.subtitle} style={{ color: '#6b7280', fontSize: '0.85rem' }}>আপনার বকেয়া চাঁদা পরিশোধ এবং লেনদেন ইতিহাস</p>
      </header>

      {/* A. Pending Invoices Card */}
      <div className="glass" style={{ padding: '1.5rem 1.25rem', borderRadius: '1.25rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.12)'
          }}>
            <AlertCircle size={20} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
            বকেয়া চাঁদার তালিকা
          </h2>
        </div>

        {pendingInvoices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingInvoices.map((inv) => {
              const totalBill = inv.amount + inv.lateFee;
              return (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                      {monthsBn[inv.month - 1]} {inv.year} এর মাসিক চাঁদা
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      মূল চাঁদা: {inv.amount} ৳ {inv.lateFee > 0 && `| বিলম্ব জরিমানা: ${inv.lateFee} ৳`}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>
                      ৳ {totalBill.toLocaleString('bn-BD')}
                    </span>
                    
                    {/* Render Automated Payment Checkout Button if active */}
                    {gatewayActive ? (
                      <OnlinePaymentCard 
                        invoiceId={inv.id} 
                        amount={totalBill} 
                        month={inv.month} 
                        year={inv.year} 
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                        অফলাইন পেমেন্ট (ক্যাশিয়ার)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            🎉 আপনার কোনো বকেয়া চাঁদা নেই!
          </div>
        )}
      </div>

      {/* B. Transactions History Card */}
      <div className={`glass ${styles.card}`}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileText size={20} color="var(--primary)" /> আমার পেমেন্ট ও লেনদেনের ইতিহাস
        </h2>

        {transactions.length > 0 ? (
          <div className={styles.transactionList}>
            {transactions.map(tx => (
              <div key={tx.id} className={styles.transactionItem} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div className={styles.txInfo}>
                  <div className={styles.txIconWrapper} style={{ backgroundColor: tx.status === 'APPROVED' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)' }}>
                    {tx.status === "APPROVED" ? (
                      <FileText className={styles.iconSuccess} size={20} style={{ color: 'var(--success)' }} />
                    ) : (
                      <Clock className={styles.iconWarning} size={20} style={{ color: '#f59e0b' }} />
                    )}
                  </div>
                  <div>
                    <h3 className={styles.txTitle} style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                      {tx.type === "DEPOSIT" ? "চাঁদা পরিশোধ" : (tx.type === "WITHDRAWAL" ? "উত্তোলন" : tx.type)}
                    </h3>
                    <p className={styles.txDate} style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                      {new Date(tx.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'})} 
                      {tx.proofImage && ` • ${tx.proofImage}`}
                    </p>
                  </div>
                </div>
                
                <div className={styles.txAction} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={styles.txAmount} style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    ৳ {tx.amount.toLocaleString('en-IN')}
                  </div>
                  {tx.status === "APPROVED" && (
                    <Link href={`/receipt/${tx.id}`} className={styles.receiptLink} style={{ fontSize: '0.75rem', textDecoration: 'underline', color: 'var(--primary)' }}>
                      রশিদ
                    </Link>
                  )}
                  {tx.status === "PENDING" && (
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                      যাচাইাধীন
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>আপনার কোনো লেনদেন ইতিহাস নেই।</p>
          </div>
        )}
      </div>
    </div>
  );
}
