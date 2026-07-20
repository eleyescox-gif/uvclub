"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Send, FileText, ChevronDown, ChevronUp, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportRequestsManager() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/report-requests?scope=admin");
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error("Fetch admin report requests error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, reqItem?: any) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/report-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        fetchRequests();

        // If approved, redirect to that member's ledger report
        if (newStatus === "APPROVED" && reqItem) {
          const fromStr = new Date(reqItem.dateFrom).toISOString().split("T")[0];
          const toStr = new Date(reqItem.dateTo).toISOString().split("T")[0];
          router.push(`/dashboard/admin/reports?type=single-member-ledger&userId=${reqItem.userId}&dateFrom=${fromStr}&dateTo=${toStr}`);
        }
      }
    } catch (e) {
      console.error("Update request status error:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenWhatsApp = (reqItem: any) => {
    const mobile = reqItem.user?.mobile || "";
    const name = reqItem.user?.nameBn || reqItem.user?.name || "সদস্য";
    const fromStr = new Date(reqItem.dateFrom).toLocaleDateString("bn-BD");
    const toStr = new Date(reqItem.dateTo).toLocaleDateString("bn-BD");

    const message = `সম্মানিত ${name},
ইউনাইটেড ভিশন ক্লাব অ্যাপে আপনার আবেদনকৃত অফিশিয়াল লেনদেন বিবরণী/রিপোর্ট (${fromStr} হতে ${toStr}) সাধারণ সম্পাদক কর্তৃক অনুমোদিত ও প্রস্তুত করা হয়েছে।

ধন্যবাদান্তে,
সাধারণ সম্পাদক
ইউনাইটেড ভিশন ক্লাব`;

    const cleanMobile = mobile.replace(/[^0-9]/g, "");
    const formattedMobile = cleanMobile.startsWith("88") ? cleanMobile : `88${cleanMobile}`;
    window.open(`https://api.whatsapp.com/send?phone=${formattedMobile}&text=${encodeURIComponent(message)}`, "_blank");
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING");

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div className="no-print" style={{
      backgroundColor: "white",
      borderRadius: "1rem",
      border: pendingRequests.length > 0 ? "2px solid #f59e0b" : "1px solid var(--border)",
      marginBottom: "2rem",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)"
    }}>
      {/* Banner Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "1rem 1.25rem",
          backgroundColor: pendingRequests.length > 0 ? "rgba(245, 158, 11, 0.08)" : "#f8fafc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "0.6rem",
            backgroundColor: pendingRequests.length > 0 ? "#f59e0b" : "#64748b",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800
          }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
              সদস্যদের রিপোর্ট আবেদনসমূহ (সাধারণ সম্পাদক প্যানেল)
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
              {pendingRequests.length > 0 
                ? `${pendingRequests.length} টি নতুন পেন্ডিং আবেদন অনুমোদনের অপেক্ষায় রয়েছে`
                : "সকল আবেদন প্রক্রিয়াজাত করা হয়েছে"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {pendingRequests.length > 0 && (
            <span style={{ backgroundColor: "#ef4444", color: "white", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 800 }}>
              {pendingRequests.length} পেন্ডিং
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
        </div>
      </div>

      {/* Requests List */}
      {isExpanded && (
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {requests.map((r) => {
            const isPending = r.status === "PENDING";
            const isApproved = r.status === "APPROVED";
            const fromStr = new Date(r.dateFrom).toLocaleDateString("bn-BD");
            const toStr = new Date(r.dateTo).toLocaleDateString("bn-BD");

            return (
              <div 
                key={r.id}
                style={{
                  padding: "1rem 1.15rem",
                  borderRadius: "0.85rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: isPending ? "#fffbeb" : "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <User size={16} color="var(--primary)" />
                      <strong style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--foreground)" }}>
                        {r.user?.nameBn || r.user?.name}
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>
                        ({r.user?.mobile})
                      </span>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "#475569", margin: "0.25rem 0 0", fontWeight: 600 }}>
                      আবেদনের বিবরণ: <span style={{ color: "var(--primary)" }}>{r.reportType === "single-member-ledger" ? "একক সদস্যের লেনদেন বিবরণী" : "চাঁদা রিপোর্ট"}</span> ({fromStr} হতে {toStr})
                    </p>

                    {r.note && (
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.2rem 0 0", fontStyle: "italic" }}>
                        নোট: "{r.note}"
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <span style={{
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    backgroundColor: isPending ? "#fef3c7" : isApproved ? "#dcfce7" : "#fee2e2",
                    color: isPending ? "#d97706" : isApproved ? "#15803d" : "#b91c1c"
                  }}>
                    {isPending ? "পেন্ডিং" : isApproved ? "অনুমোদিত" : "বাতিল"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", borderTop: "1px dashed #cbd5e1", paddingTop: "0.65rem" }}>
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(r.id, "APPROVED", r)}
                        disabled={updatingId === r.id}
                        style={{
                          backgroundColor: "#16a34a",
                          color: "white",
                          border: "none",
                          borderRadius: "0.5rem",
                          padding: "0.45rem 0.85rem",
                          fontSize: "0.775rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem"
                        }}
                      >
                        <CheckCircle2 size={14} /> অনুমোদন ও রিপোর্ট দেখুন
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                        disabled={updatingId === r.id}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "0.5rem",
                          padding: "0.45rem 0.85rem",
                          fontSize: "0.775rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem"
                        }}
                      >
                        <XCircle size={14} /> বাতিল
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
