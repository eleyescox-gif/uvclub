import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import styles from "./pending-members.module.css";
import ApproveButton from "./ApproveButton";
import { User, Phone } from "lucide-react";

export default async function PendingMembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    redirect("/dashboard");
  }

  // Fetch users with activeStatus = false
  const pendingMembers = await prisma.user.findMany({
    where: { activeStatus: false, isDeleted: false },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>অপেক্ষমাণ সদস্যবৃন্দ</h1>
        <p className={styles.subtitle}>সভাপতির অনুমোদনের অপেক্ষায় থাকা সদস্যদের তালিকা</p>
      </header>

      <div className={`glass ${styles.card}`}>
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
            <p>আপাতত কোনো অপেক্ষমাণ সদস্য নেই।</p>
          </div>
        )}
      </div>
    </div>
  );
}
