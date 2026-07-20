"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Calendar, 
  FileCheck,
  HeartPulse,
  LogOut,
  Sparkles
} from "lucide-react";

interface ApplicationsViewProps {
  user: { id: string; name: string; nameBn?: string | null; mobile: string; role: string };
  existingExitRequest?: any;
}

export default function ApplicationsView({ user, existingExitRequest }: ApplicationsViewProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const jan1stStr = `${today.getFullYear()}-01-01`;

  // Subject Dropdown selection
  const [subjectCategory, setSubjectCategory] = useState<"REPORT" | "EXIT" | "EMERGENCY" | "OTHER">("REPORT");

  // Sub-inputs
  const [reportType, setReportType] = useState("single-member-ledger");
  const [dateFrom, setDateFrom] = useState(jan1stStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [exitReason, setExitReason] = useState("");
  const [emergencyAmount, setEmergencyAmount] = useState("");
  const [emergencyReason, setEmergencyReason] = useState("");

  // Letter Body / Description
  const [letterBody, setLetterBody] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [myRequests, setMyRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/report-requests");
      const data = await res.json();
      if (data.requests) setMyRequests(data.requests);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDateBn = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  };

  // Pre-fill clean template based on subject selection
  useEffect(() => {
    const nameStr = user.nameBn || user.name;
    if (subjectCategory === "REPORT") {
      setLetterBody(`আমি ${nameStr}, আমার একাউন্টের তথ্য যাচাইয়ের জন্য অফিশিয়াল লেনদেন বিবরণী ও লেজার রিপোর্ট প্রয়োজন। নির্ধারিত মেয়াদের রিপোর্টটি অনুমোদনের বিনীত অনুরোধ জানাচ্ছি।`);
    } else if (subjectCategory === "EXIT") {
      setLetterBody(`আমি ${nameStr}, মোবাইল: ${user.mobile}। ব্যক্তিগত কারণবশত ক্লাবের সদস্যপদ থেকে পদত্যাগের আবেদন জানাচ্ছি।`);
    } else if (subjectCategory === "EMERGENCY") {
      setLetterBody(`আমি ${nameStr}, জরুরি চিকিৎসা ও শারীরিক অসুস্থতার কারণে ক্লাবের তহবিল থেকে আর্থিক সহায়তার আবেদন জানাচ্ছি।`);
    } else {
      setLetterBody(`আমি ${nameStr}, পরিচালনা পর্ষদের নিকট বিশেষ আবেদন পেশ করছি...`);
    }
  }, [subjectCategory, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!letterBody.trim()) {
      setErrorMsg("দয়া করে আবেদনের বিবরণ লিখুন।");
      return;
    }

    setSubmitting(true);
    try {
      if (subjectCategory === "REPORT") {
        const res = await fetch("/api/report-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportType,
            dateFrom,
            dateTo,
            note: letterBody
          })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          setErrorMsg(data.error || "আবেদন জমা দিতে সমস্যা হয়েছে");
        } else {
          setSuccessMsg("আপনার রিপোর্ট আবেদনপত্রটি সফলভাবে জমা হয়েছে!");
          fetchRequests();
        }
      } else if (subjectCategory === "EXIT") {
        if (existingExitRequest) {
          setErrorMsg("আপনার একটি পদত্যাগ আবেদন ইতিমধ্যেই প্যানেলে প্রক্রিয়াধীন রয়েছে।");
          setSubmitting(false);
          return;
        }
        const { requestExit } = await import("@/actions/members");
        await requestExit(exitReason || letterBody);
        setSuccessMsg("আপনার পদত্যাগ আবেদনটি সফলভাবে জমা হয়েছে। ভোটিং ও ৭৫% সদস্য অনুমোদনের পর সভাপতি চূড়ান্ত অনুমোদন দেবেন।");
      } else if (subjectCategory === "EMERGENCY") {
        if (!emergencyAmount || parseFloat(emergencyAmount) <= 0) {
          setErrorMsg("দয়া করে প্রয়োজনীয় সহায়তার পরিমাণ (৳) লিখুন।");
          setSubmitting(false);
          return;
        }
        const res = await fetch("/api/applications/emergency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: emergencyAmount,
            reason: emergencyReason || "জরুরি সহায়তা",
            medicalDetails: letterBody
          })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setErrorMsg(data.error || "আবেদন জমা দিতে সমস্যা হয়েছে");
        } else {
          setSuccessMsg(data.message || "আপনার জরুরি সহায়তার আবেদনটি সফলভাবে জমা হয়েছে।");
        }
      } else {
        setSuccessMsg("আপনার আবেদনপত্রটি সফলভাবে পরিচালনা পর্ষদের কাছে জমা হয়েছে।");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "নেটওয়ার্ক ত্রুটি ঘটেছে, পুনরায় চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 0.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Modern Simple Header */}
      <header style={{ marginBottom: "0.25rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--foreground)", margin: 0, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles color="var(--primary)" size={24} /> সদস্য আবেদনপত্র প্যানেল
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          বিষয় নির্বাচন করে আপনার প্রয়োজনীয় অফিশিয়াল আবেদন জমা দিন
        </p>
      </header>

      {/* Global Alerts */}
      {successMsg && (
        <div style={{ padding: "0.85rem 1.15rem", borderRadius: "0.85rem", backgroundColor: "#dcfce7", border: "1px solid #86efac", color: "#15803d", fontSize: "0.875rem", fontWeight: 700 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: "0.85rem 1.15rem", borderRadius: "0.85rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "0.875rem", fontWeight: 700 }}>
          ✕ {errorMsg}
        </div>
      )}

      {/* Modern Clean Application Form Card */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "1.25rem",
        padding: "1.5rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem"
      }}>
        
        {/* Recipient & Applicant Info Pill */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "0.85rem", border: "1px solid #e2e8f0", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.725rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block" }}>প্রাপক</span>
            <strong style={{ fontSize: "0.875rem", color: "#1e293b" }}>সভাপতি / সাধারণ সম্পাদক, ইউনাইটেড ভিশন ক্লাব</strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.725rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block" }}>আবেদনকারী</span>
            <strong style={{ fontSize: "0.875rem", color: "var(--primary)" }}>{user.nameBn || user.name} ({user.mobile})</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          {/* Subject Dropdown Picker */}
          <div>
            <label style={{ fontSize: "0.825rem", fontWeight: 800, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
              আবেদনের বিষয় নির্বাচন করুন
            </label>
            <select
              value={subjectCategory}
              onChange={(e) => setSubjectCategory(e.target.value as any)}
              style={{
                width: "100%",
                padding: "0.75rem 0.85rem",
                borderRadius: "0.75rem",
                border: "1.5px solid #cbd5e1",
                fontSize: "0.9rem",
                fontWeight: 800,
                color: "var(--foreground)",
                outline: "none",
                backgroundColor: "#ffffff"
              }}
            >
              <option value="REPORT">📊 অফিশিয়াল লেজার ও লেনদেন বিবরণী রিপোর্ট আবেদন</option>
              <option value="EXIT">🚪 সদস্যপদ বাতিল ও পদত্যাগ আবেদন</option>
              <option value="EMERGENCY">🚑 অসুস্থতা ও জরুরি অর্থ সহায়তার আবেদন</option>
              <option value="OTHER">📝 অন্যান্য আবেদন বা বিশেষ প্রস্তাবনা</option>
            </select>
          </div>

          {/* Conditional Sub-fields */}
          {subjectCategory === "REPORT" && (
            <div style={{ backgroundColor: "#f0fdf4", padding: "1rem", borderRadius: "0.85rem", border: "1px solid #bbf7d0", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.775rem", fontWeight: 700, color: "#166534", marginBottom: "0.25rem", display: "block" }}>
                  রিপোর্টের ধরণ
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #86efac",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    outline: "none"
                  }}
                >
                  <option value="single-member-ledger">একক সদস্যের লেনদেন বিবরণী (লেজার)</option>
                  <option value="paid-subscriptions">চাঁদা জমা ও পরিশোধিত স্টেটমেন্ট</option>
                  <option value="due-subscriptions">বকেয়া চাঁদার তালিকা</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.775rem", fontWeight: 700, color: "#166534", marginBottom: "0.25rem", display: "block" }}>
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #86efac", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.775rem", fontWeight: 700, color: "#166534", marginBottom: "0.25rem", display: "block" }}>
                    শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #86efac", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>
              </div>
            </div>
          )}

          {subjectCategory === "EXIT" && (
            <div style={{ backgroundColor: "#fffbeb", padding: "0.85rem", borderRadius: "0.85rem", border: "1px solid #fde68a", fontSize: "0.775rem", color: "#b45309" }}>
              ℹ️ ৫ বছরের কম সময়ের মধ্যে পদত্যাগ করলে সভাপতি কর্তৃক নির্ধারিত কর্তনকৃত অর্থ অবশিষ্ট সক্রিয় সদস্যদের সমহারে বন্টন করা হবে।
            </div>
          )}

          {subjectCategory === "EMERGENCY" && (
            <div style={{ backgroundColor: "#ecfdf5", padding: "1rem", borderRadius: "0.85rem", border: "1px solid #a7f3d0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.775rem", fontWeight: 700, color: "#065f46", marginBottom: "0.25rem", display: "block" }}>
                  প্রয়োজনীয় অর্থ (৳)
                </label>
                <input
                  type="number"
                  placeholder="যেমন: 25000"
                  value={emergencyAmount}
                  onChange={(e) => setEmergencyAmount(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #6ee7b7", fontSize: "0.9rem", fontWeight: 800, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.775rem", fontWeight: 700, color: "#065f46", marginBottom: "0.25rem", display: "block" }}>
                  জরুরি কারণ
                </label>
                <input
                  type="text"
                  placeholder="সার্জারি / দুর্ঘটনা"
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #6ee7b7", fontSize: "0.85rem", outline: "none" }}
                />
              </div>
            </div>
          )}

          {/* Letter Description / Body Textarea */}
          <div>
            <label style={{ fontSize: "0.825rem", fontWeight: 800, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
              আবেদনের বিবরণ (চিঠি / বক্তব্য লিখুন)
            </label>
            <textarea
              rows={5}
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              placeholder="এখানে আপনার আবেদনের বিস্তারিত লিখুন..."
              style={{
                width: "100%",
                padding: "0.75rem 0.85rem",
                borderRadius: "0.75rem",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                lineHeight: "1.6",
                color: "#1e293b",
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: "#fafafa"
              }}
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.85rem 1.25rem",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(15, 103, 61, 0.3)",
              opacity: submitting ? 0.7 : 1
            }}
          >
            <Send size={16} /> {submitting ? "জমা হচ্ছে..." : "আবেদন সাবমিট করুন"}
          </button>
        </form>
      </div>

      {/* Submitted Status List */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "1.25rem", padding: "1.25rem", border: "1px solid var(--border)" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.85rem 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={16} color="var(--primary)" /> জমা দেওয়া আবেদনের স্ট্যাটাস
        </h4>

        {myRequests.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, textAlign: "center", padding: "0.85rem 0" }}>
            এখনো কোনো আবেদন জমা দেওয়া হয়নি।
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {myRequests.map((req) => {
              const statusBg = req.status === "APPROVED" ? "#dcfce7" : req.status === "REJECTED" ? "#fee2e2" : "#fef3c7";
              const statusText = req.status === "APPROVED" ? "#15803d" : req.status === "REJECTED" ? "#b91c1c" : "#d97706";
              const statusLabel = req.status === "APPROVED" ? "অনুমোদিত" : req.status === "REJECTED" ? "বাতিল" : "পেন্ডিং";

              return (
                <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.85rem", borderRadius: "0.65rem", border: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
                  <div>
                    <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--foreground)", display: "block" }}>
                      {req.reportType === "single-member-ledger" ? "একক সদস্যের লেজার রিপোর্ট" : "চাঁদা রিপোর্ট"}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                      তারিখ: {formatDateBn(req.createdAt)}
                    </span>
                  </div>
                  <span style={{ padding: "0.2rem 0.55rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, backgroundColor: statusBg, color: statusText }}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
