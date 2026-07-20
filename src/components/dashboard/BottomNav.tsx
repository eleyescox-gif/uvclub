"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  Megaphone, 
  Vote, 
  Users, 
  User, 
  ShieldCheck,
  Briefcase
} from "lucide-react";

interface BottomNavProps {
  role: string;
  user: any;
}

export default function BottomNav({ role, user }: BottomNavProps) {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      name: "হোম",
      nameEn: "Home",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      color: "#10b981"
    },
    {
      name: "ফাইন্যান্স",
      nameEn: "Finance",
      href: "/dashboard/finance",
      icon: <Wallet size={20} />,
      color: "#f59e0b"
    },
    {
      name: "নোটিশ",
      nameEn: "Notice",
      href: "/dashboard/notices",
      icon: <Megaphone size={20} />,
      color: "#f43f5e"
    },
    {
      name: "ভোট",
      nameEn: "Vote",
      href: "/dashboard/voting",
      icon: <Vote size={20} />,
      color: "#6366f1"
    },
    {
      name: "প্রজেক্ট",
      nameEn: "Projects",
      href: "/dashboard/projects",
      icon: <Briefcase size={20} />,
      color: "#06b6d4"
    }
  ];

  return (
    <nav 
      className="mobile-bottom-nav no-print"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        backgroundColor: "#ffffff",
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
        zIndex: 9990,
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 0.5rem calc(env(safe-area-inset-bottom) + 0.2rem)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)"
      }}
    >
      {navItems.map((item) => {
        const active = isCurrent(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              textDecoration: "none",
              gap: "3px",
              color: active ? "var(--primary)" : "#64748b",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              padding: "4px 0",
              position: "relative"
            }}
          >
            {active && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  width: "24px",
                  height: "3px",
                  backgroundColor: "var(--primary)",
                  borderRadius: "999px",
                  boxShadow: "0 2px 8px rgba(15, 103, 61, 0.4)"
                }}
              />
            )}
            <div
              style={{
                transform: active ? "scale(1.15) translateY(-2px)" : "scale(1)",
                transition: "transform 0.2s ease",
                color: active ? "var(--primary)" : "#64748b"
              }}
            >
              {item.icon}
            </div>
            <span
              style={{
                fontSize: "0.685rem",
                fontWeight: active ? 900 : 600,
                color: active ? "var(--primary)" : "#64748b",
                letterSpacing: "-0.01em"
              }}
            >
              {item.nameEn}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
