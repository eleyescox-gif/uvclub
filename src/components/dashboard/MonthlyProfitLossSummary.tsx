"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, HelpCircle, ShieldCheck, Sparkles } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: Date | string;
  createdAt: Date | string;
  status: string;
  note?: string | null;
}

interface MonthlyProfitLossSummaryProps {
  user: { role: string; activeStatus: boolean };
  transactions: Transaction[];
  activeMembersCount?: number;
  totalMembersCount?: number;
}

export default function MonthlyProfitLossSummary({
  user,
  transactions,
  activeMembersCount = 1,
  totalMembersCount = 1
}: MonthlyProfitLossSummaryProps) {
  
  // Convert numbers to Bengali
  const toBn = (num: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (digit) => bnNums[parseInt(digit)]);
  };

  const formatMoney = (amount: number) => {
    return `৳ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate formula values from user transactions
  const summaryData = useMemo(() => {
    let myGrossProfit = 0;
    let myGeneralExpense = 0;
    let myBankChargeDeduction = 0;

    transactions.forEach((tx) => {
      if (tx.status === "APPROVED") {
        if (tx.type === "PROFIT_POSTING" || tx.type === "DEPOSIT") {
          myGrossProfit += tx.amount;
        } else if (tx.type === "LOSS_POSTING") {
          myGeneralExpense += tx.amount;
        } else if (tx.type === "BANK_CHARGE") {
          myBankChargeDeduction += tx.amount;
        }
      }
    });

    const netProfit = myGrossProfit - myGeneralExpense - myBankChargeDeduction;
    const isProfit = netProfit >= 0;

    return {
      myGrossProfit,
      myGeneralExpense,
      myBankChargeDeduction,
      netProfit,
      isProfit
    };
  }, [transactions]);

  // If user is Inactive / Suspended
  if (!user.activeStatus) {
    return (
      <div style={{
        backgroundColor: "#fff1f2",
        borderRadius: "1.25rem",
        padding: "1.25rem 1.5rem",
        border: "1.5px solid #fecdd3",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.75rem" }}>
          <ShieldCheck size={22} color="#e11d48" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#9f1239" }}>
            হিসাব বিবরণী (স্থগিত অ্যাকাউন্ট)
          </h3>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#881337", margin: "0 0 0.85rem 0", lineHeight: "1.5" }}>
          ℹ️ আপনার হিসাবটি বর্তমানে <strong>স্থগিত (Inactive)</strong> রয়েছে। স্থগিত অ্যাকাউন্ট কোনো প্রজেক্ট বা ব্যাংক লভ্যাংশ পাবে না। তবে সংগঠনের ব্যাংক চার্জ সকলের সমহারে প্রযুক্ত হবে।
        </p>

        <div style={{ backgroundColor: "#ffffff", borderRadius: "0.85rem", padding: "0.85rem 1rem", border: "1px solid #ffe4e6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.875rem", color: "#4c0519", fontWeight: 700 }}>প্রদেয় ব্যাংক চার্জ শেয়ার:</span>
          <span style={{ fontSize: "1rem", fontWeight: 900, color: "#e11d48" }}>- {formatMoney(summaryData.myBankChargeDeduction)}</span>
        </div>
      </div>
    );
  }

  // Active Member Profit/Loss Summary Card
  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "1.25rem",
      padding: "1.5rem",
      border: "1px solid var(--border)",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.03)",
      display: "flex",
      flexDirection: "column",
      gap: "1.15rem"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "0.75rem",
            backgroundColor: summaryData.isProfit ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            color: summaryData.isProfit ? "#10b981" : "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {summaryData.isProfit ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
              মাসিক লাভ/ক্ষতি বিবরণী (Monthly Profit/Loss Statement)
            </h3>
            <span style={{ fontSize: "0.775rem", color: "#64748b" }}>
              সক্রিয় সদস্য হিসেবে সমহারে বন্টনকৃত নিট হিসাব
            </span>
          </div>
        </div>

        <span style={{
          padding: "0.3rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.775rem",
          fontWeight: 800,
          backgroundColor: summaryData.isProfit ? "#dcfce7" : "#fee2e2",
          color: summaryData.isProfit ? "#15803d" : "#b91c1c"
        }}>
          {summaryData.isProfit ? "📈 লাভ (Net Profit)" : "📉 নিট ক্ষতি (Net Loss)"}
        </span>
      </div>

      {/* Structured Formula Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#334155", fontWeight: 800, textAlign: "left" }}>
              <th style={{ padding: "0.75rem" }}>বিবরণ (Description)</th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>টাকা (Amount)</th>
              <th style={{ padding: "0.75rem" }}>মন্তব্য (Note)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "0.75rem", fontWeight: 700, color: "#0f172a" }}>আপনার শেয়ারকৃত আয়</td>
              <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 800, color: "#16a34a" }}>
                + {formatMoney(summaryData.myGrossProfit)}
              </td>
              <td style={{ padding: "0.75rem", color: "#64748b", fontSize: "0.8rem" }}>
                (আপনার ভাগের মোট প্রজেক্ট ও সাধারণ আয়)
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "0.75rem", fontWeight: 700, color: "#0f172a" }}>বিয়োগ: আপনার ভাগের সাধারণ ব্যয় ও চার্জ</td>
              <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 800, color: "#dc2626" }}>
                - {formatMoney(summaryData.myGeneralExpense + summaryData.myBankChargeDeduction)}
              </td>
              <td style={{ padding: "0.75rem", color: "#64748b", fontSize: "0.8rem" }}>
                (অপারেশনাল খরচ ও ব্যাংক চার্জ)
              </td>
            </tr>

            <tr style={{ backgroundColor: summaryData.isProfit ? "#f0fdf4" : "#fef2f2", borderTop: "2px solid #cbd5e1" }}>
              <td style={{ padding: "0.85rem 0.75rem", fontWeight: 900, color: "#0f172a", fontSize: "0.95rem" }}>
                {summaryData.isProfit ? "নিট মুনাফা (লাভ)" : "নিট ক্ষতি (ক্ষতি)"}
              </td>
              <td style={{ padding: "0.85rem 0.75rem", textAlign: "right", fontWeight: 900, fontSize: "1.05rem", color: summaryData.isProfit ? "#15803d" : "#b91c1c" }}>
                {summaryData.isProfit ? "+" : "-"} {formatMoney(Math.abs(summaryData.netProfit))}
              </td>
              <td style={{ padding: "0.85rem 0.75rem", fontWeight: 800, color: summaryData.isProfit ? "#166534" : "#991b1b", fontSize: "0.8rem" }}>
                ({summaryData.isProfit ? "আপনার এই মাসের নিট আয়" : "আপনার এই মাসের অর্পিত নিট ক্ষতি"})
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.775rem", color: "#475569", lineHeight: "1.5" }}>
        💡 <strong>লজিক তথ্য:</strong> সকল সক্রিয় সদস্যদের মাঝে প্রজেক্ট আয়, বাতিলকৃত সদস্যের কর্তন ফি ও সাধারণ ব্যয় সমহারে বন্টন করা হয়। ব্যাংক চার্জ সংগঠনের সকল সক্রিয় ও নিষ্ক্রিয় সদস্যের মাঝে সমহারে প্রযোজ্য হয়।
      </div>
    </div>
  );
}
