"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="btn btn-primary" 
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 800 }}
    >
      <Printer size={18} /> 🖨️ ফরম প্রিন্ট ও PDF সেভ করুন (Save PDF / Print)
    </button>
  );
}
