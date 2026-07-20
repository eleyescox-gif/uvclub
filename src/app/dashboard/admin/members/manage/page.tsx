import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import ResetPasswordModal from "./ResetPasswordModal";
import DeleteMemberButton from "./DeleteMemberButton";
import SuspendMemberButton from "./SuspendMemberButton";
import PresidentExitApprovalModal from "./PresidentExitApprovalModal";

export default async function ManageMembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  // Fetch all members with exit requests and unpaid invoices count
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { name: "asc" },
    include: {
      exitRequests: {
        where: { status: "PENDING" },
        take: 1
      },
      invoices: {
        where: { status: "PENDING" },
        select: { id: true }
      }
    }
  });

  const totalMembersCount = users.filter(u => u.activeStatus).length;

  // Fetch voting events for exit requests to calculate 75% vote threshold
  const pendingExitRequestIds = users
    .map(u => u.exitRequests[0]?.votingEventId)
    .filter(Boolean) as string[];

  const votingEvents = pendingExitRequestIds.length > 0 
    ? await prisma.votingEvent.findMany({
        where: { id: { in: pendingExitRequestIds } },
        include: {
          options: {
            include: {
              _count: { select: { votes: true } }
            }
          }
        }
      })
    : [];

  const votingMap: Record<string, { percentage: number; has75Percent: boolean }> = {};
  votingEvents.forEach(ve => {
    const yesOpt = ve.options.find(o => o.text.includes("হ্যাঁ") || o.text.includes("Yes") || o.text.includes("অনুমোদন"));
    const yesVotes = yesOpt?._count?.votes || 0;
    const percentage = totalMembersCount > 0 ? (yesVotes / totalMembersCount) * 100 : 0;
    votingMap[ve.id] = { percentage, has75Percent: percentage >= 75 };
  });

  const roleOrder: Record<string, number> = {
    'PRESIDENT': 1,
    'SECRETARY': 2,
    'CASHIER': 3,
    'ADMIN': 4,
    'MEMBER': 5
  };

  users.sort((a, b) => {
    const roleDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
    if (roleDiff !== 0) return roleDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/dashboard" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> ফিরে যান
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>মেম্বার ব্যবস্থাপনা</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '2px 0 0' }}>সদস্যদের হিসাব স্থগিত, পদত্যাগ অনুমোদন ও পাসওয়ার্ড ম্যানেজমেন্ট</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <Link href="/dashboard/admin/members/print-list" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            প্রিন্ট তালিকা
          </Link>
          {(role === "ADMIN" || role === "PRESIDENT") && (
            <Link href="/dashboard/admin/members/trash" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#ef4444', borderColor: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              ট্র্যাশ
            </Link>
          )}
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'white' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700 }}>ক্রমিক</th>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700 }}>নাম</th>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700 }}>পদবী</th>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700 }}>মোবাইল</th>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700 }}>বকেয়া মাস</th>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700 }}>স্ট্যাটাস</th>
                <th style={{ padding: '0.85rem 0.5rem', color: '#475569', fontWeight: 700, textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const unpaidCount = user.invoices.length;
                const hasExitRequest = user.exitRequests && user.exitRequests.length > 0;
                const exitReq = hasExitRequest ? user.exitRequests[0] : null;
                const voteInfo = exitReq?.votingEventId ? votingMap[exitReq.votingEventId] : null;

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 0.5rem' }}>{index + 1}</td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>{user.nameBn || user.name}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#4b5563' }}>{user.role}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#4b5563' }}>{user.mobile}</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {unpaidCount >= 4 ? (
                        <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <AlertCircle size={12} /> {unpaidCount} মাস বকেয়া
                        </span>
                      ) : unpaidCount > 0 ? (
                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {unpaidCount} মাস বকেয়া
                        </span>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>পরিশোধিত</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {hasExitRequest ? (
                        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>পদত্যাগ আবেদনকৃত</span>
                      ) : user.activeStatus ? (
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>সক্রিয়</span>
                      ) : (
                        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>স্থগিত</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.35rem', alignItems: 'center' }}>
                      
                      {/* 1. View / Print Form Icon Button */}
                      <Link 
                        href={`/dashboard/admin/members/${user.id}/print-form`}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "0.5rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(2, 132, 199, 0.1)",
                          color: "#0284c7",
                          border: "1px solid rgba(2, 132, 199, 0.25)",
                          textDecoration: "none"
                        }}
                        title="সদস্য ফরম দেখুন ও প্রিন্ট করুন (View & Print)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </Link>

                      {/* 2. Edit Member Icon Button */}
                      <Link 
                        href={`/dashboard/admin/members/${user.id}/edit`}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "0.5rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          color: "#d97706",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          textDecoration: "none"
                        }}
                        title="মেম্বার তথ্য এডিট করুন (Edit Member)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                      </Link>

                      {/* 3. President / Admin Suspend Toggle Icon Button */}
                      {(role === "PRESIDENT" || role === "ADMIN") && (
                        <SuspendMemberButton userId={user.id} activeStatus={user.activeStatus} unpaidMonths={unpaidCount} />
                      )}

                      {/* Exit Approval Modal for President */}
                      {hasExitRequest && exitReq && (role === "ADMIN" || role === "PRESIDENT") && (
                        <PresidentExitApprovalModal
                          exitRequestId={exitReq.id}
                          userName={user.nameBn || user.name}
                          userBalance={user.balance}
                          joinDate={user.joinDate.toISOString()}
                          has75PercentVotes={voteInfo?.has75Percent || false}
                          yesVotePercentage={voteInfo?.percentage || 0}
                        />
                      )}

                      {/* 4. Delete Member Icon Button */}
                      {!hasExitRequest && (
                        <DeleteMemberButton userId={user.id} userName={user.name} currentUserRole={role} />
                      )}

                      {role === "ADMIN" && (
                        <ResetPasswordModal user={user} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    কোনো মেম্বার পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
