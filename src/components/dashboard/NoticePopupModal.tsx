"use client";

import { useState, useEffect } from "react";
import { X, Megaphone, Clock, Sparkles } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  bannerImage?: string | null;
  createdAt: string;
  creatorName?: string;
  creatorRole?: string;
}

interface NoticePopupModalProps {
  notices: Notice[];
  autoCloseSeconds?: number;
}

export default function NoticePopupModal({ notices, autoCloseSeconds = 8 }: NoticePopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!notices || notices.length === 0) return;

    // Check if user closed it in this session
    const hasDismissed = sessionStorage.getItem(`notice_dismissed_${notices[0]?.id}`);
    if (!hasDismissed) {
      setIsOpen(true);
    }
  }, [notices]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !notices || notices.length === 0) {
    return null;
  }

  const notice = notices[currentNoticeIndex] || notices[0];

  const handleClose = () => {
    setIsOpen(false);
    if (notice?.id) {
      sessionStorage.setItem(`notice_dismissed_${notice.id}`, "true");
    }
  };

  const progressPercentage = (timeLeft / autoCloseSeconds) * 100;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.25s ease-out",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          position: "relative",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            padding: "1.15rem 1.5rem",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Megaphone size={20} color="#ffffff" />
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#a7f3d0",
                  display: "block",
                }}
              >
                বিশেষ ঘোষণা ও নোটিশ
              </span>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                United Vision Announcement
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close notice popup"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Banner Image (if available) */}
        {notice.bannerImage && (
          <div style={{ width: "100%", maxHeight: "220px", overflow: "hidden", backgroundColor: "#f8fafc" }}>
            <img 
              src={notice.bannerImage} 
              alt={notice.title} 
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
            />
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: "1.5rem" }}>
          {/* Title */}
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "#0f172a",
              marginTop: 0,
              marginBottom: "0.75rem",
              lineHeight: 1.35,
            }}
          >
            {notice.title}
          </h2>

          {/* Content */}
          <div
            style={{
              fontSize: "0.9125rem",
              color: "#334155",
              lineHeight: 1.6,
              maxHeight: "180px",
              overflowY: "auto",
              paddingRight: "4px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {notice.content}
          </div>

          {/* Publisher Badge & Date */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "0.85rem",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            {notice.creatorName && (
              <span style={{ fontWeight: 700, color: "#047857" }}>
                ✍️ {notice.creatorName} ({notice.creatorRole || "কমিটি"})
              </span>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginLeft: "auto" }}>
              <Clock size={13} color="#94a3b8" />
              <span>
                {new Date(notice.createdAt).toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions & Timer Bar */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "0.85rem 1.5rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
            ⏳ {timeLeft} সেকেণ্ড পর স্বয়ংক্রিয় বন্ধ হবে
          </span>

          <button
            onClick={handleClose}
            style={{
              padding: "0.45rem 1.15rem",
              borderRadius: "8px",
              border: "1px solid #059669",
              backgroundColor: "#059669",
              color: "#ffffff",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ঠিক আছে (Close)
          </button>
        </div>

        {/* Progress Bar Animation */}
        <div
          style={{
            height: "4px",
            backgroundColor: "#e2e8f0",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#059669",
              width: `${progressPercentage}%`,
              transition: "width 1s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
