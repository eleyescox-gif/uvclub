import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResetPasswordModal from "./ResetPasswordModal";
import DeleteMemberButton from "./DeleteMemberButton";

export default async function ManageMembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { name: "asc" },
    include: {
      exitRequests: {
        where: { status: "PENDING" },
        take: 1
      }
    }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> ফিরে যান
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>মেম্বার ম্যানেজমেন্ট</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>সদস্যদের পাসওয়ার্ড রিসেট করুন</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <Link href="/dashboard/admin/members/print-list" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            প্রিন্ট তালিকা
          </Link>
          {(role === "ADMIN" || role === "PRESIDENT") && (
            <Link href="/dashboard/admin/members/trash" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#ef4444', borderColor: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              ট্র্যাশ (Trash)
            </Link>
          )}
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>ক্রমিক</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>নাম</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>পদবী</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>মোবাইল</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>স্ট্যাটাস</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500, textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>{index + 1}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '1rem 0.5rem', color: '#4b5563' }}>{user.role}</td>
                  <td style={{ padding: '1rem 0.5rem', color: '#4b5563' }}>{user.mobile}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    {user.exitRequests && user.exitRequests.length > 0 ? (
                      <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Deletion Pending</span>
                    ) : user.activeStatus ? (
                      <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                    ) : (
                      <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link 
                      href={`/dashboard/admin/members/${user.id}/print-form`}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                      title="ফরম প্রিন্ট করুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                      প্রিন্ট
                    </Link>
                    
                    <Link 
                      href={`/dashboard/admin/members/${user.id}/edit`}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: '#0284c7', borderColor: '#0284c7' }}
                      title="এডিট করুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      এডিট
                    </Link>

                    {user.exitRequests && user.exitRequests.length > 0 && (role === "ADMIN" || role === "PRESIDENT") ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <form action={async () => {
                          "use server";
                          const { approveExitRequest } = await import('@/actions/members');
                          await approveExitRequest(user.exitRequests[0].id);
                        }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#10b981', borderColor: '#10b981' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            অ্যাপ্রুভ
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          const { rejectExitRequest } = await import('@/actions/members');
                          await rejectExitRequest(user.exitRequests[0].id);
                        }}>
                          <button type="submit" className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            রিজেক্ট
                          </button>
                        </form>
                      </div>
                    ) : (
                      <DeleteMemberButton userId={user.id} userName={user.name} currentUserRole={role} />
                    )}

                    {role === "ADMIN" && (
                      <ResetPasswordModal user={user} />
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
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
