"use client";

import { useState, useEffect } from "react";
import { User, Folder, Trophy } from "lucide-react";
import styles from "@/app/page.module.css";

// Helper to convert standard digits to Bengali numerals
function toBn(num: number | string): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnNums[parseInt(digit)]);
}

// Helper to format with leading zero if less than 10
function formatWithLeadingZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function StatsCounter({ 
  membersCount, 
  projectsCount, 
  successYears 
}: { 
  membersCount: number; 
  projectsCount: number; 
  successYears: number; 
 }) {
  const [members, setMembers] = useState(0);
  const [projects, setProjects] = useState(0);
  const [years, setYears] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const intervalTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOutQuad = progress * (2 - progress);

      setMembers(Math.round(easeOutQuad * membersCount));
      setProjects(Math.round(easeOutQuad * projectsCount));
      setYears(Math.round(easeOutQuad * successYears));

      if (step >= steps) {
        setMembers(membersCount);
        setProjects(projectsCount);
        setYears(successYears);
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [membersCount, projectsCount, successYears]);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Card 1 - Members */}
      <div className={styles.statCardWrapper}>
        <div className={styles.glassCardOne}>
          <div className={styles.statIcon}>
            <User size={18} />
          </div>
          <span className={styles.statVal}>
            {toBn(formatWithLeadingZero(members))} জন
          </span>
          <span className={styles.statLabel}>
            সক্রিয় সদস্য
          </span>
        </div>
      </div>

      {/* Card 2 - Projects */}
      <div className={styles.statCardWrapper}>
        <div className={styles.glassCardTwo}>
          <div className={styles.statIcon}>
            <Folder size={18} />
          </div>
          <span className={styles.statVal}>
            {toBn(formatWithLeadingZero(projects))} টি
          </span>
          <span className={styles.statLabel}>
            চলমান প্রজেক্ট
          </span>
        </div>
      </div>

      {/* Card 3 - Years */}
      <div className={styles.statCardWrapper}>
        <div className={styles.glassCardThree}>
          <div className={styles.statIcon}>
            <Trophy size={18} />
          </div>
          <span className={styles.statVal}>
            {toBn(formatWithLeadingZero(years))} বছর
          </span>
          <span className={styles.statLabel}>
            সাফল্যের পথচলা
          </span>
          {/* Sparkle star at the bottom right */}
          <div className={styles.sparkle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
