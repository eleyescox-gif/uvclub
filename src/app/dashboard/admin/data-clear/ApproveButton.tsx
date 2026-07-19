"use client";

import { useState } from "react";
import { approveDataClear } from "@/actions/data-clear";
import { CheckCircle, XCircle } from "lucide-react";

export default function ApproveButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (approved: boolean) => {
    const actionText = approved ? "অ্যাপ্রুভ" : "রিজেক্ট";
    if (!confirm(`আপনি কি নিশ্চিত যে আপনি এটি ${actionText} করতে চান?${approved ? ' (সতর্কতা: এটি ট্রায়াল ডেটা মুছে ফেলবে)' : ''}`)) {
      return;
    }

    setLoading(true);
    const res = await approveDataClear(requestId, approved);
    if (res?.error) {
      alert(res.error);
    } else {
      alert(res?.message || "সফলভাবে সম্পন্ন হয়েছে।");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={() => handleAction(true)} 
        disabled={loading}
        className="btn btn-primary"
        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      >
        <CheckCircle size={16} />
        অ্যাপ্রুভ
      </button>
      <button 
        onClick={() => handleAction(false)} 
        disabled={loading}
        className="btn btn-secondary"
        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', borderColor: '#dc2626' }}
      >
        <XCircle size={16} />
        রিজেক্ট
      </button>
    </div>
  );
}
