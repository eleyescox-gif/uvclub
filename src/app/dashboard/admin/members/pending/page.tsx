import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import styles from "./pending-members.module.css";
import ApproveButton from "./ApproveButton";
import { User, Phone, UserCheck, FileText } from "lucide-react";
import ReportRequestsManager from "@/app/dashboard/admin/reports/ReportRequestsManager";

export default async function PendingMembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  // Fetch users with activeStatus = false
  const pendingMembers = await prisma.user.findMany({
    where: { activeStatus: false, isDeleted: false },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className={styles.container} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <header className={styles.header}>
        <h1 className={styles.title}>মেম্বার রিকোয়েস্ট ও আবেদনসমূহ</h1>
        <p className={styles.subtitle}>নতুন সদস্যের নিবন্ধন অনুমোদন এবং সদস্যদের রিপোর্ট আবেদন পরিচালনা করুন</p>
      </header>

      {/* 1. Pending Member Registration Approval */}
      <div className={`glass ${styles.card}`}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <UserCheck size={20} color="var(--primary)" /> ১. নতুন সদস্য নিবন্ধন আবেদনসমূহ ({pendingMembers.length})
        </h2>
        {pendingMembers.length > 0 ? (
          <div className={styles.list}>
            {pendingMembers.map(member => (
              <div key={member.id} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <div className={styles.avatar}>
                    <User size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 className={styles.name}>{member.name}</h3>
                    <div className={styles.meta}>
                      <span className={styles.metaItem}><Phone size={14} /> {member.mobile}</span>
                      {member.fatherName && <span className={styles.metaItem}>পিতা: {member.fatherName}</span>}
                    </div>
                  </div>
                </div>
                
                <div className={styles.actions}>
                  <ApproveButton userId={member.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>আপাতত কোনো নতুন অপেক্ষমাণ সদস্য নেই।</p>
          </div>
        )}
      </div>

      {/* 2. Member Report Applications / Requests */}
      <div>
        <ReportRequestsManager />
      </div>
    </div>
  );
}
