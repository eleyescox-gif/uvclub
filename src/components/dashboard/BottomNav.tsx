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
      href: "/dashboard",
      icon: <LayoutDashboard size={21} />,
      color: "#059669",          // emerald
      bg: "rgba(5,150,105,0.12)",
      activeBg: "#ecfdf5",
    },
    {
      name: "ফাইন্যান্স",
      href: "/dashboard/finance",
      icon: <Wallet size={21} />,
      color: "#d97706",          // amber
      bg: "rgba(217,119,6,0.12)",
      activeBg: "#fffbeb",
    },
    {
      name: "নোটিশ",
      href: "/dashboard/notices",
      icon: <Megaphone size={21} />,
      color: "#e11d48",          // rose
      bg: "rgba(225,29,72,0.12)",
      activeBg: "#fff1f2",
    },
    {
      name: "ভোট",
      href: "/dashboard/voting",
      icon: <Vote size={21} />,
      color: "#4f46e5",          // indigo
      bg: "rgba(79,70,229,0.12)",
      activeBg: "#eef2ff",
    },
    {
      name: "প্রজেক্ট",
      href: "/dashboard/projects",
      icon: <Briefcase size={21} />,
      color: "#0891b2",          // cyan
      bg: "rgba(8,145,178,0.12)",
      activeBg: "#ecfeff",
    },
  ];

  return (
    <>
      <nav
        className="mobile-bottom-nav no-print"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "66px",
          backgroundColor: "rgba(255,255,255,0.92)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.07)",
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 0.25rem calc(env(safe-area-inset-bottom))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
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
                padding: "4px 2px",
                position: "relative",
              }}
            >
              {/* Icon pill */}
              <div
                style={{
                  width: "44px",
                  height: "28px",
                  borderRadius: "14px",
                  backgroundColor: active ? item.bg : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? item.color : "#9ca3af",
                  transform: active ? "scale(1.08)" : "scale(1)",
                  transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow: active
                    ? `0 2px 10px ${item.color}28`
                    : "none",
                }}
              >
                {item.icon}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: active ? 800 : 500,
                  color: active ? item.color : "#9ca3af",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  transition: "color 0.2s ease",
                }}
              >
                {item.name}
              </span>

              {/* Active dot indicator */}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Inject the display:flex for the nav (only on mobile via CSS) */}
      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
