"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function requestExit(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SECRETARY") {
    return { error: "Unauthorized. Only Secretary can request exit for a member." };
  }

  const memberId = formData.get("memberId") as string;
  const reason = formData.get("reason") as string;

  if (!memberId || !reason) {
    return { error: "Member ID and reason are required" };
  }

  try {
    // Check if there is already a pending request for this user
    const existingRequest = await prisma.exitRequest.findFirst({
      where: { userId: memberId, status: { in: ["PENDING", "POLL_CREATED"] } }
    });

    if (existingRequest) {
      return { error: "An exit request is already in progress for this member." };
    }

    await prisma.exitRequest.create({
      data: {
        userId: memberId,
        reason,
        requestedBy: (session.user as any).id,
        status: "PENDING"
      }
    });

    revalidatePath("/dashboard/admin/exit-requests");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create exit request" };
  }
}

export async function processExit(exitRequestId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT") {
    return { error: "Unauthorized. Only President can finalize an exit." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const exitReq = await tx.exitRequest.findUnique({
        where: { id: exitRequestId },
        include: { user: true }
      });

      if (!exitReq) throw new Error("Exit request not found");
      if (exitReq.status === "APPROVED") throw new Error("Already approved");

      // Penalty logic: 
      // If < 5 years, 15% penalty. If >= 5 years, 5% penalty.
      const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
      const membershipDurationYears = (Date.now() - new Date(exitReq.user.joinDate).getTime()) / msPerYear;
      
      let penaltyPercentage = 0.15; // 15% default (under 5 years)
      if (membershipDurationYears >= 5) {
        penaltyPercentage = 0.05; // 5% after 5 years
      }

      const balance = exitReq.user.balance;
      const penaltyAmount = parseFloat((balance * penaltyPercentage).toFixed(2));
      const returnAmount = parseFloat((balance - penaltyAmount).toFixed(2));

      // Create transaction for return amount
      await tx.transaction.create({
        data: {
          userId: exitReq.user.id,
          type: "WITHDRAWAL",
          amount: returnAmount,
          status: "APPROVED",
          approvedBy: (session.user as any).id,
        }
      });

      // Create transaction for penalty (money stays in club)
      if (penaltyAmount > 0) {
        await tx.transaction.create({
          data: {
            userId: exitReq.user.id,
            type: "PENALTY",
            amount: penaltyAmount,
            status: "APPROVED",
            approvedBy: (session.user as any).id,
          }
        });
      }

      // Mark user as inactive (and zero balance)
      await tx.user.update({
        where: { id: exitReq.user.id },
        data: { 
          activeStatus: false, 
          balance: 0,
          role: "EX_MEMBER" // Optional, can just be false activeStatus
        }
      });

      // Mark exit request as approved
      await tx.exitRequest.update({
        where: { id: exitRequestId },
        data: { status: "APPROVED" }
      });

      return { success: true, returnAmount, penaltyAmount };
    });

    revalidatePath("/dashboard/admin/exit-requests");
    return result;
  } catch (error: any) {
    return { error: error.message || "Failed to process exit" };
  }
}
