"use client";

import { useState } from "react";
import { Send, Users, UserCheck, Phone, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { sendSms } from "@/actions/sms";

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  mobile: string;
}

export default function SmsForm({ members }: { members: Member[] }) {
  const [recipientType, setRecipientType] = useState<"ALL" | "SPECIFIC" | "CUSTOM">("ALL");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [customNumber, setCustomNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  const charCount = message.length;
  const isBangla = /[^\u0000-\u007F]/.test(message);
  // Standard Bangla unicode SMS is 70 chars for 1 SMS, English is 160 chars
  const limitPerSms = isBangla ? 70 : 160;
  const smsParts = Math.ceil(charCount / limitPerSms) || 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("এসএমএস মেসেজ টেক্সট লিখুন।");
      return;
    }

    if (recipientType === "SPECIFIC" && selectedMemberIds.length === 0) {
      alert("অনুগ্রহ করে অন্তত একজন সদস্য নির্বাচন করুন।");
      return;
    }

    if (recipientType === "CUSTOM" && !customNumber.trim()) {
      alert("অনুগ্রহ করে মোবাইল নম্বর লিখুন।");
      return;
    }

    const confirmMsg =
      recipientType === "ALL"
        ? `আপনি কি সকল ${members.length} জন সদস্যকে এই এসএমএসটি পাঠাতে চান?`
        : recipientType === "SPECIFIC"
        ? `আপনি কি নির্বাচিত ${selectedMemberIds.length} জন সদস্যকে এসএমএসটি পাঠাতে চান?`
        : `আপনি কি ${customNumber} নম্বরে এসএমএসটি পাঠাতে চান?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    setResultMsg(null);

    const formData = new FormData();
    formData.append("recipientType", recipientType);
    formData.append("message", message);
    if (recipientType === "CUSTOM") {
      formData.append("customNumber", customNumber);
    } else if (recipientType === "SPECIFIC") {
      selectedMemberIds.forEach((id) => formData.append("memberIds", id));
    }

    try {
      const res = await sendSms(formData);
      if (res.success) {
        setResultMsg({ success: true, text: res.summary || "এসএমএস সফলভাবে পাঠানো হয়েছে।" });
        setMessage("");
        setSelectedMemberIds([]);
      } else {
        setResultMsg({ success: false, text: res.error || "এসএমএস পাঠানো সম্ভব হয়নি।" });
      }
    } catch (err: any) {
      setResultMsg({ success: false, text: err?.message || "সার্ভার এরর হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMemberIds(members.map((m) => m.id));
  };

  const clearSelection = () => {
    setSelectedMemberIds([]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Recipient Selector */}
      <div>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          প্রাপক নির্বাচন করুন (Recipient Type)
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setRecipientType("ALL")}
            style={{
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: recipientType === "ALL" ? "2px solid var(--primary)" : "1px solid #e2e8f0",
              backgroundColor: recipientType === "ALL" ? "var(--primary-light)" : "#ffffff",
              color: recipientType === "ALL" ? "var(--primary)" : "#4b5563",
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <Users size={18} /> সকল সদস্য ({members.length} জন)
          </button>

          <button
            type="button"
            onClick={() => setRecipientType("SPECIFIC")}
            style={{
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: recipientType === "SPECIFIC" ? "2px solid var(--primary)" : "1px solid #e2e8f0",
              backgroundColor: recipientType === "SPECIFIC" ? "var(--primary-light)" : "#ffffff",
              color: recipientType === "SPECIFIC" ? "var(--primary)" : "#4b5563",
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <UserCheck size={18} /> নির্দিষ্ট সদস্য
          </button>

          <button
            type="button"
            onClick={() => setRecipientType("CUSTOM")}
            style={{
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: recipientType === "CUSTOM" ? "2px solid var(--primary)" : "1px solid #e2e8f0",
              backgroundColor: recipientType === "CUSTOM" ? "var(--primary-light)" : "#ffffff",
              color: recipientType === "CUSTOM" ? "var(--primary)" : "#4b5563",
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <Phone size={18} /> কাস্টম নম্বর
          </button>
        </div>
      </div>

      {/* Specific Members List */}
      {recipientType === "SPECIFIC" && (
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            padding: "1rem",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>
              সদস্য সিলেক্ট করুন ({selectedMemberIds.length} জন নির্বাচিত)
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={selectAll}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "0.35rem",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                সবাইকে বাছুন
              </button>
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "0.35rem",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                মুছুন
              </button>
            </div>
          </div>
          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {members.map((m) => {
              const isChecked = selectedMemberIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.5rem",
                    backgroundColor: isChecked ? "var(--primary-light)" : "#ffffff",
                    border: isChecked ? "1px solid var(--primary)" : "1px solid #e2e8f0",
                    cursor: "pointer",
                    fontSize: "0.825rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMember(m.id)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span style={{ fontWeight: 600 }}>{m.nameBn || m.name}</span>
                  <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: "auto" }}>{m.mobile}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Mobile Input */}
      {recipientType === "CUSTOM" && (
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.4rem" }}>
            মোবাইল নম্বর লিখুন
          </label>
          <input
            type="text"
            value={customNumber}
            onChange={(e) => setCustomNumber(e.target.value)}
            placeholder="যেমন: 01812000109 অথবা একাধিক হলে কমা দিয়ে লিখুন"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.65rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Message Body */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <label style={{ fontSize: "0.875rem", fontWeight: 700 }}>বার্তা লিখুন (SMS Message)</label>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
            {charCount} অক্ষর | {smsParts} SMS ({isBangla ? "বাংলা / Unicode" : "English / Text"})
          </span>
        </div>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="এখানে এসএমএস মেসেজটি লিখুন..."
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.65rem",
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
            lineHeight: 1.5,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Status Alerts */}
      {resultMsg && (
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "0.65rem",
            backgroundColor: resultMsg.success ? "#f0fdf4" : "#fef2f2",
            border: resultMsg.success ? "1px solid #86efac" : "1px solid #fecdd3",
            color: resultMsg.success ? "#166534" : "#991b1b",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {resultMsg.success ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertCircle size={18} color="#dc2626" />}
          <span>{resultMsg.text}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{
          padding: "0.85rem",
          fontSize: "0.95rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          borderRadius: "0.75rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={18} className="animate-spin" /> পাঠানো হচ্ছে...
          </>
        ) : (
          <>
            <Send size={18} /> এসএমএস পাঠান
          </>
        )}
      </button>
    </form>
  );
}
