import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PieChart, TrendingUp, Users, Activity, Download } from "lucide-react";
import PrintButton from "./PrintButton";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  // This report might be public to all members, or restricted. Let's make it public for transparency.

  // 1. Member stats
  const totalActiveMembers = await prisma.user.count({ where: { activeStatus: true } });
  const totalInactiveMembers = await prisma.user.count({ where: { activeStatus: false } });

  // 2. Financial Aggregates
  const transactions = await prisma.transaction.findMany({
    where: { status: "APPROVED" }
  });

  let totalDeposit = 0;
  let totalWithdrawal = 0;
  let totalPenaltyCollected = 0;
  let totalProfitDistributed = 0;
  let totalLossDistributed = 0;

  transactions.forEach(t => {
    switch (t.type) {
      case "DEPOSIT": totalDeposit += t.amount; break;
      case "WITHDRAWAL": totalWithdrawal += t.amount; break;
      case "PENALTY": totalPenaltyCollected += t.amount; break;
      case "PROFIT_POSTING": totalProfitDistributed += t.amount; break;
      case "LOSS_POSTING": totalLossDistributed += t.amount; break;
    }
  });

  // Calculate Total Members' Balance dynamically from transactions to avoid mismatch with dirty seed data
  const totalMemberBalance = totalDeposit + totalProfitDistributed - totalLossDistributed - totalWithdrawal;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={28} color="var(--primary)" /> সার্বিক রিপোর্ট
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>ক্লাবের বর্তমান আর্থিক এবং সদস্য সম্পর্কিত সার্বিক অবস্থা</p>
        </div>
        <div>
          <PrintButton />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Member Summary */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem', color: '#3b82f6' }}>
            <Users size={32} />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>মোট সদস্য</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalActiveMembers + totalInactiveMembers}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>অ্যাক্টিভ: {totalActiveMembers}</span> | <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>ইনঅ্যাক্টিভ: {totalInactiveMembers}</span>
          </div>
        </div>

        {/* Total Funds Collected */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', color: 'var(--success)' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>মোট চাঁদা/ডিপোজিট</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>৳ {totalDeposit.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Current Members Balance */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', color: 'var(--danger)' }}>
            <Activity size={32} />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>সদস্যদের পাওনা ব্যালেন্স</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>৳ {totalMemberBalance.toLocaleString('en-IN')}</h3>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>উত্তোলন: ৳ {totalWithdrawal.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>বিস্তারিত আর্থিক বিবরণী</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: '#4b5563' }}>মোট চাঁদা আদায় (ডিপোজিট)</span>
            <span style={{ fontWeight: 600 }}>৳ {totalDeposit.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: '#4b5563' }}>মোট লভ্যাংশ বন্টন</span>
            <span style={{ fontWeight: 600, color: 'var(--success)' }}>+ ৳ {totalProfitDistributed.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: '#4b5563' }}>মোট লোকসান বন্টন</span>
            <span style={{ fontWeight: 600, color: 'var(--danger)' }}>- ৳ {totalLossDistributed.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: '#4b5563' }}>মোট প্রস্থান ও উত্তোলন</span>
            <span style={{ fontWeight: 600, color: 'var(--warning)' }}>- ৳ {totalWithdrawal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: '#4b5563' }}>মোট এক্সিট পেনাল্টি (ক্লাবের আয়)</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>+ ৳ {totalPenaltyCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
