"use client";

import { Printer } from "lucide-react";
import styles from "./report.module.css";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className={`btn btn-primary ${styles.btnPrint}`} type="button">
      <Printer size={16} /> প্রিন্ট করুন
    </button>
  );
}
