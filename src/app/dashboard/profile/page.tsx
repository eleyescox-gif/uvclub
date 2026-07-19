import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import ProfileEditForm from "./ProfileEditForm";

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
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Profile</h1>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: '800px' }}>
        <ProfileEditForm user={user} />
      </div>
    </div>
  );
}
