"use client";

import { useState } from "react";
import { approveMember } from "@/actions/members";
import { CheckCircle } from "lucide-react";

export default function ApproveButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই সদস্যকে অনুমোদন দিতে চান?")) return;
    
    setLoading(true);
    const result = await approveMember(userId);
    
    if (result.error) {
      alert(result.error);
      setLoading(false);
    }
    // if success, the server action revalidates the path, so the row will disappear automatically
  };

  return (
    <button 
      onClick={handleApprove} 
      disabled={loading} 
      className="btn btn-primary"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
    >
      <CheckCircle size={16} />
      {loading ? "Approving..." : "Approve"}
    </button>
  );
}
