import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import styles from "./projects.module.css";
import Link from "next/link";
import { Briefcase, TrendingUp, Plus } from "lucide-react";

export default async function MemberProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const canAddProject = role === "PRESIDENT" || role === "CASHIER" || role === "SECRETARY" || role === "ADMIN";

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className={styles.title}>ক্লাবের প্রজেক্ট সমূহ</h1>
          <p className={styles.subtitle}>আমাদের চলমান এবং সম্পন্ন বিনিয়োগ প্রজেক্টের তালিকা</p>
        </div>
        {canAddProject && (
          <Link href="/dashboard/admin/projects" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
            <Plus size={16} /> Add Project
          </Link>
        )}
      </header>

      <div className={styles.grid}>
        {projects.length > 0 ? (
          projects.map(p => (
            <div key={p.id} className={`glass ${styles.card}`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <Briefcase size={24} className={styles.iconPrimary} />
                </div>
                <span className={`${styles.badge} ${p.status === 'ACTIVE' ? styles.badgeSuccess : styles.badgeWarning}`}>
                  {p.status}
                </span>
              </div>
              <h2 className={styles.cardTitle}>{p.title}</h2>
              <p className={styles.description}>{p.description}</p>
              
              <div className={styles.footer}>
                <div className={styles.investment}>
                  <TrendingUp size={16} className={styles.textSuccess} />
                  <span>বিনিয়োগ: ৳ {p.investmentAmount.toLocaleString('bn-BD')}</span>
                </div>
                <div className={styles.date}>
                  {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>আপাতত কোনো প্রজেক্ট নেই।</p>
          </div>
        )}
      </div>
    </div>
  );
}
