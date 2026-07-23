"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function assignToCommittee(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const currentUserRole = (session.user as any).role;
  if (currentUserRole !== "ADMIN" && currentUserRole !== "PRESIDENT" && currentUserRole !== "CONTROLLER" && currentUserRole !== "SECRETARY") {
    return { error: "Unauthorized. Only authorized leaders can assign committee members." };
  }

  const userId = formData.get("userId") as string;
  const designation = formData.get("designation") as string;
  const systemRole = formData.get("systemRole") as string; // PRESIDENT, SECRETARY, CASHIER, ADMIN, MEMBER

  if (!userId || !designation || !systemRole) {
    return { error: "সবগুলো ফিল্ড পূরণ করা আবশ্যক।" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create the Committee record
      await tx.committee.upsert({
        where: { userId },
        update: {
          designation,
          termStart: new Date(),
        },
        create: {
          userId,
          designation,
          termStart: new Date(),
        }
      });

      // 2. Update the User system role/permissions
      await tx.user.update({
        where: { id: userId },
        data: {
          role: systemRole
        }
      });
    });

    revalidatePath("/dashboard/admin/committee");
    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to assign to committee." };
  }
}

export async function removeFromCommittee(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role;
  
  if (currentUserRole !== "ADMIN" && currentUserRole !== "PRESIDENT" && currentUserRole !== "CONTROLLER" && currentUserRole !== "SECRETARY") {
    return { error: "Unauthorized. Only authorized leaders/controller can remove committee members." };
  }

  // Prevent self-deletion of controller
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true }
  });

  if (targetUser?.role === "CONTROLLER" || userId === currentUserId) {
    return { error: "সক্রিয় কন্ট্রোলার নিজেকে বা অন্য কোনো কন্ট্রোলারকে তালিকা থেকে বাদ দিতে পারবেন না।" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete the Committee record
      await tx.committee.delete({
        where: { userId }
      }).catch(() => {});

      // 2. Reset the User's role back to MEMBER
      await tx.user.update({
        where: { id: userId },
        data: {
          role: "MEMBER"
        }
      });
    });

    revalidatePath("/dashboard/admin/committee");
    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to remove from committee." };
  }
}
