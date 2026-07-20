"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Wallet, 
  FileText, 
  Clock, 
  AlertCircle, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  Printer, 
  CreditCard 
} from "lucide-react";
import Link from "next/link";
import OnlinePaymentCard from "./OnlinePaymentCard";

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
  proofImage?: string | null;
}

interface UnifiedFinanceViewProps {
  user: { name: string; nameBn?: string | null; mobile: string; role: string };
  pendingInvoices: Invoice[];
  transactions: Transaction[];
  gatewayActive: boolean;
}

const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const roleTitles: Record<string, string> = {
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সাধারণ সদস্য",
};

export default function UnifiedFinanceView({ user, pendingInvoices, transactions, gatewayActive }: UnifiedFinanceViewProps) {
  const [activeTab, setActiveTab] = useState<"bills" | "statement" | "ledger">("statement");

  // Helper date formatting
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

  // Calculate Net Member Balance
  const { totalDeposit, totalWithdrawal, totalProfit, totalLoss, currentBalance } = useMemo(() => {
    let deposit = 0;
    let withdrawal = 0;
    let profit = 0;
    let loss = 0;

    transactions.forEach(t => {
      if (t.status === "APPROVED") {
        if (t.type === "DEPOSIT") deposit += t.amount;
        if (t.type === "WITHDRAWAL") withdrawal += t.amount;
        if (t.type === "PROFIT_POSTING") profit += t.amount;
        if (t.type === "LOSS_POSTING") loss += t.amount;
      }
    });

    const balance = deposit + profit - loss - withdrawal;
    return { totalDeposit: deposit, totalWithdrawal: withdrawal, totalProfit: profit, totalLoss: loss, currentBalance: balance };
  }, [transactions]);

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", padding: "1.25rem 0.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Header Area */}
      <header style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--foreground)", margin: 0, letterSpacing: "-0.02em" }}>
          অর্থ ও স্টেটমেন্ট প্যানেল
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          বকেয়া চাঁদা পরিশোধ, স্মার্ট লেনদেন বিবরণী এবং বিস্তারিত লেজার রেজিস্টার
        </p>
      </header>

      {/* Modern Merged Tabs Navigation */}
      <div className="no-print" style={{
        backgroundColor: "white",
        borderRadius: "1.25rem",
        padding: "0.35rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        gap: "0.25rem",
        overflowX: "auto"
      }}>
        <button
          onClick={() => setActiveTab("bills")}
          style={{
            flex: "1 1 auto",
            padding: "0.65rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 800,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeTab === "bills" ? "var(--primary)" : "transparent",
            color: activeTab === "bills" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem",
            whiteSpace: "nowrap"
          }}
        >
          <CreditCard size={16} /> চাঁদা ও পরিশোধ {pendingInvoices.length > 0 && <span style={{ backgroundColor: "#ef4444", color: "white", padding: "1px 6px", borderRadius: "9999px", fontSize: "0.65rem" }}>{pendingInvoices.length}</span>}
        </button>

        <button
          onClick={() => setActiveTab("statement")}
          style={{
            flex: "1 1 auto",
            padding: "0.65rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 800,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeTab === "statement" ? "#2563eb" : "transparent",
            color: activeTab === "statement" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem",
            whiteSpace: "nowrap"
          }}
        >
          <Receipt size={16} /> লেনদেন বিবরণী
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          style={{
            flex: "1 1 auto",
            padding: "0.65rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 800,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeTab === "ledger" ? "#1e293b" : "transparent",
            color: activeTab === "ledger" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem",
            whiteSpace: "nowrap"
          }}
        >
          <Printer size={16} /> মেম্বার লেজার
        </button>
      </div>

      {/* ==================== TAB 1: PENDING INVOICES & PAYMENTS ==================== */}
      {activeTab === "bills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div className="glass" style={{ padding: "1.5rem 1.25rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
              <div style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                backgroundColor: pendingInvoices.length > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                color: pendingInvoices.length > 0 ? "#ef4444" : "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: pendingInvoices.length > 0 ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(16, 185, 129, 0.25)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                {pendingInvoices.length > 0 ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
              </div>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--foreground)", margin: 0 }}>
                  বকেয়া চাঁদার তালিকা
                </h2>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }}>
                  {pendingInvoices.length > 0 ? `আপনার মোট ${toBn(pendingInvoices.length)} টি মাসের চাঁদা পেন্ডিং রয়েছে` : "আপনার কোনো বকেয়া চাঁদা নেই"}
                </p>
              </div>
            </div>

            {pendingInvoices.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {pendingInvoices.map((inv) => {
                  const totalBill = inv.amount + inv.lateFee;
                  return (
                    <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#f8fafc", borderRadius: "0.85rem", border: "1px solid #e2e8f0", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, color: "#1e293b" }}>
                          {monthsBn[inv.month - 1]} {inv.year} এর মাসিক চাঁদা
                        </h3>
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                          মূল চাঁদা: {inv.amount} ৳ {inv.lateFee > 0 && `| বিলম্ব জরিমানা: ${inv.lateFee} ৳`}
                        </p>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--danger)" }}>
                          ৳ {toBn(totalBill.toLocaleString("en-IN"))}
                        </span>
                        
                        {gatewayActive ? (
                          <OnlinePaymentCard 
                            invoiceId={inv.id} 
                            amount={totalBill} 
                            month={inv.month} 
                            year={inv.year} 
                          />
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", fontWeight: 700, border: "1px solid #cbd5e1" }}>
                            অফলাইন জমা (ক্যাশিয়ার)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "#16a34a", fontSize: "0.95rem", fontWeight: 700, backgroundColor: "#f0fdf4", borderRadius: "0.85rem", border: "1px solid #bbf7d0" }}>
                🎉 অভিনন্দন! আপনার সবকটি চাঁদা পরিশোধিত আছে।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: BKASH STYLE TRANSACTION STATEMENT ==================== */}
      {activeTab === "statement" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Balance Card */}
          <div style={{
            background: "linear-gradient(135deg, #0F673D 0%, #064e2b 100%)",
            color: "#ffffff",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            boxShadow: "0 10px 25px rgba(15, 103, 61, 0.25)",
            position: "relative",
            overflow: "hidden"
          }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              আপনার বর্তমান ব্যালেন্স (ইউনাইটেড ভিশন)
            </span>

            <h2 style={{ fontSize: "2.25rem", fontWeight: 900, margin: "0.35rem 0 1rem", letterSpacing: "-0.02em" }}>
              ৳ {toBn(currentBalance.toLocaleString("en-IN"))}
            </h2>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)", fontSize: "0.8rem" }}>
              <div>
                <span style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", fontSize: "0.7rem" }}>মোট জমা</span>
                <strong style={{ fontWeight: 700 }}>৳ {toBn(totalDeposit.toLocaleString("en-IN"))}</strong>
              </div>
              <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.15)", paddingLeft: "1rem" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", fontSize: "0.7rem" }}>মোট উত্তোলন</span>
                <strong style={{ fontWeight: 700 }}>৳ {toBn(totalWithdrawal.toLocaleString("en-IN"))}</strong>
              </div>
              <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.15)", paddingLeft: "1rem" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.7)", display: "block", fontSize: "0.7rem" }}>মোট লভ্যাংশ</span>
                <strong style={{ fontWeight: 700, color: "#86efac" }}>+ ৳ {toBn(totalProfit.toLocaleString("en-IN"))}</strong>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Receipt size={20} color="var(--primary)" /> সাম্প্রতিক লেনদেন বিবরণী
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>
              মোট {toBn(transactions.length)} টি লেনদেন
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="glass" style={{ padding: "2.5rem", borderRadius: "1.25rem", textAlign: "center", color: "#6b7280" }}>
              কোনো লেনদেনের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {transactions.map((tx) => {
                const isCredit = tx.type === "DEPOSIT" || tx.type === "PROFIT_POSTING";
                const typeTitle = tx.type === "DEPOSIT" ? "চাঁদা জমা" :
                                  tx.type === "WITHDRAWAL" ? "উত্তোলন" :
                                  tx.type === "PROFIT_POSTING" ? "লভ্যাংশ প্রাপ্তি" :
                                  tx.type === "LOSS_POSTING" ? "লোকসান সমন্বয়" : "জরিমানা";

                return (
                  <div
                    key={tx.id}
                    style={{
                      backgroundColor: "white",
                      border: "1px solid var(--border)",
                      borderRadius: "1.15rem",
                      padding: "1rem 1.15rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
                    }}
                  >
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "0.85rem",
                      backgroundColor: isCredit ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: isCredit ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {isCredit ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
                          {typeTitle}
                        </h4>
                        {tx.status === "APPROVED" && (
                          <CheckCircle2 size={13} color="#10b981" />
                        )}
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span>{formatDateBn(tx.createdAt || tx.date)}</span>
                        <span>•</span>
                        <span style={{ backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                          রশিদ #{tx.id.substring(0, 6)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{
                        fontSize: "1.05rem",
                        fontWeight: 900,
                        color: isCredit ? "#15803d" : "#b91c1c",
                        display: "block"
                      }}>
                        {isCredit ? "+" : "-"} ৳ {toBn(tx.amount.toLocaleString("en-IN"))}
                      </span>
                      {tx.type === "DEPOSIT" && tx.status === "APPROVED" && (
                        <Link
                          href={`/dashboard/finance/receipt/${tx.id}`}
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--primary)",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                            marginTop: "2px"
                          }}
                        >
                          রশিদ <ChevronRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: FULL PRINTABLE MEMBER LEDGER ==================== */}
      {activeTab === "ledger" && (
        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
              বিস্তারিত মেম্বার লেজার রেজিস্টার
            </h3>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
              <Printer size={14} /> প্রিন্ট
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "0.65rem", textAlign: "left" }}>তারিখ</th>
                  <th style={{ padding: "0.65rem", textAlign: "left" }}>বিবরণ</th>
                  <th style={{ padding: "0.65rem", textAlign: "right" }}>জমা (৳)</th>
                  <th style={{ padding: "0.65rem", textAlign: "right" }}>উত্তোলন (৳)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const isCredit = t.type === "DEPOSIT" || t.type === "PROFIT_POSTING";
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.65rem" }}>{formatDateBn(t.createdAt || t.date)}</td>
                      <td style={{ padding: "0.65rem" }}>
                        {t.type === "DEPOSIT" ? "চাঁদা পরিশোধ" : t.type === "WITHDRAWAL" ? "উত্তোলন" : t.type}
                      </td>
                      <td style={{ padding: "0.65rem", textAlign: "right", color: "#16a34a", fontWeight: isCredit ? 700 : 400 }}>
                        {isCredit ? toBn(t.amount.toLocaleString("en-IN")) : "-"}
                      </td>
                      <td style={{ padding: "0.65rem", textAlign: "right", color: "#dc2626", fontWeight: !isCredit ? 700 : 400 }}>
                        {!isCredit ? toBn(t.amount.toLocaleString("en-IN")) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
