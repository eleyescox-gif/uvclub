"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  Vote, 
  Briefcase, 
  Users, 
  UserPlus, 
  LogOut, 
  Settings,
  FileText,
  ShieldCheck,
  Megaphone,
  Menu,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./sidebar.module.css";

const roleTitles: Record<string, string> = {
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সাধারণ সদস্য",
};

interface SidebarProps {
  role: string;
  user: any;
  totalMembersCount?: number;
}

export default function Sidebar({ role, user, totalMembersCount }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
    { name: "Finance & Statement", href: "/dashboard/finance", icon: <Wallet size={18} />, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
    { name: "Applications", href: "/dashboard/applications", icon: <FileText size={18} />, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)" },
    { name: "Voting", href: "/dashboard/voting", icon: <Vote size={18} />, color: "#6366f1", bg: "rgba(99, 102, 241, 0.12)" },
    { name: "Projects", href: "/dashboard/projects", icon: <Briefcase size={18} />, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)" },
    { name: "Members", href: "/dashboard/members", icon: <Users size={18} />, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
    { name: "Notices", href: "/dashboard/notices", icon: <Megaphone size={18} />, color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)" },
  ];

  const adminItems = [];
  if (role === "ADMIN" || role === "PRESIDENT") {
    adminItems.push({ name: "Member Requests", href: "/dashboard/admin/members/pending", icon: <UserPlus size={18} />, color: "#ea580c", bg: "rgba(234, 88, 12, 0.12)" });
  }
  
  if (role === "ADMIN" || role === "SECRETARY" || role === "PRESIDENT") {
    adminItems.push({ name: "Member Manage", href: "/dashboard/admin/members/manage", icon: <Users size={18} />, color: "#2563eb", bg: "rgba(37, 99, 235, 0.12)" });
  }
  
  if (role === "ADMIN" || role === "PRESIDENT") {
    adminItems.push({ name: "Committee Manage", href: "/dashboard/admin/committee", icon: <ShieldCheck size={18} />, color: "#7c3aed", bg: "rgba(124, 58, 237, 0.12)" });
  }

  if (role === "ADMIN" || role === "SECRETARY" || role === "PRESIDENT") {
    adminItems.push({ name: "Member Entry", href: "/dashboard/admin/members/add", icon: <UserPlus size={18} />, color: "#059669", bg: "rgba(5, 150, 105, 0.12)" });
  }
  
  if (role === "ADMIN" || role === "CASHIER") {
    adminItems.push({ name: "Admin Finance", href: "/dashboard/admin/finance", icon: <Wallet size={18} />, color: "#d97706", bg: "rgba(217, 119, 6, 0.12)" });
  }
  
  if (role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY") {
    adminItems.push({ name: "Admin Projects", href: "/dashboard/admin/projects", icon: <Briefcase size={18} />, color: "#0891b2", bg: "rgba(8, 145, 178, 0.12)" });
  }
  
  if (role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY" || role === "CASHIER") {
    adminItems.push({ name: "Reports", href: "/dashboard/admin/reports", icon: <FileText size={18} />, color: "#e11d48", bg: "rgba(225, 29, 72, 0.12)" });
  }

  if (role === "SECRETARY" || role === "ADMIN") {
    adminItems.push({ name: "Data Clear Requests", href: "/dashboard/admin/data-clear", icon: <ShieldCheck size={18} />, color: "#dc2626", bg: "rgba(220, 38, 38, 0.12)" });
  }

  const generalItems = [
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={18} />, color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" },
  ];

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      <button 
        className={`${styles.hamburger} no-print`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay Backdrop (Mobile Only) */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} 
        onClick={() => setIsOpen(false)} 
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Centered Profile Section (No Outer Box) */}
        <div className={styles.profileSection}>
          <Link href="/dashboard/profile" className={styles.profileLink} onClick={() => setIsOpen(false)}>
            <div className={styles.avatar}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>{user?.name?.charAt(0) || "U"}</>
              )}
            </div>
            <div className={styles.profileDetails}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', margin: 0, lineHeight: 1.2 }}>{user?.name}</p>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                fontWeight: 600, 
                marginTop: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
              }}>
                {roleTitles[role] || role}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          
          {/* Menu Section */}
          <div>
            <span className={styles.menuHeader}>Menu</span>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setIsOpen(false)} style={{
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : '#4b5563',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.875rem',
                  }}>
                    {isActive && <div className={styles.activeIndicator} />}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: item.bg,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {item.icon}
                    </div>
                    <span className={styles.navText} style={{ flex: 1 }}>{item.name}</span>
                    {item.name === "Members" && totalMembersCount !== undefined && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        marginLeft: 'auto'
                      }}>
                        {totalMembersCount} জন
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Admin Section */}
          {adminItems.length > 0 && (
            <div>
              <span className={styles.menuHeader}>Admin Control</span>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {adminItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setIsOpen(false)} style={{
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      color: isActive ? 'var(--primary)' : '#4b5563',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.875rem',
                    }}>
                      {isActive && <div className={styles.activeIndicator} />}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: item.bg,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {item.icon}
                      </div>
                      <span className={styles.navText}>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {generalItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setIsOpen(false)} style={{
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : '#4b5563',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.875rem',
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {item.icon}
                  </div>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              );
            })}
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={styles.logoutBtn}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <LogOut size={18} />
              </div>
              <span className={styles.logoutText}>Logout</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
