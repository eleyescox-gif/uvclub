"use client";

import { useState, useEffect } from "react";
import { getSmsBalance, sendSms } from "@/actions/sms";
import { Send, Users, Smartphone, MessageSquare, RefreshCw, CheckCircle, AlertCircle, Info, Search } from "lucide-react";

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  mobile: string;
}

export default function SmsForm({ 
  members, 
  initialBalance, 
  initialError 
}: { 
  members: Member[]; 
  initialBalance: string;
  initialError: string | null;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [apiError, setApiError] = useState<string | null>(initialError);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  
  const [callerID, setCallerID] = useState("1234");
  const [sendType, setSendType] = useState<"all" | "selected" | "manual">("all");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState("");
  const [message, setMessage] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string; errors?: string[] } | null>(null);

  // Character & SMS Count Calculator
  const isBangla = (text: string) => {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text);
  };

  const getSmsInfo = (text: string) => {
    if (!text) return { chars: 0, parts: 0, limit: 160 };
    const hasUnicode = isBangla(text);
    const charCount = text.length;
    let limitPerPart = 160;
    
    if (hasUnicode) {
      limitPerPart = charCount <= 70 ? 70 : 67;
    } else {
      limitPerPart = charCount <= 160 ? 160 : 153;
    }
    
    const parts = Math.ceil(charCount / limitPerPart);
    return {
      chars: charCount,
      parts: parts === 0 ? 1 : parts,
      limit: limitPerPart,
      isUnicode: hasUnicode
    };
  };

  const smsInfo = getSmsInfo(message);

  // Refresh balance from API
  const handleRefreshBalance = async () => {
    setRefreshingBalance(true);
    setApiError(null);
    const res: any = await getSmsBalance();
    if (res && res.success && res.balance) {
      setBalance(res.balance);
    } else {
      setApiError(res?.error || "ব্যালেন্স লোড করতে ব্যর্থ");
    }
    setRefreshingBalance(false);
  };

  // Select all or deselect members
  const handleSelectAllMembers = (checked: boolean) => {
    if (checked) {
      setSelectedMemberIds(members.map(m => m.id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const handleMemberToggle = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(mid => mid !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const filteredMembers = members.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(searchLower) ||
      (m.nameBn && m.nameBn.toLowerCase().includes(searchLower)) ||
      m.mobile.includes(searchLower)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Collect recipient phone numbers
    let numbersList: string[] = [];
    if (sendType === "all") {
      numbersList = members.map(m => m.mobile);
    } else if (sendType === "selected") {
      numbersList = members
        .filter(m => selectedMemberIds.includes(m.id))
        .map(m => m.mobile);
    } else {
      numbersList = manualNumbers
        .split(",")
        .map(n => n.trim())
        .filter(n => n.length > 0);
    }

    if (numbersList.length === 0) {
      setStatus({ type: "error", text: "অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন!" });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("callerID", callerID);
    formData.append("numbers", numbersList.join(","));
    formData.append("message", message);

    const result = await sendSms(formData);

    if (result.error) {
      setStatus({ type: "error", text: result.error });
    } else if (result.success) {
      setStatus({ 
        type: "success", 
        text: result.summary, 
        errors: result.errors 
      });
      // Clear message field on successful trigger
      setMessage("");
      // Refresh balance
      handleRefreshBalance();
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      {/* Top Section - Balance & SenderID Info */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border)' }}>
        <div>
          <h3 style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SMS এপিআই ব্যালেন্স</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ৳ {balance}
            <button 
              onClick={handleRefreshBalance} 
              disabled={refreshingBalance}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
              title="ব্যালেন্স রিফ্রেশ করুন"
            >
              <RefreshCw size={18} className={refreshingBalance ? 'spin' : ''} style={{ animation: refreshingBalance ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </p>
          {apiError && (
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '6px', 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.15)', 
              fontSize: '0.78rem', 
              color: '#ef4444', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.25rem', 
              maxWidth: '450px' 
            }}>
              <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={14} /> এপিআই কানেকশন এরর:
              </span>
              <span>{apiError}</span>
              {apiError.includes("IP") && (
                <span style={{ color: '#d97706', fontWeight: 600, marginTop: '0.25rem', lineHeight: '1.4' }}>
                  💡 সমাধান: অনুগ্রহ করে BulkSMSDhaka.net পোর্টাল-এ গিয়ে settings / security সেকশনে আপনার এই সার্ভার আইপি (IP: 43.255.20.108) হোয়াইটলিস্ট (whitelist) করুন অথবা IP Whitelist ভ্যালিডেশন বন্ধ করুন।
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '300px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>এপিআই গেটওয়ে প্রোভাইডার</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)' }}>BulkSMSDhaka.net</span>
          <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> এপিআই কানেকশন সচল
          </span>
        </div>
      </div>

      {/* Main Send Form */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Sender Masking (Caller ID) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>Sender ID / Masking (কলার আইডি)</label>
            <input 
              type="text"
              value={callerID}
              onChange={(e) => setCallerID(e.target.value)}
              placeholder="e.g. UnitedVision"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} /> আপনার পোর্টালে অনুমোদিত Masking বা Non-Masking Sender ID দিন।
            </span>
          </div>

          {/* Recipient Type Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>কাদের পাঠাতে চান?</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="sendType" 
                  checked={sendType === "all"} 
                  onChange={() => setSendType("all")} 
                />
                সব মেম্বার ({members.length} জন)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="sendType" 
                  checked={sendType === "selected"} 
                  onChange={() => setSendType("selected")} 
                />
                মেম্বার তালিকা থেকে সিলেক্ট করুন
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="sendType" 
                  checked={sendType === "manual"} 
                  onChange={() => setSendType("manual")} 
                />
                ম্যানুয়ালি নম্বর লিখুন
              </label>
            </div>
          </div>

          {/* Recipient Selection Lists based on type */}
          {sendType === "selected" && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', background: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <Search size={16} color="#9ca3af" />
                <input 
                  type="text" 
                  placeholder="মেম্বার খুঁজুন (নাম/মোবাইল)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'none', border: 'none', width: '100%', outline: 'none', color: 'var(--foreground)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                <span>সিলেক্ট করা হয়েছে: {selectedMemberIds.length} জন</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => handleSelectAllMembers(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>সব সিলেক্ট</button>
                  <span>|</span>
                  <button type="button" onClick={() => handleSelectAllMembers(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 600 }}>সব বাতিল</button>
                </div>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(m => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer', background: selectedMemberIds.includes(m.id) ? 'rgba(16, 185, 129, 0.05)' : 'none', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedMemberIds.includes(m.id)}
                        onChange={() => handleMemberToggle(m.id)}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{m.nameBn || m.name}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{m.mobile}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>কোনো মেম্বার পাওয়া যায়নি</p>
                )}
              </div>
            </div>
          )}

          {sendType === "manual" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>মোবাইল নম্বরসমূহ</label>
              <textarea 
                value={manualNumbers}
                onChange={(e) => setManualNumbers(e.target.value)}
                placeholder="01712345678, 01912345678"
                style={{ width: '100%', minHeight: '80px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>একাধিক নম্বর কমা ( , ) দিয়ে আলাদা করে লিখুন।</span>
            </div>
          )}

          {/* SMS Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>এসএমএস বার্তা (Message Body)</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="এখানে আপনার বার্তাটি লিখুন..."
              required
              style={{ width: '100%', minHeight: '120px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical', fontSize: '0.95rem', lineHeight: '1.5' }}
            />
            {/* SMS Stats Counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', padding: '0 0.25rem', marginTop: '0.25rem' }}>
              <span>ভাষা: {smsInfo.isUnicode ? 'বাংলা (Unicode)' : 'ইংরেজি (Plain Text)'}</span>
              <span style={{ fontWeight: 600 }}>
                {smsInfo.chars} অক্ষর / {smsInfo.parts} টি এসএমএস ({smsInfo.limit - (smsInfo.chars % smsInfo.limit || smsInfo.limit)} খালি)
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 700, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} /> পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                <Send size={18} /> এসএমএস পাঠান
              </>
            )}
          </button>
        </form>

        {/* Status Alerts */}
        {status && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: status.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{status.text}</span>
            </div>
            
            {status.errors && status.errors.length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>ব্যর্থ হওয়া নম্বরের তালিকা:</p>
                <ul style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', listStyle: 'disc' }}>
                  {status.errors.map((err, idx) => (
                    <li key={idx} style={{ marginTop: '0.15rem' }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
