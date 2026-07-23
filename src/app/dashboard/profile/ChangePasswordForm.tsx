"use client";

import { useState } from "react";
import { Key, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "সকল ফিল্ড পূরণ করুন।" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড এক নয়!" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "🎉 আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "ত্রুটি: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        padding: "1.75rem",
        marginTop: "2rem",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
        <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "#f0fdf4", color: "#16a34a" }}>
          <Key size={22} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
            পাসওয়ার্ড পরিবর্তন করুন (Change Password)
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.825rem", color: "#64748b" }}>
            আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        {/* Current Password */}
        <div>
          <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, marginBottom: "0.35rem", color: "#334155" }}>
            বর্তমান (পুরাতন) পাসওয়ার্ড *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="আপনার বর্তমানের পাসওয়ার্ডটি দিন"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
              }}
            />
            <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        {/* New Password */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, marginBottom: "0.35rem", color: "#334155" }}>
              নতুন পাসওয়ার্ড (New Password) *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="অন্তত ৬ অক্ষরের পাসওয়ার্ড"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, marginBottom: "0.35rem", color: "#334155" }}>
              নতুন পাসওয়ার্ড নিশ্চিতকরণ (Confirm) *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor: message.type === "success" ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecdd3"}`,
              color: message.type === "success" ? "#047857" : "#dc2626",
              fontSize: "0.825rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#059669",
            color: "#ffffff",
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: loading ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
            alignSelf: "flex-start",
          }}
        >
          {loading ? "পাসওয়ার্ড আপডেট হচ্ছে..." : "✓ নতুন পাসওয়ার্ড সংরক্ষণ করুন"}
        </button>
      </form>
    </div>
  );
}
