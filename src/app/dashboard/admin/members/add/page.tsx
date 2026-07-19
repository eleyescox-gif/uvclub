import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import styles from "./add-member.module.css";
import AddMemberForm from "./AddMemberForm";

export default async function AddMemberPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SECRETARY" && role !== "PRESIDENT") {
    redirect("/dashboard");
  }

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className={styles.title}>নতুন সদস্য যোগ করুন</h1>
          <p className={styles.subtitle}>সাধারণ সম্পাদকের প্যানেল - সদস্যের তথ্য এন্ট্রি ফর্ম</p>
        </div>
        <a href="/dashboard/admin/members/print-form" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', color: 'var(--foreground)', textDecoration: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          অফলাইন প্রিন্ট ফরম
        </a>
      </header>

      <div className={styles.formContainer}>
        <AddMemberForm currentUserRole={role} />
      </div>
    </div>
  );
}
