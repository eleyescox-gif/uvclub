"use client";

import Link from "next/link";
import { MessageSquare, Receipt } from "lucide-react";
import styles from "./finance-admin.module.css";

interface Transaction {
  id: string;
  userName: string;
  userMobile: string;
  amount: number;
  type: string;
  createdAt: string;
  receiptNo: string;
}

export default function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
  const handleWhatsApp = (tx: Transaction) => {
    let mobile = tx.userMobile.replace(/[\s\-+]/g, "");
    if (mobile.startsWith("0")) mobile = "88" + mobile;

    const receiptLink = `${window.location.origin}/receipt/${tx.id}`;
    const date = new Date(tx.createdAt).toLocaleDateString("bn-BD", {
      year: "numeric", month: "long", day: "numeric",
    });
    const typeLabel = tx.type === "DEPOSIT" ? "মাসিক চাঁদা" : tx.type;

    const text =
`আসসালামু আলাইকুম, *${tx.userName}* ভাই/আপু। 😊
United Vision Club-এ আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে। ✅

*📋 রশিদের বিবরণ:*
• রশিদ নং: *${tx.receiptNo}*
• পেমেন্টের ধরন: ${typeLabel}
• পরিমাণ: *৳ ${tx.amount.toLocaleString()} টাকা*
• তারিখ: ${date}

🔗 *আপনার মানি রিসিট দেখুন:*
${receiptLink}

ধন্যবাদ,
🏦 ইউনাইটেড ভিশন ক্লাব`;

    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className={`glass ${styles.card}`}>
      <h2 className={styles.cardTitle}>সর্বশেষ পোস্টিং সমূহ</h2>
      {transactions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {transactions.map(tx => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "0.75rem",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {/* Member Info */}
              <div style={{ flex: 1, minWidth: "100px" }}>
                <p style={{ fontWeight: 600, color: "var(--foreground)", margin: 0, fontSize: "0.9rem" }}>
                  {tx.userName}
                </p>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: 0 }}>
                  {new Date(tx.createdAt).toLocaleDateString("bn-BD")} · {tx.userMobile}
                </p>
              </div>

              {/* Amount + Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: "var(--success)", fontSize: "0.95rem" }}>
                  + ৳ {tx.amount.toLocaleString()}
                </span>

                {/* View Receipt */}
                <Link
                  href={`/receipt/${tx.id}`}
                  target="_blank"
                  title="রশিদ দেখুন"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.72rem",
                    padding: "0.3rem 0.55rem",
                    backgroundColor: "#f0fdf4",
                    color: "#0F673D",
                    border: "1px solid #a7f3d0",
                    borderRadius: "0.375rem",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  <Receipt size={13} /> রশিদ
                </Link>

                {/* WhatsApp One-Click Send */}
                <button
                  onClick={() => handleWhatsApp(tx)}
                  type="button"
                  title="WhatsApp-এ রশিদ পাঠান"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.72rem",
                    padding: "0.3rem 0.55rem",
                    backgroundColor: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: 700,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1ebe5d")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#25D366")}
                >
                  <MessageSquare size={13} /> WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#6b7280", textAlign: "center" }}>কোনো লেনদেন নেই</p>
      )}
    </div>
  );
}
