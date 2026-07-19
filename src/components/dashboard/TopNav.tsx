"use client";

import { Search, Bell, X, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  creatorName: string;
  creatorRole: string;
}

interface TopNavProps {
  user: any;
  activeNoticesCount?: number;
  clubSettings?: { name: string; logo: string | null; address: string | null };
  notices?: Notice[];
  collectionStats?: { paid: number; due: number };
}

export default function TopNav({ user, activeNoticesCount = 0, clubSettings, notices = [], collectionStats }: TopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 0.75rem',
      backgroundColor: 'transparent',
      marginBottom: '0',
      position: 'relative',
      flexWrap: 'wrap',
      gap: '0.5rem',
      minWidth: 0,
    }}>
      {/* Spacer for hamburger button on mobile */}
      <div style={{ flex: 1, minWidth: '40px' }}></div>

      {/* Centered Logo and H1 */}
      <div style={{ 
        position: 'absolute', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        maxWidth: 'calc(100vw - 160px)',
        overflow: 'hidden',
      }}>
        <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#fff', padding: '2px', border: '1px solid var(--border)' }}>
          <img src={clubSettings?.logo || "/logo.jpg"} alt={clubSettings?.name || "Logo"} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.8rem)', fontWeight: 900, color: '#1a365d', margin: 0, letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clubSettings?.name || "United Vision"}</h1>
      </div>

      {/* Notification Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
        {/* Paid & Due Pills (Left of Notification Bell) */}
        {collectionStats && (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '0.3rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#15803d',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{collectionStats.paid}</span>
              <span>পরিশোধ</span>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '0.3rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#b91c1c',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{collectionStats.due}</span>
              <span>বকেয়া</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }} ref={dropdownRef}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              position: 'relative', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'white', 
              border: '1px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              color: '#4b5563',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            <Bell size={18} />
            {activeNoticesCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-2px', 
                right: '-2px', 
                width: '12px', 
                height: '12px', 
                backgroundColor: 'var(--danger)', 
                borderRadius: '50%', 
                display: 'inline-block', 
                border: '2px solid white' 
              }}></span>
            )}
          </div>

          {/* Notification Dropdown Popover */}
          {showDropdown && (
            <div className="glass" style={{
              position: 'absolute',
              top: '50px',
              right: '0px',
              width: '320px',
              borderRadius: '1rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              zIndex: 1000,
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>নোটিফিকেশন প্যানেল</h4>
                <button onClick={() => setShowDropdown(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={16} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }}>
                {notices.length === 0 ? (
                  <div style={{ padding: '1rem 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>কোনো নোটিশ নেই</div>
                ) : (
                  notices.map((n) => (
                    <Link key={n.id} href="/dashboard/notices" onClick={() => setShowDropdown(false)} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.6rem', borderRadius: '0.5rem', transition: 'background-color 0.2s', border: '1px solid transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{n.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#4b5563', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{n.content}</span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={10} /> {n.creatorName} ({n.creatorRole})
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <Link href="/dashboard/notices" onClick={() => setShowDropdown(false)} style={{
                textAlign: 'center', 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: 'var(--primary)', 
                textDecoration: 'none',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.5rem',
                display: 'block'
              }}>
                সব নোটিশ দেখুন &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
