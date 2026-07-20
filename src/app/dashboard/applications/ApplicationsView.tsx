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
  Building,
  HeartPulse,
  LogOut,
  HelpCircle
} from "lucide-react";

interface ApplicationsViewProps {
  user: { id: string; name: string; nameBn?: string | null; mobile: string; role: string };
  existingExitRequest?: any;
}

export default function ApplicationsView({ user, existingExitRequest }: ApplicationsViewProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const jan1stStr = `${today.getFullYear()}-01-01`;

  // Application Subject State
  const [subjectCategory, setSubjectCategory] = useState<"REPORT" | "EXIT" | "EMERGENCY" | "OTHER">("REPORT");

  // Category-specific inputs
  const [reportType, setReportType] = useState("single-member-ledger");
  const [dateFrom, setDateFrom] = useState(jan1stStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [exitReason, setExitReason] = useState("");

  const [emergencyAmount, setEmergencyAmount] = useState("");
  const [emergencyReason, setEmergencyReason] = useState("");

  // Letter Body Description
  const [letterBody, setLetterBody] = useState("");

  // General Status States
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

  // Pre-fill default letter template based on selected subject
  useEffect(() => {
    const nameStr = user.nameBn || user.name;
    if (subjectCategory === "REPORT") {
      setLetterBody(`যথাযথ সম্মান প্রদর্শন পূর্বক নিবেদন এই যে, আমি ${nameStr}, ইউনাইটেড ভিশন ক্লাবের একজন নিয়মিত সদস্য। আমার একাউন্টের তথ্য যাচাইয়ের জন্য অফিশিয়াল লেনদেন বিবরণী ও লেজার রিপোর্ট প্রয়োজন। অনুগ্রহপূর্বক নির্ধারিত মেয়াদের রিপোর্টটি অনুমোদনের বিনম্র অনুরোধ জানাচ্ছি।`);
    } else if (subjectCategory === "EXIT") {
      setLetterBody(`সবিনয় নিবেদন এই যে, আমি ${nameStr}, সদস্য মোবাইল নম্বর: ${user.mobile}। ব্যক্তিগত ও অপরিহার্য কারণবশত ক্লাবের সদস্যপদ অব্যাহত রাখা সম্ভব হচ্ছে না। অতএব, ক্লাবের নিয়মাবলী সাপেক্ষে আমার পদত্যাগ আবেদনটি গ্রহণের আকুল আবেদন জানাচ্ছি।`);
    } else if (subjectCategory === "EMERGENCY") {
      setLetterBody(`বিনীত নিবেদন এই যে, আমি ${nameStr}, জরুরি শারীরিক অসুস্থতা ও চিকিৎসার ব্যায় নির্বাহের জন্য ক্লাবের তহবিল থেকে আর্থিক সহায়তার আবেদন জানাচ্ছি। পরিচালনা পর্ষদের বিশেষ বিবেচনার জন্য বিনীত প্রার্থনা।`);
    } else {
      setLetterBody(`যথাযথ সম্মানপূর্বক নিবেদন এই যে, ক্লাবের পরিচালনা পর্ষদের নিকট আমার বিশেষ আবেদন পেশ করছি...`);
    }
  }, [subjectCategory, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!letterBody.trim()) {
      setErrorMsg("দয়া করে আবেদনের পূর্ণাঙ্গ বিবরণটি লিখুন।");
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
          setSuccessMsg("আপনার অফিশিয়াল রিপোর্ট আবেদনপত্রটি সফলভাবে জমা হয়েছে!");
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
        setSuccessMsg("আপনার পদত্যাগ আবেদনপত্রটি সফলভাবে জমা হয়েছে। ভোটিং ও ৭৫% সদস্য অনুমোদনের পর সভাপতি চূড়ান্ত সিদ্ধান্ত দেবেন।");
      } else if (subjectCategory === "EMERGENCY") {
        if (!emergencyAmount || parseFloat(emergencyAmount) <= 0) {
          setErrorMsg("দয়া করে প্রয়োজনীয় সহায়তার পরিমাণ (৳) উল্লেখ করুন।");
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
          setSuccessMsg(data.message || "আপনার জরুরি সহায়তার আবেদনটি সফলভাবে পেশ করা হয়েছে।");
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
    <div style={{ maxWidth: "850px", margin: "0 auto", padding: "1.25rem 0.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Header Area */}
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--foreground)", margin: 0, letterSpacing: "-0.02em" }}>
          অফিশিয়াল আবেদনপত্র প্যানেল
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
          বিষয় নির্বাচন করে প্রফেশনাল আবেদনপত্র তৈরি ও পরিচালনা পর্ষদে প্রেরণ করুন
        </p>
      </header>

      {/* Global Alerts */}
      {successMsg && (
        <div style={{ padding: "1rem 1.25rem", borderRadius: "0.85rem", backgroundColor: "#dcfce7", border: "1px solid #86efac", color: "#15803d", fontSize: "0.9rem", fontWeight: 700 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: "1rem 1.25rem", borderRadius: "0.85rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "0.9rem", fontWeight: 700 }}>
          ✕ {errorMsg}
        </div>
      )}

      {/* Official Formal Letter Card */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "1.5rem",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
        overflow: "hidden"
      }}>
        {/* Letter Head Top Ribbon */}
        <div style={{
          background: "linear-gradient(135deg, #0F673D 0%, #064e2b 100%)",
          color: "white",
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.85, fontWeight: 700 }}>
              ইউনাইটেড ভিশন ক্লাব • মেম্বার পোর্টাল
            </span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, margin: "0.2rem 0 0" }}>
              অফিশিয়াল আবেদনপত্র (Formal Application)
            </h2>
          </div>
          <div style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", padding: "0.5rem 0.85rem", borderRadius: "0.75rem", fontSize: "0.8rem", fontWeight: 700 }}>
            তারিখ: {formatDateBn(today)}
          </div>
        </div>

        {/* Letter Form Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Recipient & Applicant Header Info */}
          <div style={{ backgroundColor: "#f8fafc", padding: "1.15rem", borderRadius: "1rem", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block" }}>
                প্রাপক (To)
              </span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b", display: "block", marginTop: "2px" }}>
                সম্মানিত সভাপতি / সাধারণ সম্পাদক
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#475569" }}>ইউনাইটেড ভিশন ক্লাব</span>
            </div>

            <div style={{ borderLeft: "1px solid #cbd5e1", paddingLeft: "1rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block" }}>
                আবেদনকারী (Applicant)
              </span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b", display: "block", marginTop: "2px" }}>
                {user.nameBn || user.name}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#475569" }}>মোবাইল: {user.mobile}</span>
            </div>
          </div>

          {/* Subject Dropdown Picker */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileCheck size={18} color="var(--primary)" /> আবেদনের বিষয় নির্বাচন করুন (Select Application Subject)
            </label>
            <select
              value={subjectCategory}
              onChange={(e) => setSubjectCategory(e.target.value as any)}
              style={{
                width: "100%",
                padding: "0.75rem 0.95rem",
                borderRadius: "0.85rem",
                border: "2px solid #cbd5e1",
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "var(--foreground)",
                outline: "none",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
              }}
            >
              <option value="REPORT">📊 অফিশিয়াল লেজার ও লেনদেন রিপোর্ট আবেদন</option>
              <option value="EXIT">🚪 সদস্যপদ বাতিল ও পদত্যাগ আবেদন</option>
              <option value="EMERGENCY">🚑 অসুস্থতা ও জরুরি অর্থ সহায়তার আবেদন</option>
              <option value="OTHER">📝 অন্যান্য বিশেষ স্মারকলিপি বা আবেদন</option>
            </select>
          </div>

          {/* Conditional Subject Context Inputs */}
          {subjectCategory === "REPORT" && (
            <div style={{ backgroundColor: "#f0fdf4", padding: "1.15rem", borderRadius: "1rem", border: "1px solid #bbf7d0", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", marginBottom: "0.35rem", display: "block" }}>
                  রিপোর্টের ধরণ
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.65rem",
                    border: "1px solid #86efac",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    outline: "none"
                  }}
                >
                  <option value="single-member-ledger">একক সদস্যের লেনদেন বিবরণী (লেজার)</option>
                  <option value="paid-subscriptions">চাঁদা জমা ও পরিশোধিত স্টেটমেন্ট</option>
                  <option value="due-subscriptions">বকেয়া চাঁদার তালিকা</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", marginBottom: "0.35rem", display: "block" }}>
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #86efac",
                      fontSize: "0.875rem",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", marginBottom: "0.35rem", display: "block" }}>
                    শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #86efac",
                      fontSize: "0.875rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {subjectCategory === "EXIT" && (
            <div style={{ backgroundColor: "#fffbeb", padding: "1.15rem", borderRadius: "1rem", border: "1px solid #fde68a", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: 700 }}>
                ℹ️ ৫ বছরের কম সময়ের মধ্যে পদত্যাগ করলে সভাপতি কর্তৃক নির্ধারিত কর্তনকৃত অর্থ অবশিষ্ট সকল সক্রিয় সদস্যদের সমহারে বন্টন করা হবে।
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#78350f", marginBottom: "0.35rem", display: "block" }}>
                  পদত্যাগের মূল কারণ (সংক্ষেপে)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: প্রবাসে স্থায়ীভাবে স্থানান্তর বা ব্যক্তিগত কারণ"
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.65rem",
                    border: "1px solid #fcd34d",
                    fontSize: "0.875rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          )}

          {subjectCategory === "EMERGENCY" && (
            <div style={{ backgroundColor: "#ecfdf5", padding: "1.15rem", borderRadius: "1rem", border: "1px solid #a7f3d0", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#065f46", marginBottom: "0.35rem", display: "block" }}>
                    প্রয়োজনীয় অর্থ (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="যেমন: 25000"
                    value={emergencyAmount}
                    onChange={(e) => setEmergencyAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #6ee7b7",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#065f46", marginBottom: "0.35rem", display: "block" }}>
                    অসুস্থতা/জরুরি কারণ
                  </label>
                  <input
                    type="text"
                    placeholder="জরুরি সার্জারি / দুর্ঘটনা"
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "0.65rem",
                      border: "1px solid #6ee7b7",
                      fontSize: "0.875rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Letter Body Description Textarea */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.4rem", display: "block" }}>
              আবেদনপত্রের পূর্ণাঙ্গ বিবরণ (চিঠি লিখুন)
            </label>
            <textarea
              rows={6}
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "0.85rem",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                color: "#1e293b",
                fontFamily: "inherit",
                outline: "none",
                backgroundColor: "#fafafa"
              }}
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.85rem",
              padding: "0.9rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 15px rgba(15, 103, 61, 0.35)",
              opacity: submitting ? 0.7 : 1,
              marginTop: "0.5rem"
            }}
          >
            <Send size={18} /> {submitting ? "পেশ করা হচ্ছে..." : "আবেদনপত্র পেশ করুন"}
          </button>
        </form>
      </div>

      {/* Submitted Requests History List */}
      <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.25rem", border: "1px solid var(--border)" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 1rem 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} color="var(--primary)" /> আপনার সাবমিট করা আবেদনপত্রের রেজিস্টার ও স্ট্যাটাস
        </h4>

        {myRequests.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, textAlign: "center", padding: "1rem 0" }}>
            এখনো কোনো আবেদন পেশ করা হয়নি।
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {myRequests.map((req) => {
              const statusBg = req.status === "APPROVED" ? "#dcfce7" : req.status === "REJECTED" ? "#fee2e2" : "#fef3c7";
              const statusText = req.status === "APPROVED" ? "#15803d" : req.status === "REJECTED" ? "#b91c1c" : "#d97706";
              const statusLabel = req.status === "APPROVED" ? "অনুমোদিত" : req.status === "REJECTED" ? "বাতিল" : "পেন্ডিং (সাধারণ সম্পাদক)";

              return (
                <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.85rem", borderRadius: "0.75rem", border: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", display: "block" }}>
                      {req.reportType === "single-member-ledger" ? "একক সদস্যের লেজার রিপোর্ট" : "চাঁদা রিপোর্ট"}
                    </span>
                    <span style={{ fontSize: "0.725rem", color: "#6b7280" }}>
                      তারিখ: {formatDateBn(req.createdAt)} • মেয়াদ: {formatDateBn(req.dateFrom)} - {formatDateBn(req.dateTo)}
                    </span>
                  </div>
                  <span style={{ padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, backgroundColor: statusBg, color: statusText }}>
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
