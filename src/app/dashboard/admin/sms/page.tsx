import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSmsBalance } from "@/actions/sms";
import SmsForm from "./SmsForm";
import { MessageSquare, Wallet, CheckCircle2, ShieldCheck, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SmsPanelPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userMobile = (session.user as any).mobile;
  const rawRole = (session.user as any).role;
  const isController = userMobile === "01812000109" || rawRole === "CONTROLLER";
  const role = isController ? "CONTROLLER" : rawRole;
  const isAdmin = role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY" || role === "CASHIER" || isController;

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Parallel fetch: SMS balance and active members
  const [balanceRes, members] = await Promise.all([
    getSmsBalance(),
    prisma.user.findMany({
      where: { activeStatus: true, isDeleted: false },
      select: { id: true, name: true, nameBn: true, mobile: true },
      orderBy: [{ nameBn: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "56rem", margin: "0 auto" }}>
      {/* Header */}
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MessageSquare size={28} color="var(--primary)" /> এসএমএস কন্ট্রোল প্যানেল (SMS Gateway)
        </h1>
        <p style={{ color: "#6b7280", marginTop: "0.25rem", fontSize: "0.875rem" }}>
          সদস্যদের চাঁদা জমার স্বয়ংক্রিয় রশিদ এসএমএস এবং জরুরি বাল্ক নোটিফিকেশন ব্যবস্থাপনা।
        </p>
      </header>

      {/* Stats Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {/* Balance Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>লাইভ এসএমএস ব্যালেন্স</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(5, 150, 105, 0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
            ৳ {balanceRes.balance}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.25rem", fontWeight: 600 }}>
            ● BulkSMSBD.net এপিআই সংযুক্ত
          </p>
        </div>

        {/* Sender ID Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>অনুমোদিত সেন্ডার আইডি</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(79, 70, 229, 0.12)",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Radio size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>
            8809617613435
          </div>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", fontWeight: 600 }}>
            অনুমোদিত অফিসিয়াল নম্বর
          </p>
        </div>

        {/* Auto Deposit SMS Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>স্বয়ংক্রিয় জমা রশিদ</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#10b981" }}>
            সক্রিয় (Active)
          </div>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", fontWeight: 600 }}>
            টাকা জমা হলেই ইনস্ট্যান্ট এসএমএস
          </p>
        </div>
      </div>

      {/* Feature Highlight Notice */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "0.85rem",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.875rem", color: "#166534", lineHeight: 1.5 }}>
          <strong>স্বয়ংক্রিয় জমা রসিদ সক্রিয়:</strong> যখনই কোনো সদস্যের চাঁদা বা অর্থ জমা (অনলাইন বা ক্যাশিয়ার মাধ্যমে) অনুমোদিত হবে, সাথে সাথে সদস্যের মোবাইলে স্বয়ংক্রিয়ভাবে জমার পরিমাণ, রশিদ নম্বর এবং বর্তমান মোট ব্যালেন্স উল্লেখ করে অফিশিয়াল এসএমএস পৌঁছে যাবে।
        </div>
      </div>

      {/* Send Custom/Bulk SMS Form Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          padding: "1.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0f172a" }}>
          কাস্টম বা নোটিশ এসএমএস প্রেরণ
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ক্লাবের সকল সদস্যকে সাধারণ নোটিশ, মিটিংয়ের তারিখ বা বকেয়া সংক্রান্ত বার্তা পাঠাতে নিচের ফর্মটি ব্যবহার করুন।
        </p>

        <SmsForm members={members} />
      </div>
    </div>
  );
}
