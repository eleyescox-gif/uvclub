"use client";

import { useMemo } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Printer,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Clock,
  Wallet
} from "lucide-react";
import OnlinePaymentCard from "./OnlinePaymentCard";
import MonthlyProfitLossSummary from "@/components/dashboard/MonthlyProfitLossSummary";

interface Invoice {
  id: string;
  month: number;
  year: number;
  amount: number;
  lateFee: number;
  status: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: Date | string;
  createdAt: Date | string;
  status: string;
  note?: string | null;
}

interface UnifiedFinanceViewProps {
  user: { name: string; nameBn?: string | null; mobile: string; role: string; activeStatus?: boolean };
  pendingInvoices: Invoice[];
  paidInvoices?: Invoice[];
  transactions: Transaction[];
  gatewayActive: boolean;
  clubLogo?: string;
  currentMonth?: number;
  currentYear?: number;
  currentMonthPaid?: boolean;
  currentMonthPaidAmount?: number;
  currentMonthPaidDate?: Date | string | null;
}

const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const monthsShortEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function UnifiedFinanceView({ 
  user, pendingInvoices, paidInvoices = [], transactions, gatewayActive, clubLogo,
  currentMonth, currentYear, currentMonthPaid, currentMonthPaidAmount = 0, currentMonthPaidDate
}: UnifiedFinanceViewProps) {
  const nowMonth = currentMonth ?? (new Date().getMonth() + 1);
  const nowYear = currentYear ?? new Date().getFullYear();
  const nowMonthEn = monthsShortEn[nowMonth - 1];
  const today = new Date();

  // Format Date to "12 Oct 2026" style
  const formatDateEnShort = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = d.getDate();
    const month = monthsShortEn[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateBn = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  };

  // Convert numbers to Bengali
  const toBn = (num: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (digit) => bnNums[parseInt(digit)]);
  };

  // Calculate Running Deposit Balance for each transaction (Chronological ascending)
  const processedTransactions = useMemo(() => {
    const approved = transactions
      .filter(t => t.status === "APPROVED")
      .sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime());

    let runningTotal = 0;
    const list = approved.map(t => {
      const isCredit = t.type === "DEPOSIT" || t.type === "PROFIT_POSTING";
      if (isCredit) {
        runningTotal += t.amount;
      } else {
        runningTotal -= t.amount;
      }

      const txDate = new Date(t.createdAt || t.date);
      const monthNameBn = monthsBn[txDate.getMonth()];
      
      const matchedInv = paidInvoices.find(inv => {
        const invDate = inv.updatedAt ? new Date(inv.updatedAt) : inv.createdAt ? new Date(inv.createdAt) : null;
        if (!invDate) return false;
        return Math.abs(invDate.getTime() - txDate.getTime()) < 120000;
      });
      const invMonthBn = matchedInv ? monthsBn[matchedInv.month - 1] : monthNameBn;
      const invYearShort = matchedInv ? String(matchedInv.year).slice(2) : String(txDate.getFullYear()).slice(2);

      let desc = `চাঁদা - ${invMonthBn} '${invYearShort}`;
      if (t.type === "PROFIT_POSTING") desc = `প্রজেক্ট লভ্যাংশ - ${monthNameBn}`;
      else if (t.type === "WITHDRAWAL") desc = `উত্তোলন - ${monthNameBn}`;
      else if (t.type === "LOSS_POSTING") desc = `লোকসান চার্জ - ${monthNameBn}`;
      else if (t.note) desc = t.note;

      const receiptNo = matchedInv 
        ? `#REC-${matchedInv.year}${String(matchedInv.month).padStart(2, '0')}-${t.id.slice(-4).toUpperCase()}`
        : `#TRX-${t.id.slice(-6).toUpperCase()}`;

      return {
        ...t,
        receiptNo,
        formattedDate: formatDateEnShort(t.createdAt || t.date),
        desc,
        monthNameBn,
        isCredit,
        runningTotal
      };
    });

    return list.reverse();
  }, [transactions, paidInvoices]);

  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount + inv.lateFee, 0);

  return (
    <div style={{ maxWidth: "950px", margin: "0 auto", padding: "1rem 0.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Official Print Header (Visible ONLY when printing) */}
      <div className="only-print" style={{ display: "none", textAlign: "center", marginBottom: "1.5rem", borderBottom: "2px solid #000", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <img src={clubLogo || "/logo.jpg"} alt="United Vision Logo" style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "6px" }} />
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0369a1", margin: 0 }}>ইউনাইটেড ভিশন ক্লাব</h1>
        </div>
        <p style={{ margin: "2px 0 4px", fontSize: "14px", color: "#334155" }}>বরইতলী, চকরিয়া, কক্সবাজার। (স্থাপিত: ২০২৬ খ্রি.)</p>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0 6px", textDecoration: "underline" }}>সদস্য অফিশিয়াল লেনদেন বিবরণী</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "14px", fontWeight: "bold", borderTop: "1px solid #ddd", paddingTop: "8px" }}>
          <span>সদস্যের নাম: {user.nameBn || user.name}</span>
          <span>মোবাইল: {user.mobile}</span>
          <span>প্রিন্ট তারিখ: {formatDateBn(today)}</span>
        </div>
      </div>

      {/* Outer Clean Card Container */}
      <div className="finance-statement-container" style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem"
      }}>

        {/* 1. Web Header Row */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Receipt size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                লেনদেন বিবরণী (Statements)
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "2px 0 0", fontWeight: 400 }}>
                আপনার জমা, রশিদ ও মোট ব্যালেন্সের হালনাগাদ তথ্য
              </p>
            </div>
          </div>

          <button 
            onClick={() => window.print()} 
            className="no-print"
            style={{
              padding: "0.45rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              color: "#0f172a",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginLeft: "auto"
            }}
          >
            <Printer size={15} /> প্রিন্ট রশিদ
          </button>
        </div>

        {/* 2. Current Month Payment Status Card */}
        <div className="no-print" style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          {/* This Month Status */}
          <div style={{
            flex: 1,
            minWidth: "200px",
            borderRadius: "10px",
            padding: "1rem 1.15rem",
            backgroundColor: currentMonthPaid ? "#f0fdf4" : "#fffbeb",
            border: `1px solid ${currentMonthPaid ? "#bbf7d0" : "#fde68a"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: currentMonthPaid ? "#059669" : "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {currentMonthPaid
                ? <CheckCircle2 size={20} color="#fff" />
                : <AlertCircle size={20} color="#fff" />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: currentMonthPaid ? "#166534" : "#92400e", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {nowMonthEn} {nowYear} — চাঁদার অবস্থা
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "1rem", fontWeight: 700, color: currentMonthPaid ? "#059669" : "#b45309" }}>
                {currentMonthPaid
                  ? `✓ পরিশোধিত — ৳ ${toBn(currentMonthPaidAmount.toLocaleString("en-IN"))}`
                  : `⏳ এখনো পরিশোধ হয়নি`
                }
              </p>
              {currentMonthPaid && currentMonthPaidDate && (
                <p style={{ margin: "1px 0 0", fontSize: "0.75rem", color: "#15803d", fontWeight: 400 }}>
                  {formatDateEnShort(currentMonthPaidDate)} তারিখে পরিশোধ করা হয়েছে
                </p>
              )}
              {!currentMonthPaid && (
                <p style={{ margin: "1px 0 0", fontSize: "0.75rem", color: "#b45309", fontWeight: 400 }}>
                  দ্রুত পরিশোধ করুন — বিলম্বে জরিমানা প্রযোজ্য
                </p>
              )}
            </div>
          </div>

          {/* Total Paid Count */}
          <div style={{
            minWidth: "140px",
            borderRadius: "10px",
            padding: "1rem 1.15rem",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              মোট পরিশোধ
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#1d4ed8", lineHeight: 1 }}>
              {toBn(paidInvoices.length)} টি
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#3b82f6", fontWeight: 400 }}>
              কিশতি সফলভাবে জমা
            </p>
          </div>
        </div>

        {/* 3. Pending Alert Banner (Only shown if user has pending invoices) */}
        {pendingInvoices.length > 0 && (
          <div className="no-print" style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecdd3",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.85rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <AlertCircle size={20} color="#dc2626" />
              <div>
                <strong style={{ fontSize: "0.875rem", color: "#991b1b", display: "block" }}>
                  ⚠️ আপনার {toBn(pendingInvoices.length)}টি মাসের চাঁদা বকেয়া রয়েছে (সর্বমোট ৳ {toBn(totalPendingAmount.toLocaleString("en-IN"))})!
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#b91c1c", fontWeight: 400 }}>
                  দয়া করে বকেয়া চাঁদা দ্রুত পরিশোধ করুন।
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {pendingInvoices.map((inv) => (
                <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {gatewayActive ? (
                    <OnlinePaymentCard 
                      invoiceId={inv.id} 
                      amount={inv.amount + inv.lateFee} 
                      month={inv.month} 
                      year={inv.year} 
                    />
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#991b1b", backgroundColor: "#fff", padding: "0.35rem 0.65rem", borderRadius: "6px", fontWeight: 700, border: "1px solid #fca5a5" }}>
                      {monthsBn[inv.month - 1]}: ৳ {inv.amount + inv.lateFee} (পরিশোধ করুন)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Monthly Profit/Loss Summary Card */}
        <div className="no-print">
          <MonthlyProfitLossSummary 
            user={{ role: user.role, activeStatus: user.activeStatus ?? true }} 
            transactions={transactions} 
          />
        </div>

        {/* 5. bKash-Style Professional Statement List (bKash Transaction History) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={16} color="#059669" /> লেনদেন ইতিহাস
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>
              তারিখ • রশিদ নম্বর • জমা
            </span>
          </div>

          {processedTransactions.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontSize: "0.875rem" }}>
              কোনো লেনদেনের তথ্য পাওয়া যায়নি।
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {processedTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    gap: "12px",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  {/* Left: Icon Bubble (Green Arrow in for Deposit, Red Arrow out for Withdrawal) */}
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: tx.isCredit ? "#ecfdf5" : "#fef2f2",
                    border: `1px solid ${tx.isCredit ? "#a7f3d0" : "#fecdd3"}`,
                    color: tx.isCredit ? "#059669" : "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {tx.isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>

                  {/* Middle: Transaction Description, Receipt No, Date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.desc}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", fontSize: "0.75rem", color: "#64748b" }}>
                      <span style={{ fontWeight: 700, color: "#475569" }}>{tx.receiptNo}</span>
                      <span>•</span>
                      <span>{tx.formattedDate}</span>
                    </div>
                  </div>

                  {/* Right: Transaction Amount & Balance */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: tx.isCredit ? "#059669" : "#dc2626", display: "block" }}>
                      {tx.isCredit ? "+" : "-"} ৳ {tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 400, marginTop: "2px", display: "block" }}>
                      ব্যালেন্স: ৳ {tx.runningTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Official Print Table (Visible ONLY during window.print) */}
      <div className="only-print" style={{ display: "none" }}>
        <table className="statement-print-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #000", fontWeight: "bold" }}>
              <th style={{ padding: "6px" }}>তারিখ</th>
              <th style={{ padding: "6px" }}>বিবরণ / রশিদ নং</th>
              <th style={{ padding: "6px" }}>মাস</th>
              <th style={{ padding: "6px" }}>টাকা</th>
              <th style={{ padding: "6px" }}>মোট জমা</th>
            </tr>
          </thead>
          <tbody>
            {processedTransactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: "6px" }}>{tx.formattedDate}</td>
                <td style={{ padding: "6px" }}>{tx.desc} ({tx.receiptNo})</td>
                <td style={{ padding: "6px" }}>{tx.monthNameBn}</td>
                <td style={{ padding: "6px", fontWeight: "bold" }}>{tx.isCredit ? "+" : "-"}৳ {tx.amount.toLocaleString("en-IN")}</td>
                <td style={{ padding: "6px", fontWeight: "bold" }}>৳ {tx.runningTotal.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print CSS Rules */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .only-print { display: block !important; }
          body, html, main, .layout-container, .main-content, .card-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
          }
          .finance-statement-container {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .statement-print-table { border: 1px solid #000 !important; width: 100% !important; }
          .statement-print-table th, .statement-print-table td {
            border: 1px solid #000 !important;
            padding: 6px 10px !important;
            color: #000 !important;
          }
        }
      `}} />

    </div>
  );
}
