"use client";

import { useState } from "react";
import { postPayment } from "@/actions/finance";
import styles from "./finance-admin.module.css";
import Link from "next/link";
import { MessageSquare, Receipt, CheckCircle } from "lucide-react";

export default function PostPaymentForm({ members }: { members: any[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    transactionId?: string;
    memberName?: string;
    memberMobile?: string;
    amount?: number;
    receiptNo?: string;
  } | null>(null);

  const [selectedMobile, setSelectedMobile] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const memberId = e.target.value;
    if (memberId) {
      const member = members.find(m => m.id === memberId);
      setSelectedMobile(member?.mobile || "");
      setSelectedName(member?.nameBn || member?.name || "");
    } else {
      setSelectedMobile("");
      setSelectedName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const result = await postPayment(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      const receiptNo = result.transactionId
        ? `UVC-${result.transactionId.substring(0, 8).toUpperCase()}`
        : "";
      setMessage({
        type: "success",
        text: "পেমেন্ট পোস্টিং সম্পন্ন হয়েছে এবং সদস্যের মোবাইলে রসিদ সহ অটোমেটিক এসএমএস পাঠানো হয়েছে।",
        transactionId: result.transactionId,
        memberName: selectedName,
        memberMobile: selectedMobile,
        amount,
        receiptNo,
      });
      (e.target as HTMLFormElement).reset();
      setSelectedMobile("");
      setSelectedName("");
    }

    setLoading(false);
  };

  const handleWhatsApp = () => {
    if (!message?.memberMobile || !message?.transactionId) return;

    let mobile = message.memberMobile.replace(/[\s\-+]/g, "");
    if (mobile.startsWith("0")) mobile = "88" + mobile;

    const receiptLink = `${window.location.origin}/receipt/${message.transactionId}`;
    const date = new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const text =
`আসসালামু আলাইকুম, *${message.memberName}* ভাই/আপু। 😊
United Vision Club-এ আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে। ✅

*📋 রশিদের বিবরণ:*
• রশিদ নং: *${message.receiptNo}*
• পেমেন্টের ধরন: মাসিক চাঁদা
• পরিমাণ: *৳ ${message.amount?.toLocaleString()} টাকা*
• তারিখ: ${date}

🔗 *আপনার মানি রিসিট দেখুন:*
${receiptLink}

ধন্যবাদ,
🏦 ইউনাইটেড ভিশন ক্লাব`;

    const url = `https://wa.me/${mobile}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className={`glass ${styles.card}`}>
      <h2 className={styles.cardTitle}>নতুন পেমেন্ট পোস্টিং (Cash Receipt)</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>সদস্য নির্বাচন করুন</label>
          <select name="userId" className={styles.select} required onChange={handleMemberChange}>
            <option value="">-- সদস্য নির্বাচন করুন --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.nameBn || m.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>চাঁদার পরিমাণ (টাকা)</label>
          <input type="number" name="amount" defaultValue="1000" className={styles.input} required min="1" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>কোন মাসের চাঁদা?</label>
          <select name="month" defaultValue={currentMonth} className={styles.select} required>
            <option value="1">জানুয়ারি</option>
            <option value="2">ফেব্রুয়ারি</option>
            <option value="3">মার্চ</option>
            <option value="4">এপ্রিল</option>
            <option value="5">মে</option>
            <option value="6">জুন</option>
            <option value="7">জুলাই</option>
            <option value="8">আগস্ট</option>
            <option value="9">সেপ্টেম্বর</option>
            <option value="10">অক্টোবর</option>
            <option value="11">নভেম্বর</option>
            <option value="12">ডিসেম্বর</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>বছর</label>
          <input type="number" name="year" defaultValue={currentYear} className={styles.input} required min="2024" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>জরিমানা / Late Fee (যদি থাকে)</label>
          <input type="number" name="lateFee" defaultValue="0" className={styles.input} min="0" />
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>১ মাস বিলম্ব হলে ৫০ টাকা জরিমানা</p>
        </div>

        <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
          {loading ? "প্রসেসিং..." : "পেমেন্ট পোস্ট করুন"}
        </button>
      </form>

      {/* Success / Error Message + Action Buttons */}
      {message && (
        <div className={`${styles.message} ${message.type === "success" ? styles.success : styles.error}`}>
          {message.type === "success" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <CheckCircle size={20} color="#0F673D" />
              <p style={{ fontWeight: 700, color: "#0F673D", margin: 0 }}>{message.text}</p>
            </div>
          )}
          {message.type === "error" && <p>{message.text}</p>}

          {message.transactionId && (
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {/* View Receipt Button */}
              <Link
                href={`/receipt/${message.transactionId}`}
                target="_blank"
                className={styles.receiptBtn}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Receipt size={15} /> রশিদ দেখুন
              </Link>

              {/* One-Click WhatsApp Send Button */}
              {message.memberMobile && (
                <button
                  onClick={handleWhatsApp}
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    backgroundColor: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 1.1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    boxShadow: "0 2px 6px rgba(37,211,102,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1ebe5d")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#25D366")}
                >
                  <MessageSquare size={15} />
                  WhatsApp-এ রশিদ পাঠান
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
