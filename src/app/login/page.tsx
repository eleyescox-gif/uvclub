import Link from "next/link";
import prisma from "@/lib/prisma";
import styles from "./login.module.css";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Query dynamic club settings (Name & Logo) set by Admin
  let settings = null;
  if (prisma.clubSettings) {
    settings = await (prisma.clubSettings as any).findUnique({
      where: { id: "singleton" }
    });
  }
  const clubSettings = settings || { name: "United Vision Club", logo: null };

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
