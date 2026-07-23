import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import EditMemberForm from "./EditMemberForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SECRETARY" && role !== "PRESIDENT" && role !== "CONTROLLER") {
    redirect("/dashboard");
  }

  const userToEdit = await prisma.user.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!userToEdit) {
    redirect("/dashboard/admin/members/manage");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard/admin/members/manage" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> ফিরে যান
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>সদস্য তথ্য আপডেট</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{userToEdit.name}-এর তথ্য পরিবর্তন করুন</p>
        </div>
      </div>

      <EditMemberForm user={userToEdit} currentUserRole={role} />
    </div>
  );
}
