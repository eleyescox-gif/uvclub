import Link from "next/link";
import styles from "./page.module.css";
import prisma from "@/lib/prisma";
import { StatsCounter } from "@/components/home/StatsCounter";
import { getClubInfo } from "@/lib/clubInfo";

export const revalidate = 60;

export default async function Home() {
  const [clubInfo, totalMembers, totalProjectsCount, latestTx, latestNotice, latestUser] = await Promise.all([
    getClubInfo(),
    prisma.user.count({ 
      where: { activeStatus: true, isDeleted: false } 
    }).catch(() => 0),
    prisma.project.count().catch(() => 0),
    prisma.transaction.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }).catch(() => null),
    prisma.notice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }).catch(() => null),
    prisma.user.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    }).catch(() => null),
  ]);

  const candidateDates = [
    latestTx?.createdAt,
    latestNotice?.createdAt,
    latestUser?.updatedAt
  ].filter(Boolean).map((d) => new Date(d as Date).getTime());

  const lastUpdateDate = candidateDates.length > 0
    ? new Date(Math.max(...candidateDates))
    : new Date();

  const formattedDate = lastUpdateDate.toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = lastUpdateDate.toLocaleTimeString("bn-BD", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const lastUpdateText = `${formattedDate} | ${formattedTime}`;

  const clubSettings = {
    name: clubInfo.name,
    logo: clubInfo.logo,
  };

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
            width={46}
            height={46}
            loading="eager"
            fetchPriority="high"
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

      {/* Footer with Last Update & Club Info */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.lastUpdateBadge}>
            <span className={styles.updatePulseDot} />
            <span className={styles.updateLabel}>সর্বশেষ আপডেট:</span>
            <span className={styles.updateTime}>{lastUpdateText}</span>
          </div>
          <p className={styles.footerText}>
            © ২০২৫ - {new Date().getFullYear() === 2025 ? "২০২৫" : `২০২৫ - ${String(new Date().getFullYear()).replace(/[0-9]/g, (d) => ['০','১','২','৩','৪','৫','৬','৭','৮','৯'][parseInt(d)])}`} | {clubSettings.name || "United Vision Club"} | সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
