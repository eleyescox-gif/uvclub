"use client";

import { useState } from "react";
import { deleteMember } from "@/actions/members";
import { Trash2 } from "lucide-react";

export default function DeleteMemberButton({ userId, userName, currentUserRole }: { userId: string, userName: string, currentUserRole: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const message = currentUserRole === "SECRETARY" 
      ? `সভাপতি বরাবর একটি আবেদন পাঠাতে চান?` 
      : `আপনি কি নিশ্চিত যে আপনি '${userName}'-কে ডিলিট করে ট্র্যাশে পাঠাতে চান?`;

    if (confirm(message)) {
      setLoading(true);
      const res = await deleteMember(userId);
      if (res.error) {
        alert(res.error);
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-secondary"
      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', borderColor: 'var(--danger)', background: 'transparent', cursor: 'pointer' }}
      title="সদস্য ডিলিট করুন"
    >
      <Trash2 size={14} />
      {loading ? "..." : "ডিলিট"}
    </button>
  );
}
