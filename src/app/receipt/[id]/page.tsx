import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./receipt.module.css";
import PrintButton from "./PrintButton";
import WhatsAppButton from "./WhatsAppButton";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id: resolvedParams.id },
    include: { user: true },
  });

  if (!transaction) notFound();

  // Check 1 month (30 days) receipt validity rule
  const createdDate = new Date(transaction.createdAt);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays > 30;

  if (isExpired) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
          ⏳
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          এই রশিদের ১ মাসের মেয়াদের সময়সীমা শেষ হয়েছে
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          সর্বশেষ পোস্টিং এর মেম্বার ক্যাশ রশিদের মেয়াদ ১ মাস (৩০ দিন)। তবে আপনার সকল লেনদেন বিবরণী চিরস্থায়ীভাবে আপনার ড্যাশবোর্ডে সংরক্ষিত রয়েছে।
        </p>
        <Link href="/dashboard/finance" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700 }}>
          📋 মূল লেনদেন বিবরণীতে যান (View Statement)
        </Link>
      </div>
    );
  }

  // Sequential member ID (001–020)
  const allMembers = await prisma.user.findMany({
    where: { activeStatus: true, isDeleted: false },
    orderBy: { createdAt: "asc" },
  });
  const memberIndex = allMembers.findIndex(m => m.id === transaction.userId);
  const memberSerial = memberIndex !== -1 ? memberIndex + 1 : 1;
  const memberSerialStr = toBengaliNumber(memberSerial).padStart(3, "০");

  // All deposits → totals
  const allDeposits = await prisma.transaction.findMany({
    where: { userId: transaction.userId, type: "DEPOSIT" },
    orderBy: { createdAt: "asc" },
  });
  const currentIdx = allDeposits.findIndex(t => t.id === transaction.id);
  const totalPaid    = allDeposits.slice(0, currentIdx + 1).reduce((s, t) => s + t.amount, 0);
  const totalInstall = currentIdx + 1;

  const receiptNo  = `UVC-${transaction.id.substring(0, 8).toUpperCase()}`;
  const memberName = transaction.user.nameBn || transaction.user.name;
  const receiptDate = new Date(transaction.createdAt).toLocaleDateString("bn-BD", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  // Club settings
  let cs = {
    name: "ইউনাইটেড ভিশন ক্লাব",
    address: "বরইতলী, চকরিয়া, কক্সবাজার।",
    logo: null as string | null,
    paidLogo: "/paid-stamp.png",
    watermarkLogo: null as string | null,
  };
  if (prisma.clubSettings) {
    const row = await (prisma.clubSettings as any).findUnique({ where: { id: "singleton" } });
    if (row) {
      if (row.name)         cs.name         = row.name;
      if (row.address)      cs.address      = row.address;
      if (row.logo)         cs.logo         = row.logo;
      if (row.paidLogo)     cs.paidLogo     = row.paidLogo;
      if (row.watermarkLogo) cs.watermarkLogo = row.watermarkLogo;
    }
  }

  const receiptUrl = `/receipt/${transaction.id}`;

  return (
    <div className={styles.container}>
      {/* ── Action Bar (screen only) ── */}
      <div className={styles.actionBar}>
        <Link href="/dashboard/admin/finance" className={styles.btnBack}>
          <ArrowLeft size={16} /> ফিরে যান
        </Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <WhatsAppButton
            mobile={transaction.user.mobile}
            name={memberName}
            amount={transaction.amount}
            type={transaction.type}
            receiptNo={receiptNo}
            date={receiptDate}
            receiptUrl={receiptUrl}
          />
          <PrintButton className={styles.btnPrint} />
        </div>
      </div>

      {/* ══════════════════════════════════════
          RECEIPT  7.5 in × 5 in
      ══════════════════════════════════════ */}
      <div className={styles.receiptPaper} id="print-area">

        {/* Watermark — centered over the TABLE area (lower half) */}
        {cs.watermarkLogo && (
          <div className={styles.watermarkWrapper}>
            <img src={cs.watermarkLogo} alt="" className={styles.watermarkImage} />
          </div>
        )}

        {/* ── HEADER BAND (gradient) ── */}
        <div className={styles.headerBand}>

          {/* Logo + Name side-by-side */}
          <div className={styles.logoName}>
            {cs.logo && (
              <img src={cs.logo} alt="logo" className={styles.logoImg} />
            )}
            <div className={styles.nameBlock}>
              <h1 className={styles.clubName}>{cs.name}</h1>
              <p className={styles.clubAddress}>{cs.address}</p>
            </div>
          </div>

          {/* Member ID badge */}
          <div className={styles.memberIdBadge}>
            <span className={styles.memberIdLabel}>সদস্য আইডি</span>
            <span className={styles.memberIdVal}>{memberSerialStr}</span>
          </div>
        </div>

        {/* ── TITLE STRIP ── */}
        <div className={styles.titleStrip}>
          <span className={styles.titleText}>মানি রিসিট (Money Receipt)</span>
        </div>

        {/* ── MEMBER INFO ROW ── */}
        <div className={styles.infoRow}>
          <span><strong>সদস্য নাম:</strong> {memberName}</span>
          <span><strong>মোবাইল:</strong> {transaction.user.mobile}</span>
          <span><strong>তারিখ:</strong> {receiptDate}</span>
        </div>

        {/* ── TABLE + PAID STAMP ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.mainTable}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: "24%" }}>জমা বিবরণ</th>
                <th className={styles.th} style={{ width: "28%" }}>টাকা</th>
                <th className={styles.th} colSpan={2} style={{ width: "48%" }}>জমার সর্বশেষ হিসাব</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.tdC}><strong>জমা</strong></td>
                <td className={styles.tdC}>{toBengaliNumber(transaction.amount)}/-</td>
                <td className={styles.tdC} style={{ width: "26%" }}>মোট কিস্তি:</td>
                <td className={styles.tdC} style={{ width: "22%" }}><strong>{toBengaliNumber(totalInstall)}</strong></td>
              </tr>
              <tr>
                <td className={styles.tdC}><strong>জরিমানা</strong></td>
                <td className={styles.tdC}>০</td>
                <td className={styles.tdC}>সর্বমোট জমা:</td>
                <td className={styles.tdC}><strong>{toBengaliNumber(totalPaid)}/-</strong></td>
              </tr>
              <tr>
                <td className={styles.tdC}><strong>কথায়</strong></td>
                <td className={styles.tdL} colSpan={3}>
                  {convertToWords(transaction.amount)} টাকা মাত্র।
                </td>
              </tr>
            </tbody>
          </table>

          {/* PAID Stamp — center of table */}
          <div className={styles.paidStamp}>
            <img src={cs.paidLogo} alt="PAID" width={105} height={105} style={{ objectFit: "contain" }} />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          এই রিসিটটি <strong>কম্পিউটার জেনারেটেড</strong> — কোনো স্বাক্ষরের প্রয়োজন নেই।
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function toBengaliNumber(n: number): string {
  const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return n.toString().replace(/\d/g, d => bn[+d]);
}
function convertToWords(n: number): string {
  const ones = ["","এক","দুই","তিন","চার","পাঁচ","ছয়","সাত","আট","নয়",
    "দশ","এগারো","বারো","তেরো","চৌদ্দ","পনের","ষোল","সতের","আঠারো","উনিশ"];
  const tens = ["","","বিশ","ত্রিশ","চল্লিশ","পঞ্চাশ","ষাট","সত্তর","আশি","নব্বই"];
  if (n === 0) return "শূন্য";
  let r = "";
  if (n >= 100000) { r += convertToWords(Math.floor(n/100000)) + " লক্ষ "; n %= 100000; }
  if (n >= 1000)   { r += convertToWords(Math.floor(n/1000))   + " হাজার "; n %= 1000; }
  if (n >= 100)    { r += ones[Math.floor(n/100)] + " শত "; n %= 100; }
  if (n >= 20)     { r += tens[Math.floor(n/10)] + (n%10 ? " "+ones[n%10] : ""); n=0; }
  else if (n > 0)  { r += ones[n]; }
  return r.trim();
}
