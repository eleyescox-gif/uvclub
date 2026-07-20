import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ApplicationsView from "./ApplicationsView";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const [user, existingExitRequest] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, nameBn: true, mobile: true, role: true }
    }),
    prisma.exitRequest.findFirst({
      where: { userId, status: { in: ["PENDING", "POLL_CREATED"] } }
    })
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <ApplicationsView 
      user={user}
      existingExitRequest={existingExitRequest}
    />
  );
}
