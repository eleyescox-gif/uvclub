"use client";

import { useState } from "react";
import { Landmark, TrendingUp, DollarSign } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  status: string;
}

export default function ProfitDistributionForm({ activeProjects = [] }: { activeProjects?: ProjectItem[] }) {
  const [selectedSource, setSelectedSource] = useState("PROJECT"); // "PROJECT", "BANK_INTEREST", "BANK_CHARGE", "OTHER_INCOME", "OTHER_EXPENSE"
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjects[0]?.id || "");
  const [distributionKind, setDistributionKind] = useState<"PROFIT" | "LOSS">("PROFIT");
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

    let typeCode = "OTHER_INCOME";
    let typeName = "";

    if (selectedSource === "PROJECT") {
      const proj = activeProjects.find(p => p.id === selectedProjectId);
      const projTitle = proj?.title || "প্রজেক্ট";
      typeCode = distributionKind === "PROFIT" ? "PROJECT_PROFIT" : "PROJECT_LOSS";
      typeName = `প্রজেক্ট: ${projTitle}`;
    } else if (selectedSource === "BANK_INTEREST") {
      typeCode = "BANK_INTEREST";
      typeName = "ব্যাংক লাভ/মুনাফা";
    } else if (selectedSource === "BANK_CHARGE") {
      typeCode = "BANK_CHARGE";
      typeName = "ব্যাংক কর্তন/চার্জ";
    } else if (selectedSource === "OTHER_INCOME") {
      typeCode = "OTHER_INCOME";
      typeName = "অন্যান্য আয়";
    } else {
      typeCode = "OTHER_EXPENSE";
      typeName = "অন্যান্য ব্যয়";
    }

    const fullDescription = description 
      ? `${typeName} - ${description}`
      : typeName;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance/profit-distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeCode,
          totalAmount,
          description: fullDescription
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "ডিস্ট্রিবিউশন সম্পন্ন করা যায়নি");
      } else {
        setMessage(data.message || "সফলভাবে একটিভ সদস্যদের মাঝে সমহারে বন্টন করা হয়েছে।");
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
            প্রজেক্ট লাভ/ক্ষতি ও ব্যাংক ম্যানুয়াল সমহার ডিস্ট্রিবিউশন
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }}>
            প্রজেক্ট বা অন্যান্য লাভ/আয় এবং ব্যাংক কর্তন সকল একটিভ সদস্যদের মাঝে সমহারে বন্টন করুন
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
        {/* Source Dropdown Selector */}
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
            আয়/ব্যয়ের খাত বা প্রজেক্ট নির্বাচন করুন
          </label>
          <select
            value={selectedSource}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSource(val);
              if (val === "BANK_CHARGE" || val === "OTHER_EXPENSE") {
                setDistributionKind("LOSS");
              } else {
                setDistributionKind("PROFIT");
              }
            }}
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
            <option value="PROJECT">📁 চলমান ক্লাবের প্রজেক্টসমূহ (Projects List)</option>
            <option value="BANK_INTEREST">🏦 ব্যাংক লাভ / মুনাফা (Bank Interest)</option>
            <option value="BANK_CHARGE">💳 ব্যাংক কর্তন / সার্ভিস চার্জ (Bank Charge)</option>
            <option value="OTHER_INCOME">💰 অন্যান্য বিশেষ আয় (অন্যান্য প্রফিট)</option>
            <option value="OTHER_EXPENSE">🧾 অন্যান্য ক্লাব ব্যয় (অন্যান্য কর্তন)</option>
          </select>
        </div>

        {/* Dynamic Active Projects Select list if PROJECT selected */}
        {selectedSource === "PROJECT" && (
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
              প্রজেক্ট সিলেক্ট করুন (Active Projects)
            </label>
            {activeProjects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
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
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status === "ACTIVE" ? "চলমান" : "প্রস্তাবিত"})
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "#dc2626", margin: 0, fontStyle: "italic" }}>
                কোনো চলমান প্রজেক্ট পাওয়া যায়নি।
              </p>
            )}
          </div>
        )}

        {/* Profit vs Loss Toggle */}
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
            বন্টনের প্রকৃতি (লাভ নাকি কর্তন)
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <label style={{
              flex: 1,
              padding: "0.55rem 0.75rem",
              borderRadius: "0.6rem",
              border: distributionKind === "PROFIT" ? "2px solid #10b981" : "1px solid #cbd5e1",
              backgroundColor: distributionKind === "PROFIT" ? "#f0fdf4" : "#f8fafc",
              color: distributionKind === "PROFIT" ? "#15803d" : "#475569",
              fontWeight: 800,
              fontSize: "0.825rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem"
            }}>
              <input
                type="radio"
                name="kind"
                value="PROFIT"
                checked={distributionKind === "PROFIT"}
                onChange={() => setDistributionKind("PROFIT")}
                style={{ display: "none" }}
              />
              📈 সদস্য একাউন্টে জমা (প্রফিট)
            </label>

            <label style={{
              flex: 1,
              padding: "0.55rem 0.75rem",
              borderRadius: "0.6rem",
              border: distributionKind === "LOSS" ? "2px solid #ef4444" : "1px solid #cbd5e1",
              backgroundColor: distributionKind === "LOSS" ? "#fef2f2" : "#f8fafc",
              color: distributionKind === "LOSS" ? "#b91c1c" : "#475569",
              fontWeight: 800,
              fontSize: "0.825rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem"
            }}>
              <input
                type="radio"
                name="kind"
                value="LOSS"
                checked={distributionKind === "LOSS"}
                onChange={() => setDistributionKind("LOSS")}
                style={{ display: "none" }}
              />
              📉 সদস্য একাউন্ট থেকে কর্তন (চার্জ/ক্ষতি)
            </label>
          </div>
        </div>

        {/* Total Amount Input */}
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
              fontSize: "1rem",
              fontWeight: 800,
              outline: "none"
            }}
          />
        </div>

        {/* Text Write Input for Custom Note / Sector Name (লিখার অপশন) */}
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
            খাত বা বিবরণ লিখুন (নোট / লিখার অপশন)
          </label>
          <input
            type="text"
            placeholder="যেমন: মে ২০২৬ মৎস্য প্রজেক্ট লাভ্যাংশ অথবা বাৎসরিক সার্ভিস চার্জ"
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
            marginTop: "0.5rem",
            backgroundColor: distributionKind === "PROFIT" ? "var(--primary)" : "#dc2626",
            borderColor: distributionKind === "PROFIT" ? "var(--primary)" : "#dc2626"
          }}
        >
          <TrendingUp size={18} /> {loading ? "বন্টন করা হচ্ছে..." : "একটিভ সদস্যদের মাঝে সমহারে পোস্ট করুন"}
        </button>
      </form>
    </div>
  );
}
