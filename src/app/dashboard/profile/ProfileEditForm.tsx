"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { Camera, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

export default function ProfileEditForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState(user.mobile);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, profilePicture }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      
      {/* Profile Picture Section */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          ) : (
            <span style={{ fontSize: '2rem', color: '#9ca3af', fontWeight: 'bold' }}>{user.name.charAt(0)}</span>
          )}
          
          <label className={styles.cameraOverlay}>
            <Camera size={14} style={{ margin: '0 auto' }} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </label>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>{user.name}</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
            {user.role === 'PRESIDENT' ? 'সভাপতি (President)' :
             user.role === 'ADMIN' ? 'এডমিন (Admin)' :
             user.role === 'SECRETARY' ? 'সাধারণ সম্পাদক (Secretary)' :
             user.role === 'CASHIER' ? 'কোষাধ্যক্ষ (Cashier)' : 'সাধারণ সদস্য (General Member)'}
          </p>
          <p style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem', marginBottom: '0.75rem' }}>
            মোবাইল: {user.mobile}
          </p>
          
          {/* Photo Controls Group */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <label className={styles.uploadBtn}>
              <Camera size={14} />
              ছবি পরিবর্তন করুন
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </label>
            
            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitBtn}
              style={{ padding: '0.45rem 1.25rem', fontSize: '0.75rem' }}
            >
              <Save size={14} />
              {loading ? "সংরক্ষণ..." : "সংরক্ষণ করুন (Save)"}
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#991b1b' : '#065f46' }}>
          {message.text}
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

      {/* Personal Information (Read-Only Detail Fields) */}
      <div>
        <h3 className={styles.sectionTitle}>
          ব্যক্তিগত তথ্য (Personal Information - Read Only)
        </h3>
        <div className={styles.gridFields}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>নাম (বাংলা) :</span>
            <span className={styles.detailValue}>{user.nameBn || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>নাম (ইংরেজি) :</span>
            <span className={styles.detailValue}>{user.nameEn || user.name}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>পিতার নাম :</span>
            <span className={styles.detailValue}>{user.fatherName || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>মাতার নাম :</span>
            <span className={styles.detailValue}>{user.motherName || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>জন্ম তারিখ :</span>
            <span className={styles.detailValue}>{user.dob ? new Date(user.dob).toLocaleDateString('en-GB') : "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>এনআইডি (NID) নম্বর :</span>
            <span className={styles.detailValue}>{user.nid || "N/A"}</span>
          </div>
          <div className={`${styles.detailItem} ${styles.fullWidthField}`}>
            <span className={styles.detailLabel}>ঠিকানা :</span>
            <span className={styles.detailValue}>{user.address || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Nominee Information (Read-Only Detail Fields) */}
      <div>
        <h3 className={styles.sectionTitle}>
          নমিনি তথ্য (Nominee Information - Read Only)
        </h3>
        <div className={styles.gridFields}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>নমিনির নাম :</span>
            <span className={styles.detailValue}>{user.nomineeName || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>সম্পর্ক (Relation) :</span>
            <span className={styles.detailValue}>{user.nomineeRelation || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>নমিনির মোবাইল :</span>
            <span className={styles.detailValue}>{user.nomineeMobile || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>নমিনির এনআইডি (NID) :</span>
            <span className={styles.detailValue}>{user.nomineeNid || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>নমিনির বয়স/জন্ম তারিখ :</span>
            <span className={styles.detailValue}>
              {user.nomineeDob 
                ? `${new Date(user.nomineeDob).toLocaleDateString('en-GB')} ${user.nomineeAge ? `(বয়স: ${user.nomineeAge} বছর)` : ''}`
                : user.nomineeAge ? `${user.nomineeAge} বছর` : "N/A"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>অংশীদারিত্ব হার (Ratio) :</span>
            <span className={styles.detailValue}>{user.nomineeRatio || 100}%</span>
          </div>
        </div>
      </div>
    </form>
  );
}
