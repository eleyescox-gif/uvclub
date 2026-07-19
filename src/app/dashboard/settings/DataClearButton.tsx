"use client";

import { useState } from "react";
import { requestDataClear } from "@/actions/data-clear";

export default function DataClearButton({ pendingRequestExists }: { pendingRequestExists: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleRequest = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি সকল ট্রায়াল ডেটা মুছে ফেলতে চান? এটি সাধারণ সম্পাদকের অনুমোদনের জন্য পাঠানো হবে।")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await requestDataClear();
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: "ডেটা মুছে ফেলার অনুরোধ সফলভাবে পাঠানো হয়েছে।" });
    }
    setLoading(false);
  };

  if (pendingRequestExists && message?.type !== 'success') {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
        <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>আপনার একটি ডেটা মুছে ফেলার অনুরোধ বর্তমানে সাধারণ সম্পাদকের অনুমোদনের অপেক্ষায় রয়েছে।</p>
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={handleRequest} 
        disabled={loading}
        className="btn btn-danger"
        style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
      >
        {loading ? "অনুরোধ পাঠানো হচ্ছে..." : "সকল ট্রায়াল ডেটা মুছে ফেলার অনুরোধ করুন"}
      </button>
      
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          fontSize: '0.875rem',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
