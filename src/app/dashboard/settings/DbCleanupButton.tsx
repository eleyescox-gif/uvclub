"use client";

import { useState } from "react";
import { executeDatabaseCleanup } from "@/actions/dbCleanup";
import { Trash2, Loader2, Sparkles } from "lucide-react";

export default function DbCleanupButton() {
  const [loading, setLoading] = useState(false);

  const handleCleanup = async () => {
    const confirm = window.confirm(
      "আপনি কি নিশ্চিত যে আপনি ডাটাবেসের পুরোনো ও ডিলিট হওয়া মেম্বার/নোটিশের ফালতু ডেটা স্থায়ীভাবে পার্জ (Hard Delete) করে ডাটাবেস স্পেস খালি করতে চান?"
    );
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await executeDatabaseCleanup();
      if (res.success && res.stats) {
        alert(
          `✅ ডাটাবেস স্পেস সফলভাবে খালি করা হয়েছে!\n\n` +
          `• স্থায়ীভাবে মুছে ফেলা সদস্য: ${res.stats.usersPurged} জন\n` +
          `• অনাবশ্যক পুরোনো নোটিশ: ${res.stats.noticesPurged} টি\n` +
          `• বাতিল রিকোয়েস্ট রেকর্ড: ${res.stats.reportRequestsPurged + res.stats.clearRequestsPurged} টি`
        );
      } else {
        alert(res.error || "ডাটাবেস পার্জ করতে ব্যর্থ হয়েছে।");
      }
    } catch (e: any) {
      alert("ত্রুটি: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} /> ডাটাবেস স্পেস ও মেমোরি পার্জ (Database Cleanup)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.25rem' }}>
            পুরোনো অনাবশ্যক ডেটা ও মুছে ফেলা রেকর্ডগুলো পার্জ করে ডাটাবেস স্পেস খালি করুন।
          </p>
        </div>
        <button
          onClick={handleCleanup}
          disabled={loading}
          className="btn"
          style={{
            backgroundColor: '#16a34a',
            color: '#ffffff',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          ডাটাবেস স্পেস পার্জ করুন
        </button>
      </div>
    </div>
  );
}
