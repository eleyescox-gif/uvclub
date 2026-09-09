"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const BULKSMSBD_API_KEY = process.env.BULKSMSBD_API_KEY || "5zVaXEuUgZq5gyX23ujq";
const BULKSMSBD_SENDER_ID = process.env.BULKSMSBD_SENDER_ID || "8809617613435";
const SMS_API_URL = "http://bulksmsbd.net/api/smsapi";
const BALANCE_API_URL = "http://bulksmsbd.net/api/getBalanceApi";

/**
 * Helper to format Bangladeshi phone number to 8801XXXXXXXXX
 */
export function formatBdMobile(mobile: string): string {
  let clean = mobile.replace(/\D/g, "");
  if (clean.startsWith("880")) return clean;
  if (clean.startsWith("0")) return "88" + clean;
  if (clean.length === 10 && clean.startsWith("1")) return "880" + clean;
  return "88" + clean;
}

/**
 * Core send SMS function to BulkSMSBD gateway
 */
export async function callBulkSmsBd(
  number: string,
  message: string
): Promise<{ success: boolean; rawResponse?: any; error?: string }> {
  try {
    const formattedNumber = formatBdMobile(number);
    const isUnicode = /[^\u0000-\u007F]/.test(message);
    const type = isUnicode ? "unicode" : "text";

    const params = new URLSearchParams({
      api_key: BULKSMSBD_API_KEY,
      type: type,
      number: formattedNumber,
      senderid: BULKSMSBD_SENDER_ID,
      message: message,
    });

    const res = await fetch(`${SMS_API_URL}?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store"
    });

    const data = await res.json().catch(() => null);

    if (data && (data.response_code === 202 || data.response_code === "202" || data.success)) {
      console.log(`[BulkSMSBD SUCCESS] Sent to ${formattedNumber}:`, data);
      return { success: true, rawResponse: data };
    }

    console.error(`[BulkSMSBD ERROR] Code ${data?.response_code}:`, data);
    return {
      success: false,
      rawResponse: data,
      error: data?.error_message || data?.msg || `SMS Error (Code: ${data?.response_code || "Unknown"})`,
    };
  } catch (err: any) {
    console.error("[BulkSMSBD EXCEPTION]:", err);
    return { success: false, error: err?.message || "Failed to connect to SMS gateway" };
  }
}

/**
 * Returns real-time SMS balance from BulkSMSBD
 */
export async function getSmsBalance(): Promise<{ success: boolean; balance: string; error?: string }> {
  try {
    const res = await fetch(`${BALANCE_API_URL}?api_key=${BULKSMSBD_API_KEY}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (data && data.response_code === 202) {
      const numBalance = parseFloat(data.balance);
      return {
        success: true,
        balance: isNaN(numBalance) ? String(data.balance) : numBalance.toFixed(2),
      };
    }

    return {
      success: false,
      balance: "0.00",
      error: data?.error_message || "ব্যালেন্স জানতে সমস্যা হয়েছে।",
    };
  } catch (err: any) {
    return { success: false, balance: "0.00", error: err?.message || "গেটওয়ে সার্ভার সাড়া দিচ্ছে না।" };
  }
}

/**
 * Automated Receipt SMS handler when a deposit or payment is made.
 * Called from postPayment and payInvoiceAutomated.
 */
export async function sendReceiptSms(
  userId: string,
  receiptId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, nameBn: true, mobile: true, balance: true },
      }),
      (prisma as any).clubSettings.findUnique({
        where: { id: "singleton" },
        select: { name: true },
      }).catch(() => null),
    ]);

    if (!user || !user.mobile) {
      return { success: false, error: "Member mobile number not found." };
    }

    const memberName = user.nameBn || user.name || "সদস্য";
    const clubName = settings?.name || "ইউনাইটেড ভিশন ক্লাব";
    const shortTxId = receiptId.replace(/-/g, "").slice(0, 8).toUpperCase();
    const formattedBalance = user.balance.toLocaleString("en-IN");
    const formattedAmount = amount.toLocaleString("en-IN");

    // Professional Bengali SMS Template
    const message = `সম্মানিত সদস্য ${memberName}, ${clubName}-এ আপনার ৳${formattedAmount} চাঁদা জমা গৃহীত হয়েছে (রশিদ: #${shortTxId})। বর্তমান জমার স্থিতি: ৳${formattedBalance}। ধন্যবাদ।`;

    console.log(`[SMS RECEIPT] Sending to ${user.mobile} for User ${userId}`);
    const result = await callBulkSmsBd(user.mobile, message);
    return result;
  } catch (err: any) {
    console.error("[SMS RECEIPT ERROR]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Admin send single or bulk SMS handler
 */
export async function sendSms(
  formData: FormData
): Promise<{ success: boolean; summary?: string; error?: string; errors?: string[] }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthenticated" };

  const userMobile = (session.user as any).mobile;
  const rawRole = (session.user as any).role;
  const isController = userMobile === "01812000109" || rawRole === "CONTROLLER";
  const role = isController ? "CONTROLLER" : rawRole;

  if (!isController && role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CASHIER") {
    return { success: false, error: "অনুমোদিত নয় (Unauthorized)" };
  }

  const recipientType = formData.get("recipientType") as string; // ALL, SPECIFIC, CUSTOM
  const customNumber = formData.get("customNumber") as string;
  const message = ((formData.get("message") as string) || "").trim();

  if (!message) {
    return { success: false, error: "এসএমএস মেসেজ টেক্সট আবশ্যক।" };
  }

  try {
    let targetNumbers: string[] = [];

    if (recipientType === "ALL") {
      const activeMembers = await prisma.user.findMany({
        where: { activeStatus: true, isDeleted: false },
        select: { mobile: true },
      });
      targetNumbers = activeMembers.map((m) => m.mobile).filter(Boolean);
    } else if (recipientType === "CUSTOM" && customNumber) {
      targetNumbers = customNumber.split(",").map((n) => n.trim()).filter(Boolean);
    } else {
      const selectedIds = formData.getAll("memberIds") as string[];
      if (selectedIds && selectedIds.length > 0) {
        const members = await prisma.user.findMany({
          where: { id: { in: selectedIds }, activeStatus: true, isDeleted: false },
          select: { mobile: true },
        });
        targetNumbers = members.map((m) => m.mobile).filter(Boolean);
      }
    }

    if (targetNumbers.length === 0) {
      return { success: false, error: "কোনো প্রাপক নম্বর পাওয়া যায়নি।" };
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const num of targetNumbers) {
      const res = await callBulkSmsBd(num, message);
      if (res.success) {
        successCount++;
      } else {
        errors.push(`${num}: ${res.error || "পাঠানো যায়নি"}`);
      }
    }

    return {
      success: successCount > 0,
      summary: `মোট ${targetNumbers.length} জনের মধ্যে ${successCount} জনের কাছে এসএমএস সফলভাবে পাঠানো হয়েছে।`,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "এসএমএস প্রেরণে সমস্যা হয়েছে।" };
  }
}

/**
 * Pin recovery flow with real SMS
 */
export async function recoverUserPin(
  mobile: string
): Promise<{ success?: boolean; message?: string; error?: string }> {
  if (!mobile) {
    return { error: "অনুগ্রহ করে মোবাইল নম্বরটি দিন।" };
  }

  const formattedMobile = mobile.trim();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ mobile: formattedMobile }, { name: formattedMobile }, { nid: formattedMobile }],
        isDeleted: false,
      },
    });

    if (!user || user.isDeleted) {
      return { error: "এই মোবাইল নম্বরটি নিবন্ধিত নয় বা বাতিল করা হয়েছে!" };
    }

    // Generate a new 6-digit random PIN
    const newPin = String(Math.floor(100000 + Math.random() * 900000));

    // Update in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPin },
    });

    // Send SMS to user's mobile phone
    const smsText = `ইউনাইটেড ভিশন ক্লাবে আপনার অ্যাকাউন্ট পিন (PIN) রিসেট করা হয়েছে। আপনার নতুন লগইন পিন: ${newPin}। লগইন করে অনুগ্রহ করে পিন পরিবর্তন করে নিন।`;
    await callBulkSmsBd(user.mobile, smsText);

    return {
      success: true,
      message: `আপনার পিন রিসেট সফল হয়েছে! আপনার মোবাইল নম্বরে এসএমএসের মাধ্যমে নতুন পিন পাঠিয়ে দেওয়া হয়েছে।`,
    };
  } catch (err: any) {
    return { error: err.message || "পিন রিকভারি করতে সমস্যা হচ্ছে।" };
  }
}
