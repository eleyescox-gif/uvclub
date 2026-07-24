"use client";

import { useEffect } from "react";

export default function UserHeartbeat() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/user/heartbeat", { method: "POST" });
      } catch (e) {
        // Silent catch for heartbeat
      }
    };

    // Send heartbeat immediately on page load
    sendHeartbeat();

    // Send heartbeat every 60 seconds
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
