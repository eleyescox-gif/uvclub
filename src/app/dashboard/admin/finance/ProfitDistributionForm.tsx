"use client";

import { useState } from "react";
import { DollarSign, Landmark, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfitDistributionForm() {
  const [type, setType] = useState("PROJECT_PROFIT");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError("দয়া করে সঠিক টাকার পরিমাণ দিন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance/profit-distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          totalAmount,
          description
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "ডিস্ট্রিবিউশন সম্পন্ন করা যায়নি");
      } else {
        setMessage(data.message || "সফলভাবে একটিভ সদস্যদের মাঝে ডিস্ট্রিবিউট করা হয়েছে।");
        setTotalAmount("");
        setDescription("");
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি ঘটেছে, পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass" style={{
      backgroundColor: "white",
      borderRadius: "1.25rem",
      padding: "1.5rem",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "0.75rem",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          color: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <Landmark size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
            লাভ্যাংশ ও আয়/ব্যয় ডিস্ট্রিবিউশন প্যানেল
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }}>
            প্রজেক্টের লাভ, ব্যাংক মুনাফা বা ব্যাংক চার্জ সকল একটিভ সদস্যদের মাঝে সমহারে বন্টন করুন
          </p>
        </div>
      </div>

      {message && (
        <div style={{ padding: "0.85rem", borderRadius: "0.75rem", backgroundColor: "#dcfce7", border: "1px solid #86efac", color: "#15803d", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem" }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ padding: "0.85rem", borderRadius: "0.75rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem" }}>
          ✕ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
            আয়/ব্যয়ের ধরণ
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "0.65rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              fontWeight: 700,
              outline: "none"
            }}
          >
            <option value="PROJECT_PROFIT">📈 প্রজেক্টের লাভ (Project Profit - সমহারে জমা)</option>
            <option value="PROJECT_LOSS">📉 প্রজেক্টের লোকসান (Project Loss - সমহারে কর্তন)</option>
            <option value="BANK_INTEREST">🏦 ব্যাংক মুনাফা/ইন্টারেস্ট (Bank Profit - সমহারে জমা)</option>
            <option value="BANK_CHARGE">💳 ব্যাংক চার্জ (Bank Charge - সমহারে কর্তন)</option>
            <option value="OTHER_INCOME">💰 অন্যান্য আয়/ক্লাব প্রফিট (Other Income - সমহারে জমা)</option>
            <option value="OTHER_EXPENSE">🧾 অন্যান্য ক্লাব ব্যয় (Other Expense - সমহারে কর্তন)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
            মোট টাকার পরিমাণ (৳)
          </label>
          <input
            type="number"
            placeholder="যেমন: 50000"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "0.65rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
              fontWeight: 800,
              outline: "none"
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
            বিবরণ বা নোট (ঐচ্ছিক)
          </label>
          <input
            type="text"
            placeholder="যেমন: মে ২০২১ মৎস্য প্রজেক্টের নিট লভ্যাংশ"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "0.65rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              outline: "none"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{
            padding: "0.85rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            borderRadius: "0.75rem",
            marginTop: "0.5rem"
          }}
        >
          <TrendingUp size={18} /> {loading ? "বন্টন করা হচ্ছে..." : "একটিভ সদস্যদের মাঝে সমহারে পোস্ট করুন"}
        </button>
      </form>
    </div>
  );
}
