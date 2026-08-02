"use client";

import { useEffect } from "react";

export default function UserHeartbeat() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const lastSent = sessionStorage.getItem("uvc_last_heartbeat");
        const now = Date.now();

        // Throttle client fetches to once every 2 minutes (120,000 ms)
        if (lastSent && now - parseInt(lastSent, 10) < 120000) {
          return;
        }

        sessionStorage.setItem("uvc_last_heartbeat", now.toString());
        await fetch("/api/user/heartbeat", { method: "POST" });
      } catch (e) {
        // Silent catch for heartbeat
      }
    };

    sendHeartbeat();

    // Send periodic heartbeat every 2.5 minutes (150,000 ms)
    const interval = setInterval(sendHeartbeat, 150000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
