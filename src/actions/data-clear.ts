"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function requestDataClear() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "PRESIDENT") {
    return { error: "Unauthorized. Only the President can request to clear trial data." };
  }

  try {
    // Check if there's already a pending request
    const existing = await prisma.dataClearRequest.findFirst({
      where: { status: "PENDING" }
    });

    if (existing) {
      return { error: "A trial data clearance request is already pending approval." };
    }

    await prisma.dataClearRequest.create({
      data: {
        requestedBy: (session.user as any).id,
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create data clear request." };
  }
}

export async function approveDataClear(requestId: string, approved: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "SECRETARY") {
    return { error: "Unauthorized. Only the Secretary can approve or reject trial data clearance." };
  }

  try {
    const request = await prisma.dataClearRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.status !== "PENDING") {
      return { error: "Request not found or already processed." };
    }

    if (!approved) {
      await prisma.dataClearRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });
      revalidatePath("/dashboard/admin/data-clear");
      return { success: true, message: "Request rejected successfully." };
    }

    // Process Approval
    await prisma.$transaction(async (tx) => {
      // 1. Mark request as APPROVED
      await tx.dataClearRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      });

      // 2. Delete all trial data
      await tx.transaction.deleteMany({});
      await tx.invoice.deleteMany({});
      await tx.vote.deleteMany({});
      await tx.pollOption.deleteMany({});
      await tx.votingEvent.deleteMany({});
      await tx.exitRequest.deleteMany({});
      await tx.notice.deleteMany({});
      await tx.bankReconciliation.deleteMany({});
      await tx.project.deleteMany({});

      // 3. Reset all user balances to 0
      await tx.user.updateMany({
        data: { balance: 0 }
      });
    });

    revalidatePath("/dashboard/admin/data-clear");
    revalidatePath("/dashboard");
    return { success: true, message: "Trial data successfully cleared." };
  } catch (error: any) {
    return { error: error.message || "Failed to process data clear request." };
  }
}
