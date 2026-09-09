"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Wallet, CheckCircle2, ArrowRight, Radio, RefreshCw } from "lucide-react";
import { getSmsBalance } from "@/actions/sms";

export default function SmsGatewaySettingsCard({ initialBalance }: { initialBalance?: string }) {
  const [balance, setBalance] = useState(initialBalance || "103.10");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await getSmsBalance();
      if (res.success) {
        setBalance(res.balance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(37, 99, 235, 0.12)",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <MessageSquare size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: "var(--foreground)" }}>
              এসএমএস গেটওয়ে কন্ট্রোল (BulkSMSBD Gateway)
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
              টাকা জমা হলে স্বয়ংক্রিয় রশিদ এসএমএস প্রেরণ এবং বাল্ক নোটিফিকেশন ব্যবস্থাপনা।
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #86efac",
              fontSize: "0.8rem",
              fontWeight: 700
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
            গেটওয়ে সংযুক্ত ও সক্রিয় (Active)
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            padding: "1rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>লাইভ ব্যালেন্স</span>
            <button
              onClick={fetchBalance}
              disabled={loading}
              title="ব্যালেন্স রিফ্রেশ করুন"
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                padding: "2px"
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
            ৳ {balance}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 600 }}>BulkSMSBD.net</span>
        </div>

        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            padding: "1rem"
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>
            অনুমোদিত সেন্ডার আইডি
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>
            8809617613435
          </div>
          <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Approved Sender ID</span>
        </div>

        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            padding: "1rem"
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.35rem" }}>
            জমা রসিদ এসএমএস
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981" }}>
            স্বয়ংক্রিয় (Auto)
          </div>
          <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>টাকা জমা হলেই ইনস্ট্যান্ট এসএমএস</span>
        </div>
      </div>

      {/* Bullet features */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "0.75rem",
          padding: "0.85rem 1.25rem",
          marginBottom: "1.5rem",
          fontSize: "0.85rem",
          color: "#166534",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} color="#16a34a" /> <strong>চাঁদা জমা কনফার্মেশন:</strong> যেকোনো সদস্যের চাঁদা জমা পোস্ট বা পরিশোধ হলে সাথে সাথে রশিদ নং ও ব্যালেন্স সহ এসএমএস যাবে।
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} color="#16a34a" /> <strong>পিন রিকভারি:</strong> সদস্য পাসওয়ার্ড রিসেট করলে ফোনে এসএমএসের মাধ্যমে নতুন পিন পাঠানো হবে।
        </div>
      </div>

      <Link
        href="/dashboard/admin/sms"
        className="btn btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.75rem 1.5rem",
          fontSize: "0.95rem",
          fontWeight: 700,
          borderRadius: "0.65rem",
          backgroundColor: "#2563eb",
          borderColor: "#2563eb",
          textDecoration: "none"
        }}
      >
        <MessageSquare size={18} /> এসএমএস প্যানেলে যান ও কাস্টম/বাল্ক এসএমএস পাঠান <ArrowRight size={16} />
      </Link>
    </div>
  );
}
