"use client";

import { useState } from "react";
import { createNotice, deleteNotice } from "@/actions/notices";
import { Trash2, Image as ImageIcon, UploadCloud } from "lucide-react";

export function CreateNoticeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ছবিটির সাইজ সর্বোচ্চ 5MB হতে পারবে।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (bannerPreview) {
      formData.set("bannerImage", bannerPreview);
    }

    const result = await createNotice(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setBannerPreview(null);
      alert("নোটিশ ও ব্যানার ছবি সফলভাবে প্রকাশ করা হয়েছে।");
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
        <ImageIcon size={18} /> + ব্যানার/নোটিশ প্রকাশ করুন
      </button>
    );
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2.5rem', border: '1px solid rgba(15, 103, 61, 0.15)', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ImageIcon size={20} /> নতুন নোটিশ ও ব্যানার ছবি আপলোড
        </h2>
        <button type="button" onClick={() => setIsOpen(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>বাতিল (Cancel)</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--foreground)' }}>নোটিশের শিরোনাম (Title)</label>
          <input 
            type="text" 
            name="title" 
            required 
            placeholder="যেমন: জরুরি সাধারণ সভা স্থগিতকরণ বা ঈদ শুভেচ্ছা" 
            style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.9rem' }} 
          />
        </div>

        {/* Notice Banner Image Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--foreground)' }}>
            নোটিশের ব্যানার/পপআপ ছবি (Banner Image - Optional)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
            />
            {bannerPreview && (
              <div style={{ marginTop: '0.5rem', position: 'relative', width: '100%', maxHeight: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setBannerPreview(null)}
                  style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--foreground)' }}>নোটিশের বিষয়বস্তু (Content)</label>
          <textarea 
            name="content" 
            required 
            rows={4} 
            placeholder="নোটিশের বিস্তারিত বার্তা এখানে লিখুন..." 
            style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          ></textarea>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem' }}>
          {loading ? "প্রকাশ হচ্ছে..." : "📢 নোটিশ ও ব্যানার প্রকাশ করুন"}
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
      className="btn btn-secondary" 
      style={{ 
        padding: '0.35rem 0.65rem', 
        fontSize: '0.78rem', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.35rem', 
        color: 'var(--danger)', 
        borderColor: '#fca5a5', 
        backgroundColor: '#fef2f2' 
      }}
      title="নোটিশ মুছে ফেলুন"
    >
      <Trash2 size={14} />
      <span>মুছে ফেলুন</span>
    </button>
  );
}
