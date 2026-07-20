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
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "0.5rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: activeStatus ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
        color: activeStatus ? "#dc2626" : "#16a34a",
        border: activeStatus ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(16, 185, 129, 0.25)",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      title={activeStatus ? "হিসাব স্থগিত করুন (Suspend Account)" : "হিসাব পুনরায় সক্রিয় করুন (Reactivate Account)"}
    >
      {activeStatus ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
    </button>
  );
}
