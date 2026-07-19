"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { recoverUserPin } from "@/actions/sms";

export default function LoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    if (mode === "login") {
      const result = await signIn("credentials", {
        redirect: false,
        mobile,
        password,
      });

      if (result?.error) {
        setError("মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে!");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const result = await recoverUserPin(mobile);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.message || "আপনার মোবাইলে নতুন পিন পাঠানো হয়েছে।");
        setMode("login");
      }
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successBox} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>মোবাইল নম্বর</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className={styles.input}
            placeholder="017XXXXXXXX"
            required
          />
        </div>
        
        {mode === "login" ? (
          <>
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className={styles.label} style={{ margin: 0 }}>পাসওয়ার্ড (পিন)</label>
                <button 
                  type="button" 
                  onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  পিন ভুলে গেছেন?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              {loading ? "অপেক্ষা করুন..." : "লগইন"}
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', borderColor: 'transparent' }}
            >
              {loading ? "অপেক্ষা করুন..." : "পিন রিকভার করুন"}
            </button>
            <button 
              type="button" 
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }} 
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', marginTop: '0.75rem', alignSelf: 'center' }}
            >
              লগইন পেজে ফিরে যান
            </button>
          </>
        )}
      </form>
    </>
  );
}
