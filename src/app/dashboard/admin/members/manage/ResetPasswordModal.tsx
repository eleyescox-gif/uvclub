"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/members";
import { Key } from "lucide-react";

export default function ResetPasswordModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("userId", user.id);
    
    const result = await resetPassword(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });
      setTimeout(() => setIsOpen(false), 1500);
    }
    
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-secondary" 
        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      >
        <Key size={14} /> পাসওয়ার্ড সেট করুন
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '28rem', padding: '2rem', borderRadius: '1rem', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
              পাসওয়ার্ড পরিবর্তন করুন
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              মেম্বার: <strong>{user.name}</strong> ({user.mobile})
            </p>

            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>নতুন পাসওয়ার্ড</label>
                <input 
                  type="text" 
                  name="newPassword" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} 
                  required 
                  minLength={6}
                  placeholder="কমপক্ষে ৬ ক্যারেক্টার..." 
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড সেভ করুন"}
              </button>
            </form>

            {message && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
