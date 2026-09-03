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
      name: "Home",
      href: "/dashboard",
      icon: <LayoutDashboard size={21} />,
      color: "#059669",
      bg: "rgba(5,150,105,0.12)",
    },
    {
      name: "Finance",
      href: "/dashboard/finance",
      icon: <Wallet size={21} />,
      color: "#d97706",
      bg: "rgba(217,119,6,0.12)",
    },
    {
      name: "Notice",
      href: "/dashboard/notices",
      icon: <Megaphone size={21} />,
      color: "#e11d48",
      bg: "rgba(225,29,72,0.12)",
    },
    {
      name: "Vote",
      href: "/dashboard/voting",
      icon: <Vote size={21} />,
      color: "#4f46e5",
      bg: "rgba(79,70,229,0.12)",
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: <Briefcase size={21} />,
      color: "#0891b2",
      bg: "rgba(8,145,178,0.12)",
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
          height: "64px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 0.25rem calc(env(safe-area-inset-bottom))",
        }}
      >
        {navItems.map((item) => {
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="bottom-nav-item"
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
                WebkitTapHighlightColor: "transparent",
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
                  transition: "all 0.18s ease-out",
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
                  transition: "color 0.18s ease",
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
        .bottom-nav-item:active {
          transform: scale(0.92);
          transition: transform 0.1s ease;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
        @media print {
          .mobile-bottom-nav, nav, footer, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
