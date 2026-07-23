import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import ProfileEditForm from "./ProfileEditForm";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id }
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
        আমার প্রোফাইল ও নিরাপত্তা সেটিংস
      </h1>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <ProfileEditForm user={user} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
