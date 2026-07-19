import prisma from "@/lib/prisma";
import SmsForm from "./SmsForm";
import { getSmsBalance } from "@/actions/sms";

export const revalidate = 0;

export default async function SmsPanelPage() {
  // Fetch active and non-deleted members
  const members = await prisma.user.findMany({
    where: {
      activeStatus: true,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      nameBn: true,
      mobile: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const balanceRes = await getSmsBalance();
  const initialBalance = balanceRes.success ? String(balanceRes.balance) : "০.০০";
  const initialError = balanceRes.success ? null : (balanceRes.error || "ব্যালেন্স লোড করতে ব্যর্থ");

  return (
    <div style={{ padding: '1.5rem 0', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>এসএমএস প্যানেল (SMS Panel)</h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>সংগঠনের মেম্বারদের মোবাইলে দ্রুত নোটিশ, বকেয়া এবং নোটিফিকেশন পাঠাতে বাল্ক এসএমএস গেটওয়ে ব্যবহার করুন।</p>
      </div>

      <SmsForm members={members} initialBalance={initialBalance} initialError={initialError} />
    </div>
  );
}
