"use client";

import { Search, Bell, X, Calendar, User as UserIcon, LogOut, ChevronDown, Shield, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

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

const roleTitles: Record<string, string> = {
  CONTROLLER: "কন্ট্রোলার",
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সাধারণ সদস্য",
};

export default function TopNav({ user, activeNoticesCount = 0, clubSettings, notices = [], collectionStats }: TopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
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
      gap: '0.5rem',
      minWidth: 0,
    }}>
      {/* Spacer for hamburger button on mobile */}
      <div className="topnav-hamburger-spacer"></div>

      {/* Logo and Club Name Title (Centered on Desktop, Left on Mobile via CSS) */}
      <div className="topnav-title-container">
        <div className="topnav-logo-box">
          <img src={clubSettings?.logo || "/logo.jpg"} alt={clubSettings?.name || "Logo"} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 className="topnav-title-text">{clubSettings?.name || "United Vision"}</h1>
      </div>

      {/* Right Side Icons Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.6rem', position: 'relative', zIndex: 2 }}>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {/* 1. Notification Bell */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
              onClick={() => { setShowDropdown(!showDropdown); setShowProfileMenu(false); }}
              style={{ 
                position: 'relative', 
                width: '38px', 
                height: '38px', 
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
                top: '48px',
                right: '0px',
                width: '300px',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
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
                          <UserIcon size={10} /> {n.creatorName} ({n.creatorRole})
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

          {/* 2. User Profile & Mobile Logout Avatar Button */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowDropdown(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 6px 3px 3px',
                borderRadius: '2rem',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
              title="User Account & Logout"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {/* Profile & Logout Dropdown Popover */}
            {showProfileMenu && (
              <div style={{
                position: 'fixed',
                top: '56px',
                right: '0.75rem',
                width: '250px',
                maxWidth: 'calc(100vw - 1.5rem)',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border)',
                zIndex: 99999,
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                {/* User Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.nameBn || user?.name}
                    </p>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '2px'
                    }}>
                      {roleTitles[user?.role] || user?.role || "মেম্বার"}
                    </span>
                  </div>
                </div>

                {/* Profile Link */}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <UserIcon size={16} color="#0284c7" />
                  <span>প্রোফাইল প্রোফাইল পেজ</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <Settings size={16} color="#64748b" />
                  <span>সেটিংস</span>
                </Link>

                {/* Direct Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '0.6rem',
                    border: 'none',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.12)'
                  }}
                >
                  <LogOut size={16} />
                  <span>লগআউট করুন (Log Out)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
