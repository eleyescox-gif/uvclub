"use client";

import { MessageSquare } from "lucide-react";

interface WhatsAppButtonProps {
  mobile: string;
  name: string;
  amount: number;
  type: string;
  receiptNo: string;
  date: string;
  receiptUrl: string;
}

export default function WhatsAppButton({
  mobile, name, amount, type, receiptNo, date, receiptUrl
}: WhatsAppButtonProps) {
  const handleWhatsAppSend = () => {
    let formattedMobile = mobile.replace(/[\s\-+]/g, "");
    if (formattedMobile.startsWith("0")) {
      formattedMobile = "88" + formattedMobile;
    }

    const typeLabel = type === "DEPOSIT" ? "মাসিক চাঁদা" : type;
    const absoluteUrl = window.location.origin + receiptUrl;
    
    const message =
`আসসালামু আলাইকুম, জনাব *${name}*
United Vision Club-এ আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে। ✅

*📋 রশিদের বিবরণ:*
• রশিদ নং: *${receiptNo}*
• পেমেন্টের ধরন: ${typeLabel}
• পরিমাণ: *৳ ${amount.toLocaleString()} টাকা*
• তারিখ: ${date}

🔗 *আপনার মানি রিসিট দেখুন:*
${absoluteUrl}

ধন্যবাদ,
💚 ইউনাইটেড ভিশন ক্লাব`;

    const whatsappUrl = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppSend}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.5rem 1.1rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: '0.85rem',
        boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1ebe5d')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
    >
      <MessageSquare size={16} /> WhatsApp-এ পাঠান
    </button>
  );
}
