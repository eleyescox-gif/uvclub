"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function VotingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Voting Page Error:", error);
  }, [error]);

  return (
    <div style={{ padding: "2rem", maxWidth: "48rem", margin: "0 auto", textAlign: "center" }}>
      <div className="glass" style={{ padding: "2rem", borderRadius: "1rem", border: "1px solid #fca5a5", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "#dc2626" }}>
          <AlertTriangle size={48} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#991b1b", marginBottom: "0.5rem" }}>
          ভোটিং ইঞ্জিন লোড হতে সমস্যা হয়েছে
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          সার্ভার বা ডাটাবেজ সংযোগে সাময়িক বিলম্ব দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
        </p>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <RefreshCw size={16} /> পুনরায় চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}
