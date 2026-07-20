"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Users } from "lucide-react";

interface ExitApprovalModalProps {
  exitRequestId: string;
  userName: string;
  userBalance: number;
  joinDate: string;
  has75PercentVotes: boolean;
  yesVotePercentage: number;
}

export default function PresidentExitApprovalModal({
  exitRequestId,
  userName,
  userBalance,
  joinDate,
  has75PercentVotes,
  yesVotePercentage
}: ExitApprovalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const joinDateObj = new Date(joinDate);
  const diffYears = (new Date().getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const isWithin5Years = diffYears <= 5.0;

  const handleApprove = async () => {
    setError("");
    setSuccess("");

    const dedNum = parseFloat(deductionAmount || "0");
    if (isNaN(dedNum) || dedNum < 0) {
      setError("সঠিক কর্তনের পরিমাণ লিখুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/exit-requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exitRequestId,
          deductionAmount: dedNum
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "অনুমোদন করা সম্ভব হয়নি");
      } else {
        setSuccess(data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (e) {
      setError("নেটওয়ার্ক ত্রুটি ঘটেছে, পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const refundCalc = Math.max(0, userBalance - (parseFloat(deductionAmount) || 0));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{
          padding: "0.3rem 0.65rem",
          fontSize: "0.75rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          backgroundColor: has75PercentVotes ? "#10b981" : "#f59e0b",
          borderColor: has75PercentVotes ? "#10b981" : "#f59e0b",
          fontWeight: 800
        }}
      >
        <CheckCircle2 size={14} /> বাতিল অনুমোদন ({yesVotePercentage.toFixed(0)}% ভোট)
      </button>

      {isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "var(--shadow-xl)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 900, margin: 0, color: "var(--foreground)" }}>
                সদস্যপদ বাতিল অনুমোদন (সভাপতি প্যানেল)
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}>
                <XCircle size={22} />
              </button>
            </div>

            {error && (
              <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "0.6rem", fontSize: "0.85rem", fontWeight: 700 }}>
                ✕ {error}
              </div>
            )}

            {success && (
              <div style={{ padding: "0.75rem", backgroundColor: "#dcfce7", border: "1px solid #86efac", color: "#15803d", borderRadius: "0.6rem", fontSize: "0.85rem", fontWeight: 700 }}>
                ✓ {success}
              </div>
            )}

            <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div><strong>সদস্যের নাম:</strong> {userName}</div>
              <div><strong>সদস্যপদ যোগদানের সময়:</strong> {joinDateObj.toLocaleDateString("bn-BD")} ({diffYears.toFixed(1)} বছর)</div>
              <div><strong>মোট সঞ্চিত জমা:</strong> ৳ {userBalance.toLocaleString("bn-BD")}</div>
              <div><strong>ভোটের সমর্থন:</strong> {yesVotePercentage.toFixed(1)}% ({has75PercentVotes ? "✓ ৭৫% অতিক্রম করেছে" : "⚠️ ৭৫% পূর্ণ হয়নি"})</div>
            </div>

            {isWithin5Years && (
              <div style={{ backgroundColor: "#fffbeb", padding: "0.85rem", borderRadius: "0.75rem", border: "1px solid #fde68a", fontSize: "0.8rem", color: "#b45309", display: "flex", gap: "0.5rem" }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>বিশেষ নিয়ম:</strong> সদস্য ৫ বছরের মধ্যে পদত্যাগ করছেন। সভাপতি কর্তনকৃত অর্থ নির্ধারণ করলে তা অবশিষ্ট সকল একটিভ সদস্যের অ্যাকাউন্টে সমহারে ডিস্ট্রিবিউট হয়ে যাবে।
                </span>
              </div>
            )}

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                কর্তনকৃত অর্থের পরিমাণ (৳)
              </label>
              <input
                type="number"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(e.target.value)}
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "0.65rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "1rem",
                  fontWeight: 800,
                  outline: "none"
                }}
              />
            </div>

            <div style={{ backgroundColor: "#f0fdf4", padding: "0.85rem", borderRadius: "0.75rem", border: "1px solid #bbf7d0", fontSize: "0.85rem", color: "#15803d", fontWeight: 700 }}>
              সদস্যের চূড়ান্ত ফেরতযোগ্য অর্থ: ৳ {refundCalc.toLocaleString("bn-BD")}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setIsOpen(false)} className="btn btn-secondary" style={{ padding: "0.6rem 1.25rem" }}>
                বাতিল করুন
              </button>
              <button onClick={handleApprove} disabled={loading} className="btn btn-primary" style={{ padding: "0.6rem 1.5rem", fontWeight: 800, backgroundColor: "#10b981", borderColor: "#10b981" }}>
                {loading ? "প্রসেসিং..." : "চূড়ান্ত অনুমোদন দিন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
