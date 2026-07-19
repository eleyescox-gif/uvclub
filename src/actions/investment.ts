"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const investmentAmount = parseFloat(formData.get("investmentAmount") as string);
  
  if (!title || !description || !investmentAmount) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.project.create({
      data: {
        title,
        description,
        investmentAmount,
        status: "ACTIVE"
      }
    });

    revalidatePath("/dashboard/admin/projects");
    revalidatePath("/dashboard/projects");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create project" };
  }
}
export async function updateProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const investmentAmount = parseFloat(formData.get("investmentAmount") as string);
  const status = formData.get("status") as string;
  
  if (!id || !title || !description || !investmentAmount) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        investmentAmount,
        status: status || "ACTIVE"
      }
    });

    revalidatePath("/dashboard/admin/projects");
    revalidatePath("/dashboard/projects");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update project" };
  }
}

export async function distributeProfit(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  // Usually CASHIER or PRESIDENT manages funds
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "CASHIER") {
    return { error: "Unauthorized" };
  }

  const projectId = formData.get("projectId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as "PROFIT" | "LOSS"; // Form passes PROFIT or LOSS
  
  if (!projectId || !amount || !type) {
    return { error: "Missing required fields" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get total club balance
      const allMembers = await tx.user.findMany({
        where: { activeStatus: true, balance: { gt: 0 } },
        select: { id: true, balance: true }
      });

      const totalClubBalance = allMembers.reduce((sum, m) => sum + m.balance, 0);

      if (totalClubBalance === 0) {
        throw new Error("Total club balance is 0, cannot distribute proportionally.");
      }

      const transactionType = type === "PROFIT" ? "PROFIT_POSTING" : "LOSS_POSTING";

      // Distribute proportionally
      for (const member of allMembers) {
        const userShareRatio = member.balance / totalClubBalance;
        const userShareAmount = parseFloat((amount * userShareRatio).toFixed(2));

        if (userShareAmount > 0) {
          // Add transaction
          await tx.transaction.create({
            data: {
              userId: member.id,
              type: transactionType,
              amount: userShareAmount,
              status: "APPROVED",
              approvedBy: (session.user as any).id,
            }
          });

          // Update balance
          if (type === "PROFIT") {
            await tx.user.update({
              where: { id: member.id },
              data: { balance: { increment: userShareAmount } }
            });
          } else {
            // LOSS
            await tx.user.update({
              where: { id: member.id },
              data: { balance: { decrement: userShareAmount } }
            });
          }
        }
      }
      
      return { success: true };
    });

    revalidatePath("/dashboard/admin/projects");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");
    
    return result;
  } catch (error: any) {
    return { error: error.message || "Failed to distribute profit/loss" };
  }
}

export async function deleteProject(projectId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.project.delete({
      where: { id: projectId }
    });

    revalidatePath("/dashboard/admin/projects");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete project" };
  }
}
