"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function executeDatabaseCleanup() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "অননুমোদিত অ্যাক্সেস" };
  }

  const role = (session.user as any).role;
  const mobile = (session.user as any).mobile;

  // Only President, Controller, or Admin can execute DB cleanup
  if (mobile !== "01812000109" && role !== "CONTROLLER" && role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "অনুমতি নেই। কেবল কন্ট্রোলার বা সভাপতি ডাটাবেস পার্জ করতে পারবেন।" };
  }

  try {
    // 1. Permanently Hard Delete soft deleted users
    const deletedUsers = await prisma.user.deleteMany({
      where: { isDeleted: true }
    });

    // 2. Delete inactive notices
    const deletedNotices = await prisma.notice.deleteMany({
      where: { isActive: false }
    });

    // 3. Delete rejected report requests
    const deletedReportReqs = await prisma.reportRequest.deleteMany({
      where: { status: "REJECTED" }
    });

    // 4. Delete processed DataClearRequests
    const deletedClearReqs = await prisma.dataClearRequest.deleteMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } }
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      stats: {
        usersPurged: deletedUsers.count,
        noticesPurged: deletedNotices.count,
        reportRequestsPurged: deletedReportReqs.count,
        clearRequestsPurged: deletedClearReqs.count
      }
    };
  } catch (error: any) {
    return { error: error.message || "ডাটাবেস পার্জ করতে ব্যর্থ হয়েছে।" };
  }
}
