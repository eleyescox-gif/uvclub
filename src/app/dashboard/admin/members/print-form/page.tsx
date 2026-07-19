import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MemberAdmissionForm from "@/components/print/MemberAdmissionForm";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import PrintButton from "./PrintButton";

export default async function PrintMemberFormPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SECRETARY" && role !== "PRESIDENT" && role !== "CASHIER") {
    redirect("/dashboard");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/admin/members/add" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> ফিরে যান
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>সদস্য এন্ট্রি ফরম (প্রিন্ট)</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>অফলাইন ব্যবহারের জন্য ফাঁকা ফরমটি প্রিন্ট করুন</p>
          </div>
        </div>
        
        <PrintButton />
      </div>

      <div style={{ padding: '2rem', backgroundColor: '#e5e7eb', borderRadius: '1rem', overflowX: 'auto', display: 'flex', justifyContent: 'center' }} className="no-print-bg">
        <div style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
          <MemberAdmissionForm />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print, .no-print-bg {
            background-color: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
