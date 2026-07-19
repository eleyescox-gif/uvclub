"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Member {
  id: string;
  name: string;
  nameBn: string | null;
  mobile: string;
}

export default function ReportSelector({ members }: { members: Member[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "member-list";
  const currentMonth = searchParams.get("month") || "all";
  const currentYear = searchParams.get("year") || "all";
  const currentUserId = searchParams.get("userId") || (members[0]?.id || "");
  
  // Default date ranges: current year
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const jan1stStr = `${today.getFullYear()}-01-01`;

  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || jan1stStr);
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || todayStr);

  // Sync state with URL searchParams if they change
  useEffect(() => {
    const urlFrom = searchParams.get("dateFrom");
    const urlTo = searchParams.get("dateTo");
    if (urlFrom) setDateFrom(urlFrom);
    if (urlTo) setDateTo(urlTo);
  }, [searchParams]);

  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) => {
      if (val) {
        newParams.set(key, val);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/dashboard/admin/reports?${newParams.toString()}`);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    const params: Record<string, string> = { type };
    
    // Set default parameters for cleaner navigation
    if (type === "single-member-ledger") {
      params.userId = currentUserId || members[0]?.id || "";
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
    } else if (type === "due-subscriptions" || type === "paid-subscriptions") {
      params.month = currentMonth;
      params.year = currentYear;
    }
    updateUrl(params);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ month: e.target.value });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ year: e.target.value });
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ userId: e.target.value });
  };

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    updateUrl({ dateFrom: from, dateTo: to });
  };

  const applyPreset = (preset: string) => {
    const now = new Date();
    const nowStr = now.toISOString().split("T")[0];
    let fromStr = "";

    if (preset === "this-year") {
      fromStr = `${now.getFullYear()}-01-01`;
    } else if (preset === "last-1-year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      fromStr = oneYearAgo.toISOString().split("T")[0];
    } else if (preset === "last-2-years") {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      fromStr = twoYearsAgo.toISOString().split("T")[0];
    } else if (preset === "last-3-months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      fromStr = threeMonthsAgo.toISOString().split("T")[0];
    }

    handleDateChange(fromStr, nowStr);
  };

  const handlePrint = () => {
    window.print();
  };

  const showMonthYearFilter = currentType === "due-subscriptions" || currentType === "paid-subscriptions";
  const showMemberFilter = currentType === "single-member-ledger";

  return (
    <div className="no-print" style={{ 
      backgroundColor: 'white', 
      padding: '1.5rem', 
      borderRadius: '1rem', 
      border: '1px solid var(--border)', 
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Report Type Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>রিপোর্টের ধরণ (Report Type)</label>
          <select 
            value={currentType} 
            onChange={handleTypeChange}
            className="input"
            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minWidth: '250px', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontWeight: 600 }}
          >
            <option value="member-list">মেম্বার লিস্ট (All Members)</option>
            <option value="active-members">একটিভ সদস্য (Active Members)</option>
            <option value="member-nominees">সদস্য ও নমিনি তালিকা (Member & Nominees)</option>
            <option value="due-subscriptions">বকেয়া চাঁদার তালিকা (Due Subscriptions)</option>
            <option value="paid-subscriptions">পরিশোধিত চাঁদার তালিকা (Paid Subscriptions)</option>
            <option value="member-transactions">সদস্যদের মোট লেনদেন (Transactions Summary)</option>
            <option value="single-member-ledger">একক সদস্যের লেনদেন বিবরণী (Single Member Ledger)</option>
          </select>
        </div>

        {/* Conditional Month/Year filter */}
        {showMonthYearFilter && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>মাস (Month)</label>
              <select 
                value={currentMonth} 
                onChange={handleMonthChange}
                className="input"
                style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minWidth: '130px' }}
              >
                <option value="all">সব মাস (All)</option>
                <option value="1">জানুয়ারি (January)</option>
                <option value="2">ফেব্রুয়ারি (February)</option>
                <option value="3">মার্চ (March)</option>
                <option value="4">এপ্রিল (April)</option>
                <option value="5">মে (May)</option>
                <option value="6">জুন (June)</option>
                <option value="7">জুলাই (July)</option>
                <option value="8">আগস্ট (August)</option>
                <option value="9">সেপ্টেম্বর (September)</option>
                <option value="10">অক্টোবর (October)</option>
                <option value="11">নভেম্বর (November)</option>
                <option value="12">ডিসেম্বর (December)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>বছর (Year)</label>
              <select 
                value={currentYear} 
                onChange={handleYearChange}
                className="input"
                style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minWidth: '120px' }}
              >
                <option value="all">সব বছর (All)</option>
                <option value="2026">২০২৬ (2026)</option>
                <option value="2027">২০২৭ (2027)</option>
                <option value="2028">২০২৮ (2028)</option>
              </select>
            </div>
          </>
        )}

        {/* Conditional Single Member select filter */}
        {showMemberFilter && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>সদস্য নির্বাচন করুন (Select Member)</label>
            <select 
              value={currentUserId} 
              onChange={handleMemberChange}
              className="input"
              style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minWidth: '220px' }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nameBn || m.name} ({m.mobile})
                </option>
              ))}
            </select>
          </div>
        )}

        <button 
          onClick={handlePrint} 
          className="btn btn-primary" 
          style={{ padding: '0.6rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-end', marginLeft: 'auto' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          রিপোর্ট প্রিন্ট করুন
        </button>
      </div>

      {/* Date Range selectors and presets for single member ledger */}
      {showMemberFilter && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>সময়কাল:</span>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => handleDateChange(e.target.value, dateTo)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>থেকে</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => handleDateChange(dateFrom, e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
            />
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => applyPreset("this-year")} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>চলতি বছর</button>
            <button onClick={() => applyPreset("last-3-months")} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>বিগত ৩ মাস</button>
            <button onClick={() => applyPreset("last-1-year")} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>বিগত ১ বছর</button>
            <button onClick={() => applyPreset("last-2-years")} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>বিগত ২ বছর</button>
          </div>
        </div>
      )}
    </div>
  );
}
