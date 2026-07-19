"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
  className?: string;
}

export default function PrintButton({ className }: PrintButtonProps) {
  return (
    <button 
      onClick={() => window.print()} 
      className={className} 
      type="button"
    >
      <Printer size={16} /> পিডিএফ / প্রিন্ট করুন
    </button>
  );
}
