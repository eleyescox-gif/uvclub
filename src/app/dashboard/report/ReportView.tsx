"use client";

import { useState, useMemo } from "react";
import { Printer, Calendar, RefreshCw, Receipt, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ReceiptTx {
  id: string;
  amount: number;
  createdAt: Date | string;
}

interface ReportViewProps {
  user: { name: string; nameBn?: string | null; mobile: string; role: string };
  transactions: any[];
  receiptTransactions: ReceiptTx[];
}

const roleTitles: Record<string, string> = {
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সাধারণ সদস্য",
};

export default function ReportView({ user, transactions, receiptTransactions }: ReportViewProps) {
  const [filterType, setFilterType] = useState<"monthly" | "range">("monthly");
  const [showReceipts, setShowReceipts] = useState(false);
  
  // Monthly filter states
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // "1" - "12" or "all"
  const [selectedYear, setSelectedYear] = useState<string>("all"); // "2026", "2027" or "all"

  // Date range filter states (default to current year)
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const jan1stStr = `${today.getFullYear()}-01-01`;

  const [dateFrom, setDateFrom] = useState(jan1stStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const getMonthName = (m: number) => {
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    return months[m - 1] || "";
  };

  const getTxNameBn = (type: string) => {
    if (type === 'DEPOSIT') return 'চাঁদা জমা';
    if (type === 'WITHDRAWAL') return 'উত্তোলন';
    if (type === 'PROFIT_POSTING') return 'লভ্যাংশ পোস্টিং';
    if (type === 'LOSS_POSTING') return 'লোকসান পোস্টিং';
    if (type === 'PENALTY') return 'জরিমানা';
    return type;
  };

  // Compile Filters Subtitle for the print layout
  const filterSubtitle = useMemo(() => {
    if (filterType === "monthly") {
      const mText = selectedMonth !== "all" ? getMonthName(parseInt(selectedMonth)) : "সব মাস";
      const yText = selectedYear !== "all" ? `${selectedYear} খ্রি.` : "সব বছর";
      return `সময়কাল: ${mText}, ${yText}`;
    } else {
      return `সময়কাল: ${new Date(dateFrom).toLocaleDateString('bn-BD')} হতে ${new Date(dateTo).toLocaleDateString('bn-BD')}`;
    }
  }, [filterType, selectedMonth, selectedYear, dateFrom, dateTo]);

  // Handle preset range buttons
  const applyPreset = (preset: string) => {
    const now = new Date();
    const nowStr = now.toISOString().split("T")[0];
    let fromStr = "";

    if (preset === "this-year") {
      fromStr = `${now.getFullYear()}-01-01`;
    } else if (preset === "last-3-months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      fromStr = threeMonthsAgo.toISOString().split("T")[0];
    } else if (preset === "last-1-year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      fromStr = oneYearAgo.toISOString().split("T")[0];
    } else if (preset === "last-2-years") {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      fromStr = twoYearsAgo.toISOString().split("T")[0];
    }

    setDateFrom(fromStr);
    setDateTo(nowStr);
  };

  // 1. Process Monthly filter
  const monthlyFilteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const matchMonth = selectedMonth === "all" || (txDate.getMonth() + 1).toString() === selectedMonth;
      const matchYear = selectedYear === "all" || txDate.getFullYear().toString() === selectedYear;
      return tx.status === "APPROVED" && matchMonth && matchYear;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedMonth, selectedYear]);

  // 2. Process Date Range filter with Opening Balance & Running Balance
  const rangeLedgerData = useMemo(() => {
    // Sort transactions oldest to newest first
    const sortedApproved = [...transactions]
      .filter(tx => tx.status === "APPROVED")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const startDateTime = new Date(dateFrom).getTime();
    const endDateTime = new Date(dateTo + "T23:59:59").getTime();

    let openingBalance = 0;
    const inRangeTx: any[] = [];

    sortedApproved.forEach(tx => {
      const txTime = new Date(tx.date).getTime();
      const isCredit = tx.type === "DEPOSIT" || tx.type === "PROFIT_POSTING";

      if (txTime < startDateTime) {
        // Add to opening balance
        if (isCredit) openingBalance += tx.amount;
        else openingBalance -= tx.amount;
      } else if (txTime <= endDateTime) {
        // Collect in-range transaction
        inRangeTx.push(tx);
      }
    });

    return {
      openingBalance,
      transactions: inRangeTx
    };
  }, [transactions, dateFrom, dateTo]);

  // Calculate totals
  const totalDepositMonthly = monthlyFilteredTransactions
    .filter(tx => tx.type === "DEPOSIT")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawalMonthly = monthlyFilteredTransactions
    .filter(tx => tx.type === "WITHDRAWAL")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="report-page-container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Filters Form (Hidden on Print) */}
      <div className="no-print" style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '1rem', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Combined Inline Toolbar (Tabs + Filters + Print) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
            {/* Filter Type Toggle */}
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--background)', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid var(--border)', flexShrink: 0 }}>
              <button 
                onClick={() => setFilterType("monthly")} 
                className="btn" 
                style={{ 
                  padding: '0.35rem 0.85rem', 
                  fontSize: '0.75rem',
                  borderRadius: '0.375rem',
                  background: filterType === "monthly" ? 'white' : 'transparent',
                  color: filterType === "monthly" ? 'var(--primary)' : '#6b7280',
                  border: 'none',
                  boxShadow: filterType === "monthly" ? 'var(--shadow-sm)' : 'none'
                }}
              >
                মাস ভিত্তিক
              </button>
              <button 
                onClick={() => setFilterType("range")} 
                className="btn" 
                style={{ 
                  padding: '0.35rem 0.85rem', 
                  fontSize: '0.75rem',
                  borderRadius: '0.375rem',
                  background: filterType === "range" ? 'white' : 'transparent',
                  color: filterType === "range" ? 'var(--primary)' : '#6b7280',
                  border: 'none',
                  boxShadow: filterType === "range" ? 'var(--shadow-sm)' : 'none'
                }}
              >
                বিস্তারিত লেজার বিবরণী
              </button>
            </div>

            {/* Filters Controls - Inline */}
            {filterType === "monthly" ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.8rem', minWidth: '120px' }}
                >
                  <option value="all">সব মাস (All)</option>
                  <option value="1">জানুয়ারি (January)</option>
                  <option value="2">ফেব্রুয়ারি (February)</option>
                  <option value="3">মার্চ (March)</option>
                  <option value="4">এপ্রিল (April)</option>
                  <option value="5">মে (May)</option>
                  <option value="6">জুন (June)</option>
                  <option value="7">জুলাই (July)</option>
                  <option value="8">আগস্ট (August)</option>
                  <option value="9">সেপ্টেম্বর (September)</option>
                  <option value="10">অক্টোবর (October)</option>
                  <option value="11">নভেম্বর (November)</option>
                  <option value="12">ডিসেম্বর (December)</option>
                </select>
                
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.8rem', minWidth: '100px' }}
                >
                  <option value="all">সব বছর (All)</option>
                  <option value="2026">২০২৬ (2026)</option>
                  <option value="2027">২০২৭ (2027)</option>
                  <option value="2028">২০২৮ (2028)</option>
                </select>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.75rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>থেকে</span>
                  <input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.75rem' }}
                  />
                </div>

                {/* Presets */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => applyPreset("this-year")} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>চলতি বছর</button>
                  <button onClick={() => applyPreset("last-3-months")} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>বিগত ৩ মাস</button>
                  <button onClick={() => applyPreset("last-1-year")} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>বিগত ১ বছর</button>
                </div>
              </div>
            )}
          </div>
          
          {/* Print Button */}
          <button 
            onClick={() => window.print()} 
            className="btn btn-primary" 
            style={{ padding: '0.45rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', flexShrink: 0 }}
          >
            <Printer size={16} /> রিপোর্ট প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* A4 Printable Report Area */}
      <div className="print-area" style={{ 
        backgroundColor: 'white', 
        padding: '3rem', 
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        color: 'black'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
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
            .no-print {
              display: none !important;
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
            td:nth-child(2) { text-align: left !important; }
            td:nth-child(3), td:nth-child(4) { text-align: right !important; }
            th {
              background-color: #e8f4fd !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: bold;
            }
          }
        `}} />

        {/* Letterhead */}
        <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px double #475569', paddingBottom: '15px' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '26px', margin: '0 0 5px 0', fontWeight: '900', letterSpacing: '-0.02em' }}>ইউনাইটেড ভিশন ক্লাব</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#475569', fontWeight: 600 }}>বরইতলী, চকরিয়া, কক্সবাজার।</p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>স্থাপিত: ২০২৬ খ্রি.</p>
          
          <div style={{ marginTop: '15px' }}>
            <h2 style={{ 
              fontSize: '15px', 
              backgroundColor: '#e6f3ed', 
              color: 'var(--primary)', 
              display: 'inline-block', 
              padding: '0.4rem 1.5rem', 
              borderRadius: '9999px',
              fontWeight: 800,
              border: '1px solid rgba(15, 103, 61, 0.15)'
            }}>
              {filterType === "monthly" ? "ব্যক্তিগত লেনদেন বিবরণী (মাস ভিত্তিক)" : "ব্যক্তিগত অ্যাকাউন্ট খতিয়ান (Detailed Ledger)"}
            </h2>
          </div>
          
          <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', marginTop: '6px', fontWeight: 600 }}>{filterSubtitle}</p>
        </div>

        {/* User Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
          <div>
            <p style={{ margin: '0.25rem 0' }}><strong>সদস্যের নাম:</strong> {user.nameBn || user.name}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>মোবাইল নম্বর:</strong> {user.mobile}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0.25rem 0' }}><strong>পদবী:</strong> {roleTitles[user.role] || "সাধারণ সদস্য"}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>রিপোর্ট জেনারেশনের তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}</p>
          </div>
        </div>

        {/* 1. Monthly filtered view */}
        {filterType === "monthly" ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '15%' }}>তারিখ</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '45%' }}>বিবরণ (Particulars)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '20%' }}>জমা (+)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '20%' }}>উত্তোলন (-)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyFilteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                    {new Date(tx.date).toLocaleDateString('bn-BD')}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'left' }}>
                    {getTxNameBn(tx.type)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', color: tx.type === 'DEPOSIT' || tx.type === 'PROFIT_POSTING' ? '#15803d' : '#64748b' }}>
                    {tx.type === 'DEPOSIT' || tx.type === 'PROFIT_POSTING' ? `${tx.amount.toLocaleString('en-IN')} ৳` : '-'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.5rem', textAlign: 'right', color: tx.type === 'WITHDRAWAL' || tx.type === 'LOSS_POSTING' ? '#b91c1c' : '#64748b' }}>
                    {tx.type === 'WITHDRAWAL' || tx.type === 'LOSS_POSTING' ? `${tx.amount.toLocaleString('en-IN')} ৳` : '-'}
                  </td>
                </tr>
              ))}

              {monthlyFilteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    এই সময়কালের কোনো লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
            {monthlyFilteredTransactions.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                  <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right' }}>সর্বমোট জমাকৃত চাঁদা:</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--primary)' }}>
                    {totalDepositMonthly.toLocaleString('en-IN')} ৳
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--danger)' }}>
                    {totalWithdrawalMonthly > 0 ? `${totalWithdrawalMonthly.toLocaleString('en-IN')} ৳` : '-'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        ) : (
          /* 2. Detailed Date Range Ledger view */
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'center', width: '15%' }}>তারিখ</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'left', width: '40%' }}>বিবরণ (Particulars)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '15%' }}>জমা (+)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '15%' }}>উত্তোলন (-)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem 0.5rem', textAlign: 'right', width: '15%' }}>জের (Balance)</th>
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
                  {rangeLedgerData.openingBalance.toLocaleString('en-IN')} ৳
                </td>
              </tr>

              {/* Loop and calculate running balance */}
              {(() => {
                let runningBalance = rangeLedgerData.openingBalance;
                return rangeLedgerData.transactions.map((tx) => {
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

              {rangeLedgerData.transactions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                    এই সময়কালের মধ্যে কোনো লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Footer Signatures */}
        <div style={{ display: 'none', justifyContent: 'space-between', marginTop: '60px' }} className="print-area">
          <div style={{ textAlign: 'center', width: '35%', borderTop: '1px solid black', paddingTop: '5px', fontSize: '12px' }}>
            সদস্যের স্বাক্ষর
          </div>
          <div style={{ textAlign: 'center', width: '35%', borderTop: '1px solid black', paddingTop: '5px', fontSize: '12px' }}>
            যাচাইকারী কর্তৃপক্ষ (ইউভিসি)
          </div>
        </div>

      </div>

      {/* ── রশিদ সেকশন (no-print) ── */}
      <div className="no-print" style={{ marginTop: '0' }}>
        <button
          onClick={() => setShowReceipts(prev => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1e40af',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} color="#1e40af" />
            রশিদ — আমার সকল রশিদ ({receiptTransactions.length} টি)
          </span>
          {showReceipts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showReceipts && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            marginTop: '0.75rem',
            overflow: 'hidden',
          }}>
            {receiptTransactions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                এখনো কোনো অনুমোদিত রশিদ নেই।
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                    <th style={{ border: '1px solid #1e40af', padding: '0.75rem 0.75rem', textAlign: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', width: '8%' }}>ক্রমিক</th>
                    <th style={{ border: '1px solid #1e40af', padding: '0.75rem 0.75rem', textAlign: 'left', color: 'white', fontWeight: 800, fontSize: '0.85rem', width: '22%' }}>রশিদ নং</th>
                    <th style={{ border: '1px solid #1e40af', padding: '0.75rem 0.75rem', textAlign: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', width: '22%' }}>তারিখ</th>
                    <th style={{ border: '1px solid #1e40af', padding: '0.75rem 0.75rem', textAlign: 'right', color: 'white', fontWeight: 800, fontSize: '0.85rem', width: '20%' }}>পরিমাণ</th>
                    <th style={{ border: '1px solid #1e40af', padding: '0.75rem 0.75rem', textAlign: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', width: '28%' }}>রশিদ দেখুন</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptTransactions.map((rx, index) => (
                    <tr key={rx.id} style={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white' }}>
                      <td style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'left', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: '#1e40af' }}>UVC-{rx.id.substring(0, 8).toUpperCase()}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'center', fontSize: '0.82rem', color: '#475569' }}>{new Date(rx.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, fontSize: '0.9rem', color: '#15803d' }}>৳ {rx.amount.toLocaleString('en-IN')}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <Link
                          href={`/receipt/${rx.id}`}
                          target="_blank"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.35rem 0.9rem',
                            background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                            color: 'white',
                            borderRadius: '0.4rem',
                            textDecoration: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 6px rgba(30,64,175,0.3)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <ExternalLink size={13} /> রশিদ দেখুন
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#eff6ff' }}>
                    <td colSpan={3} style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, fontSize: '0.88rem', color: '#1e40af' }}>সর্বমোট জমা:</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', color: '#15803d' }}>
                      ৳ {receiptTransactions.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ border: '1px solid #e2e8f0' }}></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
