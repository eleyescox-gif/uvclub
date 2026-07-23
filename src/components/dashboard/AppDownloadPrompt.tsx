"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export default function AppDownloadPrompt() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA app mode
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed prompt recently
    const isDismissed = sessionStorage.getItem("uvc_app_prompt_dismissed");
    if (isDismissed) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show prompt anyway after 3 seconds if not in PWA mode
    const timer = setTimeout(() => {
      const isDismissedCheck = sessionStorage.getItem("uvc_app_prompt_dismissed");
      if (!isDismissedCheck) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for browser PWA installation
      alert(
        "📲 অ্যাপস ইনস্টল করার নির্দেশিকা:\n\n১. ব্রাউজারের উপরে/নিচে ৩-ডট মেনু (Menu)-তে ক্লিক করুন।\n২. 'Add to Home screen' বা 'Install App' নির্বাচন করুন।"
      );
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("uvc_app_prompt_dismissed", "true");
  };

  // Do NOT show if logged in OR not on public home page ("/")
  if (session?.user || pathname !== "/" || isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        width: "92%",
        maxWidth: "480px",
        backgroundColor: "#059669",
        color: "#ffffff",
        borderRadius: "16px",
        padding: "1rem 1.25rem",
        boxShadow: "0 20px 40px -10px rgba(5, 150, 105, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* App Icon Badge */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            <Smartphone size={24} color="#059669" />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                ইউনাইটেড ভিশন ক্লাব অ্যাপস
              </h4>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                PWA App
              </span>
            </div>

            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#a7f3d0", lineHeight: 1.35 }}>
              দ্রুত চাঁদা জমা, নোটিশ ও একাউন্ট দেখতে হোমস্ক্রিনে অ্যাপস যোগ করুন।
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "none",
            color: "#ffffff",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Dismiss app download prompt"
        >
          <X size={16} />
        </button>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            color: "#047857",
            border: "none",
            padding: "0.55rem 1rem",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Download size={16} />
          <span>📲 অ্যাপস ডাউনলোড / ইনস্টল করুন</span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "0.55rem 0.85rem",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          পরে
        </button>
      </div>
    </div>
  );
}
