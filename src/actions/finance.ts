"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { sendReceiptSms } from "./sms";

export async function postPayment(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "CASHIER" && role !== "ADMIN") {
    return { error: "Unauthorized. Only admins/cashiers can post payments." };
  }

  const userId = formData.get("userId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);
  const lateFee = parseFloat(formData.get("lateFee") as string) || 0;
  
  if (!userId || !amount || !month || !year) {
    return { error: "Missing required fields" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction (DEPOSIT)
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          amount: amount,
          status: "APPROVED",
          approvedBy: (session.user as any).id,
        }
      });

      // 1.5 Create Transaction (PENALTY) if late fee exists
      if (lateFee > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "PENALTY",
            amount: lateFee,
            status: "APPROVED",
            approvedBy: (session.user as any).id,
          }
        });
      }

      // 2. Create Invoice as PAID
      const invoice = await tx.invoice.create({
        data: {
          userId,
          amount,
          month,
          year,
          lateFee,
          status: "PAID",
        }
      });

      // 3. Update User Balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount // Note: late fee usually doesn't increase member's principal balance, it goes to club fund. But let's clarify this. For now, principal balance increases by amount.
          }
        }
      });

      return { transaction, invoice };
    });

    // Send automated receipt SMS to member
    sendReceiptSms(userId, result.transaction.id, amount).catch(err =>
      console.error("Failed to send postPayment receipt SMS:", err)
    );

    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard/admin/finance");
    
    return { success: true, transactionId: result.transaction.id };
  } catch (error: any) {
    return { error: error.message || "Failed to post payment" };
  }
}

export async function getAllMembersForSelect() {
  const members = await prisma.user.findMany({
    select: { id: true, name: true, mobile: true },
    orderBy: { name: "asc" }
  });
  return members;
}

export async function payInvoiceAutomated(invoiceId: string, method: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const userId = (session.user as any).id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the invoice
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status === "PAID") throw new Error("Invoice already paid");
      if (invoice.userId !== userId) throw new Error("Unauthorized");

      // 2. Create approved transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          amount: invoice.amount,
          status: "APPROVED",
          proofImage: `Gateway: ${method} | Automated API Payment`,
          approvedBy: "System Gateway"
        }
      });

      if (invoice.lateFee > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "PENALTY",
            amount: invoice.lateFee,
            status: "APPROVED",
            proofImage: `Gateway: ${method} | Automated Penalty`,
            approvedBy: "System Gateway"
          }
        });
      }

      // 3. Update Invoice status
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" }
      });

      // 4. Increment user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: invoice.amount }
        }
      });

      return { transaction };
    });

    // Fetch invoice amount for receipt SMS
    prisma.invoice.findUnique({ where: { id: invoiceId } }).then(inv => {
      if (inv) {
        sendReceiptSms(userId, result.transaction.id, inv.amount).catch(err =>
          console.error("Failed to send automated receipt SMS:", err)
        );
      }
    });

    revalidatePath("/dashboard/finance");
    return { success: true, transactionId: result.transaction.id };
  } catch (error: any) {
    return { error: error.message || "Payment failed" };
  }
}
