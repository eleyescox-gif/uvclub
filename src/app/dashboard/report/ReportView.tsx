"use client";

import { useState, useMemo } from "react";
import { Printer, Calendar, Receipt, MessageCircle, ArrowUpRight, ArrowDownLeft, FileText, Send, CheckCircle2, ChevronRight } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"statement" | "whatsapp" | "ledger">("statement");

  // Date range state for WhatsApp Report application
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const jan1stStr = `${today.getFullYear()}-01-01`;

  const [whatsappDateFrom, setWhatsappDateFrom] = useState(jan1stStr);
  const [whatsappDateTo, setWhatsappDateTo] = useState(todayStr);

  // Helper date formatting
  const formatDateBn = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatTimeBn = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
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

  // Handle WhatsApp Report Generation & Opening
  const handleSendWhatsAppReport = () => {
    const fromText = formatDateBn(whatsappDateFrom);
    const toText = formatDateBn(whatsappDateTo);

    const message = `ইউনাইটেড ভিশন ক্লাব - স্টেটমেন্ট আবেদন:
----------------------------------------
মেম্বার নাম: ${user.nameBn || user.name}
মোবাইল: ${user.mobile}
পদবী: ${roleTitles[user.role] || "সদস্য"}

আবেদনের মেয়াদ: ${fromText} থেকে ${toText}

অনুরোধ: প্রিয় সাধারণ সম্পাদক, দয়া করে উল্লেখিত সময়ের মধ্যে আমার অ্যাকাউন্টের সম্পূর্ণ অফিশিয়াল স্টেটমেন্ট/রিপোর্ট প্রস্তুত করে এই হোয়াটসঅ্যাপে পাঠাবেন।`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, "_blank");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "3rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Top View Selector Switcher (bKash Statement vs Apply for Report vs Full Ledger) */}
      <div className="no-print" style={{
        backgroundColor: "white",
        borderRadius: "1.25rem",
        padding: "0.4rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        gap: "0.25rem"
      }}>
        <button
          onClick={() => setActiveView("statement")}
          style={{
            flex: 1,
            padding: "0.65rem 0.5rem",
            fontSize: "0.825rem",
            fontWeight: 700,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeView === "statement" ? "var(--primary)" : "transparent",
            color: activeView === "statement" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem"
          }}
        >
          <Receipt size={16} /> লেনদেন বিবরণী
        </button>

        <button
          onClick={() => setActiveView("whatsapp")}
          style={{
            flex: 1,
            padding: "0.65rem 0.5rem",
            fontSize: "0.825rem",
            fontWeight: 700,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeView === "whatsapp" ? "#16a34a" : "transparent",
            color: activeView === "whatsapp" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem"
          }}
        >
          <MessageCircle size={16} /> রিপোর্ট আবেদন
        </button>

        <button
          onClick={() => setActiveView("ledger")}
          style={{
            flex: 1,
            padding: "0.65rem 0.5rem",
            fontSize: "0.825rem",
            fontWeight: 700,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeView === "ledger" ? "#1e293b" : "transparent",
            color: activeView === "ledger" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem"
          }}
        >
          <FileText size={16} /> বিস্তারিত লেজার
        </button>
      </div>

      {/* ==================== VIEW 1: BKASH STYLE STATEMENT ==================== */}
      {activeView === "statement" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* bKash Balance Summary Card */}
          <div style={{
            background: "linear-gradient(135deg, #0F673D 0%, #064e2b 100%)",
            color: "#ffffff",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            boxShadow: "0 10px 25px rgba(15, 103, 61, 0.25)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              pointerEvents: "none"
            }} />

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

          {/* Statement List Title */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Receipt size={20} color="var(--primary)" /> সাম্প্রতিক লেনদেন বিবরণী
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>
              মোট {toBn(transactions.length)} টি লেনদেন
            </span>
          </div>

          {/* bKash App Style Transactions Cards */}
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
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                      transition: "transform 0.15s ease, boxShadow 0.15s ease"
                    }}
                  >
                    {/* Left Icon */}
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

                    {/* Middle Details */}
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
                        <span>{formatDateBn(tx.date)}</span>
                        <span>•</span>
                        <span style={{ backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                          রশিদ #{tx.id.substring(0, 6)}
                        </span>
                      </div>
                    </div>

                    {/* Right Amount */}
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

      {/* ==================== VIEW 2: APPLY FOR REPORT VIA WHATSAPP ==================== */}
      {activeView === "whatsapp" && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "1.75rem 1.5rem",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "1rem",
              backgroundColor: "rgba(22, 163, 74, 0.1)",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <MessageCircle size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                হোয়াটসঅ্যাপে রিপোর্ট এর আবেদন
              </h3>
              <p style={{ fontSize: "0.825rem", color: "#6b7280", margin: "2px 0 0" }}>
                তারিখ সিলেক্ট করে সাধারণ সম্পাদককে অফিশিয়াল স্টেটমেন্টের জন্য অনুরোধ জানান।
              </p>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px dashed var(--border)" }} />

          {/* Date Picker Range */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={whatsappDateFrom}
                  onChange={(e) => setWhatsappDateFrom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    color: "var(--foreground)",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                  শেষ তারিখ
                </label>
                <input
                  type="date"
                  value={whatsappDateTo}
                  onChange={(e) => setWhatsappDateTo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    color: "var(--foreground)",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Quick Date Presets */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => { setWhatsappDateFrom(`${today.getFullYear()}-01-01`); setWhatsappDateTo(todayStr); }}
                style={{ backgroundColor: "#f1f5f9", border: "none", padding: "0.35rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}
              >
                চলতি বছর
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - 3);
                  setWhatsappDateFrom(d.toISOString().split("T")[0]);
                  setWhatsappDateTo(todayStr);
                }}
                style={{ backgroundColor: "#f1f5f9", border: "none", padding: "0.35rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}
              >
                গত ৩ মাস
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setFullYear(d.getFullYear() - 1);
                  setWhatsappDateFrom(d.toISOString().split("T")[0]);
                  setWhatsappDateTo(todayStr);
                }}
                style={{ backgroundColor: "#f1f5f9", border: "none", padding: "0.35rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}
              >
                গত ১ বছর
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSendWhatsAppReport}
            style={{
              backgroundColor: "#25D366",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.85rem",
              padding: "0.85rem 1.25rem",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              boxShadow: "0 4px 15px rgba(37, 211, 102, 0.35)",
              transition: "transform 0.15s ease"
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Send size={18} /> হোয়াটসঅ্যাপে রিপোর্টে আবেদন পাঠান
          </button>
        </div>
      )}

      {/* ==================== VIEW 3: FULL LEDGER TABLE (PRINT FRIENDLY) ==================== */}
      {activeView === "ledger" && (
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
                      <td style={{ padding: "0.65rem" }}>{formatDateBn(t.date)}</td>
                      <td style={{ padding: "0.65rem" }}>{t.type}</td>
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
