"use client";

import { useState } from "react";
import { updateMember } from "@/actions/members";
import { Save } from "lucide-react";
import styles from "../../add/add-member.module.css";
import { useRouter } from "next/navigation";

export default function EditMemberForm({ user, currentUserRole }: { user: any, currentUserRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>(user.profilePicture || "");

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
    
    // Convert checkbox to boolean string for FormData
    const isActive = formData.get("activeStatusCheckbox") === "on";
    formData.set("activeStatus", isActive ? "true" : "false");

    const result = await updateMember(user.id, formData);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: "সদস্য তথ্য সফলভাবে আপডেট হয়েছে!" });
      setTimeout(() => {
        router.push("/dashboard/admin/members/manage");
      }, 1500);
    }
    
    setLoading(false);
  };

  const formattedDob = user.dob ? new Date(user.dob).toISOString().split('T')[0] : "";

  return (
    <div className={`glass ${styles.card}`} style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Section 1: Personal Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ১। ব্যক্তিগত তথ্যাদি
          </h3>

          <div className={styles.imageUploadSection} style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={styles.imagePreview} style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', flexShrink: 0 }}>
              {photoBase64 ? (
                <img src={photoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center' }}>ছবি নেই</div>
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
              <input type="text" name="nameBn" defaultValue={user.nameBn || ""} className={styles.input} placeholder="উদাঃ মোঃ আব্দুর রহিম" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>নাম (ইংরেজি ব্লকে) *ঐচ্ছিক</label>
              <input type="text" name="nameEn" defaultValue={user.nameEn || ""} className={styles.input} placeholder="e.g. MD. ABDUR RAHIM" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>লগইন নাম (সাধারণত ইংরেজি)</label>
              <input type="text" name="name" defaultValue={user.name} className={styles.input} required placeholder="e.g. Abdur Rahim" />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>পিতা/স্বামীর নাম</label>
              <input type="text" name="fatherName" defaultValue={user.fatherName || ""} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>মাতার নাম</label>
              <input type="text" name="motherName" defaultValue={user.motherName || ""} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>জাতীয় পরিচয়পত্র (NID) নম্বর</label>
              <input type="text" name="nid" defaultValue={user.nid || ""} className={styles.input} placeholder="10 বা 17 ডিজিট" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>মোবাইল নম্বর (লগইন আইডি)</label>
              <input type="text" name="mobile" defaultValue={user.mobile} className={styles.input} required placeholder="01XXXXXXXXX" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>পাসওয়ার্ড / পিন (লগইন পাসওয়ার্ড)</label>
              <input type="text" name="password" defaultValue={user.password || ""} className={styles.input} required placeholder="পাসওয়ার্ড লিখুন" style={{ fontWeight: 600, borderColor: '#0284c7' }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>জন্ম তারিখ</label>
              <input type="date" name="dob" defaultValue={formattedDob} className={styles.input} />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>স্থায়ী ঠিকানা</label>
            <textarea name="address" defaultValue={user.address || ""} className={styles.textarea} rows={3} placeholder="গ্রাম/রাস্তা, ডাকঘর, থানা, জেলা"></textarea>
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
              <input type="text" name="nomineeName" defaultValue={user.nomineeName || ""} className={styles.input} placeholder="যাকে নমিনি করতে চান" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>সম্পর্ক</label>
              <input type="text" name="nomineeRelation" defaultValue={user.nomineeRelation || ""} className={styles.input} placeholder="উদাঃ স্ত্রী/পুত্র/কন্যা" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>বয়স</label>
              <input type="text" name="nomineeAge" defaultValue={user.nomineeAge || ""} className={styles.input} placeholder="উদাঃ ২৫" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন নং</label>
              <input type="text" name="nomineeNid" defaultValue={user.nomineeNid || ""} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>মোবাইল নম্বর</label>
              <input type="text" name="nomineeMobile" defaultValue={user.nomineeMobile || ""} className={styles.input} placeholder="01XXXXXXXXX" />
            </div>
          </div>
        </div>

        {/* Section 3: Admin Actions */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '1rem' }}>
            অফিসিয়াল স্ট্যাটাস ও রোল
          </h3>
          <div className={styles.grid}>
            <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="activeStatusCheckbox" id="activeStatusCheckbox" defaultChecked={user.activeStatus} style={{ width: '1.2rem', height: '1.2rem' }} />
              <label htmlFor="activeStatusCheckbox" style={{ fontWeight: 600, color: '#15803d', cursor: 'pointer' }}>সদস্যপদ সক্রিয় (Active)?</label>
            </div>
            
            {(currentUserRole === "ADMIN" || currentUserRole === "PRESIDENT" || currentUserRole === "CONTROLLER") && (
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ color: '#166534' }}>সদস্যের রোল (Role)</label>
                <select name="role" defaultValue={user.role} className={styles.input} style={{ borderColor: '#86efac' }}>
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
          <Save size={20} />
          <span>{loading ? "আপডেট হচ্ছে..." : "তথ্য সেভ করুন"}</span>
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
