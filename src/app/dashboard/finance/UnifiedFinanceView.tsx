"use client";

import { useMemo } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Printer,
  Sparkles,
  Receipt
} from "lucide-react";
import Link from "next/link";
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
  const nowMonthBn = monthsBn[nowMonth - 1];
  const nowMonthEn = monthsShortEn[nowMonth - 1];
  const today = new Date();

  // Format Date to "12 Oct 2023" style
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
      
      // Try to find the matching paid invoice for correct month name
      const matchedInv = paidInvoices.find(inv => {
        const invDate = inv.updatedAt ? new Date(inv.updatedAt) : inv.createdAt ? new Date(inv.createdAt) : null;
        if (!invDate) return false;
        return Math.abs(invDate.getTime() - txDate.getTime()) < 120000; // within 2 min
      });
      const invMonthBn = matchedInv ? monthsBn[matchedInv.month - 1] : monthNameBn;
      const invYearShort = matchedInv ? String(matchedInv.year).slice(2) : String(txDate.getFullYear()).slice(2);

      let desc = `চাঁদা - ${invMonthBn} '${invYearShort}`;
      if (t.type === "PROFIT_POSTING") desc = `প্রজেক্ট লভ্যাংশ - ${monthNameBn}`;
      else if (t.type === "WITHDRAWAL") desc = `উত্তোলন - ${monthNameBn}`;
      else if (t.type === "LOSS_POSTING") desc = `লোকসান চার্জ - ${monthNameBn}`;
      else if (t.note) desc = t.note;

      return {
        ...t,
        formattedDate: formatDateEnShort(t.createdAt || t.date),
        desc,
        monthNameBn,
        isCredit,
        runningTotal
      };
    });

    // Return in reverse chronological order (newest first)
    return list.reverse();
  }, [transactions]);

  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount + inv.lateFee, 0);

  return (
    <div style={{ maxWidth: "950px", margin: "0 auto", padding: "1.25rem 0.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
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
        borderRadius: "1.25rem",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem"
      }}>

        {/* 1. Web Header Row (Hidden during print) */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: pendingInvoices.length > 0 ? "rgba(239, 68, 68, 0.12)" : "#10b981",
              color: pendingInvoices.length > 0 ? "#dc2626" : "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {pendingInvoices.length > 0 ? <AlertCircle size={26} /> : <CheckCircle2 size={26} />}
            </div>
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
                লেনদেন বিবরণী
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "2px 0 0" }}>
                {pendingInvoices.length > 0 
                  ? `আপনার অ্যাকাউন্ট এ ${toBn(pendingInvoices.length)}টি চাঁদা বকেয়া রয়েছে (মোট ৳ ${toBn(totalPendingAmount.toLocaleString("en-IN"))})।`
                  : "আপনার অ্যাকাউন্ট সম্পূর্ণ আপডেট রয়েছে। কোনো বকেয়া নেই।"
                }
              </p>
            </div>
          </div>

          <button 
            onClick={() => window.print()} 
            className="no-print"
            style={{
              padding: "0.5rem 0.95rem",
              borderRadius: "0.65rem",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#334155",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginLeft: "auto"
            }}
          >
            <Printer size={15} /> প্রিন্ট স্টেটমেন্ট
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
            borderRadius: "1rem",
            padding: "1rem 1.15rem",
            background: currentMonthPaid
              ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
              : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: `1.5px solid ${currentMonthPaid ? "#86efac" : "#fde68a"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: currentMonthPaid ? "#10b981" : "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: currentMonthPaid
                ? "0 4px 12px rgba(16,185,129,0.3)"
                : "0 4px 12px rgba(245,158,11,0.3)",
            }}>
              {currentMonthPaid
                ? <CheckCircle2 size={22} color="#fff" />
                : <AlertCircle size={22} color="#fff" />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: currentMonthPaid ? "#065f46" : "#92400e", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {nowMonthEn} {nowYear} — চাঁদার অবস্থা
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 900, color: currentMonthPaid ? "#059669" : "#b45309" }}>
                {currentMonthPaid
                  ? `✓ পরিশোধিত — ৳ ${toBn(currentMonthPaidAmount.toLocaleString("en-IN"))}`
                  : `⏳ এখনো পরিশোধ হয়নি`
                }
              </p>
              {currentMonthPaid && currentMonthPaidDate && (
                <p style={{ margin: "1px 0 0", fontSize: "0.7rem", color: "#047857", fontWeight: 600 }}>
                  {formatDateEnShort(currentMonthPaidDate)} তারিখে পরিশোধ করা হয়েছে
                </p>
              )}
              {!currentMonthPaid && (
                <p style={{ margin: "1px 0 0", fontSize: "0.7rem", color: "#92400e", fontWeight: 600 }}>
                  দ্রুত পরিশোধ করুন — বিলম্বে জরিমানা প্রযোজ্য
                </p>
              )}
            </div>
          </div>

          {/* Total Paid Count */}
          <div style={{
            minWidth: "130px",
            borderRadius: "1rem",
            padding: "1rem 1.15rem",
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1.5px solid #bfdbfe",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              মোট পরিশোধ
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "1.6rem", fontWeight: 900, color: "#1d4ed8", lineHeight: 1 }}>
              {toBn(paidInvoices.length)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#3b82f6", fontWeight: 600 }}>
              কিস্তি সফলভাবে জমা
            </p>
          </div>
        </div>

        {/* 3. Pending Alert Banner (Only shown if user has pending invoices) */}
        {pendingInvoices.length > 0 && (
          <div className="no-print" style={{
            backgroundColor: "#FEF2F2",
            border: "1.5px solid #FCA5A5",
            borderRadius: "0.85rem",
            padding: "1.15rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.85rem",
            boxShadow: "0 4px 15px rgba(220, 38, 38, 0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <AlertCircle size={22} color="#dc2626" />
              <div>
                <strong style={{ fontSize: "0.95rem", color: "#991b1b", display: "block" }}>
                  ⚠️ আপনার {toBn(pendingInvoices.length)}টি মাসের চাঁদা বকেয়া রয়েছে (সর্বমোট ৳ {toBn(totalPendingAmount.toLocaleString("en-IN"))})!
                </strong>
                <span style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: 600 }}>
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
                    <span style={{ fontSize: "0.75rem", color: "#991b1b", backgroundColor: "#fff", padding: "0.35rem 0.65rem", borderRadius: "0.5rem", fontWeight: 700, border: "1px solid #fca5a5" }}>
                      {monthsBn[inv.month - 1]}: ৳ {inv.amount + inv.lateFee} (পরিশোধ করুন)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Monthly Profit/Loss Summary Card (Formula Based) */}
        <div className="no-print">
          <MonthlyProfitLossSummary 
            user={{ role: user.role, activeStatus: user.activeStatus ?? true }} 
            transactions={transactions} 
          />
        </div>

        {/* 4. Transaction List — Desktop: Table | Mobile: Compact Rows */}
        <div>
          {processedTransactions.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontSize: "0.9rem" }}>
              কোনো লেনদেনের তথ্য পাওয়া যায়নি।
            </p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="tx-table-desktop" style={{ overflowX: "auto" }}>
                <table className="statement-print-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #cbd5e1", color: "#0f172a", fontWeight: 900, backgroundColor: "#f8fafc" }}>
                      <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>তারিখ</th>
                      <th style={{ padding: "0.85rem 0.75rem" }}>বিবরণ</th>
                      <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>মাস</th>
                      <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>চাঁদা</th>
                      <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>মোট জমা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedTransactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "0.85rem 0.75rem", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>{tx.formattedDate}</td>
                        <td style={{ padding: "0.85rem 0.75rem", color: "#0f172a", fontWeight: 700 }}>{tx.desc}</td>
                        <td style={{ padding: "0.85rem 0.75rem", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>{tx.monthNameBn}</td>
                        <td style={{ padding: "0.85rem 0.75rem", fontWeight: 800, color: tx.isCredit ? "#15803d" : "#b91c1c", whiteSpace: "nowrap" }}>
                          {tx.isCredit ? "+" : "-"}৳ {tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "0.85rem 0.75rem", color: "#0f172a", fontWeight: 800, whiteSpace: "nowrap" }}>
                          ৳ {tx.runningTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Compact Rows */}
              <div className="tx-cards-mobile">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.5rem", padding: "0.55rem 0.5rem", backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1", fontWeight: 800, fontSize: "0.68rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  <span>বিবরণ / তারিখ</span>
                  <span style={{ minWidth: "72px", textAlign: "right" }}>চাঁদা</span>
                  <span style={{ minWidth: "80px", textAlign: "right" }}>মোট জমা</span>
                </div>
                {processedTransactions.map((tx, i) => (
                  <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.35rem", alignItems: "center", padding: "0.65rem 0.5rem", borderBottom: "1px solid #f1f5f9", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.desc}</span>
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500 }}>{tx.formattedDate}</span>
                    </div>
                    <span style={{ minWidth: "72px", textAlign: "right", fontSize: "0.82rem", fontWeight: 800, color: tx.isCredit ? "#15803d" : "#b91c1c", whiteSpace: "nowrap" }}>
                      {tx.isCredit ? "+" : "-"}৳{tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span style={{ minWidth: "80px", textAlign: "right", fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
                      ৳{tx.runningTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.65rem 0.5rem", backgroundColor: "#f0fdf4", borderTop: "2px solid #86efac", fontWeight: 900, fontSize: "0.82rem" }}>
                  <span style={{ color: "#14532d" }}>সর্বশেষ মোট জমা</span>
                  <span style={{ color: "#14532d" }}>৳{processedTransactions[0]?.runningTotal.toLocaleString("en-IN") ?? "০"}</span>
                </div>
              </div>
            </>
          )}
        </div>

      </div>


      <style dangerouslySetInnerHTML={{__html: `
        /* Mobile: flat card, no shadow/radius, compact rows */
        .tx-cards-mobile { display: none; }
        @media (max-width: 640px) {
          .finance-statement-container {
            border-radius: 0 !important;
            box-shadow: none !important;
            border-left: none !important;
            border-right: none !important;
            padding: 1rem 0.65rem !important;
            margin-left: -0.5rem !important;
            margin-right: -0.5rem !important;
          }
          .tx-table-desktop { display: none !important; }
          .tx-cards-mobile { display: block !important; }
        }
        /* Print */
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
          .tx-cards-mobile { display: none !important; }
          .tx-table-desktop { display: block !important; }
          .statement-print-table { border: 1px solid #000 !important; width: 100% !important; }
          .statement-print-table th, .statement-print-table td {
            border: 1px solid #64748b !important;
            padding: 6px 10px !important;
            color: #000 !important;
          }
        }
      `}} />

    </div>
  );
}
