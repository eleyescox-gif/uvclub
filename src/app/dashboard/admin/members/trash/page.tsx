import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { hardDeleteMember, restoreMember } from "@/actions/members";

export default async function TrashPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    redirect("/dashboard/admin/members/manage");
  }

  // Lazy cleanup: Find members deleted more than 30 days ago and hard delete them
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const expiredUsers = await prisma.user.findMany({
    where: {
      isDeleted: true,
      deletedAt: {
        lt: thirtyDaysAgo
      }
    }
  });

  for (const expUser of expiredUsers) {
    await hardDeleteMember(expUser.id);
  }

  // Fetch remaining soft-deleted users
  const deletedUsers = await prisma.user.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: "desc" }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard/admin/members/manage" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> ফিরে যান
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>ট্র্যাশ (Trash Bin)</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>ডিলিট হওয়া মেম্বাররা ৩০ দিন পর অটোমেটিক মুছে যাবে</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>নাম</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>মোবাইল</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>ডিলিট করার তারিখ</th>
                <th style={{ padding: '1rem 0.5rem', color: '#6b7280', fontWeight: 500, textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((user) => {
                const deletedDate = user.deletedAt ? new Date(user.deletedAt) : new Date();
                const daysLeft = Math.max(0, 30 - Math.floor((new Date().getTime() - deletedDate.getTime()) / (1000 * 3600 * 24)));
                
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: '#4b5563' }}>{user.mobile}</td>
                    <td style={{ padding: '1rem 0.5rem', color: '#4b5563' }}>
                      {deletedDate.toLocaleDateString('bn-BD')}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444' }}>আর {daysLeft} দিন পর মুছে যাবে</span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <form action={async () => {
                        "use server";
                        await restoreMember(user.id);
                      }}>
                        <button type="submit" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', borderColor: 'var(--success)' }}>
                          <RefreshCw size={14} /> রিস্টোর
                        </button>
                      </form>

                      <form action={async () => {
                        "use server";
                        await hardDeleteMember(user.id);
                      }}>
                        <button type="submit" className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Trash2 size={14} /> স্থায়ী ডিলিট
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {deletedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    ট্র্যাশে কোনো মেম্বার নেই
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
