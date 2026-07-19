import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users, User, Phone, Calendar, Mail } from "lucide-react";
import Link from "next/link";

const roleTitles: Record<string, string> = {
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সাধারণ সদস্য",
};

const roleOrderMap: Record<string, number> = {
  PRESIDENT: 1,
  SECRETARY: 2,
  CASHIER: 3,
  ADMIN: 4,
  MEMBER: 5,
};

export default async function MembersGalleryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all active and non-deleted members
  const members = await prisma.user.findMany({
    where: {
      activeStatus: true,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      nameBn: true,
      nameEn: true,
      mobile: true,
      profilePicture: true,
      role: true,
      joinDate: true,
    },
  });

  // Sort: Committee first (President, Secretary, Cashier, Admin) then general Members
  const sortedMembers = [...members].sort((a, b) => {
    const orderA = roleOrderMap[a.role] || 99;
    const orderB = roleOrderMap[b.role] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name, 'bn');
  });

  return (
    <div style={{ padding: '1.5rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <Users size={32} color="var(--primary)" /> সদস্যবৃন্দ (Members)
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>ইউনাইটেড ভিশন ক্লাবের সম্মানিত সকল সক্রিয় সদস্যবৃন্দ</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            ড্যাশবোর্ড
          </Link>
        </div>
      </header>

      {/* Gallery Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '2rem' 
      }}>
        {sortedMembers.map((member) => {
          const isCommittee = member.role !== 'MEMBER';
          const roleTitle = roleTitles[member.role] || member.role;

          return (
            <div 
              key={member.id} 
              className="glass" 
              style={{ 
                borderRadius: '1.25rem', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '2rem 1.5rem',
                textAlign: 'center',
                border: isCommittee ? '1.5px solid rgba(15, 103, 61, 0.25)' : '1px solid var(--border)',
                boxShadow: isCommittee ? '0 10px 25px -5px rgba(15, 103, 61, 0.08)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Highlight ribbon for Committee members */}
              {isCommittee && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(15, 103, 61, 0.1)',
                  color: 'var(--primary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(15, 103, 61, 0.2)'
                }}>
                  কমিটি
                </div>
              )}

              {/* Profile Image Container */}
              <div style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '1rem', 
                overflow: 'hidden', 
                backgroundColor: '#f3f4f6', 
                marginBottom: '1.25rem', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '3px solid white'
              }}>
                {member.profilePicture ? (
                  <img 
                    src={member.profilePicture} 
                    alt={member.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700
                  }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Names */}
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 0.75rem 0' }}>
                {member.nameBn || member.name}
              </h3>

              {/* Role Title Badge */}
              <span style={{ 
                display: 'inline-block',
                padding: '0.35rem 1rem', 
                borderRadius: '9999px', 
                background: member.role === 'PRESIDENT' ? 'rgba(239, 68, 68, 0.08)' : 
                            member.role === 'SECRETARY' ? 'rgba(59, 130, 246, 0.08)' : 
                            member.role === 'CASHIER' ? 'rgba(245, 158, 11, 0.08)' : 
                            member.role === 'ADMIN' ? 'rgba(107, 114, 128, 0.08)' : 'rgba(243, 244, 246, 1)',
                color: member.role === 'PRESIDENT' ? '#dc2626' : 
                       member.role === 'SECRETARY' ? '#2563eb' : 
                       member.role === 'CASHIER' ? '#d97706' : 
                       member.role === 'ADMIN' ? '#4b5563' : '#6b7280',
                fontWeight: 600,
                fontSize: '0.8rem',
                marginBottom: '1rem',
                border: member.role === 'PRESIDENT' ? '1px solid rgba(239, 68, 68, 0.15)' : 
                        member.role === 'SECRETARY' ? '1px solid rgba(59, 130, 246, 0.15)' : 
                        member.role === 'CASHIER' ? '1px solid rgba(245, 158, 11, 0.15)' : 'none'
              }}>
                {roleTitle}
              </span>

              {/* Extra details with small icons */}
              <div style={{ width: '100%', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  <Phone size={12} style={{ color: '#9ca3af' }} />
                  <span>{member.mobile}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <Calendar size={11} />
                  <span>যোগদান: {new Date(member.joinDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
