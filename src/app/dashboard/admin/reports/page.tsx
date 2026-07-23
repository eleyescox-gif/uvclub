import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReportSelector from "./ReportSelector";
import ReportRequestsManager from "./ReportRequestsManager";
import { getClubInfo } from "@/lib/clubInfo";

export default async function ReportsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    type?: string; 
    month?: string; 
    year?: string; 
    userId?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CASHIER" && role !== "CONTROLLER") {
    redirect("/dashboard");
  }

  const club = await getClubInfo();

  // Fetch list of active members for selection in the selector component
  const activeMembersList = await prisma.user.findMany({
    where: { isDeleted: false, activeStatus: true },
    select: { id: true, name: true, nameBn: true, mobile: true },
    orderBy: { name: 'asc' }
  });

  const resolvedSearchParams = await searchParams;
  const type = resolvedSearchParams.type || "member-list";
  const month = resolvedSearchParams.month || "all";
  const year = resolvedSearchParams.year || "all";
  const userId = resolvedSearchParams.userId || (activeMembersList[0]?.id || "");
  const dateFrom = resolvedSearchParams.dateFrom || `${new Date().getFullYear()}-01-01`;
  const dateTo = resolvedSearchParams.dateTo || new Date().toISOString().split("T")[0];

  let reportTitle = "";
  let reportSubtitle = "";
  let reportData: any = null;
  let ledgerUser: any = null;
  let ledgerOpeningBalance = 0;
  let ledgerTransactions: any[] = [];

  const getMonthName = (m: number) => {
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    return months[m - 1] || "";
  };

  // Compile Filters Text
  let filtersText = "";
  if (type === "due-subscriptions" || type === "paid-subscriptions") {
    const mText = month !== "all" ? getMonthName(parseInt(month)) : "সব মাস";
    const yText = year !== "all" ? `${year} খ্রি.` : "সব বছর";
    filtersText = `সময়কাল: ${mText}, ${yText}`;
  }

  // 1. All Members List
  if (type === "member-list") {
    reportTitle = "সকল সদস্যের তালিকা";
    reportData = await prisma.user.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'asc' } });
  } 
  
  // 2. Active Members List
  else if (type === "active-members") {
    reportTitle = "সক্রিয় সদস্য তালিকা";
    reportData = await prisma.user.findMany({ where: { isDeleted: false, activeStatus: true }, orderBy: { createdAt: 'asc' } });
  } 
  
  // 3. Member Nominees List
  else if (type === "member-nominees") {
    reportTitle = "সদস্য ও নমিনি বিবরণী তালিকা";
    reportData = await prisma.user.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'asc' } });
  } 
  
  // 3. Due Subscriptions
  else if (type === "due-subscriptions") {
    reportTitle = "বকেয়া চাঁদার তালিকা";
    const dueWhere: any = { status: "PENDING" };
    if (month !== "all") dueWhere.month = parseInt(month);
    if (year !== "all") dueWhere.year = parseInt(year);

    reportData = await prisma.invoice.findMany({ 
      where: dueWhere,
      include: { user: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
  } 
  
  // 4. Paid Subscriptions
  else if (type === "paid-subscriptions") {
    reportTitle = "পরিশোধিত চাঁদার তালিকা";
    const paidWhere: any = { status: "PAID" };
    if (month !== "all") paidWhere.month = parseInt(month);
    if (year !== "all") paidWhere.year = parseInt(year);

    reportData = await prisma.invoice.findMany({ 
      where: paidWhere,
      include: { user: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
  } 
  
  // 5. Members Transaction Summary
  else if (type === "member-transactions") {
    reportTitle = "সদস্যদের লেনদেন বিবরণী (সংক্ষিপ্ত)";
    reportData = await prisma.user.findMany({
      where: { isDeleted: false },
      include: {
        transactions: {
          where: { status: "APPROVED" }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  } 
  
  // 6. Club Institutional Financial Statement (Total Income & Expense)
  else if (type === "club-financial-statement") {
    reportTitle = "প্রতিষ্ঠানের সামগ্রিক আয় ও ব্যয় বিবরণী";
    filtersText = `মেয়াদ: ${new Date(dateFrom).toLocaleDateString('bn-BD')} হতে ${new Date(dateTo).toLocaleDateString('bn-BD')}`;

    const [totalSubPaid, approvedExitDeductions, profitPostings, lossPostings, reconLogs] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true, lateFee: true }
      }).catch(() => ({ _sum: { amount: 0, lateFee: 0 } })),
      prisma.exitRequest.aggregate({
        where: { status: "APPROVED" },
        _sum: { deductionAmount: true }
      }).catch(() => ({ _sum: { deductionAmount: 0 } })),
      prisma.transaction.aggregate({
        where: { type: "PROFIT_POSTING", status: "APPROVED" },
        _sum: { amount: true }
      }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.transaction.aggregate({
        where: { type: "LOSS_POSTING", status: "APPROVED" },
        _sum: { amount: true }
      }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.bankReconciliation.findMany().catch(() => [])
    ]);

    const totalSubscriptions = (totalSubPaid._sum.amount || 0) + (totalSubPaid._sum.lateFee || 0);
    const exitBonusIncome = approvedExitDeductions._sum.deductionAmount || 0;
    const projectProfits = profitPostings._sum.amount || 0;
    
    let bankInterest = 0;
    let bankCharge = 0;
    let operationalExpenses = lossPostings._sum.amount || 0;
    let otherIncome = 0;

    reconLogs.forEach(r => {
      if (r.transactionType === "BANK_INTEREST") bankInterest += r.amount;
      else if (r.transactionType === "BANK_CHARGE") bankCharge += r.amount;
      else if (r.transactionType === "OTHER_INCOME") otherIncome += r.amount;
      else if (r.transactionType === "OTHER_EXPENSE") operationalExpenses += r.amount;
    });

    const totalGrossIncome = totalSubscriptions + exitBonusIncome + projectProfits + bankInterest + otherIncome;
    const totalGrossExpense = bankCharge + operationalExpenses;
    const netSurplus = totalGrossIncome - totalGrossExpense;

    reportData = {
      totalSubscriptions,
      exitBonusIncome,
      projectProfits,
      bankInterest,
      otherIncome,
      totalGrossIncome,
      bankCharge,
      operationalExpenses,
      totalGrossExpense,
      netSurplus
    };
  }

  // 7. Single Member Ledger (Detailed statement over custom date range)
  else if (type === "single-member-ledger") {
    reportTitle = "একক সদস্যের লেনদেন বিবরণী";
    
    if (userId) {
      ledgerUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (ledgerUser) {
        reportSubtitle = `সদস্যের নাম: ${ledgerUser.nameBn || ledgerUser.name} | মোবাইল: ${ledgerUser.mobile}`;
        filtersText = `সময়কাল: ${new Date(dateFrom).toLocaleDateString('bn-BD')} হতে ${new Date(dateTo).toLocaleDateString('bn-BD')}`;

        // Compute Opening Balance (prior transactions up to dateFrom)
        const priorTransactions = await prisma.transaction.findMany({
          where: {
            userId,
            status: "APPROVED",
            date: { lt: new Date(dateFrom) }
          }
        });

        priorTransactions.forEach(t => {
          if (t.type === 'DEPOSIT' || t.type === 'PROFIT_POSTING') ledgerOpeningBalance += t.amount;
          if (t.type === 'WITHDRAWAL' || t.type === 'LOSS_POSTING') ledgerOpeningBalance -= t.amount;
        });

        // Query transactions in range
        ledgerTransactions = await prisma.transaction.findMany({
          where: {
            userId,
            status: "APPROVED",
            date: {
              gte: new Date(dateFrom),
              lte: new Date(dateTo + "T23:59:59")
            }
          },
          orderBy: { date: 'asc' }
        });
      }
    }
  }

  // Apply Committee sorting (President > Secretary > Cashier > Admin > Members)
  if (reportData && Array.isArray(reportData) && type !== "due-subscriptions" && type !== "paid-subscriptions") {
    const roleOrder: Record<string, number> = {
      'PRESIDENT': 1,
      'SECRETARY': 2,
      'CASHIER': 3,
      'ADMIN': 4,
      'MEMBER': 5
    };

    reportData.sort((a: any, b: any) => {
      const roleA = a.role || 'MEMBER';
      const roleB = b.role || 'MEMBER';
      const roleDiff = (roleOrder[roleA] || 99) - (roleOrder[roleB] || 99);
      if (roleDiff !== 0) return roleDiff;
      return a.name.localeCompare(b.name, 'bn');
    });
  }

  const getRoleName = (r: string) => {
    if (r === 'PRESIDENT') return 'সভাপতি';
    if (r === 'SECRETARY') return 'সাধারণ সম্পাদক';
    if (r === 'CASHIER') return 'ক্যাশিয়ার';
    if (r === 'ADMIN') return 'অ্যাডমিন';
    return 'সদস্য';
  };

  const getTxNameBn = (type: string) => {
    if (type === 'DEPOSIT') return 'চাঁদা জমা';
    if (type === 'WITHDRAWAL') return 'উত্তোলন';
    if (type === 'PROFIT_POSTING') return 'লভ্যাংশ পোস্টিং';
    if (type === 'LOSS_POSTING') return 'লোকসান পোস্টিং';
    if (type === 'PENALTY') return 'জরিমানা';
    return type;
  };

  return (
    <div className="report-page-container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--foreground)' }}>রিপোর্ট জেনারেশন</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>ফিল্টার সেট করুন এবং প্রিন্ট বাটন চেপে প্রফেশনাল এ৪ সাইজের পিডিএফ বা রিপোর্ট প্রিন্ট করুন।</p>
      </div>

      {/* Render selector component with member list for member dropdown */}
      <ReportSelector members={activeMembersList} />

      {/* Printable Area */}
      <div className="print-area" style={{ 
        backgroundColor: 'white', 
        padding: '2.5rem', 
        borderRadius: '1rem', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          .watermark-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .watermark-img {
            width: 320px;
            height: 320px;
            object-fit: contain;
          }
          @media print {
            .report-page-container {
              padding: 0 !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
            .print-area {
              width: 100%;
              padding: 0 !important;
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
              text-align: center;
              position: relative !important;
            }
            .report-letterhead {
              text-align: center !important;
              width: 100% !important;
            }
            .report-table-wrap {
              display: flex;
              justify-content: center;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            .watermark-container {
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              opacity: 0.05 !important;
              z-index: 0 !important;
              display: block !important;
            }
            .watermark-img {
              width: 380px !important;
              height: 380px !important;
            }
            @page {
              size: A4 portrait;
              margin: 0.5in;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 0 auto;
            }
            th, td {
              border: 1px solid #1e293b !important;
              padding: 7px 5px !important;
              text-align: center !important;
              font-size: 11.5px;
              color: black !important;
            }
            td[style*="text-align: left"], td[style*="text-align:left"] {
              text-align: left !important;
            }
            td[style*="text-align: right"], td[style*="text-align:right"] {
              text-align: right !important;
            }
            th {
              background-color: #e8f4fd !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: bold;
            }
          }
        `}} />

        {/* Global centered watermark */}
        {club.watermarkLogo && (
          <div className="watermark-container">
            <img src={club.watermarkLogo} alt="" className="watermark-img" />
          </div>
        )}

        {/* Club Letterhead */}
        <div className="report-letterhead" style={{ position: 'relative', textAlign: 'center', marginBottom: '25px', borderBottom: '2px double #475569', paddingBottom: '15px' }}>
          {/* Logo */}
          {club.logo && (
            <div style={{ marginBottom: '8px', position: 'relative', zIndex: 1 }}>
              <img src={club.logo} alt="logo" style={{ height: '58px', objectFit: 'contain' }} />
            </div>
          )}
          <h1 style={{ color: 'var(--primary)', fontSize: '26px', margin: '0 0 5px 0', fontWeight: '900', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>{club.name}</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#475569', fontWeight: 600, position: 'relative', zIndex: 1 }}>{club.address}</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>স্থাপিত: ২০২৬ খ্রি.</p>
          
          <div style={{ marginTop: '15px' }}>
            <h2 style={{ 
              fontSize: '16px', 
              backgroundColor: '#e6f3ed', 
              color: 'var(--primary)', 
              display: 'inline-block', 
              padding: '0.4rem 1.5rem', 
              borderRadius: '9999px',
              fontWeight: 800,
              border: '1px solid rgba(15, 103, 61, 0.15)'
            }}>{reportTitle}</h2>
          </div>
          
          {reportSubtitle && (
            <p style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px', color: '#1e293b' }}>{reportSubtitle}</p>
          )}
          
          {filtersText && (
            <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', marginTop: '4px', fontWeight: 600 }}>{filtersText}</p>
          )}
        </div>

        {/* 0. Club Institutional Financial Statement (Bengali Only, Active Transactions Only) */}
        {type === "club-financial-statement" && reportData && (() => {
          const activeIncomes: { name: string; amount: number }[] = [];
          if (reportData.totalSubscriptions > 0) activeIncomes.push({ name: "সদস্যদের জমাকৃত মোট চাঁদা", amount: reportData.totalSubscriptions });
          if (reportData.exitBonusIncome > 0) activeIncomes.push({ name: "পদত্যাগকৃত সদস্যের কর্তন ফি আয়", amount: reportData.exitBonusIncome });
          if (reportData.projectProfits > 0) activeIncomes.push({ name: "প্রজেক্টসমূহের অর্জিত মোট লভ্যাংশ", amount: reportData.projectProfits });
          if (reportData.bankInterest > 0) activeIncomes.push({ name: "ব্যাংক মুনাফা ও ইন্টারেস্ট", amount: reportData.bankInterest });
          if (reportData.otherIncome > 0) activeIncomes.push({ name: "অন্যান্য বিশেষ আয়", amount: reportData.otherIncome });

          const activeExpenses: { name: string; amount: number }[] = [];
          if (reportData.bankCharge > 0) activeExpenses.push({ name: "ব্যাংক সার্ভিস চার্জ ও কর্তন", amount: reportData.bankCharge });
          if (reportData.operationalExpenses > 0) activeExpenses.push({ name: "ক্লাব অপারেশনাল খরচ ও ব্যয়", amount: reportData.operationalExpenses });

          const rowCount = Math.max(activeIncomes.length, activeExpenses.length, 1);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#134e2a', color: '#ffffff', fontWeight: 800 }}>
                    <th colSpan={2} style={{ border: '1px solid #0e391f', padding: '0.75rem', textAlign: 'center', width: '50%', fontSize: '15px' }}>
                      আয়ের বিবরণ
                    </th>
                    <th colSpan={2} style={{ border: '1px solid #0e391f', padding: '0.75rem', textAlign: 'center', width: '50%', fontSize: '15px' }}>
                      ব্যয়ের বিবরণ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, idx) => {
                    const inc = activeIncomes[idx];
                    const exp = activeExpenses[idx];

                    return (
                      <tr key={idx}>
                        {/* Income Side */}
                        <td style={{ border: '1px solid #94a3b8', padding: '0.7rem 0.75rem', fontWeight: 600, width: '35%' }}>
                          {inc ? `${idx + 1}. ${inc.name}` : '-'}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 800, color: inc ? '#14532d' : '#94a3b8', width: '15%', fontSize: '14px' }}>
                          {inc ? `৳ ${inc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        {/* Expense Side */}
                        <td style={{ border: '1px solid #94a3b8', padding: '0.7rem 0.75rem', fontWeight: 600, width: '35%' }}>
                          {exp ? `${idx + 1}. ${exp.name}` : '-'}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 800, color: exp ? '#b91c1c' : '#94a3b8', width: '15%', fontSize: '14px' }}>
                          {exp ? `৳ ${exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total Row */}
                  <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 900 }}>
                    <td style={{ border: '2px solid #166534', padding: '0.75rem', color: '#14532d' }}>
                      সর্বমোট ক্লাব আয়
                    </td>
                    <td style={{ border: '2px solid #166534', padding: '0.75rem', textAlign: 'right', color: '#14532d', fontSize: '1.05rem' }}>
                      ৳ {reportData.totalGrossIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '2px solid #991b1b', padding: '0.75rem', color: '#991b1b', backgroundColor: '#fef2f2' }}>
                      সর্বমোট ক্লাব ব্যয়
                    </td>
                    <td style={{ border: '2px solid #991b1b', padding: '0.75rem', textAlign: 'right', color: '#b91c1c', fontSize: '1.05rem', backgroundColor: '#fef2f2' }}>
                      ৳ {reportData.totalGrossExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Net Surplus Row */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ backgroundColor: reportData.netSurplus >= 0 ? '#dcfce7' : '#fee2e2', fontWeight: 900 }}>
                    <td style={{ border: '2px solid #000', padding: '0.9rem', color: '#0f172a', fontSize: '1.05rem', width: '70%' }}>
                      নিট সর্বমোট ক্লাব তহবিল উদ্বৃত্ত / সঞ্চয়
                    </td>
                    <td style={{ border: '2px solid #000', padding: '0.9rem', textAlign: 'right', fontSize: '1.25rem', color: reportData.netSurplus >= 0 ? '#14532d' : '#b91c1c', width: '30%' }}>
                      ৳ {reportData.netSurplus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* 1 & 2. Members / Active Members table */}
        {(type === "member-list" || type === "active-members") && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '8%' }}>ক্রমিক</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '32%' }}>নাম</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '18%' }}>পদবী</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '18%' }}>ফোন নম্বর</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '12%' }}>স্ট্যাটাস</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '12%' }}>জমাকৃত অর্থ</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((user: any, index: number) => (
                <tr key={user.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{user.nameBn || user.name}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{getRoleName(user.role)}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{user.mobile}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{user.activeStatus ? 'সক্রিয়' : 'স্থগিত'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{user.balance.toLocaleString('en-IN')} ৳</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 3. Member Nominees table */}
        {type === "member-nominees" && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '6%' }}>ক্রমিক</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '20%' }}>সদস্যের নাম</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '20%' }}>নমিনির নাম</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '12%' }}>সম্পর্ক</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '12%' }}>নমিনির মোবাইল</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '15%' }}>নমিনির এনআইডি</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '9%' }}>বয়স / জন্মতারিখ</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '6%' }}>অংশ (%)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((user: any, index: number) => (
                <tr key={user.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{user.nameBn || user.name}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{user.nomineeName || '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{user.nomineeRelation || '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{user.nomineeMobile || '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{user.nomineeNid || '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                    {user.nomineeDob ? new Date(user.nomineeDob).toLocaleDateString('bn-BD') : (user.nomineeAge ? `${user.nomineeAge} বছর` : '-')}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700 }}>{user.nomineeRatio ? `${user.nomineeRatio}%` : '100%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 3 & 4. Monthly Invoices (Due/Paid) table */}
        {(type === "due-subscriptions" || type === "paid-subscriptions") && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '8%' }}>ক্রমিক</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '32%' }}>সদস্যের নাম</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '18%' }}>মাস ও বছর</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '14%' }}>চাঁদার পরিমাণ</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '14%' }}>জরিমানা</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '14%' }}>মোট পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((invoice: any, index: number) => (
                <tr key={invoice.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{invoice.user?.nameBn || invoice.user?.name}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{getMonthName(invoice.month)}, {invoice.year}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right' }}>{invoice.amount.toLocaleString('en-IN')} ৳</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right' }}>{invoice.lateFee.toLocaleString('en-IN')} ৳</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{(invoice.amount + invoice.lateFee).toLocaleString('en-IN')} ৳</td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>কোনো তথ্য পাওয়া যায়নি</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 5. Members Transactions Summary */}
        {type === "member-transactions" && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '8%' }}>ক্রমিক</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '28%' }}>সদস্যের নাম</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '16%' }}>মোট জমা</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '16%' }}>মোট উত্তোলন</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '16%' }}>লাভ/ক্ষতি পোস্টিং</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '16%' }}>বর্তমান ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((user: any, index: number) => {
                const totalDeposit = user.transactions.filter((t: any) => t.type === 'DEPOSIT').reduce((sum: number, t: any) => sum + t.amount, 0);
                const totalWithdrawal = user.transactions.filter((t: any) => t.type === 'WITHDRAWAL').reduce((sum: number, t: any) => sum + t.amount, 0);
                const profitPosting = user.transactions.filter((t: any) => t.type === 'PROFIT_POSTING').reduce((sum: number, t: any) => sum + t.amount, 0);
                const lossPosting = user.transactions.filter((t: any) => t.type === 'LOSS_POSTING').reduce((sum: number, t: any) => sum + t.amount, 0);
                const netProfitLoss = profitPosting - lossPosting;

                return (
                  <tr key={user.id}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{user.nameBn || user.name}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right' }}>{totalDeposit.toLocaleString('en-IN')} ৳</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right' }}>{totalWithdrawal.toLocaleString('en-IN')} ৳</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right' }}>{netProfitLoss.toLocaleString('en-IN')} ৳</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{user.balance.toLocaleString('en-IN')} ৳</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 6. Single Member Detailed Statement (Ledger) */}
        {type === "single-member-ledger" && (
          <div>
            {!ledgerUser ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                দয়া করে একজন সদস্য নির্বাচন করুন।
              </div>
            ) : (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '12%' }}>তারিখ</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '38%' }}>বিবরণ</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '16%' }}>জমা (+)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '16%' }}>উত্তোলন/খরচ (-)</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '18%' }}>জের (ব্যালেন্স)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Opening Balance Row */}
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center', color: '#64748b' }}>
                        {new Date(dateFrom).toLocaleDateString('bn-BD')}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>
                        প্রারম্ভিক জের (Opening Balance)
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', color: '#64748b' }}>-</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', color: '#64748b' }}>-</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>
                        {ledgerOpeningBalance.toLocaleString('en-IN')} ৳
                      </td>
                    </tr>

                    {/* Loop and calculate running balance */}
                    {(() => {
                      let runningBalance = ledgerOpeningBalance;
                      return ledgerTransactions.map((tx) => {
                        const isCredit = tx.type === 'DEPOSIT' || tx.type === 'PROFIT_POSTING';
                        if (isCredit) {
                          runningBalance += tx.amount;
                        } else {
                          runningBalance -= tx.amount;
                        }

                        return (
                          <tr key={tx.id}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                              {new Date(tx.date).toLocaleDateString('bn-BD')}
                            </td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left' }}>
                              {getTxNameBn(tx.type)}
                            </td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', color: isCredit ? '#15803d' : '#64748b' }}>
                              {isCredit ? `${tx.amount.toLocaleString('en-IN')} ৳` : '-'}
                            </td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', color: !isCredit ? '#b91c1c' : '#64748b' }}>
                              {!isCredit ? `${tx.amount.toLocaleString('en-IN')} ৳` : '-'}
                            </td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>
                              {runningBalance.toLocaleString('en-IN')} ৳
                            </td>
                          </tr>
                        );
                      });
                    })()}

                    {ledgerTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                          এই সময়কালের মধ্যে কোনো লেনদেন পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Signatures at the bottom of the printed report */}
        <div style={{ display: 'none', justifyContent: 'space-between', marginTop: '60px' }} className="print-area">
          <div style={{ textAlign: 'center', width: '30%', borderTop: '1px solid black', paddingTop: '5px', fontSize: '12px' }}>
            ক্যাশিয়ার
          </div>
          <div style={{ textAlign: 'center', width: '30%', borderTop: '1px solid black', paddingTop: '5px', fontSize: '12px' }}>
            সাধারণ সম্পাদক
          </div>
          <div style={{ textAlign: 'center', width: '30%', borderTop: '1px solid black', paddingTop: '5px', fontSize: '12px' }}>
            সভাপতি
          </div>
        </div>

      </div>
    </div>
  );
}
