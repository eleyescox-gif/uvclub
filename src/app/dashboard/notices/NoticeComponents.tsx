"use client";

import { useState } from "react";
import { createNotice, deleteNotice } from "@/actions/notices";
import { Trash2 } from "lucide-react";

export function CreateNoticeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createNotice(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      alert("নোটিশটি সফলভাবে তৈরি ও প্রকাশ করা হয়েছে।");
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        + নতুন নোটিশ লিখুন
      </button>
    );
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2.5rem', border: '1px solid rgba(15, 103, 61, 0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>নতুন নোটিশ তৈরি করুন</h2>
        <button type="button" onClick={() => setIsOpen(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>বাতিল (Cancel)</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--foreground)' }}>নোটিশের শিরোনাম (Title)</label>
          <input 
            type="text" 
            name="title" 
            required 
            placeholder="যেমন: জরুরি সাধারণ সভা স্থগিতকরণ" 
            style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.9rem' }} 
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--foreground)' }}>নোটিশের বিষয়বস্তু (Content)</label>
          <textarea 
            name="content" 
            required 
            rows={5} 
            placeholder="নোটিশের বিস্তারিত এখানে লিখুন..." 
            style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          ></textarea>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem' }}>
          {loading ? "প্রকাশ হচ্ছে..." : "নোটিশ প্রকাশ করুন"}
        </button>
      </form>
    </div>
  );
}

export function DeleteNoticeButton({ noticeId }: { noticeId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই নোটিশটি মুছে ফেলতে চান?")) return;
    
    setLoading(true);
    const result = await deleteNotice(noticeId);
    if (result.error) {
      alert(result.error);
    } else {
      alert("নোটিশটি সফলভাবে মুছে ফেলা হয়েছে।");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading} 
      style={{ 
        background: 'none', 
        border: 'none', 
        color: 'var(--danger)', 
        cursor: 'pointer', 
        display: 'inline-flex', 
        alignItems: 'center',
        padding: '0.25rem',
        borderRadius: '0.25rem',
        transition: 'background-color 0.2s'
      }}
      title="নোটিশ মুছুন"
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Trash2 size={16} />
    </button>
  );
}
