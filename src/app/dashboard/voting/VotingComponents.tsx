"use client";

import { useState } from "react";
import { castVote, closePoll, createPoll, deletePoll } from "@/actions/voting";

import { CheckCircle2, Circle, Check } from "lucide-react";

export function PollOptionList({ 
  pollId, 
  options, 
  totalVotes, 
  userHasVoted,
  userVotedOptionId,
  isClosed 
}: { 
  pollId: string, 
  options: { 
    id: string, 
    text: string, 
    voteCount: number,
    candidate?: {
      name: string;
      nameBn: string | null;
      profilePicture: string | null;
    } | null
  }[], 
  totalVotes: number, 
  userHasVoted: boolean,
  userVotedOptionId?: string | null,
  isClosed: boolean 
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(userVotedOptionId || null);

  const handleVote = async (optionId: string) => {
    if (userHasVoted || isClosed || loading) return;
    if (!window.confirm("আপনি কি এই অপশনে ভোট দিতে চান? (ভোট পরিবর্তনযোগ্য নয়)")) return;
    
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("pollId", pollId);
    formData.append("optionId", optionId);

    const result = await castVote(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setSelectedOptionId(optionId);
      setMessage({ type: "success", text: "আপনার ভোট সফলভাবে গ্রহণ করা হয়েছে।" });
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
      {options.map((opt) => {
        const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
        const canClick = !userHasVoted && !isClosed && !loading;
        const isSelected = selectedOptionId === opt.id; 

        return (
          <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              
              {/* Option Pill */}
              <div 
                onClick={() => canClick && handleVote(opt.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '999px',
                  border: `1.5px solid ${isSelected ? '#059669' : '#e5e7eb'}`,
                  backgroundColor: isSelected ? '#ecfdf5' : 'transparent',
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { if (canClick && !isSelected) e.currentTarget.style.borderColor = '#10b981'; }}
                onMouseLeave={(e) => { if (canClick && !isSelected) e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                {isSelected ? (
                  <CheckCircle2 size={18} color="#059669" fill="#d1fae5" />
                ) : (
                  <Circle size={18} color="#9ca3af" />
                )}
                {opt.candidate ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {opt.candidate.profilePicture ? (
                      <img src={opt.candidate.profilePicture} alt={opt.candidate.nameBn || opt.candidate.name} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e5e7eb', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                        {(opt.candidate.nameBn || opt.candidate.name).charAt(0)}
                      </div>
                    )}
                    <span style={{ 
                      fontWeight: isSelected ? 700 : 500, 
                      color: isSelected ? '#064e3b' : 'var(--foreground)',
                      fontSize: '0.9rem' 
                    }}>
                      {opt.candidate.nameBn || opt.candidate.name}
                    </span>
                  </div>
                ) : (
                  <span style={{ 
                    fontWeight: isSelected ? 700 : 500, 
                    color: isSelected ? '#064e3b' : 'var(--foreground)',
                    fontSize: '0.9rem' 
                  }}>
                    {opt.text}
                  </span>
                )}
              </div>

              {/* Stats (Visible ONLY when Poll is Closed) */}
              {isClosed && (
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 700, 
                  color: '#4b5563',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap'
                }}>
                  {percentage}% / {String(opt.voteCount).padStart(2, '0')} জন
                </div>
              )}
            </div>

            {/* Progress Bar (Visible ONLY when Poll is Closed) */}
            {isClosed && (
              <div style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '99px',
                overflow: 'hidden',
                marginTop: '0.15rem'
              }}>
                <div style={{ 
                  width: `${percentage}%`, 
                  height: '100%', 
                  backgroundColor: '#10b981',
                  borderRadius: '99px',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Voted Status Badge */}
      {(userHasVoted || selectedOptionId) && !isClosed && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#d1fae5', color: '#059669', padding: '0.4rem 1rem', borderRadius: '99px', width: 'fit-content', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <Check size={16} /> আপনি ভোট দিয়েছেন
        </div>
      )}

      {message && !selectedOptionId && (
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', textAlign: 'center', marginTop: '0.5rem' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export function ClosePollButton({ pollId }: { pollId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!window.confirm("আপনি কি পোলটি বন্ধ করে ফলাফল চূড়ান্ত করতে চান?")) return;
    
    setLoading(true);
    const result = await closePoll(pollId);
    if (result.error) {
      alert(result.error);
    } else {
      alert(`Poll Closed. Status: ${result.status}`);
    }
    setLoading(false);
  };

  return (
    <button onClick={handleClose} disabled={loading} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', marginLeft: 'auto' }}>
      {loading ? "Closing..." : "Close Poll"}
    </button>
  );
}

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  profilePicture: string | null;
}

export function CreateGeneralPollForm({ members = [] }: { members?: Member[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pollType, setPollType] = useState<"GENERAL" | "COMMITTEE_ELECTION">("GENERAL");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (pollType === "COMMITTEE_ELECTION" && selectedMembers.length < 2) {
      setMessage({ type: "error", text: "কমপক্ষে ২ জন প্রার্থী নির্বাচন করতে হবে।" });
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("type", pollType); // Set selected type

    // Append all selected candidate ids
    if (pollType === "COMMITTEE_ELECTION") {
      selectedMembers.forEach(id => {
        formData.append("candidateIds", id);
      });
    }

    const result = await createPoll(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "পোল সফলভাবে তৈরি হয়েছে।" });
      (e.target as HTMLFormElement).reset();
      setSelectedMembers([]);
      setPollType("GENERAL");
      setTimeout(() => setIsOpen(false), 2000);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ marginBottom: '1.5rem', width: '100%' }}>
        + নতুন পোল তৈরি করুন (অ্যাডমিন)
      </button>
    );
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>নতুন পোল তৈরি করুন</h2>
        <button type="button" onClick={() => setIsOpen(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>পোলের শিরোনাম (Title)</label>
          <input type="text" name="title" required placeholder="যেমন: নতুন সভাপতি নির্বাচন" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>বিস্তারিত বর্ণনা (Description)</label>
          <textarea name="description" required rows={3} placeholder="এই পোলের বিষয়ে বিস্তারিত লিখুন..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}></textarea>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>পোলের ধরণ (Poll Type)</label>
          <select 
            name="type" 
            value={pollType} 
            onChange={(e) => setPollType(e.target.value as any)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
          >
            <option value="GENERAL">সাধারণ পোল (General Poll)</option>
            <option value="COMMITTEE_ELECTION">কমিটি নির্বাচন (Committee Election)</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>শেষ তারিখ ও সময় (Deadline)</label>
          <input type="datetime-local" name="deadline" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>

        {pollType === "COMMITTEE_ELECTION" ? (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>প্রার্থী বা সদস্য নির্বাচন করুন (Select Candidates)</label>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid var(--border)', 
              borderRadius: '0.5rem', 
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              backgroundColor: 'var(--background)'
            }}>
              {members.map(member => (
                <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                  <input 
                    type="checkbox" 
                    value={member.id} 
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                      }
                    }}
                  />
                  {member.profilePicture ? (
                    <img src={member.profilePicture} alt={member.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e5e7eb', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {(member.nameBn || member.name).charAt(0)}
                    </div>
                  )}
                  <span>{member.nameBn || member.name}</span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>কমপক্ষে ২ জন প্রার্থী নির্বাচন করতে হবে।</p>
          </div>
        ) : (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>পোলের অপশনসমূহ (Options)</label>
            <input type="text" name="options" required={pollType === "GENERAL"} placeholder="কমা (,) দিয়ে আলাদা করুন। যেমন: রহিম, করিম, জব্বার" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>কমপক্ষে ২টি অপশন কমা (,) দিয়ে লিখতে হবে।</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
          {loading ? "তৈরি হচ্ছে..." : "পোল পাবলিশ করুন"}
        </button>
      </form>
      
      {message && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', textAlign: 'center' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export function DeletePollButton({ pollId }: { pollId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই পোলটি স্থায়ীভাবে মুছে ফেলতে চান? এর সকল ডেটা এবং সংগৃহীত ভোট মুছে যাবে।")) return;
    
    setLoading(true);
    const result = await deletePoll(pollId);
    if (result.error) {
      alert(result.error);
    } else {
      alert("পোলটি সফলভাবে মুছে ফেলা হয়েছে।");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading} 
      className="btn btn-secondary" 
      style={{ 
        fontSize: '0.75rem', 
        padding: '0.25rem 0.75rem', 
        color: '#ef4444', 
        borderColor: '#fca5a5', 
        backgroundColor: '#fef2f2' 
      }}
    >
      {loading ? "Deleting..." : "মুছে ফেলুন (Delete)"}
    </button>
  );
}

