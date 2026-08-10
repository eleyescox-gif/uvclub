const monthsBn = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

/**
 * Returns a standardized, professional Bengali transaction title and reason.
 */
export function getTransactionTitle(t: any): string {
  if (!t) return "লেনদেন";

  // 1. If a custom note or description was provided by Admin during deduction/posting, prioritize it
  if (t.note && typeof t.note === "string" && t.note.trim()) {
    return t.note.trim();
  }
  if (t.description && typeof t.description === "string" && t.description.trim()) {
    return t.description.trim();
  }

  // 2. Format based on transaction type and date
  const txDate = new Date(t.createdAt || t.date || Date.now());
  const monthNameBn = monthsBn[txDate.getMonth()];
  const yearShort = String(txDate.getFullYear()).slice(2);

  switch (t.type) {
    case "DEPOSIT":
      return `চাঁদা - ${monthNameBn} '${yearShort}`;
    case "PROFIT_POSTING":
      return `প্রজেক্ট লভ্যাংশ - ${monthNameBn}`;
    case "LOSS_POSTING":
      return `প্রজেক্ট লোকসান বন্টন - ${monthNameBn}`;
    case "PENALTY":
    case "LATE_FEE":
      return `বিলম্ব ফি (জরিমানা) - ${monthNameBn}`;
    case "WITHDRAWAL":
      return `উত্তোলন - ${monthNameBn}`;
    default:
      return t.type || "লেনদেন";
  }
}
