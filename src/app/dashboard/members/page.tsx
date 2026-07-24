import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users, User, Phone, Calendar, Mail } from "lucide-react";
import Link from "next/link";

const roleTitles: Record<string, string> = {
  CONTROLLER: "কন্ট্রোলার",
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সদস্য",
};

const roleOrderMap: Record<string, number> = {
  CONTROLLER: 1,
  PRESIDENT: 2,
  SECRETARY: 3,
  CASHIER: 4,
  ADMIN: 5,
  MEMBER: 6,
};

export default async function MembersGalleryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch club settings & all active members
  const [settings, members] = await Promise.all([
    (prisma as any).clubSettings.findUnique({
      where: { id: "singleton" }
    }).catch(() => null),
    prisma.user.findMany({
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
        lastActiveAt: true,
      },
    })
  ]);

  const noCommitteeMode = settings?.noCommitteeMode ?? false;

  // Sort: Committee/Controller first, then general Members
  const sortedMembers = [...members].sort((a, b) => {
    const orderA = roleOrderMap[a.role] || 99;
    const orderB = roleOrderMap[b.role] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name, 'bn');
  });

  const nowMs = new Date().getTime();

  return (
    <div style={{ padding: '1.5rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <Users size={32} color="var(--primary)" /> সদস্যবৃন্দ (Members)
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
            {noCommitteeMode ? "⚡ অন্তরবর্তীকালীন সময়ে ক্লাবের সম্মানিত সদস্যবৃন্দ (কমিটি স্থগিত)" : "ইউনাইটেড ভিশন ক্লাবের সম্মানিত সকল সক্রিয় সদস্যবৃন্দ"}
          </p>
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
          // Calculate Online status (Logged in now or active in last 15 mins)
          const isOnline = member.id === session.user.id || Boolean(
            member.lastActiveAt && (nowMs - new Date(member.lastActiveAt).getTime() < 15 * 60 * 1000)
          );

          // If noCommitteeMode is active: only CONTROLLER / ADMIN retain leadership title, all others show as 'সদস্য'
          const effectiveRole = noCommitteeMode 
            ? (member.role === 'CONTROLLER' || member.role === 'ADMIN' ? member.role : 'MEMBER')
            : member.role;

          const isController = effectiveRole === 'CONTROLLER';
          const isLeader = effectiveRole !== 'MEMBER';
          const displayRoleTitle = roleTitles[effectiveRole] || 'সদস্য';

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
                border: isController ? '2px solid #ea580c' : isLeader ? '1.5px solid rgba(15, 103, 61, 0.25)' : '1px solid var(--border)',
                boxShadow: isController ? '0 10px 25px -5px rgba(234, 88, 12, 0.15)' : isLeader ? '0 10px 25px -5px rgba(15, 103, 61, 0.08)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Highlight ribbon */}
              {isLeader && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: isController ? 'rgba(234, 88, 12, 0.12)' : 'rgba(15, 103, 61, 0.1)',
                  color: isController ? '#c2410c' : 'var(--primary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: isController ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(15, 103, 61, 0.2)'
                }}>
                  {isController ? "কন্ট্রোলার" : "কমিটি"}
                </div>
              )}

              {/* Profile Image Container */}
              <div style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '50%', 
                backgroundColor: '#f3f4f6', 
                marginBottom: '1.25rem', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '3px solid white',
                position: 'relative'
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                  {member.profilePicture ? (
                    <img 
                      src={member.profilePicture} 
                      alt={member.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: isController ? 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' : 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)', 
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

                {/* Glowing Green Online Indicator Dot */}
                {isOnline && (
                  <div 
                    title="অনলাইনে আছেন (Online Active)"
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#22c55e',
                      border: '3px solid white',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(34, 197, 94, 0.9)',
                      zIndex: 5
                    }}
                  />
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
                background: isController ? '#ffedd5' : 
                            effectiveRole === 'PRESIDENT' ? 'rgba(239, 68, 68, 0.08)' : 
                            effectiveRole === 'SECRETARY' ? 'rgba(59, 130, 246, 0.08)' : 
                            effectiveRole === 'CASHIER' ? 'rgba(245, 158, 11, 0.08)' : 
                            effectiveRole === 'ADMIN' ? 'rgba(107, 114, 128, 0.08)' : '#f1f5f9',
                color: isController ? '#c2410c' : 
                       effectiveRole === 'PRESIDENT' ? '#dc2626' : 
                       effectiveRole === 'SECRETARY' ? '#2563eb' : 
                       effectiveRole === 'CASHIER' ? '#d97706' : 
                       effectiveRole === 'ADMIN' ? '#4b5563' : '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                marginBottom: '1rem',
                border: isController ? '1px solid #fed7aa' : 
                        effectiveRole === 'PRESIDENT' ? '1px solid rgba(239, 68, 68, 0.15)' : 
                        effectiveRole === 'SECRETARY' ? '1px solid rgba(59, 130, 246, 0.15)' : '#cbd5e1'
              }}>
                {displayRoleTitle}
              </span>

              {/* Online status text pill */}
              {isOnline && (
                <span style={{ fontSize: '0.725rem', color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span> অনলাইনে আছেন
                </span>
              )}

              {/* Contact Information */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Phone size={14} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>{member.mobile}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
