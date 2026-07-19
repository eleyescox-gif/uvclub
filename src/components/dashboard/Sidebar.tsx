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
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./sidebar.module.css";

const roleTitles: Record<string, string> = {
  PRESIDENT: "সভাপতি",
  SECRETARY: "সাধারণ সম্পাদক",
  CASHIER: "ক্যাশিয়ার",
  ADMIN: "অ্যাডমিন",
  MEMBER: "সাধারণ সদস্য",
};

interface SidebarProps {
  role: string;
  user: any;
}

export default function Sidebar({ role, user }: SidebarProps) {
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
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Finance", href: "/dashboard/finance", icon: <Wallet size={18} /> },
    { name: "Voting", href: "/dashboard/voting", icon: <Vote size={18} /> },
    { name: "Projects", href: "/dashboard/projects", icon: <Briefcase size={18} /> },
    { name: "Members", href: "/dashboard/members", icon: <Users size={18} /> },
    { name: "Notices", href: "/dashboard/notices", icon: <Megaphone size={18} /> },
    { name: "Report", href: "/dashboard/report", icon: <FileText size={18} /> },
  ];

  const adminItems = [];
  if (role === "ADMIN" || role === "PRESIDENT") {
    adminItems.push({ name: "Member Requests", href: "/dashboard/admin/members/pending", icon: <UserPlus size={18} /> });
  }
  
  if (role === "ADMIN" || role === "SECRETARY" || role === "PRESIDENT") {
    adminItems.push({ name: "Member Manage", href: "/dashboard/admin/members/manage", icon: <Users size={18} /> });
  }
  
  if (role === "ADMIN" || role === "PRESIDENT") {
    adminItems.push({ name: "Committee Manage", href: "/dashboard/admin/committee", icon: <ShieldCheck size={18} /> });
  }

  if (role === "ADMIN" || role === "SECRETARY" || role === "PRESIDENT") {
    adminItems.push({ name: "Member Entry", href: "/dashboard/admin/members/add", icon: <UserPlus size={18} /> });
  }
  
  if (role === "ADMIN" || role === "CASHIER") {
    adminItems.push({ name: "Admin Finance", href: "/dashboard/admin/finance", icon: <Wallet size={18} /> });
  }
  
  if (role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY") {
    adminItems.push({ name: "Admin Projects", href: "/dashboard/admin/projects", icon: <Briefcase size={18} /> });
  }
  
  if (role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY" || role === "CASHIER") {
    adminItems.push({ name: "Reports (রিপোর্ট)", href: "/dashboard/admin/reports", icon: <FileText size={18} /> });
  }

  if (role === "SECRETARY" || role === "ADMIN") {
    adminItems.push({ name: "Data Clear Requests", href: "/dashboard/admin/data-clear", icon: <ShieldCheck size={18} /> });
  }

  const generalItems = [
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      <button 
        className={styles.hamburger} 
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1 }}>
          
          {/* Menu Section */}
          <div>
            <span className={styles.menuHeader}>Menu</span>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setIsOpen(false)} style={{
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : '#6b7280',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                  }}>
                    {isActive && <div className={styles.activeIndicator} />}
                    {item.icon}
                    <span className={styles.navText}>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Admin Section */}
          {adminItems.length > 0 && (
            <div>
              <span className={styles.menuHeader}>Admin Control</span>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {adminItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setIsOpen(false)} style={{
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      color: isActive ? 'var(--primary)' : '#6b7280',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.875rem',
                    }}>
                      {isActive && <div className={styles.activeIndicator} />}
                      {item.icon}
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {generalItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setIsOpen(false)} style={{
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : '#6b7280',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                }}>
                  {item.icon}
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              );
            })}
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={styles.logoutBtn}
            >
              <LogOut size={18} />
              <span className={styles.logoutText}>Logout</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
