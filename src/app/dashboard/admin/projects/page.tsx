import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import styles from "./projects.module.css";
import { CreateProjectForm, ProfitDistributionForm, EditProjectModal } from "./ProjectForms";

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CASHIER") {
    redirect("/dashboard");
  }

  const canEdit = role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY";

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>বিনিয়োগ ও প্রজেক্ট ম্যানেজমেন্ট</h1>
        <p className={styles.subtitle}>নতুন প্রজেক্ট তৈরি এবং লভ্যাংশ বন্টন</p>
      </header>

      <div className={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {canEdit && <CreateProjectForm />}
          
          <div className={`glass ${styles.card}`}>
            <h2 className={styles.cardTitle}>সকল প্রজেক্টসমূহ</h2>
            {projects.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {projects.map(p => (
                  <div key={p.id} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div>
                        <h3 style={{fontWeight: 600, color: 'var(--foreground)'}}>{p.title}</h3>
                        <span style={{
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '9999px',
                          backgroundColor: p.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : p.status === 'COMPLETED' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: p.status === 'ACTIVE' ? 'var(--success)' : p.status === 'COMPLETED' ? '#3b82f6' : 'var(--danger)',
                          marginTop: '0.25rem',
                          display: 'inline-block'
                        }}>
                          {p.status}
                        </span>
                      </div>
                      {canEdit && <EditProjectModal project={p} />}
                    </div>
                    <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0'}}>{p.description}</p>
                    <p style={{fontSize: '0.875rem', fontWeight: 600}}>বিনিয়োগ: ৳ {p.investmentAmount.toLocaleString('bn-BD')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{color: '#6b7280'}}>কোনো প্রজেক্ট পাওয়া যায়নি</p>
            )}
          </div>
        </div>

        <div>
          <ProfitDistributionForm projects={projects} />
        </div>
      </div>
    </div>
  );
}
