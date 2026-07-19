"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function getClubSettings() {
  if (!prisma.clubSettings) {
    return {
      name: "United Vision",
      logo: null,
      paidLogo: null,
      watermarkLogo: null,
      address: "Dhaka, Bangladesh",
      paymentGatewayActive: false
    };
  }

  const settings = await (prisma.clubSettings as any).findUnique({
    where: { id: "singleton" }
  });
  
  if (!settings) {
    // Return defaults if none exist
    return {
      name: "United Vision",
      logo: null,
      paidLogo: null,
      watermarkLogo: null,
      address: "Dhaka, Bangladesh",
      paymentGatewayActive: false
    };
  }
  
  return settings;
}

export async function updateClubSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized. Only admins can update settings." };
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const logo = formData.get("logo") as string;
  const paidLogo = formData.get("paidLogo") as string;
  const watermarkLogo = formData.get("watermarkLogo") as string;

  if (!name) {
    return { error: "Organization Name is required" };
  }

  if (!prisma.clubSettings) {
    return { error: "Database client is not updated yet. Please completely stop the server and run 'npx prisma generate'." };
  }

  try {
    await (prisma.clubSettings as any).upsert({
      where: { id: "singleton" },
      update: {
        name,
        address,
        logo: logo || null,
        paidLogo: paidLogo || null,
        watermarkLogo: watermarkLogo || null,
        updatedBy: (session.user as any).id
      },
      create: {
        id: "singleton",
        name,
        address,
        logo: logo || null,
        paidLogo: paidLogo || null,
        watermarkLogo: watermarkLogo || null,
        updatedBy: (session.user as any).id
      }
    });

    revalidatePath("/", "layout"); // Revalidate entire app to update TopNav
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update settings" };
  }
}

export async function togglePaymentGateway(active: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "PRESIDENT") {
    return { error: "Unauthorized. Only the President can toggle the payment gateway." };
  }

  try {
    await (prisma.clubSettings as any).upsert({
      where: { id: "singleton" },
      update: { paymentGatewayActive: active },
      create: { 
        id: "singleton", 
        name: "United Vision", 
        paymentGatewayActive: active 
      }
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle gateway settings" };
  }
}

export async function updateGatewayInfo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const role = (session.user as any).role;
  if (role !== "PRESIDENT") {
    return { error: "Unauthorized. Only the President can update gateway info." };
  }

  const bkashNumber = formData.get("bkashNumber") as string;
  const nagadNumber = formData.get("nagadNumber") as string;
  const bankDetails = formData.get("bankDetails") as string;
  const bkashUsername = formData.get("bkashUsername") as string;
  const bkashPassword = formData.get("bkashPassword") as string;
  const bkashAppKey = formData.get("bkashAppKey") as string;
  const bkashAppSecret = formData.get("bkashAppSecret") as string;
  const nagadMerchantId = formData.get("nagadMerchantId") as string;
  const nagadAppKey = formData.get("nagadAppKey") as string;

  try {
    await (prisma.clubSettings as any).upsert({
      where: { id: "singleton" },
      update: {
        bkashNumber: bkashNumber || null,
        nagadNumber: nagadNumber || null,
        bankDetails: bankDetails || null,
        bkashUsername: bkashUsername || null,
        bkashPassword: bkashPassword || null,
        bkashAppKey: bkashAppKey || null,
        bkashAppSecret: bkashAppSecret || null,
        nagadMerchantId: nagadMerchantId || null,
        nagadAppKey: nagadAppKey || null
      },
      create: {
        id: "singleton",
        name: "United Vision",
        bkashNumber: bkashNumber || null,
        nagadNumber: nagadNumber || null,
        bankDetails: bankDetails || null,
        bkashUsername: bkashUsername || null,
        bkashPassword: bkashPassword || null,
        bkashAppKey: bkashAppKey || null,
        bkashAppSecret: bkashAppSecret || null,
        nagadMerchantId: nagadMerchantId || null,
        nagadAppKey: nagadAppKey || null
      }
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update gateway info" };
  }
}
