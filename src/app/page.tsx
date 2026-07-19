import Link from "next/link";
import styles from "./page.module.css";
import prisma from "@/lib/prisma";
import { StatsCounter } from "@/components/home/StatsCounter";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Query dynamic club settings & metrics with defensive fallbacks
  let clubSettings = { name: "United Vision Club", logo: null };
  let totalMembers = 0;
  let totalProjectsCount = 0;

  try {
    if (prisma.clubSettings) {
      const settings = await (prisma.clubSettings as any).findUnique({
        where: { id: "singleton" }
      });
      if (settings) clubSettings = settings;
    }
    totalMembers = await prisma.user.count({ 
      where: { activeStatus: true, isDeleted: false } 
    });
    totalProjectsCount = await prisma.project.count();
  } catch (err) {
    console.error("Home: Could not fetch metrics from DB:", err);
  }

  // Calculate dynamic success years (founded in 2025)
  const foundingYear = 2025;
  const currentYear = new Date().getFullYear();
  const successYears = Math.max(1, currentYear - foundingYear);

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img 
            src={clubSettings.logo || "/logo.jpg"} 
            alt="Logo" 
            style={{ width: '46px', height: '46px', borderRadius: '4px', objectFit: 'contain', backgroundColor: '#fff', padding: '2px' }} 
          />
          <h1 className={styles.logoTitle}>{clubSettings.name || "United Vision Club"}</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/login" className={styles.navLogin}>
            লগইন করুন
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles.heroContent}>
          {/* Live Indicator Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            ক্লাব ড্যাশবোর্ড অনলাইন
          </div>

          {/* Heading */}
          <h1 className={styles.heroTitle}>
            বিনিয়োগে গড়ি,<br />
            <span className={styles.textPrimary}>আগামীর স্বপ্ন।</span>
          </h1>

          {/* Subtitle description */}
          <p className={styles.heroText}>
            সহজ বিনিয়োগ, স্মার্ট সঞ্চয়। <br />
            ইউনাইটেড ভিশন ক্লাবের সাথে আপনার তহবিল থাকুক নিরাপদ ও স্বচ্ছ।
          </p>



          {/* Bottom Stats Row with Animation & Leading Zero */}
          <div className={styles.statsRow}>
            <StatsCounter 
              membersCount={totalMembers} 
              projectsCount={totalProjectsCount} 
              successYears={successYears} 
            />
          </div>
        </div>
      </main>

      {/* Footer with border and club name */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © ২০২৫ - {new Date().getFullYear() === 2025 ? "২০২৫" : `২০২৫ - ${String(new Date().getFullYear()).replace(/[0-9]/g, (d) => ['০','১','২','৩','৪','৫','৬','৭','৮','৯'][parseInt(d)])}`} | {clubSettings.name || "United Vision Club"} | সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </div>
  );
}
