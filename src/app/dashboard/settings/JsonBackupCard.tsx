"use client";

import { useState } from "react";
import { Download, Database, FileJson, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function JsonBackupCard() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/backup");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "ব্যাকআপ ডাউনলোডে সমস্যা হয়েছে।");
      }

      // Extract filename from header if available
      const disposition = res.headers.get("Content-Disposition");
      let filename = `uvclub-backup-${new Date().toISOString().split("T")[0]}.json`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMsg(`✅ সফলভাবে '${filename}' ডাউনলোড সম্পন্ন হয়েছে! এটি আপনার অফলাইন ব্যাকআপ হিসেবে সংরক্ষণ করুন।`);
    } catch (err: any) {
      console.error("Backup download error:", err);
      setErrorMsg(err?.message || "ব্যাকআপ তৈরি করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass"
      style={{
        padding: "2rem",
        borderRadius: "1rem",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "rgba(5, 150, 105, 0.12)",
            color: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <FileJson size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.35rem 0", color: "var(--foreground)" }}>
            ডেটাবেস সম্পূর্ণ ব্যাকআপ (JSON Export)
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
            এক ক্লিকে ক্লাবের সকল সদস্যের প্রোফাইল, মাসিক চাঁদার ইনভয়েস, জমা-খরচের সকল লেনদেন, প্রজেক্ট, নোটিশ এবং সিস্টেম সেটিংস সম্পূর্ণ স্ট্যান্ডার্ড JSON ফরম্যাটে অফলাইনে আপনার মোবাইল বা কম্পিউটারে ডাউনলোড করে সুরক্ষিত রাখুন।
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          fontSize: "0.85rem",
          color: "#475569"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} color="#059669" /> সকল সক্রিয় ও সাবেক সদস্য তথ্য
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} color="#059669" /> চাঁদা পরিশোধ ও বকেয়া ইনভয়েস
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} color="#059669" /> আয়-ব্যয় ও অফিস খরচের লেনদেন
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} color="#059669" /> প্রজেক্ট, ভোটিং ও নোটিশ হিস্টোরি
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: "0.85rem 1rem",
            backgroundColor: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "0.5rem",
            color: "#166534",
            fontSize: "0.875rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "0.85rem 1rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecdd3",
            borderRadius: "0.5rem",
            color: "#991b1b",
            fontSize: "0.875rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        className="btn btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.75rem 1.5rem",
          fontSize: "0.95rem",
          fontWeight: 700,
          borderRadius: "0.65rem",
          backgroundColor: "#059669",
          borderColor: "#059669",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={18} className="animate-spin" /> ব্যাকআপ ফাইল প্রস্তুত হচ্ছে...
          </>
        ) : (
          <>
            <Download size={18} /> সম্পূর্ণ ডেটাবেস JSON ব্যাকআপ ডাউনলোড করুন
          </>
        )}
      </button>
    </div>
  );
}
