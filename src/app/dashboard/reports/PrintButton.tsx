"use client";

import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="btn btn-secondary" 
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'white', border: '1px solid var(--border)', color: 'var(--foreground)', cursor: 'pointer', outline: 'none' }}
    >
      <Download size={16} /> Data Report
    </button>
  );
}
