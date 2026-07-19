"use client";

import { useState } from "react";
import { assignToCommittee, removeFromCommittee } from "@/actions/committee";
import { UserCheck, Trash2, Shield } from "lucide-react";

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  mobile: string;
}

export function CommitteeSelectForm({ members }: { members: Member[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await assignToCommittee(formData);

    if (result.error) {
      setError(result.error);
    } else {
      alert("সদস্যকে সফলভাবে পরিচালনা কমিটিতে যুক্ত করা হয়েছে।");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <div className="glass" style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <UserCheck size={20} /> কমিটিতে সদস্য নির্বাচন (Select Member)
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Select Member */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#4b5563' }}>সদস্য নির্বাচন করুন</label>
          <select name="userId" required style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <option value="">-- সদস্য নির্বাচন করুন --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.nameBn || m.name} ({m.mobile})
              </option>
            ))}
          </select>
        </div>

        {/* Designation Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#4b5563' }}>কমিটির পদবী (Designation)</label>
          <input 
            type="text" 
            name="designation" 
            required 
            placeholder="যেমন: সহ-সভাপতি, সহ-সাধারণ সম্পাদক, সদস্য"
            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
          />
        </div>

        {/* System Access Role */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#4b5563' }}>সিস্টেম রোল/অনুমতি (System Role)</label>
          <select name="systemRole" required style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <option value="MEMBER">সাধারণ মেম্বার পারমিশন (Member Role)</option>
            <option value="PRESIDENT">সভাপতি পারমিশন (President Role)</option>
            <option value="SECRETARY">সাধারণ সম্পাদক পারমিশন (Secretary Role)</option>
            <option value="CASHIER">ক্যাশিয়ার পারমিশন (Cashier Role)</option>
            <option value="ADMIN">অ্যাডমিন পারমিশন (Admin Role)</option>
          </select>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', fontWeight: 700, marginTop: '0.5rem' }}>
          {loading ? "সংরক্ষণ হচ্ছে..." : "কমিটিতে নিযুক্ত করুন"}
        </button>
      </form>
    </div>
  );
}

export function RemoveCommitteeButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে আপনি ${userName}-কে পরিচালনা কমিটি থেকে বাদ দিতে চান? বাদ দিলে তার সিস্টেম পারমিশন সাধারণ সদস্য হিসেবে রিসেট হবে।`)) return;
    
    setLoading(true);
    const result = await removeFromCommittee(userId);
    if (result.error) {
      alert(result.error);
    } else {
      alert("সদস্যকে সফলভাবে কমিটি থেকে বাদ দেওয়া হয়েছে।");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={loading} 
      className="btn btn-secondary" 
      style={{ 
        padding: '0.25rem 0.5rem', 
        fontSize: '0.75rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem', 
        color: 'var(--danger)', 
        borderColor: '#fca5a5', 
        backgroundColor: '#fef2f2' 
      }}
      title="কমিটি থেকে বাদ দিন"
    >
      <Trash2 size={13} />
      <span>বাদ দিন</span>
    </button>
  );
}

export function PrintCommitteeButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="btn btn-secondary" 
      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      <span>তালিকা প্রিন্ট করুন</span>
    </button>
  );
}
