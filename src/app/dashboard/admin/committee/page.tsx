import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Phone, User as UserIcon, Award, Sparkles } from "lucide-react";
import { InterimModeToggle, CheckboxRoleAssignForm, RemoveCommitteeButton, PrintCommitteeButton } from "./CommitteeComponents";

export default async function CommitteeManagePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CONTROLLER") {
    redirect("/dashboard");
  }

  // 1. Fetch club settings & all members
  const [settings, committeeMembers, allMembers] = await Promise.all([
    (prisma as any).clubSettings.findUnique({
      where: { id: "singleton" }
    }).catch(() => null),
    prisma.user.findMany({
      where: { 
        committeeRole: { isNot: null }, 
        isDeleted: false,
        activeStatus: true 
      },
      include: {
        committeeRole: true
      }
    }),
    prisma.user.findMany({
      where: {
        isDeleted: false,
        activeStatus: true
      },
      select: { id: true, name: true, nameBn: true, mobile: true },
      orderBy: { name: 'asc' }
    })
  ]);

  const noCommitteeMode = settings?.noCommitteeMode ?? false;

  // 2. Sort committee members by executive hierarchy
  const roleOrder: Record<string, number> = {
    'CONTROLLER': 1,
    'PRESIDENT': 2,
    'SECRETARY': 3,
    'CASHIER': 4,
    'ADMIN': 5,
    'MEMBER': 6
  };

  const sortedCommittee = [...committeeMembers].sort((a, b) => {
    const orderA = roleOrder[a.role] || 99;
    const orderB = roleOrder[b.role] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'bn');
  });

  const getRoleName = (r: string) => {
    if (r === 'CONTROLLER') return 'কন্ট্রোলার (অন্তরবর্তীকালীন)';
    if (r === 'PRESIDENT') return 'সভাপতি';
    if (r === 'SECRETARY') return 'সাধারণ সম্পাদক';
    if (r === 'CASHIER') return 'ক্যাশিয়ার';
    if (r === 'ADMIN') return 'অ্যাডমিন';
    return 'সদস্য';
  };

  const canManage = role === "ADMIN" || role === "PRESIDENT" || role === "CONTROLLER";

  return (
    <div style={{ padding: '1.5rem', maxWidth: '84rem', margin: '0 auto' }}>
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

      <header style={{ marginBottom: '1.5rem' }} className="no-print">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--foreground)' }}>
          <ShieldCheck size={28} color="var(--primary)" /> পরিচালনা কমিটি ও পদবী ব্যবস্থাপনা
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.2rem' }}>
          কার্যনির্বাহী কমিটি গঠন, টিকমার্কের মাধ্যমে রোল প্রদান এবং অন্তরবর্তীকালীন মোড নিয়ন্ত্রণ।
        </p>
      </header>

      {/* 1. Interim No-Committee Mode Banner & Toggle */}
      {canManage && (
        <div className="no-print">
          <InterimModeToggle initialMode={noCommitteeMode} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: canManage ? '2.2fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Committee Members Table */}
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }} id="print-area">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                {noCommitteeMode ? "⚡ অন্তরবর্তীকালীন পরিচালনা প্যানেল" : "বর্তমান কমিটি সদস্যগণ"}
              </h2>
              {noCommitteeMode && (
                <span style={{ fontSize: "0.75rem", color: "#c2410c", fontWeight: 700 }}>
                  (অন্তরবর্তীকালীন সময়ে নির্বাচিত কমিটি স্থগিত)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="no-print">
              <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
                মোট পরিচালনা সদস্য: {sortedCommittee.length} জন
              </span>
              <PrintCommitteeButton />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
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
                      কোনো পদবী বা রোল নিযুক্ত করা হয়নি।
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
                            <span style={{ fontSize: '0.78rem', color: (noCommitteeMode && user.role !== 'CONTROLLER' && user.role !== 'ADMIN') ? '#64748b' : user.role === 'CONTROLLER' ? '#c2410c' : 'var(--primary)', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                              {noCommitteeMode ? (user.role === 'CONTROLLER' ? 'কন্ট্রোলার (অন্তরবর্তীকালীন)' : 'সদস্য (কমিটি স্থগিত)') : (user.committeeRole?.designation || getRoleName(user.role))}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          padding: '0.25rem 0.65rem', 
                          borderRadius: '9999px',
                          backgroundColor: (noCommitteeMode && user.role !== 'CONTROLLER' && user.role !== 'ADMIN') ? '#f1f5f9' : user.role === 'CONTROLLER' ? '#ffedd5' : user.role === 'PRESIDENT' ? '#ecfdf5' : user.role === 'SECRETARY' ? '#eff6ff' : user.role === 'CASHIER' ? '#fffbeb' : '#f1f5f9',
                          color: (noCommitteeMode && user.role !== 'CONTROLLER' && user.role !== 'ADMIN') ? '#64748b' : user.role === 'CONTROLLER' ? '#c2410c' : user.role === 'PRESIDENT' ? '#047857' : user.role === 'SECRETARY' ? '#1d4ed8' : user.role === 'CASHIER' ? '#b45309' : '#475569',
                          border: `1px solid ${(noCommitteeMode && user.role !== 'CONTROLLER' && user.role !== 'ADMIN') ? '#cbd5e1' : user.role === 'CONTROLLER' ? '#fed7aa' : user.role === 'PRESIDENT' ? '#a7f3d0' : user.role === 'SECRETARY' ? '#bfdbfe' : user.role === 'CASHIER' ? '#fde68a' : '#cbd5e1'}`
                        }}>
                          {noCommitteeMode ? (user.role === 'CONTROLLER' ? 'কন্ট্রোলার' : 'সদস্য') : getRoleName(user.role)}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} color="#9ca3af" />
                          <span>{user.mobile}</span>
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

        {/* Right Column: Checkbox Role Assignment Form */}
        {canManage && (
          <div className="no-print">
            <CheckboxRoleAssignForm members={allMembers} />
          </div>
        )}

      </div>
    </div>
  );
}
