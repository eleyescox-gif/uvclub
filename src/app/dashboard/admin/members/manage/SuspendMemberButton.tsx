"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function SuspendMemberButton({ userId, activeStatus, unpaidMonths }: { userId: string; activeStatus: boolean; unpaidMonths: number }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const actionText = activeStatus ? "স্থগিত" : "পুনরায় সক্রিয়";
    if (!confirm(`আপনি কি এই সদস্যের হিসাবটি ${actionText} করতে চান?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/members/toggle-suspend", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          activeStatus: !activeStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "কার্যক্রম সম্পন্ন করা সম্ভব হয়নি");
      }
    } catch (e) {
      alert("নেটওয়ার্ক ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="btn btn-secondary"
      style={{
        padding: "0.25rem 0.5rem",
        fontSize: "0.75rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        color: activeStatus ? "#dc2626" : "#16a34a",
        borderColor: activeStatus ? "#dc2626" : "#16a34a",
        fontWeight: 700
      }}
      title={activeStatus ? "টানা ৪ মাস চাঁদা বকেয়া থাকলে স্থগিত করুন" : "হিসাব পুনরুজ্জীবিত করুন"}
    >
      {activeStatus ? (
        <>
          <ShieldAlert size={14} /> স্থগিত করুন
        </>
      ) : (
        <>
          <CheckCircle2 size={14} /> সক্রিয় করুন
        </>
      )}
    </button>
  );
}
