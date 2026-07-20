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
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "0.5rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        color: "#dc2626",
        border: "1px solid rgba(239, 68, 68, 0.25)",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      title="সদস্য তথ্য মুছুন / ডিলিট করুন (Delete Member)"
    >
      <Trash2 size={16} />
    </button>
  );
}
