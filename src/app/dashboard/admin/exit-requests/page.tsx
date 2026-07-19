import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RequestExitForm, CreatePollButton } from "./ExitRequestForms";
import { UserMinus } from "lucide-react";

export default async function AdminExitRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    redirect("/dashboard");
  }

  // Active members for Secretary to select
  const activeMembers = await prisma.user.findMany({
    where: { activeStatus: true },
    select: { id: true, name: true, mobile: true },
    orderBy: { name: 'asc' }
  });

  // Fetch pending and poll_created requests
  const exitRequests = await prisma.exitRequest.findMany({
    where: { status: { in: ["PENDING", "POLL_CREATED", "APPROVED", "REJECTED"] } },
    include: {
      user: {
        select: { name: true, createdAt: true, balance: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>সদস্যপদ বাতিল ব্যবস্থাপনা</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>সদস্যপদ বাতিলের আবেদন এবং পোল তৈরি</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Secretary View: Create Request */}
        {(role === "SECRETARY" || role === "ADMIN") && (
          <RequestExitForm members={activeMembers} />
        )}

        {/* President / General Admin View: Manage Requests */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>আবেদনসমূহ</h2>
          
          {exitRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {exitRequests.map(req => {
                const isUnder5Years = (Date.now() - new Date(req.user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25) < 5;
                const penaltyInfo = isUnder5Years ? '১৫% কর্তন' : '৫% কর্তন';

                return (
                  <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <UserMinus size={18} color="var(--primary)" />
                        <h3 style={{ fontWeight: 600 }}>{req.user.name}</h3>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: req.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : req.status === 'POLL_CREATED' ? 'rgba(59,130,246,0.1)' : req.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: req.status === 'PENDING' ? 'var(--warning)' : req.status === 'POLL_CREATED' ? '#3b82f6' : req.status === 'APPROVED' ? 'var(--success)' : 'var(--danger)' }}>
                          {req.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>কারণ: {req.reason}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>বর্তমান ব্যালেন্স: ৳ {req.user.balance} (সম্ভাব্য কর্তন: {penaltyInfo})</p>
                    </div>

                    {(role === "PRESIDENT" || role === "ADMIN") && req.status === "PENDING" && (
                      <div>
                        <CreatePollButton requestId={req.id} memberName={req.user.name} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>কোনো আবেদন নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}
