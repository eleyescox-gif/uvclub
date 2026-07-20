"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  LogOut, 
  HeartPulse, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  DollarSign
} from "lucide-react";

interface ApplicationsViewProps {
  user: { id: string; name: string; nameBn?: string | null; mobile: string; role: string };
  existingExitRequest?: any;
}

export default function ApplicationsView({ user, existingExitRequest }: ApplicationsViewProps) {
  const [activeType, setActiveType] = useState<"report" | "exit" | "emergency">("report");

  // Report Request States
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const jan1stStr = `${today.getFullYear()}-01-01`;

  const [dateFrom, setDateFrom] = useState(jan1stStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [reportType, setReportType] = useState("single-member-ledger");
  const [reportNote, setReportNote] = useState("");

  // Exit Request States
  const [exitReason, setExitReason] = useState("");

  // Emergency Assistance States
  const [emergencyAmount, setEmergencyAmount] = useState("");
  const [emergencyReason, setEmergencyReason] = useState("");
  const [medicalDetails, setMedicalDetails] = useState("");

  // General Status States
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [myReportRequests, setMyReportRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/report-requests");
      const data = await res.json();
      if (data.requests) setMyReportRequests(data.requests);
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

  // Submit Report Application
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    setSubmitting(true);
    try {
      const res = await fetch("/api/report-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          dateFrom,
          dateTo,
          note: reportNote
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "আবেদন জমা দিতে সমস্যা হয়েছে");
      } else {
        setSuccessMsg("আপনার রিপোর্ট আবেদনটি সাধারণ সম্পাদকের নিকট সফলভাবে জমা হয়েছে!");
        setReportNote("");
        fetchRequests();
      }
    } catch (e) {
      setErrorMsg("নেটওয়ার্ক ত্রুটি, পুনরায় চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Exit Application
  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!exitReason) {
      setErrorMsg("দয়া করে সদস্যপদ বাতিলের কারণটি উল্লেখ করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const { requestExit } = await import("@/actions/members");
      await requestExit(exitReason);
      setSuccessMsg("আপনার পদত্যাগ আবেদনটি সফলভাবে সাধারণ সম্পাদক ও সভাপতির নিকট প্রেরণ করা হয়েছে। সদস্যদের ৭৫% ভোটের সমর্থনের পর এটি অনুমোদন পাবেন।");
      setExitReason("");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      setErrorMsg(e.message || "আবেদন জমা দিতে ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Emergency Aid Application
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!emergencyAmount || parseFloat(emergencyAmount) <= 0) {
      setErrorMsg("দয়া করে প্রয়োজনীয় টাকার পরিমাণ দিন।");
      return;
    }

    if (!emergencyReason) {
      setErrorMsg("দয়া করে সহায়তার কারণ উল্লেখ করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: emergencyAmount,
          reason: emergencyReason,
          medicalDetails
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "আবেদনটি সম্পন্ন করা যায়নি");
      } else {
        setSuccessMsg(data.message || "আপনার জরুরি সহায়তার আবেদনটি পরিচালনা পর্ষদের নিকট জমা হয়েছে।");
        setEmergencyAmount("");
        setEmergencyReason("");
        setMedicalDetails("");
      }
    } catch (e) {
      setErrorMsg("নেটওয়ার্ক ত্রুটি ঘটেছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", padding: "1.25rem 0.5rem 3rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Header */}
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--foreground)", margin: 0 }}>
          সদস্য আবেদন ও সহায়তার প্যানেল
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
          অফিশিয়াল রিপোর্ট, সদস্যপদ বাতিল এবং জরুরি চিকিৎসা সহায়তার জন্য ফরম পূরণ করুন
        </p>
      </header>

      {/* Category Tabs */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "1.25rem",
        padding: "0.35rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        gap: "0.25rem",
        overflowX: "auto"
      }}>
        <button
          onClick={() => { setActiveType("report"); setSuccessMsg(""); setErrorMsg(""); }}
          style={{
            flex: "1 1 auto",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 800,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeType === "report" ? "#7c3aed" : "transparent",
            color: activeType === "report" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            whiteSpace: "nowrap"
          }}
        >
          <FileText size={18} /> অফিশিয়াল রিপোর্ট আবেদন
        </button>

        <button
          onClick={() => { setActiveType("exit"); setSuccessMsg(""); setErrorMsg(""); }}
          style={{
            flex: "1 1 auto",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 800,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeType === "exit" ? "#dc2626" : "transparent",
            color: activeType === "exit" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            whiteSpace: "nowrap"
          }}
        >
          <LogOut size={18} /> সদস্যপদ বাতিল আবেদন
        </button>

        <button
          onClick={() => { setActiveType("emergency"); setSuccessMsg(""); setErrorMsg(""); }}
          style={{
            flex: "1 1 auto",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 800,
            borderRadius: "0.85rem",
            border: "none",
            backgroundColor: activeType === "emergency" ? "#059669" : "transparent",
            color: activeType === "emergency" ? "#ffffff" : "#4b5563",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            whiteSpace: "nowrap"
          }}
        >
          <HeartPulse size={18} /> অসুস্থতা ও জরুরি সহায়তা
        </button>
      </div>

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

      {/* ==================== TYPE 1: REPORT APPLICATION ==================== */}
      {activeType === "report" && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "1.75rem 1.5rem",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "1rem",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <FileText size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                অফিশিয়াল হিসাব ও লেনদেন রিপোর্ট আবেদন
              </h3>
              <p style={{ fontSize: "0.825rem", color: "#6b7280", margin: "2px 0 0" }}>
                সাধারণ সম্পাদক এই আবেদন পরীক্ষা করে অনুমোদিত অফিশিয়াল লেজার বা চাঁদা স্টেটমেন্ট প্রদান করবেন
              </p>
            </div>
          </div>

          <form onSubmit={handleReportSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                রিপোর্টের ধরণ
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
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
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                  শেষ তারিখ
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                বিশেষ নোট বা মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: ব্যাংক ভেরিফিকেশনের জন্য প্রয়োজন"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: "#7c3aed",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.85rem",
                padding: "0.85rem 1.25rem",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem"
              }}
            >
              <Send size={18} /> {submitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
            </button>
          </form>
        </div>
      )}

      {/* ==================== TYPE 2: EXIT MEMBERSHIP APPLICATION ==================== */}
      {activeType === "exit" && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "1.75rem 1.5rem",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "1rem",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <LogOut size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                সদস্যপদ বাতিল ও পদত্যাগ আবেদন
              </h3>
              <p style={{ fontSize: "0.825rem", color: "#6b7280", margin: "2px 0 0" }}>
                আপনার আবেদনের পর সাধারণ সদস্যদের ভোটিং ও ৭৫% সমর্থনের ভিত্তিতে সভাপতি অনুমোদন দেবেন
              </p>
            </div>
          </div>

          {existingExitRequest ? (
            <div style={{ backgroundColor: "#fef3c7", padding: "1rem 1.25rem", borderRadius: "0.85rem", border: "1px solid #fde68a", color: "#b45309", fontSize: "0.9rem", fontWeight: 700 }}>
              ⚠️ আপনার একটি পদত্যাগ আবেদন প্যানেলে প্রক্রিয়াধীন রয়েছে (স্ট্যাটাস: {existingExitRequest.status})।
            </div>
          ) : (
            <form onSubmit={handleExitSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ backgroundColor: "#fffbeb", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: "1px solid #fde68a", fontSize: "0.8rem", color: "#b45309" }}>
                ℹ️ <strong>গুরুত্বপূর্ণ তথ্য:</strong> ৫ বছরের কম সময়ে পদত্যাগ করলে সভাপতি কর্তৃক নির্ধারিত কর্তনকৃত অর্থ অবশিষ্ট সকল সক্রিয় সদস্যদের অ্যাকাউন্টে সমহারে ডিস্ট্রিবিউট করা হবে।
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                  পদত্যাগের সুনির্দিষ্ট কারণ
                </label>
                <textarea
                  rows={4}
                  placeholder="যেমন: ব্যক্তিগত কারণ বা প্রবাসে স্থায়ীভাবে গমনের জন্য..."
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                    outline: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.85rem",
                  padding: "0.85rem 1.25rem",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                <LogOut size={18} /> {submitting ? "জমা হচ্ছে..." : "পদত্যাগ আবেদন জমা দিন"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ==================== TYPE 3: EMERGENCY MEDICAL / FINANCIAL AID ==================== */}
      {activeType === "emergency" && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "1.75rem 1.5rem",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "1rem",
              backgroundColor: "rgba(5, 150, 105, 0.1)",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <HeartPulse size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                অসুস্থতা ও জরুরি অর্থ সহায়তার আবেদন
              </h3>
              <p style={{ fontSize: "0.825rem", color: "#6b7280", margin: "2px 0 0" }}>
                জরুরি চিকিৎসা বা বিপদকালীন সহায়তার জন্য ক্লাবের পরিচালনা পর্ষদের নিকট অর্থ আবেদন ফরম
              </p>
            </div>
          </div>

          <form onSubmit={handleEmergencySubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                প্রয়োজনীয় সহায়তার পরিমাণ (৳)
              </label>
              <input
                type="number"
                placeholder="যেমন: 25000"
                value={emergencyAmount}
                onChange={(e) => setEmergencyAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "1rem",
                  fontWeight: 800,
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                জরুরি সহায়তার মূল কারণ (সংক্ষেপে)
              </label>
              <input
                type="text"
                placeholder="যেমন: দুর্ঘটনা জনিত জরুরি সার্জারি / হঠাৎ শারীরিক অসুস্থতা"
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "0.35rem", display: "block" }}>
                হাসপাতাল বা চিকিৎসার বিস্তারিত তথ্য (ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                placeholder="হাসপাতালের নাম, বেড নম্বর বা ডাক্তারের নাম..."
                value={medicalDetails}
                onChange={(e) => setMedicalDetails(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: "#059669",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.85rem",
                padding: "0.85rem 1.25rem",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <Send size={18} /> {submitting ? "জমা হচ্ছে..." : "জরুরি আবেদন জমা দিন"}
            </button>
          </form>
        </div>
      )}

      {/* Status tracking section */}
      <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "1.25rem", border: "1px solid var(--border)" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 1rem 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} color="var(--primary)" /> আপনার সাবমিট করা রিপোর্ট আবেদনের স্ট্যাটাস
        </h4>

        {myReportRequests.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, textAlign: "center", padding: "1rem 0" }}>
            এখনো কোনো রিপোর্ট আবেদন করা হয়নি।
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {myReportRequests.map((req) => {
              const statusBg = req.status === "APPROVED" ? "#dcfce7" : req.status === "REJECTED" ? "#fee2e2" : "#fef3c7";
              const statusText = req.status === "APPROVED" ? "#15803d" : req.status === "REJECTED" ? "#b91c1c" : "#d97706";
              const statusLabel = req.status === "APPROVED" ? "অনুমোদিত" : req.status === "REJECTED" ? "বাতিল" : "পেন্ডিং (সাধারণ সম্পাদক)";

              return (
                <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.85rem", borderRadius: "0.75rem", border: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", display: "block" }}>
                      {req.reportType === "single-member-ledger" ? "একক সদস্যের লেজার" : "চাঁদা রিপোর্ট"}
                    </span>
                    <span style={{ fontSize: "0.725rem", color: "#6b7280" }}>
                      মেয়াদ: {formatDateBn(req.dateFrom)} - {formatDateBn(req.dateTo)}
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
