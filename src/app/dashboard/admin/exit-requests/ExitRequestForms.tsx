"use client";

import { useState } from "react";
import { requestExit } from "@/actions/exit";
import { createPoll } from "@/actions/voting";

export function RequestExitForm({ members }: { members: any[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await requestExit(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "সদস্যপদ বাতিলের আবেদন সফলভাবে সাবমিট করা হয়েছে।" });
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>সদস্যপদ বাতিলের আবেদন করুন</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>সদস্য নির্বাচন করুন</label>
          <select name="memberId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}>
            <option value="">-- নির্বাচন করুন --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.mobile})</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>বাতিলের কারণ</label>
          <textarea name="reason" required rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}></textarea>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
          {loading ? "সাবমিট হচ্ছে..." : "আবেদন সাবমিট করুন"}
        </button>
      </form>
      {message && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', textAlign: 'center' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export function CreatePollButton({ requestId, memberName }: { requestId: string, memberName: string }) {
  const [loading, setLoading] = useState(false);

  const handleCreatePoll = async () => {
    if (!window.confirm("আপনি কি এই সদস্যের প্রস্থান অনুমোদনের জন্য একটি ভোটিং পোল তৈরি করতে চান? (৭৫% ভোট প্রয়োজন হবে)")) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("title", `সদস্যপদ বাতিল: ${memberName}`);
    formData.append("description", `${memberName} ক্লাব থেকে তার সদস্যপদ বাতিল করে টাকা উত্তোলন করতে চেয়েছেন। নিয়ম অনুযায়ী এতে ক্লাবের ৭৫% সদস্যের সম্মতি প্রয়োজন। আপনি কি একমত?`);
    formData.append("type", "MEMBER_EXIT");
    formData.append("targetId", requestId);

    const result = await createPoll(formData);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <button onClick={handleCreatePoll} disabled={loading} className="btn btn-warning" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
      {loading ? "Creating..." : "পোল তৈরি করুন (Create Poll)"}
    </button>
  );
}
