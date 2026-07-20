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
  transactions: Transaction[];
  gatewayActive: boolean;
}

const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const monthsShortEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function UnifiedFinanceView({ user, pendingInvoices, transactions, gatewayActive }: UnifiedFinanceViewProps) {
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
      
      let desc = `চাঁদা - ${monthNameBn}`;
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
          <img src="/logo.jpg" alt="United Vision Logo" style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "6px" }} />
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

        {/* 2. Confetti / Unpaid Alert Banner */}
        {pendingInvoices.length === 0 ? (
          <div className="no-print" style={{
            backgroundColor: "#FFF8ED",
            border: "1px solid #FDE68A",
            borderRadius: "0.85rem",
            padding: "0.9rem 1.25rem",
            textAlign: "center",
            fontSize: "0.95rem",
            color: "#78350F",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem"
          }}>
            <span style={{ fontSize: "1.2rem" }}>🏆🎉</span>
            <span>
              চমৎকার! <strong>আপনার কোনো বকেয়া চাঁদা নেই। সমস্ত চাঁদা সফলভাবে পরিশোধ করা হয়েছে।</strong>
            </span>
          </div>
        ) : (
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

        {/* 3. Monthly Profit/Loss Summary Card (Formula Based) */}
        <div className="no-print">
          <MonthlyProfitLossSummary 
            user={{ role: user.role, activeStatus: user.activeStatus ?? true }} 
            transactions={transactions} 
          />
        </div>

        {/* 3. Single Unified Statement Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="statement-print-table" style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.9rem"
          }}>
            <thead>
              <tr style={{
                borderBottom: "2px solid #cbd5e1",
                color: "#0f172a",
                fontWeight: 900,
                backgroundColor: "#f8fafc"
              }}>
                <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>তারিখ</th>
                <th style={{ padding: "0.85rem 0.75rem" }}>বিবরণ</th>
                <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>মাসের নাম</th>
                <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>চাঁদা</th>
                <th style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>মোট জমা</th>
              </tr>
            </thead>
            <tbody>
              {processedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    কোনো লেনদেনের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                processedTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {/* Date */}
                    <td style={{ padding: "0.85rem 0.75rem", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {tx.formattedDate}
                    </td>

                    {/* Description */}
                    <td style={{ padding: "0.85rem 0.75rem", color: "#0f172a", fontWeight: 700 }}>
                      {tx.desc}
                    </td>

                    {/* Month Name */}
                    <td style={{ padding: "0.85rem 0.75rem", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {tx.monthNameBn}
                    </td>

                    {/* Amount */}
                    <td style={{
                      padding: "0.85rem 0.75rem",
                      fontWeight: 800,
                      color: tx.isCredit ? "#15803d" : "#b91c1c",
                      whiteSpace: "nowrap"
                    }}>
                      {tx.isCredit ? "+" : "-"}৳ {tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Running Cumulative Total Deposit */}
                    <td style={{ padding: "0.85rem 0.75rem", color: "#0f172a", fontWeight: 800, whiteSpace: "nowrap" }}>
                      ৳ {tx.runningTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print {
            display: none !important;
          }
          .only-print {
            display: block !important;
          }
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
          .statement-print-table {
            border: 1px solid #000 !important;
            width: 100% !important;
          }
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
