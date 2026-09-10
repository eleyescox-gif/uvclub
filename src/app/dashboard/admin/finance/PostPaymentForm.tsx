"use client";

import { useState, useMemo } from "react";
import { postPayment } from "@/actions/finance";
import styles from "./finance-admin.module.css";
import Link from "next/link";
import { MessageSquare, Receipt, CheckCircle, Filter } from "lucide-react";

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  mobile: string;
}

interface PaidRecord {
  userId: string;
  month: number;
  year: number;
}

export default function PostPaymentForm({
  members,
  paidRecords = [],
}: {
  members: Member[];
  paidRecords?: PaidRecord[];
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedMobile, setSelectedMobile] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [hidePaidMembers, setHidePaidMembers] = useState<boolean>(true);
  const [paidList, setPaidList] = useState<PaidRecord[]>(paidRecords);

  // Set of user IDs who have paid for the currently selected month and year
  const paidUserIdsForSelectedMonth = useMemo(() => {
    const set = new Set<string>();
    paidList.forEach((r) => {
      if (r.month === selectedMonth && r.year === selectedYear) {
        set.add(r.userId);
      }
    });
    return set;
  }, [paidList, selectedMonth, selectedYear]);

  // Filtered members: when hidePaidMembers is true, exclude already paid
  const displayedMembers = useMemo(() => {
    if (hidePaidMembers) {
      return members.filter((m) => !paidUserIdsForSelectedMonth.has(m.id));
    }
    return members;
  }, [members, hidePaidMembers, paidUserIdsForSelectedMonth]);

  const totalMembersCount = members.length;
  const paidCount = members.filter((m) => paidUserIdsForSelectedMonth.has(m.id)).length;
  const unpaidCount = totalMembersCount - paidCount;

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value);
    setSelectedMonth(newMonth);

    // If currently selected member is already paid in the new month, clear selection
    const isPaid = paidList.some(
      (r) => r.userId === selectedUserId && r.month === newMonth && r.year === selectedYear
    );
    if (isPaid) {
      setSelectedUserId("");
      setSelectedMobile("");
      setSelectedName("");
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = Number(e.target.value);
    setSelectedYear(newYear);

    const isPaid = paidList.some(
      (r) => r.userId === selectedUserId && r.month === selectedMonth && r.year === newYear
    );
    if (isPaid) {
      setSelectedUserId("");
      setSelectedMobile("");
      setSelectedName("");
    }
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    setSelectedUserId(memberId);
    if (memberId) {
      const member = members.find((m) => m.id === memberId);
      setSelectedMobile(member?.mobile || "");
      setSelectedName(member?.nameBn || member?.name || "");
    } else {
      setSelectedMobile("");
      setSelectedName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const postedUserId = selectedUserId;
    const postedMonth = selectedMonth;
    const postedYear = selectedYear;

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

      // Instantly mark member as paid in local state so they disappear from unpaid list
      setPaidList((prev) => [
        ...prev,
        { userId: postedUserId, month: postedMonth, year: postedYear },
      ]);

      (e.target as HTMLFormElement).reset();
      setSelectedUserId("");
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

  return (
    <div className={`glass ${styles.card}`}>
      <h2 className={styles.cardTitle}>নতুন পেমেন্ট পোস্টিং (Cash Receipt)</h2>

      <form onSubmit={handleSubmit}>
        {/* Month & Year Selection Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div>
            <label className={styles.label}>কোন মাসের চাঁদা?</label>
            <select
              name="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className={styles.select}
              required
            >
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

          <div>
            <label className={styles.label}>বছর</label>
            <input
              type="number"
              name="year"
              value={selectedYear}
              onChange={handleYearChange}
              className={styles.input}
              required
              min="2024"
            />
          </div>
        </div>

        {/* Member Selection */}
        <div className={styles.formGroup}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <label className={styles.label} style={{ margin: 0 }}>
              সদস্য নির্বাচন করুন
            </label>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                backgroundColor: unpaidCount > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                color: unpaidCount > 0 ? "#dc2626" : "#059669",
                fontWeight: 600,
              }}
            >
              বকেয়া: {unpaidCount} জন | পরিশোধিত: {paidCount} জন
            </span>
          </div>

          {/* Toggle to hide/show already paid members */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              marginBottom: "0.5rem",
              fontSize: "0.82rem",
              color: "#4b5563",
              backgroundColor: "#f9fafb",
              padding: "0.4rem 0.65rem",
              borderRadius: "0.4rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <input
              type="checkbox"
              id="hidePaidMembersCheck"
              checked={hidePaidMembers}
              onChange={(e) => setHidePaidMembers(e.target.checked)}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <label htmlFor="hidePaidMembersCheck" style={{ cursor: "pointer", userSelect: "none", fontWeight: 500 }}>
              চলতি মাসে যারা পেমেন্ট করেছে তাদের নাম লুকান (ডিফল্ট)
            </label>
          </div>

          <select
            name="userId"
            value={selectedUserId}
            className={styles.select}
            required
            onChange={handleMemberChange}
          >
            <option value="">
              {displayedMembers.length === 0
                ? "-- এই মাসের সকল সদস্যের চাঁদা পরিশোধিত --"
                : `-- সদস্য নির্বাচন করুন (${displayedMembers.length} জন বকেয়া) --`}
            </option>
            {displayedMembers.map((m) => {
              const isPaid = paidUserIdsForSelectedMonth.has(m.id);
              return (
                <option
                  key={m.id}
                  value={m.id}
                  disabled={isPaid}
                  style={isPaid ? { color: "#9ca3af", fontStyle: "italic" } : {}}
                >
                  {m.nameBn || m.name} ({m.mobile}) {isPaid ? "— [ইতোমধ্যে পরিশোধিত]" : ""}
                </option>
              );
            })}
          </select>

          {hidePaidMembers && unpaidCount === 0 && (
            <p style={{ fontSize: "0.82rem", color: "#059669", marginTop: "0.4rem", fontWeight: 600 }}>
              🎉 চমৎকার! নির্বাচিত মাসে ক্লাবের সকল সদস্যের চাঁদা পরিশোধ সম্পন্ন হয়েছে।
            </p>
          )}
        </div>

        {/* Amount */}
        <div className={styles.formGroup}>
          <label className={styles.label}>চাঁদার পরিমাণ (টাকা)</label>
          <input type="number" name="amount" defaultValue="1000" className={styles.input} required min="1" />
        </div>

        {/* Late Fee */}
        <div className={styles.formGroup}>
          <label className={styles.label}>জরিমানা / Late Fee (যদি থাকে)</label>
          <input type="number" name="lateFee" defaultValue="0" className={styles.input} min="0" />
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>১ মাস বিলম্ব হলে ৫০ টাকা জরিমানা</p>
        </div>

        <button
          type="submit"
          disabled={loading || (hidePaidMembers && unpaidCount === 0) || !selectedUserId}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
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
