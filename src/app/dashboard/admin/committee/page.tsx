import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Phone, User as UserIcon, Award } from "lucide-react";
import { CommitteeSelectForm, RemoveCommitteeButton, PrintCommitteeButton } from "./CommitteeComponents";

export default async function CommitteeManagePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  // 1. Fetch current committee members (users with a committeeRole entry)
  const committeeMembers = await prisma.user.findMany({
    where: { 
      committeeRole: { isNot: null }, 
      isDeleted: false,
      activeStatus: true 
    },
    include: {
      committeeRole: true
    }
  });

  // 2. Fetch general members who are not currently in the committee
  const generalMembers = await prisma.user.findMany({
    where: {
      committeeRole: null,
      isDeleted: false,
      activeStatus: true
    },
    select: { id: true, name: true, nameBn: true, mobile: true },
    orderBy: { name: 'asc' }
  });

  // 3. Sort committee members by executive hierarchy
  const roleOrder: Record<string, number> = {
    'PRESIDENT': 1,
    'SECRETARY': 2,
    'CASHIER': 3,
    'ADMIN': 4,
    'MEMBER': 5
  };

  const sortedCommittee = [...committeeMembers].sort((a, b) => {
    const orderA = roleOrder[a.role] || 99;
    const orderB = roleOrder[b.role] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'bn');
  });

  const getRoleName = (r: string) => {
    if (r === 'PRESIDENT') return 'সভাপতি';
    if (r === 'SECRETARY') return 'সাধারণ সম্পাদক';
    if (r === 'CASHIER') return 'ক্যাশিয়ার';
    if (r === 'ADMIN') return 'অ্যাডমিন';
    return 'সদস্য';
  };

  const canManage = role === "ADMIN" || role === "PRESIDENT";

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '84rem', margin: '0 auto' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 1.5rem !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <header style={{ marginBottom: '2.5rem' }} className="no-print">
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--foreground)' }}>
          <ShieldCheck size={28} color="var(--primary)" /> পরিচালনা কমিটি (Committee)
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.2rem' }}>ক্লাবের কার্যনির্বাহী পরিষদ এবং সদস্য নির্বাচন ব্যবস্থাপনা।</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: canManage ? '2.2fr 1fr' : '1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Committee Members Table */}
        <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }} id="print-area">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>বর্তমান কমিটি সদস্যগণ</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="no-print">
              <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
                মোট সদস্য: {sortedCommittee.length} জন
              </span>
              <PrintCommitteeButton />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>নাম ও পদবি</th>
                  <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>সিস্টেম রোল</th>
                  <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>মোবাইল নম্বর</th>
                  {canManage && <th className="no-print" style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '12%' }}>অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody>
                {sortedCommittee.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 4 : 3} style={{ padding: '4rem 1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                      <Award size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                      কোনো কমিটি সদস্য নিযুক্ত করা হয়নি।
                    </td>
                  </tr>
                ) : (
                  sortedCommittee.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', overflow: 'hidden' }}>
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <UserIcon size={20} />
                            )}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                              {user.nameBn || user.name}
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                              কমিটি পদ: {user.committeeRole?.designation || 'সদস্য'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: user.role === 'PRESIDENT' ? '#1e3a8a' : (user.role === 'SECRETARY' ? '#0f766e' : '#0369a1'), 
                          backgroundColor: user.role === 'PRESIDENT' ? '#dbeafe' : (user.role === 'SECRETARY' ? '#ccfbf1' : '#e0f2fe'), 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '9999px', 
                          fontWeight: 800 
                        }}>
                          {getRoleName(user.role)} ({user.role})
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                          <Phone size={13} /> {user.mobile}
                        </div>
                      </td>
                      {canManage && (
                        <td className="no-print" style={{ padding: '1rem' }}>
                          <RemoveCommitteeButton userId={user.id} userName={user.nameBn || user.name} />
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Member Selection form (Visible to ADMIN and PRESIDENT only) */}
        {canManage && (
          <div className="no-print">
            <CommitteeSelectForm members={generalMembers} />
          </div>
        )}

      </div>
    </div>
  );
}
