"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Users } from "lucide-react";

export default function InterimModeSettingsSwitch({ initialMode }: { initialMode: boolean }) {
  const [isInterim, setIsInterim] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    
    if (!newStatus) {
      const confirmOff = window.confirm(
        "আপনি কি অন্তরবর্তীকালীন মোড বন্ধ করে নিয়মিত কমিটি মোড পুনঃসক্রিয় করতে চান?\n(শর্ত: অবশ্যই একটি নির্বাচিত পরিচালনা কমিটি থাকতে হবে)।"
      );
      if (!confirmOff) return;
    } else {
      const confirmOn = window.confirm(
        "আপনি কি নিশ্চিত যে আপনি 'অন্তরবর্তীকালীন কন্ট্রোলার মোড' অন করতে চান?\nঅন করলে কার্যনির্বাহী কমিটি স্থগিত থাকবে এবং একমাত্র 'কন্ট্রোলার' সকল অ্যাডমিন দায়িত্ব পালন করবেন।"
      );
      if (!confirmOn) return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/toggle-interim-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noCommitteeMode: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setIsInterim(data.noCommitteeMode);
        alert(
          data.noCommitteeMode
            ? "⚡ অন্তরবর্তীকালীন কন্ট্রোলার মোড সফলভাবে সক্রিয় করা হয়েছে।"
            : "👥 নিয়মিত পরিচালনা কমিটি মোড সফলভাবে পুনঃসক্রিয় করা হয়েছে।"
        );
        router.refresh();
      } else {
        alert(data.error || "মোড পরিবর্তন করতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      alert("ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: isInterim ? "#fff7ed" : "#ffffff",
        border: `1.5px solid ${isInterim ? "#fed7aa" : "#e2e8f0"}`,
        borderRadius: "16px",
        padding: "1.5rem",
        marginBottom: "2rem",
        boxShadow: isInterim ? "0 10px 25px -5px rgba(234, 88, 12, 0.08)" : "0 4px 6px -1px rgba(0,0,0,0.02)",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        {/* Left Info */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1, minWidth: "260px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: isInterim ? "#ffedd5" : "#ecfdf5",
              color: isInterim ? "#c2410c" : "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${isInterim ? "#fed7aa" : "#a7f3d0"}`
            }}
          >
            {isInterim ? <Sparkles size={24} /> : <Users size={24} />}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                অন্তরবর্তীকালীন কন্ট্রোলার মোড (Interim Controller Mode)
              </h3>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  backgroundColor: isInterim ? "#ea580c" : "#059669",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {isInterim ? "মোড: সক্রিয় (ON)" : "মোড: নিষ্ক্রিয় (OFF)"}
              </span>
            </div>

            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#475569", lineHeight: 1.5 }}>
              {isInterim
                ? "বর্তমানে অন্তরবর্তীকালীন মোড সক্রিয় রয়েছে। ক্লাবের ১০০% এডমিন ও পরিচালনা ক্ষমতা কন্ট্রোলারের কাছে ন্যস্ত।"
                : "নিয়মিত পরিচালনা কমিটি মোড সক্রিয়। যার যার অর্পিত পদবী ও পারমিশন অনুযায়ী দায়িত্ব বন্টিত রয়েছে।"}
            </p>
          </div>
        </div>

        {/* Right Switch Toggle Control */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isInterim ? "#c2410c" : "#64748b" }}>
            {isInterim ? "অন (ON)" : "অফ (OFF)"}
          </span>

          <label style={{ position: "relative", display: "inline-block", width: "56px", height: "30px", cursor: loading ? "wait" : "pointer" }}>
            <input
              type="checkbox"
              checked={isInterim}
              onChange={handleToggle}
              disabled={loading}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isInterim ? "#ea580c" : "#cbd5e1",
                transition: "0.3s",
                borderRadius: "30px",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  content: '""',
                  height: "22px",
                  width: "22px",
                  left: isInterim ? "28px" : "4px",
                  bottom: "4px",
                  backgroundColor: "white",
                  transition: "0.3s",
                  borderRadius: "50%",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {isInterim && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            border: "1px solid #fdba74",
            fontSize: "0.8125rem",
            color: "#9a3412",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={18} color="#c2410c" />
          <span>
            <strong>সতর্কতা:</strong> এটি বন্ধ করতে হলে পরবর্তীতে অবশ্যই পরিচালনা কমিটিতে সদস্য নিযুক্ত থাকতে হবে।
          </span>
        </div>
      )}
    </div>
  );
}
