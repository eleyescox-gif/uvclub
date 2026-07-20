"use client";

import { useState } from "react";
import { createProject, distributeProfit, updateProject, deleteProject } from "@/actions/investment";
import styles from "./projects.module.css";
import { Pencil } from "lucide-react";

export function EditProjectModal({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("id", project.id);
    
    const result = await updateProject(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "প্রজেক্ট আপডেট সফল হয়েছে!" });
      setTimeout(() => setIsOpen(false), 1500);
    }
    
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই প্রজেক্টটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।")) return;
    
    setLoading(true);
    setMessage(null);
    
    const result = await deleteProject(project.id);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "প্রজেক্টটি সফলভাবে মুছে ফেলা হয়েছে!" });
      setTimeout(() => setIsOpen(false), 1500);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn" 
        style={{ 
          padding: '0.35rem 0.75rem', 
          fontSize: '0.82rem', 
          fontWeight: 600,
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
      >
        <Pencil size={12} /> এডিট
      </button>

      {isOpen && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1rem' 
        }}>
          <div className="glass" style={{ 
            width: '100%', 
            maxWidth: '30rem', 
            padding: '2rem', 
            borderRadius: '20px', 
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} color="var(--primary)" /> প্রজেক্ট আপডেট করুন
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ 
                  background: '#f3f4f6', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  color: '#4b5563',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>প্রজেক্টের নাম</label>
                <input 
                  type="text" 
                  name="title" 
                  className={styles.input} 
                  required 
                  defaultValue={project.title} 
                  style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.65rem 0.85rem' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>প্রজেক্টের বিবরণ</label>
                <textarea 
                  name="description" 
                  className={styles.textarea} 
                  required 
                  defaultValue={project.description} 
                  style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.65rem 0.85rem', minHeight: '80px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>বিনিয়োগের পরিমাণ (টাকা)</label>
                <input 
                  type="number" 
                  name="investmentAmount" 
                  className={styles.input} 
                  required 
                  min="1" 
                  defaultValue={project.investmentAmount} 
                  style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.65rem 0.85rem' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>স্ট্যাটাস</label>
                <select 
                  name="status" 
                  className={styles.select} 
                  required 
                  defaultValue={project.status}
                  style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.65rem 0.85rem' }}
                >
                  <option value="ACTIVE">ACTIVE (সক্রিয়)</option>
                  <option value="COMPLETED">COMPLETED (সম্পন্ন)</option>
                  <option value="CANCELLED">CANCELLED (বাতিল)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  {loading ? "আপডেট হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  disabled={loading} 
                  className="btn" 
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    backgroundColor: '#fee2e2', 
                    color: '#dc2626', 
                    border: '1px solid #fca5a5',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                >
                  {loading ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
                </button>
              </div>
            </form>

            {message && (
              <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`} style={{ borderRadius: '8px', marginTop: '1rem' }}>
                <p style={{ fontWeight: 600 }}>{message.text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function CreateProjectForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "নতুন প্রজেক্ট সফলভাবে তৈরি হয়েছে।" });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <div className={`glass ${styles.card}`}>
      <h2 className={styles.cardTitle}>নতুন প্রজেক্ট তৈরি করুন</h2>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>প্রজেক্টের নাম</label>
          <input type="text" name="title" className={styles.input} required placeholder="যেমন: জমি ক্রয়" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>প্রজেক্টের বিবরণ</label>
          <textarea name="description" className={styles.textarea} required placeholder="প্রজেক্ট সম্পর্কে বিস্তারিত..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>বিনিয়োগের পরিমাণ (টাকা)</label>
          <input type="number" name="investmentAmount" className={styles.input} required min="1" />
        </div>

        <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
          {loading ? "তৈরি হচ্ছে..." : "প্রজেক্ট তৈরি করুন"}
        </button>
      </form>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          <p>{message.text}</p>
        </div>
      )}
    </div>
  );
}

export function ProfitDistributionForm({ projects = [] }: { projects: any[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(!window.confirm("আপনি কি নিশ্চিত? এই ট্রানজেকশন সবার ব্যালেন্সে সমহারে যুক্ত/কর্তন হবে।")) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await distributeProfit(formData);

    if ('error' in result && result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "সফলভাবে সবার মাঝে বন্টন করা হয়েছে!" });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <div className={`glass ${styles.card}`}>
      <h2 className={styles.cardTitle}>লাভ/লোকসান বন্টন করুন (Proportional)</h2>
      <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
        ইনপুট দেওয়া টাকা সক্রিয় সদস্যদের ব্যালেন্সের অনুপাতে অটোমেটিকভাবে বন্টন বা কর্তন হবে।
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>প্রজেক্ট বা খাত নির্বাচন করুন</label>
          <select name="projectId" className={styles.select} required defaultValue="BANK_INTEREST">
            <option value="BANK_INTEREST">🏦 ব্যাংক লাভ / মুনাফা (Bank Interest)</option>
            <option value="BANK_CHARGE">💳 ব্যাংক কর্তন / সার্ভিস চার্জ (Bank Charge)</option>
            <option value="OTHER_INCOME">💰 অন্যান্য বিশেষ আয় (Other Income)</option>
            <option value="OTHER_EXPENSE">🧾 অন্যান্য ক্লাব ব্যয় (Other Expense)</option>
            {projects && projects.length > 0 && (
              <optgroup label="📁 প্রজেক্টসমূহ">
                {projects.map(p => (
                  <option key={p.id} value={p.id}>📂 প্রজেক্ট: {p.title}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>বন্টনের ধরন</label>
          <select name="type" className={styles.select} required>
            <option value="PROFIT">📈 লভ্যাংশ / জমা (Profit)</option>
            <option value="LOSS">📉 লোকসান / কর্তন (Loss)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>মোট টাকার পরিমাণ (৳)</label>
          <input type="number" name="amount" className={styles.input} required min="1" placeholder="যেমন: 5000" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>খাত / নোট লিখুন (ঐচ্ছিক)</label>
          <input type="text" name="note" className={styles.input} placeholder="যেমন: মে ২০২৬ ব্যাংক লাভ্যাংশ" />
        </div>

        <button type="submit" disabled={loading} className={`btn btn-warning ${styles.submitBtn}`}>
          {loading ? "প্রসেসিং..." : "বন্টন করুন"}
        </button>
      </form>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          <p>{message.text}</p>
        </div>
      )}
    </div>
  );
}
