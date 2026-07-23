"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function createNotice(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CASHIER" && role !== "CONTROLLER") {
    return { error: "Unauthorized. Only authorized leaders/controller can post notices." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const bannerImage = (formData.get("bannerImage") as string) || null;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  try {
    await prisma.notice.create({
      data: {
        title,
        content,
        bannerImage,
        createdBy: (session.user as any).id,
        isActive: true,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notices");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create notice" };
  }
}

export async function deleteNotice(noticeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CASHIER" && role !== "CONTROLLER") {
    return { error: "Unauthorized. Only authorized leaders/controller can delete notices." };
  }

  try {
    await prisma.notice.update({
      where: { id: noticeId },
      data: { isActive: false }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notices");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete notice" };
  }
}
