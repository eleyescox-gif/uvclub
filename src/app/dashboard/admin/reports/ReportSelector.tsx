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
    
    if (type === "single-member-ledger") {
      params.userId = currentUserId || members[0]?.id || "";
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
      params.month = currentMonth;
      params.year = currentYear;
    } else if (type === "due-subscriptions" || type === "paid-subscriptions") {
      params.month = currentMonth;
      params.year = currentYear;
    }
    updateUrl(params);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    const params: Record<string, string> = { month: m };
    
    // If selecting a month in single member ledger, auto calculate dateFrom and dateTo
    if (currentType === "single-member-ledger" && m !== "all") {
      const y = currentYear !== "all" ? parseInt(currentYear) : today.getFullYear();
      const mNum = parseInt(m);
      const start = new Date(y, mNum - 1, 1).toISOString().split("T")[0];
      const end = new Date(y, mNum, 0).toISOString().split("T")[0];
      setDateFrom(start);
      setDateTo(end);
      params.dateFrom = start;
      params.dateTo = end;
    }
    updateUrl(params);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = e.target.value;
    const params: Record<string, string> = { year: y };

    if (currentType === "single-member-ledger" && y !== "all") {
      const yNum = parseInt(y);
      const mNum = currentMonth !== "all" ? parseInt(currentMonth) : 1;
      const start = new Date(yNum, mNum - 1, 1).toISOString().split("T")[0];
      const end = currentMonth !== "all" ? new Date(yNum, mNum, 0).toISOString().split("T")[0] : `${yNum}-12-31`;
      setDateFrom(start);
      setDateTo(end);
      params.dateFrom = start;
      params.dateTo = end;
    }
    updateUrl(params);
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

  const showMonthYearFilter = currentType === "due-subscriptions" || currentType === "paid-subscriptions" || currentType === "single-member-ledger";
  const showMemberFilter = currentType === "single-member-ledger";

  return (
    <div className="no-print" style={{ 
      backgroundColor: 'white', 
      padding: '1.25rem', 
      borderRadius: '1rem', 
      border: '1px solid var(--border)', 
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        
        {/* Report Type Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: '1 1 240px', minWidth: '220px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>রিপোর্টের ধরণ</label>
          <select 
            value={currentType} 
            onChange={handleTypeChange}
            className="input"
            style={{ padding: '0.65rem 0.85rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', width: '100%', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontWeight: 700, fontSize: '0.875rem' }}
          >
            <option value="member-list">সকল সদস্যের তালিকা</option>
            <option value="active-members">সক্রিয় সদস্য তালিকা</option>
            <option value="member-nominees">সদস্য ও নমিনি বিবরণী তালিকা</option>
            <option value="due-subscriptions">বকেয়া চাঁদার তালিকা</option>
            <option value="paid-subscriptions">পরিশোধিত চাঁদার তালিকা</option>
            <option value="club-financial-statement">🏛️ প্রতিষ্ঠানের সামগ্রিক আয় ও ব্যয় বিবরণী</option>
            <option value="member-transactions">সদস্যদের মোট লেনদেন বিবরণী</option>
            <option value="single-member-ledger">একক সদস্যের লেনদেন বিবরণী</option>
          </select>
        </div>

        {/* Member Selector (for single member ledger) */}
        {showMemberFilter && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: '1 1 240px', minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>সদস্য নির্বাচন করুন</label>
            <select 
              value={currentUserId} 
              onChange={handleMemberChange}
              className="input"
              style={{ padding: '0.65rem 0.85rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', width: '100%', fontWeight: 600, fontSize: '0.875rem' }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nameBn || m.name} ({m.mobile})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Conditional Month/Year filter */}
        {showMonthYearFilter && (
          <div style={{ display: 'flex', gap: '0.5rem', flex: '0 1 auto', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>মাস</label>
              <select 
                value={currentMonth} 
                onChange={handleMonthChange}
                className="input"
                style={{ padding: '0.65rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', minWidth: '110px', fontSize: '0.85rem' }}
              >
                <option value="all">সব মাস</option>
                <option value="1">জানুয়ারি</option>
                <option value="2">ফেব্রুয়ারি</option>
                <option value="3">মার্চ</option>
                <option value="4">এপ্রিল</option>
                <option value="5">মে</option>
                <option value="6">জুন</option>
                <option value="7">জুলাই</option>
                <option value="8">আগস্ট</option>
                <option value="9">সেপ্টেম্বর</option>
                <option value="10">অক্টোবর</option>
                <option value="11">নভেম্বর</option>
                <option value="12">ডিসেম্বর</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>বছর</label>
              <select 
                value={currentYear} 
                onChange={handleYearChange}
                className="input"
                style={{ padding: '0.65rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', minWidth: '100px', fontSize: '0.85rem' }}
              >
                <option value="all">সব বছর</option>
                <option value="2026">২০২৬</option>
                <option value="2027">২০২৭</option>
                <option value="2028">২০২৮</option>
              </select>
            </div>
          </div>
        )}

        {/* Print Action Button */}
        <button 
          onClick={handlePrint} 
          className="btn btn-primary" 
          style={{ 
            padding: '0.65rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            borderRadius: '0.6rem',
            fontWeight: 800,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          রিপোর্ট প্রিন্ট করুন
        </button>
      </div>

      {/* Custom Date Range selectors and presets for single member ledger */}
      {showMemberFilter && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>কাস্টম সময়কাল:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => handleDateChange(e.target.value, dateTo)}
                style={{ padding: '0.45rem 0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>থেকে</span>
              <input 
                type="date" 
                value={dateTo} 
                onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                style={{ padding: '0.45rem 0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button onClick={() => applyPreset("this-year")} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '0.375rem' }}>চলতি বছর</button>
            <button onClick={() => applyPreset("last-3-months")} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '0.375rem' }}>বিগত ৩ মাস</button>
            <button onClick={() => applyPreset("last-1-year")} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '0.375rem' }}>বিগত ১ বছর</button>
          </div>
        </div>
      )}
    </div>
  );
}
