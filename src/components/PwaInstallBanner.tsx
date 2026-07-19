"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Smartphone, CheckCircle2 } from "lucide-react";

export default function PwaInstallBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.log("SW registration failed:", err));
    }

    // 2. Check if already running as standalone PWA
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || 
      (navigator as any).standalone || 
      document.referrer.includes("android-app://");
    
    if (isInStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Check if dismissed recently
    const isDismissed = localStorage.getItem("uvc_pwa_banner_dismissed");
    const dismissedTime = isDismissed ? parseInt(isDismissed, 10) : 0;
    const now = Date.now();
    // Re-show after 1 day if dismissed
    const hidePeriod = 24 * 60 * 60 * 1000;

    // 4. Listen for beforeinstallprompt event (Android / Chrome / Edge / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissedTime || now - dismissedTime > hidePeriod) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not dismissed, show iOS installation hint banner
    if (iosDevice && (!dismissedTime || now - dismissedTime > hidePeriod)) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        alert("আইফোনে অ্যাপ ইনস্টল করতে: Safari ব্রাউজারের নিচে 'Share' (শেয়ার) আইকনে চাপ দিন এবং 'Add to Home Screen' বেছে নিন।");
      } else {
        alert("আপনার ব্রাউজার থ্রি-ডট (⋮) মেনু থেকে 'Add to Home Screen' বা 'Install App' বেছে নিন।");
      }
      return;
    }

    // Trigger native browser install dialog
    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted PWA install prompt");
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("uvc_pwa_banner_dismissed", Date.now().toString());
  };

  if (!showBanner || isStandalone || pathname !== "/") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        width: "calc(100% - 2rem)",
        maxWidth: "480px",
        backgroundColor: "#0F673D",
        color: "#ffffff",
        borderRadius: "1.25rem",
        padding: "0.85rem 1rem",
        boxShadow: "0 20px 35px -10px rgba(15, 103, 61, 0.45), 0 10px 15px -5px rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        animation: "slideUpPwa 0.4s ease-out forwards",
        border: "1.5px solid rgba(255, 255, 255, 0.2)"
      }}
    >
      <style>{`
        @keyframes slideUpPwa {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>

      {/* App Icon */}
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "0.85rem",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          overflow: "hidden"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192x192.jpg"
          alt="UVC Logo"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            // Fallback if image fails
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <Smartphone size={24} color="#0F673D" style={{ display: "none" }} />
      </div>

      {/* Title & Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            ইউনাইটেড ভিশন অ্যাপ
          </h4>
          <CheckCircle2 size={14} color="#4ade80" />
        </div>
        <p style={{ fontSize: "0.75rem", margin: 0, color: "rgba(255, 255, 255, 0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          সহজে ব্যবহারে মোবাইল অ্যাপ ইনস্টল করুন
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: "#ffffff",
            color: "#0F673D",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.5rem 0.85rem",
            fontSize: "0.825rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "transform 0.15s ease, backgroundColor 0.15s ease"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Download size={15} /> ইনস্টল
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Close"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
