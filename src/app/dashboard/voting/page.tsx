import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PollOptionList, ClosePollButton, CreateGeneralPollForm, DeletePollButton } from "./VotingComponents";
import { PieChart, Users, Award, Clock } from "lucide-react";

export default async function VotingEnginePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const isAdmin = role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY";

  // Fetch active members
  const members = await prisma.user.findMany({
    where: { activeStatus: true, isDeleted: false },
    select: { id: true, name: true, nameBn: true, profilePicture: true }
  });

  // Fetch all polls
  const polls = await prisma.votingEvent.findMany({
    include: {
      options: {
        include: {
          votes: true,
          candidate: true
        }
      },
      votes: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '48rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <PieChart size={28} color="var(--primary)" /> ভোটিং ইঞ্জিন
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>ক্লাবের গুরুত্বপূর্ণ সিদ্ধান্তে আপনার মতামত দিন</p>
      </header>

      {isAdmin && <CreateGeneralPollForm members={members} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {polls.length > 0 ? (
          polls.map(poll => {
            const userHasVoted = poll.votes.some(v => v.userId === userId);
            const totalVotes = poll.votes.length;
            const isClosed = poll.status !== 'OPEN';

            // Find Winner
            let winner: any = null;
            if (isClosed && poll.options.length > 0) {
              winner = poll.options.reduce((prev, current) => (prev.votes.length > current.votes.length) ? prev : current);
            }

            const formattedOptions = poll.options.map(opt => ({
              id: opt.id,
              text: opt.text,
              voteCount: opt.votes.length,
              candidate: opt.candidate
            }));

            // Sort options by voteCount if closed
            if (isClosed) {
              formattedOptions.sort((a, b) => b.voteCount - a.voteCount);
            }

            return (
              <div key={poll.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: poll.status === 'OPEN' ? 'rgba(59,130,246,0.1)' : poll.status === 'PASSED' || poll.status === 'CLOSED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: poll.status === 'OPEN' ? '#3b82f6' : poll.status === 'PASSED' || poll.status === 'CLOSED' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {poll.status === 'OPEN' ? 'চলমান (Open)' : poll.status}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>{poll.title}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                    {isAdmin && poll.status === 'OPEN' && (
                      <ClosePollButton pollId={poll.id} />
                    )}
                    {(role === "PRESIDENT" || role === "ADMIN") && (
                      <DeletePollButton pollId={poll.id} />
                    )}
                  </div>
                </div>

                <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {poll.description}
                </p>

                {/* Winner Banner */}
                {isClosed && winner && winner.votes.length > 0 && (
                  <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '2px solid #fbbf24', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.2)' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#d97706', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Award size={24} /> অভিনন্দন! 
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
                      এই পোলে সর্বাধিক ভোট পেয়ে বিজয়ী হয়েছেন:
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e', marginTop: '0.5rem' }}>
                      {winner.text}
                    </p>
                  </div>
                )}

                <PollOptionList 
                  pollId={poll.id} 
                  options={formattedOptions} 
                  totalVotes={totalVotes} 
                  userHasVoted={userHasVoted} 
                  isClosed={isClosed} 
                />

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={14} /> মোট কাস্ট হওয়া ভোট: {totalVotes}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> শেষ সময়: {poll.deadline ? new Date(poll.deadline).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'অনির্ধারিত'}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            আপাতত কোনো পোল বা ভোটিং চলছে না।
          </div>
        )}
      </div>
    </div>
  );
}
