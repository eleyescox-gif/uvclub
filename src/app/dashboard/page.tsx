import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { ArrowUpRight, Clock, Plus, Download, Activity, CheckCircle, Briefcase, FileText, CheckCircle2, Award, Wallet, Landmark, Users, CheckSquare, RefreshCw, Vote, Megaphone, User, FileCheck, ChevronRight } from "lucide-react";
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
  const today = new Date();
  if (today.getDate() > 10) {
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
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

  // Parallelized database queries
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

  // Clean, consistent Quick Services List
  const quickServices = [
    { name: "চাঁদা জমা", href: "/dashboard/finance", icon: <Wallet size={20} /> },
    { name: "বিবরণী", href: "/dashboard/finance", icon: <FileText size={20} /> },
    { name: "ভোট প্যানেল", href: "/dashboard/voting", icon: <Vote size={20} /> },
    { name: "নোটিশ", href: "/dashboard/notices", icon: <Megaphone size={20} /> },
    { name: "প্রজেক্ট", href: "/dashboard/projects", icon: <Briefcase size={20} /> },
    { name: "সদস্যবৃন্দ", href: "/dashboard/members", icon: <Users size={20} /> },
    { name: "আবেদন", href: "/dashboard/applications", icon: <FileCheck size={20} /> },
    { name: "প্রোফাইল", href: "/dashboard/profile", icon: <User size={20} /> },
  ];

  if (role === "ADMIN" || role === "CASHIER") {
    quickServices.push({ name: "চাঁদা এন্ট্রি", href: "/dashboard/admin/finance", icon: <Plus size={20} /> });
  }
  if (role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY") {
    quickServices.push({ name: "অনুমোদন", href: "/dashboard/admin/members/pending", icon: <CheckCircle2 size={20} /> });
    quickServices.push({ name: "রিপোর্ট", href: "/dashboard/admin/reports", icon: <Activity size={20} /> });
  }

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ড্যাশবোর্ড</h1>
          <p className={styles.subtitle}>ইউনাইটেড ভিশন ক্লাব ড্যাশবোর্ডে আপনাকে স্বাগতম।</p>
        </div>
      </div>

      {/* 1. Top Summary Stats Grid (3 Columns Desktop, 2 Columns Mobile) */}
      <div className={styles.topStatsGrid}>
        {/* Card 1: My Personal Deposit */}
        <div className={styles.balanceCardFull}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle} style={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={18} /> আমার মোট জমা
            </span>
          </div>
          <div>
            <h2 className={styles.statCardValue} style={{ color: '#ffffff', fontSize: '1.75rem' }}>
              <AnimatedCounter value={personalBalance} prefix="৳ " />
            </h2>
            <span className={styles.ctaBadge} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.35)' }}>
              ব্যক্তিগত সঞ্চয় তহবিল
            </span>
          </div>
        </div>

        {/* Card 2: Club Total Fund */}
        <div className={styles.statCardFlat}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardTitle}>ক্লাবের জমা</span>
            <div className={`${styles.iconContainer} ${styles.iconGreen}`}>
              <Landmark size={20} />
            </div>
          </div>
          <div>
            <h2 className={styles.statCardValue}>
              <AnimatedCounter value={clubBalance} prefix="৳ " />
            </h2>
            <span className={`${styles.ctaBadge} ${styles.ctaGreen}`}>
              ক্লাবের মোট ফান্ড ব্যালেন্স
            </span>
          </div>
        </div>

        {/* Card 3: Pending Polls */}
        <Link href="/dashboard/voting" style={{ textDecoration: 'none' }}>
          <div className={styles.statCardFlat}>
            <div className={styles.statCardHeader}>
              <span className={styles.statCardTitle}>পেন্ডিং ভোট</span>
              <div className={`${styles.iconContainer} ${styles.iconAmber}`}>
                <CheckSquare size={20} />
              </div>
            </div>
            <div>
              <h2 className={styles.statCardValue}>
                <AnimatedCounter value={pendingPolls} />
              </h2>
              <span className={`${styles.ctaBadge} ${styles.ctaAmber}`}>
                এখনই দেখুন &rarr;
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Mobile-First Quick Services Grid (2 Columns on Mobile, 4 Columns Desktop) */}
      <div className={styles.quickServicesSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Activity size={18} color="#059669" /> কুইক সেবাসমূহ
          </h3>
          <span className={styles.sectionSubtitle}>১-ট্যাপ অ্যাকশন</span>
        </div>

        <div className={styles.servicesGrid}>
          {quickServices.map((item, index) => (
            <Link key={index} href={item.href} className={styles.serviceCard}>
              <div className={styles.serviceIconBox}>
                {item.icon}
              </div>
              <span className={styles.serviceLabel}>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Profit & Loss Statement Palette */}
      <div className={styles.pnlSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Landmark size={18} color="#059669" /> প্রতিষ্ঠানের আয়-ব্যয় ও নিট লভ্যাংশ
          </h3>
          <Link href="/dashboard/admin/reports" className={styles.badgeBtn}>
            বিস্তারিত &rarr;
          </Link>
        </div>

        <div className={styles.pnlGrid}>
          {/* Total Income */}
          <div className={`${styles.pnlBlock} ${styles.pnlIncome}`}>
            <span className={styles.pnlLabel}>মোট অর্জিত আয়</span>
            <h3 className={styles.pnlValue}>
              <AnimatedCounter value={totalIncome} prefix="৳ " />
            </h3>
            <span className={styles.pnlDesc}>চাঁদা ও সফল এন্ট্রি থেকে সংগৃহীত</span>
          </div>

          {/* Total Expense */}
          <div className={`${styles.pnlBlock} ${styles.pnlExpense}`}>
            <span className={styles.pnlLabel}>মোট পরিচালনা ও ব্যাংক ব্যয়</span>
            <h3 className={styles.pnlValue}>
              <AnimatedCounter value={totalExpense} prefix="৳ " />
            </h3>
            <span className={styles.pnlDesc}>সার্ভার, অফিস ও ব্যাংক চার্জের সমষ্টি</span>
          </div>

          {/* Net Surplus */}
          <div className={`${styles.pnlBlock} ${styles.pnlSurplus}`}>
            <span className={styles.pnlLabel}>নিট তহবিল লভ্যাংশ / সঞ্চয়</span>
            <h3 className={styles.pnlValue}>
              <AnimatedCounter value={netSurplus} prefix="৳ " />
            </h3>
            <span className={styles.pnlDesc}>
              {netSurplus >= 0 ? 'নিট সংরক্ষিত লভ্যাংশ তহবিলে রয়েছে' : 'ঘাটতি সঞ্চয় তহবিল'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Main 3-Column Content Layout */}
      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.colLeft}>
          {/* Active Poll Area */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                {latestPoll?.status === 'OPEN' ? 'চলমান সিদ্ধান্ত ও ভোট' : 'সাম্প্রতিক সিদ্ধান্ত'}
              </h3>
              <Link href="/dashboard/voting" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            {latestPoll ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{latestPoll.title}</h4>
                  <span className={latestPoll.status === 'OPEN' ? styles.statusPillWarning : styles.statusPill}>
                    {latestPoll.status === 'OPEN' ? 'চলমান' : 'সম্পন্ন'}
                  </span>
                </div>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', color: '#64748b', padding: '4px 8px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} color="#059669" /> <span>{latestPoll._count.votes}/{totalMembers} ভোট</span></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="#d97706" /> <span>শেষ: {latestPoll.deadline ? new Date(latestPoll.deadline).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) : 'অনির্ধারিত'}</span></span>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '16px' }}>{latestPoll.description}</p>
                
                {latestPoll.status !== 'OPEN' && winner && winner._count.votes > 0 && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Award size={16} /> অভিনন্দন! 
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#92400e', margin: 0 }}>
                      বিজয়ী সিদ্ধান্ত: <strong>{winner.text}</strong>
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
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>বর্তমানে কোনো সক্রিয় ভোট নেই।</p>
              </div>
            )}
          </div>

          {/* Member Services */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>মেম্বার সেবাসমূহ</h3>
            </div>
            
            <div className={styles.serviceList}>
              <Link href="/dashboard/finance" className={styles.serviceItem}>
                <div className={styles.avatarWrapper} style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                  <FileText size={18} />
                </div>
                <div className={styles.serviceInfo}>
                  <h4>পেমেন্ট ও রশিদ বিবরণী</h4>
                  <p>আপনার জমা ও রশিদের তালিকা দেখুন</p>
                </div>
                <div className={styles.statusPill}>সক্রিয়</div>
              </Link>
              
              <Link href="/dashboard/projects" className={styles.serviceItem}>
                <div className={styles.avatarWrapper} style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                  <Briefcase size={18} />
                </div>
                <div className={styles.serviceInfo}>
                  <h4>ক্লাবের প্রজেক্টসমূহ</h4>
                  <p>চলমান বিনিয়োগের তথ্য দেখুন</p>
                </div>
                <div className={styles.statusPillWarning}>এখনই দেখুন</div>
              </Link>

              <Link href="/dashboard/voting" className={styles.serviceItem}>
                <div className={styles.avatarWrapper} style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div className={styles.serviceInfo}>
                  <h4>ভোট ও সিদ্ধান্ত প্যানেল</h4>
                  <p>সিদ্ধান্তে আপনার মতামত দিন</p>
                </div>
                <div className={styles.statusPillDanger}>ভোট দিন</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className={styles.colMiddle}>
          {/* Fund Collection Progress */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ marginBottom: '16px' }}>চাঁদা আদায় অগ্রগতি</h3>
            <div className={styles.progressCircleArea}>
              <div className={styles.donutChart} style={{
                background: `conic-gradient(#059669 ${collectionProgress * 3.6}deg, #e2e8f0 0deg)`,
              }}>
                <div className={styles.donutInner}>
                  <h3>{collectionProgress}%</h3>
                  <p>আদায়ের হার</p>
                </div>
              </div>

              <div className={styles.legendArea}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span className={styles.legendItem} style={{ color: '#166534' }}>
                    <span className={styles.dot} style={{ backgroundColor: '#059669' }}></span> আদায় হয়েছে
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803d', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #86efac' }}>
                    {paidInvoicesAllTime} জন
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                  <span className={styles.legendItem} style={{ color: '#991b1b' }}>
                    <span className={styles.dot} style={{ backgroundColor: '#dc2626' }}></span> বকেয়া
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#b91c1c', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                    {Math.max(0, totalInvoicesAllTime - paidInvoicesAllTime)} জন
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>চলমান প্রজেক্টসমূহ</h3>
              <Link href="/dashboard/projects" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {runningProjects.length > 0 ? (
                runningProjects.map((p) => {
                  const isAct = p.status === 'ACTIVE';
                  return (
                    <div key={p.id} style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {p.title}
                        </h4>
                        <span className={isAct ? styles.statusPill : styles.statusPillWarning}>
                          {isAct ? 'চলমান' : 'প্রস্তাবিত'}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>বিনিয়োগের পরিমাণ:</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                          ৳ {p.investmentAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0', fontSize: '0.875rem' }}>কোনো চলমান প্রজেক্ট নেই</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.colRight}>
          {/* Notice Board Card */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>নোটিশ বোর্ড</h3>
              <Link href="/dashboard/notices" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {latestNotices.length > 0 ? (
                latestNotices.map((n, index) => {
                  const author = noticeCreatorsMap[n.createdBy];
                  const authorName = author?.nameBn || author?.name || "কর্তৃপক্ষ";
                  const authorRole = roleTitles[author?.role || "MEMBER"] || "সদস্য";
                  
                  return (
                    <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '10px', borderBottom: index === latestNotices.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <Link href="/dashboard/notices" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', color: '#059669' }}>
                        {n.title}
                      </Link>
                      <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {n.content}
                      </p>
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                        {authorName} ({authorRole}) • {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0', fontSize: '0.875rem' }}>কোনো নোটিশ নেই</div>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>সাম্প্রতিক কার্যক্রম</h3>
              <Link href="/dashboard/finance" className={styles.badgeBtn}>সব দেখুন</Link>
            </div>
            
            <div className={styles.recentList}>
              {user?.transactions && user.transactions.length > 0 ? (
                user.transactions.map((tx: any) => {
                  const txName = tx.type === 'DEPOSIT' ? 'চাঁদা জমা' : tx.type === 'WITHDRAWAL' ? 'উত্তোলন' : tx.type === 'PROFIT_POSTING' ? 'লভ্যাংশ' : 'জরিমানা';
                  const isInc = tx.type === 'DEPOSIT' || tx.type === 'PROFIT_POSTING';
                  return (
                    <div key={tx.id} className={styles.recentItem}>
                      <div className={styles.recentIconWrapper} data-type={tx.type}>
                        <Activity size={16} />
                      </div>
                      <div className={styles.recentInfo}>
                        <h4>{tx.txName || txName}</h4>
                        <p>তারিখ: {new Date(tx.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isInc ? '#059669' : '#dc2626' }}>
                        {isInc ? '+' : '-'} ৳{tx.amount}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '0.875rem' }}>কোনো সাম্প্রতিক কার্যক্রম পাওয়া যায়নি</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
