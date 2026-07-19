"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const API_KEY = "3af828b6ad57e7816ecf7a14808a65e07cb852d9";
const DEFAULT_SENDER_ID = process.env.SMS_SENDER_ID || "1234";

function lowercaseKeys(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  return Object.keys(obj).reduce((acc: any, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {});
}

/**
 * Universal helper to call BulkSMSDhaka API.
 * Automatically switches between:
 *  - /api/otpsend (GET) for purely numeric or Random callerIDs
 *  - /api/sendtext (GET) for custom string maskings
 */
async function callBulkSmsDhaka(callerID: string, number: string, message: string) {
  try {
    const isNumericCaller = /^\d+$/.test(callerID);
    const baseUrl = isNumericCaller
      ? "https://bulksmsdhaka.net/api/otpsend"
      : "https://bulksmsdhaka.net/api/sendtext";

    const params = new URLSearchParams({
      apikey: API_KEY,
      callerID: callerID,
      number: number,
      message: message
    });

    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      method: "GET",
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`HTTP Error Status: ${res.status}`);
    }

    const resText = await res.text();
    let data: any = {};
    try {
      data = lowercaseKeys(JSON.parse(resText));
    } catch (e) {
      data = { rawtext: resText };
    }

    const isSuccess = 
      data.status === "success" || 
      data.status === "100" ||
      data.response_code === 200 || 
      data.success === true ||
      data.success === "true" ||
      data.messageid ||
      (data.rawtext && data.rawtext.toLowerCase().includes("success"));

    if (isSuccess) {
      return { success: true };
    } else {
      return { success: false, error: data.message || data.error || data.rawtext };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Network request failed" };
  }
}

export async function getSmsBalance() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized" };
  }

  try {
    const res = await fetch(`https://bulksmsdhaka.net/api/getBalance?apikey=${API_KEY}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch balance from SMS API");
    }

    const data = lowercaseKeys(await res.json());
    if (data.status === "error" || data.status === "failed" || data.response_code === 401) {
      return { success: false, error: data.message || "এপিআই অ্যাক্সেস রিজেক্টেড" };
    }
    return { 
      success: true, 
      balance: data.balance || data.credit || data.credit_balance || data.balance_amount || "০.০০"
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retrieve balance" };
  }
}

export async function sendSms(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthenticated" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY") {
    return { error: "Unauthorized" };
  }

  const rawCallerID = (formData.get("callerID") as string) || "Random";
  const numbersStr = formData.get("numbers") as string;
  const message = formData.get("message") as string;

  if (!numbersStr || !message) {
    return { error: "মোবাইল নম্বর এবং মেসেজ আবশ্যিক!" };
  }

  const numbers = numbersStr
    .split(",")
    .map(n => n.trim())
    .filter(n => n.length > 0);

  if (numbers.length === 0) {
    return { error: "কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি!" };
  }

  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (const number of numbers) {
    let formattedNumber = number;
    if (formattedNumber.startsWith("+88")) {
      formattedNumber = formattedNumber.slice(1);
    } else if (!formattedNumber.startsWith("88") && formattedNumber.startsWith("0")) {
      formattedNumber = "88" + formattedNumber;
    }

    const activeCallerID = rawCallerID.toLowerCase() === "random"
      ? String(Math.floor(1000 + Math.random() * 9000))
      : rawCallerID;

    try {
      const sendResult = await callBulkSmsDhaka(activeCallerID, formattedNumber, message);
      if (sendResult.success) {
        successCount++;
      } else {
        failCount++;
        errors.push(`${number}: ${sendResult.error || "Failed response"}`);
      }
    } catch (err: any) {
      failCount++;
      errors.push(`${number}: ${err.message || "Connection failed"}`);
    }
  }

  return {
    success: true,
    summary: `${successCount} টি এসএমএস সফলভাবে পাঠানো হয়েছে, ${failCount} টি ব্যর্থ হয়েছে।`,
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function sendReceiptSms(userId: string, receiptId: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mobile: true }
    });

    if (!user || !user.mobile) {
      console.log(`Failed to send receipt SMS: User or mobile not found for ID ${userId}`);
      return { success: false, error: "User mobile not found" };
    }

    const activeSenderID = DEFAULT_SENDER_ID.toLowerCase() === "random"
      ? String(Math.floor(1000 + Math.random() * 9000))
      : DEFAULT_SENDER_ID;

    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const receiptLink = `${siteUrl}/receipt/${receiptId}`;
    const message = `United Vision Club: We have received your payment: ${amount} tk. Thank you! Receipt link: ${receiptLink}`;

    let formattedNumber = user.mobile.trim();
    if (formattedNumber.startsWith("+88")) {
      formattedNumber = formattedNumber.slice(1);
    } else if (!formattedNumber.startsWith("88") && formattedNumber.startsWith("0")) {
      formattedNumber = "88" + formattedNumber;
    }

    const res = await callBulkSmsDhaka(activeSenderID, formattedNumber, message);
    if (res.success) {
      return { success: true };
    } else {
      return { success: false, error: res.error };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

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

    const newPin = String(Math.floor(100000 + Math.random() * 900000));

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPin }
    });

    const activeSenderID = DEFAULT_SENDER_ID.toLowerCase() === "random"
      ? String(Math.floor(1000 + Math.random() * 9000))
      : DEFAULT_SENDER_ID;

    const message = `ইউনাইটেড ভিশন ক্লাব\nআপনার একাউন্টের নতুন লগইন পাসওয়ার্ড/পিন (PIN): ${newPin}\nদয়া করে লগইন করার পর সেটিংসে গিয়ে পিন পরিবর্তন করে নিন।`;

    let formattedNumber = formattedMobile;
    if (formattedNumber.startsWith("+88")) {
      formattedNumber = formattedNumber.slice(1);
    } else if (!formattedNumber.startsWith("88") && formattedNumber.startsWith("0")) {
      formattedNumber = "88" + formattedNumber;
    }

    const res = await callBulkSmsDhaka(activeSenderID, formattedNumber, message);
    if (res.success) {
      return { success: true, message: "আপনার মোবাইলে নতুন পিন নম্বরটি পাঠানো হয়েছে।" };
    } else {
      return { error: res.error || "পিন রিসেট হয়েছে কিন্তু এসএমএস পাঠানো যায়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।" };
    }
  } catch (err: any) {
    return { error: err.message || "পিন রিকভারি করতে সমস্যা হচ্ছে।" };
  }
}
