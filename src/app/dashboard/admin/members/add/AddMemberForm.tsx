"use client";

import { useState } from "react";
import { addMember } from "@/actions/members";
import styles from "./add-member.module.css";
import { UserPlus, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddMemberForm({ currentUserRole }: { currentUserRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await addMember(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "সদস্য সফলভাবে যুক্ত করা হয়েছে। সভাপতির অনুমোদনের অপেক্ষায় রয়েছে।" });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <div className={`glass ${styles.card}`} style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Section 1: Personal Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ১। ব্যক্তিগত তথ্যাদি
          </h3>
          
          <div className={styles.imageUploadSection} style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={styles.imagePreview} style={{ width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoBase64 ? (
                <img src={photoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={40} color="#9ca3af" />
              )}
            </div>
            <div>
              <label className={styles.label}>পাসপোর্ট সাইজ ছবি (Photo)</label>
              <input type="file" accept="image/*" className={styles.fileInput} onChange={handlePhotoChange} />
              <input type="hidden" name="profilePicture" value={photoBase64} />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>আবেদনকারীর নাম (বাংলা)</label>
              <input type="text" name="nameBn" className={styles.input} placeholder="উদাঃ মোঃ আব্দুর রহিম" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>নাম (ইংরেজি ব্লকে) *ঐচ্ছিক</label>
              <input type="text" name="nameEn" className={styles.input} placeholder="e.g. MD. ABDUR RAHIM" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>লগইন নাম (সাধারণত ইংরেজি)</label>
              <input type="text" name="name" className={styles.input} required placeholder="e.g. Abdur Rahim" />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>পিতা/স্বামীর নাম</label>
              <input type="text" name="fatherName" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>মাতার নাম</label>
              <input type="text" name="motherName" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>জাতীয় পরিচয়পত্র (NID) নম্বর</label>
              <input type="text" name="nid" className={styles.input} placeholder="10 বা 17 ডিজিট" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>মোবাইল নম্বর (লগইন আইডি)</label>
              <input type="text" name="mobile" className={styles.input} required placeholder="01XXXXXXXXX" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>জন্ম তারিখ</label>
              <input type="date" name="dob" className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>স্থায়ী ঠিকানা</label>
            <textarea name="address" className={styles.textarea} rows={3} placeholder="গ্রাম/রাস্তা, ডাকঘর, থানা, জেলা"></textarea>
          </div>
        </div>

        {/* Section 2: Nominee Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
            ২। নমিনির তথ্যাদি
          </h3>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>নমিনির নাম</label>
              <input type="text" name="nomineeName" className={styles.input} placeholder="যাকে নমিনি করতে চান" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>সম্পর্ক</label>
              <input type="text" name="nomineeRelation" className={styles.input} placeholder="উদাঃ স্ত্রী/পুত্র/কন্যা" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>বয়স</label>
              <input type="text" name="nomineeAge" className={styles.input} placeholder="উদাঃ ২৫" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন নং</label>
              <input type="text" name="nomineeNid" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>মোবাইল নম্বর</label>
              <input type="text" name="nomineeMobile" className={styles.input} placeholder="01XXXXXXXXX" />
            </div>
          </div>
        </div>

        {/* Section 3: Official Info */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fff7ed', borderRadius: '0.5rem', border: '1px solid #fed7aa' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c2410c', marginBottom: '1rem' }}>
            ৩। শুধুমাত্র অফিসের ব্যবহারের জন্য (লগইন তথ্য)
          </h3>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label} style={{ color: '#9a3412' }}>অ্যাকাউন্টের প্রাথমিক পাসওয়ার্ড</label>
              <input type="text" name="password" defaultValue="password123" className={styles.input} style={{ borderColor: '#fdba74' }} required />
              <p style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '0.25rem' }}>* এই পাসওয়ার্ড দিয়ে সদস্য লগইন করতে পারবেন।</p>
            </div>
            
            {(currentUserRole === "ADMIN" || currentUserRole === "PRESIDENT") && (
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ color: '#9a3412' }}>সদস্যের রোল (Role)</label>
                <select name="role" defaultValue="MEMBER" className={styles.input} style={{ borderColor: '#fdba74' }}>
                  <option value="MEMBER">MEMBER (সাধারণ সদস্য)</option>
                  <option value="CASHIER">CASHIER (ক্যাশিয়ার)</option>
                  <option value="SECRETARY">SECRETARY (সাধারণ সম্পাদক)</option>
                  <option value="PRESIDENT">PRESIDENT (সভাপতি)</option>
                  {currentUserRole === "ADMIN" && <option value="ADMIN">ADMIN (অ্যাডমিন)</option>}
                </select>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          <UserPlus size={20} />
          <span>{loading ? "ডেটা সেভ হচ্ছে..." : "ফরম জমা দিন ও সদস্য যুক্ত করুন"}</span>
        </button>
      </form>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`} style={{ marginTop: '1.5rem' }}>
          <p>{message.text}</p>
        </div>
      )}
    </div>
  );
}
