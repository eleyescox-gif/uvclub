import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { CreateNoticeForm, DeleteNoticeButton } from "./NoticeComponents";
import { Megaphone, Calendar, UserCheck } from "lucide-react";

export default async function NoticesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const isAuthorizedLeader = role === "SECRETARY" || role === "PRESIDENT" || role === "CASHIER" || role === "ADMIN" || role === "CONTROLLER";

  // Fetch active notices
  const notices = await prisma.notice.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch notice creators details
  const creatorIds = notices.map(n => n.createdBy);
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, name: true, nameBn: true, role: true }
  });

  const creatorsMap: Record<string, typeof creators[0]> = {};
  creators.forEach(c => {
    creatorsMap[c.id] = c;
  });

  const roleTitles: Record<string, string> = {
    PRESIDENT: "সভাপতি",
    SECRETARY: "সাধারণ সম্পাদক",
    CASHIER: "ক্যাশিয়ার",
    ADMIN: "অ্যাডমিন",
    MEMBER: "সাধারণ সদস্য",
  };

  return (
    <div style={{ padding: '1.5rem 0', maxWidth: '42rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Megaphone size={28} color="var(--primary)" /> নোটিশ বোর্ড (Notices)
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.15rem' }}>ইউনাইটেড ভিশন ক্লাবের সর্বশেষ নোটিশ ও নির্দেশনাসমূহ</p>
        </div>
        {isAuthorizedLeader && (
          <CreateNoticeForm />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {notices.length === 0 ? (
          <div className="glass" style={{ padding: '3rem 2rem', borderRadius: '1.25rem', textAlign: 'center', color: '#6b7280' }}>
            <Megaphone size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>আপাতত কোনো সক্রিয় নোটিশ নেই।</p>
          </div>
        ) : (
          notices.map((notice) => {
            const author = creatorsMap[notice.createdBy];
            const authorName = author?.nameBn || author?.name || "ক্লাব কর্তৃপক্ষ";
            const authorRole = roleTitles[author?.role || "MEMBER"] || "সদস্য";

            return (
              <div 
                key={notice.id} 
                className="glass" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '1.25rem', 
                  border: '1px solid var(--border)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.25s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0, lineHeight: 1.3 }}>
                    {notice.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8792a2', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <Calendar size={13} /> {new Date(notice.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {isAuthorizedLeader && (
                      <DeleteNoticeButton noticeId={notice.id} />
                    )}
                  </div>
                </div>

                <p style={{ 
                  color: 'var(--foreground)', 
                  lineHeight: 1.6, 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.95rem', 
                  margin: 0,
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '1rem'
                }}>
                  {notice.content}
                </p>

                {/* Author Name and Designation at the bottom */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.8rem', 
                  color: '#475569', 
                  fontWeight: 700,
                  alignSelf: 'flex-end'
                }}>
                  <UserCheck size={14} style={{ color: 'var(--primary)' }} />
                  <span>প্রচারকারী: {authorName} ({authorRole})</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
