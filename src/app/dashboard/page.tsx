import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { ArrowUpRight, Clock, Plus, Download, Activity, CheckCircle, Briefcase, FileText, CheckCircle2, Award, Wallet, Landmark, Users, CheckSquare, RefreshCw } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import styles from "./dashboard.module.css";
import { authOptions } from "@/lib/auth";
import { PollOptionList } from "@/app/dashboard/voting/VotingComponents";
import AnimatedCounter from "@/components/dashboard/AnimatedCounter";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // --- Auto Penalty Logic ---
  // Background check: Apply 50 Taka late fee to this month's unpaid invoices if past the 10th
  const today = new Date();
  if (today.getDate() > 10) {
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Fire and forget (don't block the render)
    prisma.invoice.updateMany({
      where: {
        month: currentMonth,
        year: currentYear,
        status: 'PENDING',
        lateFee: 0
      },
      data: {
        lateFee: 50.0
      }
    }).catch(e => console.error("Auto penalty error:", e));
  }

  // Parallelized database queries for maximum performance
  const [
    user,
    runningProjects,
    pendingPolls,
    totalMembers,
    totalInvoicesAllTime,
    paidInvoicesAllTime,
    latestPoll,
    latestNotices,
    approvedTxs
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: {
        transactions: {
          take: 4,
          orderBy: { date: 'desc' }
        }
      }
    }).catch(() => null),
    prisma.project.findMany({
      where: { status: { in: ['ACTIVE', 'PROPOSED'] } },
      orderBy: { createdAt: 'desc' },
      take: 3
    }).catch(() => []),
    prisma.votingEvent.count({ where: { status: 'OPEN' } }).catch(() => 0),
    prisma.user.count({ where: { activeStatus: true } }).catch(() => 0),
    prisma.invoice.count().catch(() => 0),
    prisma.invoice.count({ where: { status: 'PAID' } }).catch(() => 0),
    prisma.votingEvent.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
            candidate: true
          }
        },
        _count: { select: { votes: true } }
      }
    }).catch(() => null),
    prisma.notice.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 2
    }).catch(() => []),
    prisma.transaction.findMany({
      where: { status: 'APPROVED' }
    }).catch(() => [])
  ]);

  const collectionProgress = totalInvoicesAllTime > 0
    ? Math.round((paidInvoicesAllTime / totalInvoicesAllTime) * 100)
    : 0;

  let userHasVotedOnActive = false;
  let userVotedOptionId: string | null = null;
  let winner = null;

  if (latestPoll && user) {
    const checkVote = await prisma.vote.findFirst({
      where: { userId: user.id, votingEventId: latestPoll.id }
    }).catch(() => null);
    userHasVotedOnActive = !!checkVote;
    if (checkVote) {
      userVotedOptionId = checkVote.pollOptionId;
    }

    if (latestPoll.status !== 'OPEN' && latestPoll.options.length > 0) {
      winner = latestPoll.options.reduce((prev, current) => (prev._count.votes > current._count.votes) ? prev : current);
    }
  }

  const role = (session.user as any).role;
  const noticeCreatorIds = latestNotices.map(n => n.createdBy);
  const noticeCreators = noticeCreatorIds.length > 0 
    ? await prisma.user.findMany({
        where: { id: { in: noticeCreatorIds } },
        select: { id: true, name: true, nameBn: true, role: true }
      }).catch(() => [])
    : [];

  const noticeCreatorsMap: Record<string, typeof noticeCreators[0]> = {};
  noticeCreators.forEach(c => {
    noticeCreatorsMap[c.id] = c;
  });

  const roleTitles: Record<string, string> = {
    PRESIDENT: "সভাপতি",
    SECRETARY: "সাধারণ সম্পাদক",
    CASHIER: "ক্যাশিয়ার",
    ADMIN: "অ্যাডমিন",
    MEMBER: "সাধারণ সদস্য",
  };

  let clubBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  approvedTxs.forEach(t => {
    if (t.type === 'DEPOSIT' || t.type === 'PROFIT_POSTING') {
      clubBalance += t.amount;
      totalIncome += t.amount;
    } else if (t.type === 'WITHDRAWAL' || t.type === 'LOSS_POSTING' || t.type === 'PENALTY') {
      clubBalance -= t.amount;
      totalExpense += t.amount;
    }
  });

  const netSurplus = totalIncome - totalExpense;
  const personalBalance = user?.balance || 0;

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ড্যাশবোর্ড</h1>
          <p className={styles.subtitle}>ইউনাইটেড ভিশন ক্লাব ড্যাশবোর্ডে আপনাকে স্বাগতম।</p>
        </div>
      </div>


      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        {/* Card 1: My Personal Deposit */}
        <div className={styles.statCardPremium}>
          <div className={styles.statHeader}>
            <span className={styles.statCardPremiumLabel}>
              <Wallet size={18} /> আমার মোট জমা
            </span>
          </div>
          <div>
            <h2 className={styles.statCardPremiumValue}>
              <AnimatedCounter value={personalBalance} prefix="৳ " />
            </h2>
            <div className={styles.statCardPremiumBadge}>
              ব্যক্তিগত সঞ্চয় তহবিল
            </div>
          </div>
        </div>

        {/* Card 2: Club Total Fund */}
        <div className={styles.statCardIndigo}>
          <div className={styles.statHeader}>
            <span style={{ color: '#3730a3', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              ক্লাবের জমা
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
              flexShrink: 0
            }}>
              <Landmark size={19} />
            </div>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e1b4b', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              <AnimatedCounter value={clubBalance} prefix="৳ " />
            </h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              color: '#3730a3',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '20px'
            }}>
              ক্লাবের মোট ফান্ড ব্যালেন্স
            </div>
          </div>
        </div>

        {/* Card 3: Total Members */}
        <Link href="/dashboard/members" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.statCardAmber}>
            <div className={styles.statHeader}>
              <span style={{ color: '#92400e', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                মোট সদস্য
              </span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#d97706',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
                flexShrink: 0
              }}>
                <Users size={19} />
              </div>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#78350f', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
                <AnimatedCounter value={totalMembers} />
              </h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                color: '#92400e',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '20px'
              }}>
                অনুমোদিত সক্রিয় সদস্য
              </div>
            </div>
          </div>
        </Link>

        {/* Card 4: Pending Polls */}
        <Link href="/dashboard/voting" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.statCardRose}>
            <div className={styles.statHeader}>
              <span style={{ color: '#9f1239', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                পেন্ডিং ভোট
              </span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)',
                flexShrink: 0
              }}>
                <CheckSquare size={19} />
              </div>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#881337', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
                <AnimatedCounter value={pendingPolls} />
              </h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(225, 29, 72, 0.1)',
                border: '1px solid rgba(225, 29, 72, 0.2)',
                color: '#9f1239',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '20px'
              }}>
                আপনার সিদ্ধান্ত প্রয়োজন
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Profit & Loss (লাভ ও লোকসান) Financial Palette Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Landmark size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                প্রতিষ্ঠানের আয়-ব্যয় ও নিট লভ্যাংশ স্টেটমেন্ট (P&L Palette)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                ইউনাইটেড ভিশন ক্লাবের সর্বমোট আয়, পরিচালন ব্যয় ও সঞ্চিত নিট তহবিলের আর্থিক সারাংশ
              </p>
            </div>
          </div>

          <Link href="/dashboard/admin/reports" style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--primary)',
            textDecoration: 'none',
            backgroundColor: 'var(--primary-light)',
            padding: '0.4rem 0.85rem',
            borderRadius: '0.5rem',
            transition: 'all 0.2s'
          }}>
            বিস্তারিত রিপোর্ট &rarr;
          </Link>
        </div>

        {/* 3-Color Palette Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginTop: '0.25rem'
        }}>
          {/* 1. Total Income Palette Block */}
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #86efac',
            borderRadius: '1rem',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🟢 মোট অর্জিত আয়
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#ffffff', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Gross Income
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#047857' }}>
              <AnimatedCounter value={totalIncome} prefix="৳ " />
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600 }}>
              চাঁদা ও সফল এন্ট্রি থেকে সংগৃহীত
            </span>
          </div>

          {/* 2. Total Expense Palette Block */}
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fca5a5',
            borderRadius: '1rem',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔴 মোট পরিচালনা ও ব্যাংক ব্যয়
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#ffffff', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Total Expenses
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#b91c1c' }}>
              <AnimatedCounter value={totalExpense} prefix="৳ " />
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>
              সার্ভার, অফিস ও ব্যাংক চার্জ সমূহের যোগফল
            </span>
          </div>

          {/* 3. Net Surplus / Profit Palette Block */}
          <div style={{
            background: netSurplus >= 0
              ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
              : 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: `1px solid ${netSurplus >= 0 ? '#93c5fd' : '#fed7aa'}`,
            borderRadius: '1rem',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: netSurplus >= 0 ? '#1e40af' : '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                💙 নিট তহবিল লভ্যাংশ / সঞ্চয়
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#ffffff', color: netSurplus >= 0 ? '#1d4ed8' : '#ea580c', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Net Surplus
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: netSurplus >= 0 ? '#1d4ed8' : '#c2410c' }}>
              <AnimatedCounter value={netSurplus} prefix="৳ " />
            </h3>
            <span style={{ fontSize: '0.72rem', color: netSurplus >= 0 ? '#1e40af' : '#c2410c', fontWeight: 600 }}>
              {netSurplus >= 0 ? 'ক্লাবের নিট সংরক্ষিত লভ্যাংশ তহবিলে রয়েছে' : 'ঘাটতি সঞ্চয় তহবিল'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.colLeft}>
          {/* Active Poll Area */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>{latestPoll?.status === 'OPEN' ? 'চলমান সিদ্ধান্ত ও ভোট' : 'সাম্প্রতিক সিদ্ধান্ত'}</h3>
              <Link href="/dashboard/voting" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            {latestPoll ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--foreground)' }}>{latestPoll.title}</h4>
                  <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: latestPoll.status === 'OPEN' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)', color: latestPoll.status === 'OPEN' ? '#3b82f6' : 'var(--success)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {latestPoll.status === 'OPEN' ? 'চলমান' : 'সম্পন্ন'}
                  </span>
                </div>
                
                {/* Meta Bar */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', color: '#6b7280', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} color="#3b82f6" /> <span style={{ fontWeight: 600, color: '#374151' }}>{latestPoll._count.votes}/{totalMembers}</span> ভোট</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} color="#f59e0b" /> শেষ হবে: <span style={{ fontWeight: 600, color: '#374151' }}>{latestPoll.deadline ? new Date(latestPoll.deadline).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' }) : 'অনির্ধারিত'}</span></span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>{latestPoll.description}</p>
                
                {latestPoll.status !== 'OPEN' && winner && winner._count.votes > 0 && (
                  <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', color: '#c2410c', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Award size={16} /> অভিনন্দন! 
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#9a3412' }}>
                      এই পোলে সর্বাধিক ভোট পেয়ে বিজয়ী হয়েছেন:
                    </p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c2410c', marginTop: '0.25rem' }}>
                      {winner.text}
                    </p>
                  </div>
                )}
                
                <PollOptionList 
                  pollId={latestPoll.id}
                  options={latestPoll.options.map(opt => ({ id: opt.id, text: opt.text, voteCount: opt._count.votes, candidate: (opt as any).candidate }))}
                  totalVotes={latestPoll._count.votes}
                  userHasVoted={userHasVotedOnActive}
                  userVotedOptionId={userVotedOptionId}
                  isClosed={latestPoll.status !== 'OPEN'}
                />
              </div>
            ) : (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#9ca3af' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>বর্তমানে কোনো সক্রিয় ভোট নেই।</p>
              </div>
            )}
          </div>

          {/* Quick Services */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>মেম্বার সেবাসমূহ</h3>
            </div>
            
            <div className={styles.serviceList}>
              <Link href="/dashboard/finance" className={styles.serviceItem}>
                <div className={styles.avatarWrapper} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <FileText size={18} />
                </div>
                <div className={styles.serviceInfo}>
                  <h4>পেমেন্ট ও রশিদ বিবরণী</h4>
                  <p>আপনার সব জমা ও রশিদের তালিকা দেখুন</p>
                </div>
                <div className={styles.statusPill}>সক্রিয়</div>
              </Link>
              
              <Link href="/dashboard/projects" className={styles.serviceItem}>
                <div className={styles.avatarWrapper} style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', color: '#10b981' }}>
                  <Briefcase size={18} />
                </div>
                <div className={styles.serviceInfo}>
                  <h4>ক্লাবের প্রজেক্টসমূহ</h4>
                  <p>চলমান বিনিয়োগের তথ্য দেখুন</p>
                </div>
                <div className={styles.statusPillWarning}>দেখুন</div>
              </Link>

              <Link href="/dashboard/voting" className={styles.serviceItem}>
                <div className={styles.avatarWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div className={styles.serviceInfo}>
                  <h4>ভোট ও সিদ্ধান্ত প্যানেল</h4>
                  <p>সিদ্ধান্তে আপনার মতামত দিন</p>
                </div>
                <div className={styles.statusPillDanger}>ভোট</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className={styles.colMiddle}>
          {/* Fund Collection Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>চাঁদা আদায় অগ্রগতি</h3>
            <div className={styles.progressCircleArea}>
              <div className={styles.donutChart} style={{
                background: `conic-gradient(var(--primary) ${collectionProgress * 3.6}deg, #f1f5f9 0deg)`,
                borderRadius: '50%',
                width: '140px',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div className={styles.donutInner} style={{
                  backgroundColor: 'white',
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>{collectionProgress}%</h3>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>আদায়ের হার</p>
                </div>
              </div>
              <div className={styles.legendArea}>
                <span className={styles.legendItem}><span className={styles.dot} style={{backgroundColor: 'var(--primary)'}}></span> আদায় হয়েছে</span>
                <span className={styles.legendItem}><span className={styles.dot} style={{backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1'}}></span> বকেয়া</span>
              </div>
            </div>
          </div>

          {/* Active Projects Panel */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>চলমান প্রজেক্টসমূহ</h3>
              <Link href="/dashboard/projects" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {runningProjects.length > 0 ? (
                runningProjects.map((p) => {
                  const statusColors = p.status === 'ACTIVE' 
                    ? { bg: 'rgba(16, 185, 129, 0.08)', text: 'var(--success)', label: 'চলমান' }
                    : { bg: 'rgba(245, 158, 11, 0.08)', text: 'var(--warning)', label: 'প্রস্তাবিত' };
                  
                  return (
                    <div key={p.id} style={{ 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
                          {p.title}
                        </h4>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '9999px', 
                          background: statusColors.bg, 
                          color: statusColors.text, 
                          fontWeight: 700 
                        }}>
                          {statusColors.label}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.15rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                        {p.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>বিনিয়োগের পরিমাণ:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ৳ {p.investmentAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem 0', fontSize: '0.8rem' }}>কোনো চলমান প্রজেক্ট নেই</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.colRight}>
          {/* Notice Board Card */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                নোটিশ বোর্ড
              </h3>
              <Link href="/dashboard/notices" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {latestNotices.length > 0 ? (
                latestNotices.map((n, index) => {
                  const author = noticeCreatorsMap[n.createdBy];
                  const authorName = author?.nameBn || author?.name || "কর্তৃপক্ষ";
                  const authorRole = roleTitles[author?.role || "MEMBER"] || "সদস্য";
                  
                  return (
                    <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: '0.75rem', borderBottom: index === latestNotices.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <Link href="/dashboard/notices" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                        {n.title}
                      </Link>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                        {n.content}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', fontWeight: 600 }}>
                        {authorName} ({authorRole}) • {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem 0', fontSize: '0.8rem' }}>কোনো নোটিশ নেই</div>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>সাম্প্রতিক কার্যক্রম</h3>
              <Link href="/dashboard/finance" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            <div className={styles.recentList}>
              {user?.transactions && user.transactions.length > 0 ? (
                user.transactions.map((tx: any) => {
                  const txName = tx.type === 'DEPOSIT' ? 'চাঁদা জমা' : tx.type === 'WITHDRAWAL' ? 'উত্তোলন' : tx.type === 'PROFIT_POSTING' ? 'লভ্যাংশ' : 'জরিমানা';
                  return (
                    <div key={tx.id} className={styles.recentItem}>
                      <div className={styles.recentIconWrapper} data-type={tx.type}>
                        <Activity size={16} />
                      </div>
                      <div className={styles.recentInfo}>
                        <h4>{tx.txName || txName}</h4>
                        <p>তারিখ: {new Date(tx.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tx.type === 'DEPOSIT' || tx.type === 'PROFIT_POSTING' ? 'var(--success)' : 'var(--danger)' }}>
                        {tx.type === 'DEPOSIT' || tx.type === 'PROFIT_POSTING' ? '+' : '-'} ৳{tx.amount}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0', fontSize: '0.85rem' }}>কোনো সাম্প্রতিক কার্যক্রম পাওয়া যায়নি</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
