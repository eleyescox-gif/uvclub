import Link from "next/link";
import styles from "./login.module.css";
import LoginForm from "./LoginForm";
import { getClubInfo } from "@/lib/clubInfo";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const clubInfo = await getClubInfo();
  const clubSettings = { name: clubInfo.name, logo: clubInfo.logo };

  return (
    <div className={styles.container}>
      <div className={`glass ${styles.loginCard}`}>
        <div className={styles.topGradient} />
        
        <div className={styles.header}>
          {/* Dynamic Logo from Admin Settings */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img 
              src={clubSettings.logo || "/logo.jpg"} 
              alt="Logo" 
              style={{ 
                width: '85px', 
                height: '85px', 
                borderRadius: '12px', 
                objectFit: 'contain', 
                backgroundColor: '#fff', 
                padding: '4px', 
                border: '1px solid rgba(0,0,0,0.06)' 
              }} 
            />
          </div>
          <h1 className={styles.title}>লগইন করুন</h1>
          <p className={styles.subtitle}>{clubSettings.name || "United Vision Club"} মেম্বার প্যানেল</p>
        </div>

        {/* Client form component */}
        <LoginForm />

        <div className={styles.footer}>
          <Link href="/" className={styles.link}>
            হোমপেজে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
