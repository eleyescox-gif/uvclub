"use client";

import { useState } from "react";
import { assignToCommittee, removeFromCommittee } from "@/actions/committee";
import { UserCheck, Trash2, Shield, AlertTriangle, CheckSquare, Settings2, Sparkles, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  mobile: string;
}

export function InterimModeToggle({ initialMode }: { initialMode: boolean }) {
  const [isInterim, setIsInterim] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    const newStatus = !isInterim;
    const confirmMsg = newStatus
      ? "আপনি কি নিশ্চিত যে আপনি 'অন্তরবর্তীকালীন মোড (No-Committee Mode)' সক্রিয় করতে চান?\nসক্রিয় করলে কার্যনির্বাহী কমিটি সাময়িকভাবে স্থগিত থাকবে এবং নিয়ন্ত্রক সদস্যের পদবী হবে 'কন্ট্রোলার (Controller)'।"
      : "আপনি কি অন্তরবর্তীকালীন মোড বন্ধ করে নিয়মিত কমিটি মোড পুনঃসক্রিয় করতে চান?";

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/toggle-interim-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noCommitteeMode: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setIsInterim(data.noCommitteeMode);
        alert(data.noCommitteeMode ? "অন্তরবর্তীকালীন মোড সফলভাবে সক্রিয় করা হয়েছে।" : "নিয়মিত কমিটি মোড সফলভাবে পুনঃসক্রিয় করা হয়েছে।");
        router.refresh();
      } else {
        alert(data.error || "মোড পরিবর্তন করতে ব্যর্থ");
      }
    } catch (e: any) {
      alert("ত্রুটি: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: isInterim ? "#fff7ed" : "#ffffff",
      border: `1.5px solid ${isInterim ? "#fed7aa" : "#e2e8f0"}`,
      borderRadius: "12px",
      padding: "1.25rem",
      marginBottom: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: isInterim ? "#ffedd5" : "#ecfdf5",
            color: isInterim ? "#c2410c" : "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Settings2 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
              অন্তরবর্তীকালীন মোড (Interim No-Committee Mode)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
              কমিটি না থাকলে বা সাময়িক দায়িত্বে অর্পণের ক্ষেত্রে 'কন্ট্রোলার (Controller)' হিসেবে ক্লাব পরিচালনা করতে ব্যবহার করুন।
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            padding: "0.5rem 1.15rem",
            borderRadius: "8px",
            border: `1px solid ${isInterim ? "#ea580c" : "#059669"}`,
            backgroundColor: isInterim ? "#ea580c" : "#059669",
            color: "#ffffff",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Sparkles size={16} />
          {loading ? "আপডেট হচ্ছে..." : isInterim ? "অন্তরবর্তীকালীন মোড বন্ধ করুন" : "অন্তরবর্তীকালীন মোড সক্রিয় করুন"}
        </button>
      </div>

      {isInterim && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #fdba74",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          fontSize: "0.8125rem",
          color: "#9a3412",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <AlertTriangle size={18} color="#c2410c" />
          <span>
            <strong>সতর্কতা:</strong> বর্তমানে <strong>অন্তরবর্তীকালীন মোড (Interim Controller Mode)</strong> সক্রিয় রয়েছে। পরিচালনা পদে নিযুক্ত সদস্যের পদবী <strong>'কন্ট্রোলার (Controller)'</strong> হিসেবে সিস্টেমে গণ্য হবে।
          </span>
        </div>
      )}
    </div>
  );
}

export function CheckboxRoleAssignForm({ members }: { members: Member[] }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("CONTROLLER");
  const [customDesignation, setCustomDesignation] = useState("কন্ট্রোলার (অন্তরবর্তীকালীন)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const roleOptions = [
    { key: "CONTROLLER", label: "কন্ট্রোলার (অন্তরবর্তীকালীন মোড)", desc: "কমিটি না থাকলে অন্তরবর্তীকালে ক্লাব নিয়ন্ত্রকের দায়িত্ব", color: "#c2410c", defaultDesig: "কন্ট্রোলার" },
    { key: "PRESIDENT", label: "সভাপতি (President)", desc: "সভাপতি পদে ফুল অ্যাডমিন ও অনুমোদন ক্ষমতা", color: "#059669", defaultDesig: "সভাপতি" },
    { key: "SECRETARY", label: "সাধারণ সম্পাদক (Secretary)", desc: "সাধারণ সম্পাদক পদে নোটিশ, মেম্বার ও রিপোর্ট পাওয়ার", color: "#2563eb", defaultDesig: "সাধারণ সম্পাদক" },
    { key: "CASHIER", label: "ক্যাশিয়ার (Cashier)", desc: "অর্থ জমা, চাঁদা এন্ট্রি ও ক্যাশ বুক অনুমোদন", color: "#d97706", defaultDesig: "ক্যাশিয়ার" },
    { key: "ADMIN", label: "অ্যাডমিন (System Admin)", desc: "সম্পূর্ণ কারিগরি ও সিস্টেম কন্ট্রোল", color: "#7c3aed", defaultDesig: "অ্যাডমিন" },
    { key: "MEMBER", label: "সাধারণ সদস্য (General Member)", desc: "সাধারণ মেম্বার সুবিধা", color: "#64748b", defaultDesig: "সদস্য" },
  ];

  const handleRoleSelect = (roleKey: string, defaultDesig: string) => {
    setSelectedRole(roleKey);
    setCustomDesignation(defaultDesig);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("দয়া করে একজন সদস্য নির্বাচন করুন।");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/members/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
          committeeDesignation: customDesignation
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("সদস্যের রোল ও পারমিশন টিকমার্ক অনুযায়ী সফলভাবে আপডেট করা হয়েছে!");
        setSelectedUser("");
        router.refresh();
      } else {
        setError(data.error || "রোল পরিবর্তন ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError("ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "1.25rem",
    }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <CheckSquare size={18} color="#059669" /> সদস্য পদবী ও রোল নির্বাচন (Role Checkbox Assign)
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 1. Member Selector */}
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.4rem", color: "#475569" }}>
            ১. সদস্য সিলেক্ট করুন
          </label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            required 
            style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem", backgroundColor: "#ffffff" }}
          >
            <option value="">-- সদস্য সিলেক্ট করুন --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.nameBn || m.name} ({m.mobile})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Role Checkbox Selection Cards */}
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.4rem", color: "#475569" }}>
            ২. পদবী/রোল টিক দিয়ে নির্বাচন করুন (Checkmark Role)
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px" }}>
            {roleOptions.map((item) => {
              const isChecked = selectedRole === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => handleRoleSelect(item.key, item.defaultDesig)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${isChecked ? item.color : "#e2e8f0"}`,
                    backgroundColor: isChecked ? `${item.color}08` : "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleRoleSelect(item.key, item.defaultDesig)}
                    style={{ marginTop: "3px", accentColor: item.color, cursor: "pointer" }}
                  />
                  <div>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: isChecked ? item.color : "#0f172a", display: "block" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 400, marginTop: "2px", display: "block" }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Custom Designation Input */}
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.4rem", color: "#475569" }}>
            ৩. কমিটির অফিসিয়াল পদবী নাম
          </label>
          <input
            type="text"
            value={customDesignation}
            onChange={(e) => setCustomDesignation(e.target.value)}
            required
            placeholder="যেমন: কন্ট্রোলার, সভাপতি, সহ-সভাপতি, সদস্য"
            style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
          />
        </div>

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecdd3", color: "#dc2626", fontSize: "0.8125rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          style={{
            padding: "0.65rem 1.25rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#059669",
            color: "#ffffff",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: "0.25rem"
          }}
        >
          {loading ? "আপডেট করা হচ্ছে..." : "✓ পছন্দনীয় রোল ও পদবী সংরক্ষণ করুন"}
        </button>
      </form>
    </div>
  );
}

export function RemoveCommitteeButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে আপনি ${userName}-কে পরিচালনা কমিটি থেকে বাদ দিতে চান? বাদ দিলে তার পদবী সাধারণ সদস্য হিসেবে রিসেট হবে।`)) return;
    
    setLoading(true);
    const result = await removeFromCommittee(userId);
    if (result.error) {
      alert(result.error);
    } else {
      alert("সদস্যকে সফলভাবে কমিটি থেকে বাদ দেওয়া হয়েছে।");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={loading} 
      style={{ 
        padding: "0.35rem 0.65rem", 
        fontSize: "0.75rem", 
        borderRadius: "6px",
        display: "flex", 
        alignItems: "center", 
        gap: "0.25rem", 
        color: "#dc2626", 
        border: "1px solid #fecdd3", 
        backgroundColor: "#fef2f2",
        cursor: "pointer",
        fontWeight: 700
      }}
      title="কমিটি থেকে বাদ দিন"
    >
      <Trash2 size={13} />
      <span>বাদ দিন</span>
    </button>
  );
}

export function ExecutiveCommitteeForm({ members }: { members: Member[] }) {
  const [presidentId, setPresidentId] = useState("");
  const [secretaryId, setSecretaryId] = useState("");
  const [cashierId, setCashierId] = useState("");
  const [vicePresidentId, setVicePresidentId] = useState("");
  const [jointSecretaryId, setJointSecretaryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presidentId && !secretaryId && !cashierId) {
      setError("দয়া করে অন্তত মূল ৩টি পদের (সভাপতি, সাধারণ সম্পাদক, ক্যাশিয়ার) সদস্য সিলেক্ট করুন।");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/committee/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presidentId,
          secretaryId,
          cashierId,
          vicePresidentId,
          jointSecretaryId
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("🎉 পরিচালনা কমিটির সদস্য ও পদবীসমূহ এক সাথে সফলভাবে আপডেট করা হয়েছে!");
        router.refresh();
      } else {
        setError(data.error || "কমিটি আপডেট করতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setError("ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1.5px solid #059669",
      borderRadius: "14px",
      padding: "1.5rem",
      marginBottom: "2rem",
      boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.08)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#047857", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Shield size={22} color="#059669" /> পরিচালনা কমিটি গঠন (Form Executive Committee)
        </h2>
        <span style={{ fontSize: "0.75rem", color: "#059669", backgroundColor: "#ecfdf5", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontWeight: 700, border: "1px solid #a7f3d0" }}>
          ১-ক্লিকে নতুন পরিচালনা কমিটি গঠন
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {/* 1. President */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.35rem", color: "#1e293b" }}>
              👑 সভাপতি (President)
            </label>
            <select
              value={presidentId}
              onChange={(e) => setPresidentId(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value="">-- সদস্য সিলেক্ট করুন --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nameBn || m.name} ({m.mobile})</option>
              ))}
            </select>
          </div>

          {/* 2. Secretary */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.35rem", color: "#1e293b" }}>
              📜 সাধারণ সম্পাদক (General Secretary)
            </label>
            <select
              value={secretaryId}
              onChange={(e) => setSecretaryId(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value="">-- সদস্য সিলেক্ট করুন --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nameBn || m.name} ({m.mobile})</option>
              ))}
            </select>
          </div>

          {/* 3. Cashier */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.35rem", color: "#1e293b" }}>
              💰 ক্যাশিয়ার (Cashier)
            </label>
            <select
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value="">-- সদস্য সিলেক্ট করুন --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nameBn || m.name} ({m.mobile})</option>
              ))}
            </select>
          </div>

          {/* 4. Vice President */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.35rem", color: "#475569" }}>
              🛡️ সহ-সভাপতি (Vice President - ঐচ্ছিক)
            </label>
            <select
              value={vicePresidentId}
              onChange={(e) => setVicePresidentId(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value="">-- সদস্য সিলেক্ট করুন (ঐচ্ছিক) --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nameBn || m.name} ({m.mobile})</option>
              ))}
            </select>
          </div>

          {/* 5. Joint Secretary */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.35rem", color: "#475569" }}>
              📝 সহ-সাধারণ সম্পাদক (Joint Sec. - ঐচ্ছিক)
            </label>
            <select
              value={jointSecretaryId}
              onChange={(e) => setJointSecretaryId(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value="">-- সদস্য সিলেক্ট করুন (ঐচ্ছিক) --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.nameBn || m.name} ({m.mobile})</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "0.8125rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#059669",
            color: "#ffffff",
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem"
          }}
        >
          {loading ? "কমিটি গঠন ও আপডেট হচ্ছে..." : "✓ নতুন পরিচালনা কমিটি গঠন ও আপডেট করুন"}
        </button>
      </form>
    </div>
  );
}

export function PrintCommitteeButton() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.45rem 0.85rem",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        fontSize: "0.8125rem",
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      <Printer size={15} />
      <span>তালিকা প্রিন্ট</span>
    </button>
  );
}
