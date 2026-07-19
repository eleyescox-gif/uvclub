"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Mocked helper for SMS gateway as SMS has been disabled.
 * Always returns success: true to avoid crashes or errors in background flows.
 */
async function callBulkSmsDhaka(callerID: string, number: string, message: string) {
  console.log(`[SMS DISABLED] Simulated send to ${number}: ${message}`);
  return { success: true, mocked: true };
}

/**
 * Returns null as SMS is disabled.
 */
export async function getSmsBalance() {
  return { success: false, balance: "0.00", error: "SMS integration has been disabled." };
}

/**
 * Disabled send SMS handler.
 */
export async function sendSms(formData: FormData) {
  return {
    success: true,
    summary: "SMS সার্ভিসটি বন্ধ রাখা হয়েছে। কোনো বার্তা পাঠানো হয়নি।",
    errors: undefined
  };
}

/**
 * Mocked receipt SMS handler.
 */
export async function sendReceiptSms(userId: string, receiptId: string, amount: number) {
  console.log(`[SMS DISABLED] Mocked receipt SMS for User: ${userId}, Amount: ${amount}`);
  return { success: true, mocked: true };
}

/**
 * Pin recovery flow. Generates new PIN, updates database, and shows PIN directly to the user since SMS is disabled.
 */
export async function recoverUserPin(mobile: string) {
  if (!mobile) {
    return { error: "অনুগ্রহ করে মোবাইল নম্বরটি দিন।" };
  }

  const formattedMobile = mobile.trim();
  
  try {
    const user = await prisma.user.findUnique({
      where: { mobile: formattedMobile }
    });

    if (!user || user.isDeleted) {
      return { error: "এই মোবাইল নম্বরটি নিবন্ধিত নয় বা বাতিল করা হয়েছে!" };
    }

    // Generate a new 6-digit random PIN
    const newPin = String(Math.floor(100000 + Math.random() * 900000));

    // Update in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPin }
    });

    console.log(`[SMS DISABLED] Password recovered for mobile ${formattedMobile}. New PIN: ${newPin}`);

    return { 
      success: true, 
      message: `আপনার পিন রিসেট সফল হয়েছে! আপনার নতুন পিন (PIN): ${newPin} (দয়া করে এটি কোথাও সংরক্ষণ করুন এবং লগইন করার পর সেটিংসে গিয়ে পিন পরিবর্তন করে নিন।)` 
    };
  } catch (err: any) {
    return { error: err.message || "পিন রিকভারি করতে সমস্যা হচ্ছে।" };
  }
}
