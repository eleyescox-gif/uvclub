import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users, UserCircle } from "lucide-react";

const roleTitles: Record<string, string> = {
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
};

export default async function CommitteePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch users who are part of the committee (not just MEMBER or EX_MEMBER)
  const committeeMembers = await prisma.user.findMany({
    where: {
      role: {
        in: ["PRESIDENT", "SECRETARY", "CASHIER", "ADMIN"]
      },
      activeStatus: true,
      isDeleted: false
    },
    select: {
      id: true,
      name: true,
      nameBn: true,
      nameEn: true,
      profilePicture: true,
      role: true,
      mobile: true,
      createdAt: true
    },
    orderBy: {
      role: 'asc' // Simple sort, ideally we'd want custom sort order for President > Secretary > Cashier > Admin
    }
  });

  // Custom sort to prioritize roles correctly
  const roleOrder = ["PRESIDENT", "SECRETARY", "CASHIER", "ADMIN"];
  committeeMembers.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Users size={28} color="var(--primary)" /> কার্যকরী কমিটি
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>ক্লাবের বর্তমান কার্যকরী কমিটির সদস্যবৃন্দ</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {committeeMembers.length > 0 ? (
          committeeMembers.map(member => (
            <div key={member.id} className="glass" style={{ padding: '2rem 1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.2) 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', overflow: 'hidden' }}>
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                ) : (
                  <UserCircle size={48} color="var(--primary)" />
                )}
              </div>
              
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>
                {member.nameBn || member.nameEn || member.name}
              </h2>
              
              <div style={{ margin: '0.75rem 0' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 1rem', 
                  borderRadius: '9999px', 
                  background: member.role === 'PRESIDENT' ? 'rgba(239, 68, 68, 0.1)' : member.role === 'SECRETARY' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: member.role === 'PRESIDENT' ? 'var(--danger)' : member.role === 'SECRETARY' ? '#3b82f6' : 'var(--success)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  {roleTitles[member.role] || member.role}
                </span>
              </div>
              
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                যোগাযোগ: {member.mobile}
              </p>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            আপাতত কোনো কমিটি মেম্বার নেই।
          </div>
        )}
      </div>
    </div>
  );
}
