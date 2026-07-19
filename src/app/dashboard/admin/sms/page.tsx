import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SmsPanelPage() {
  return (
    <div style={{ padding: '3rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ 
        backgroundColor: 'var(--card)', 
        border: '1px solid var(--border)', 
        borderRadius: '1.5rem', 
        padding: '2.5rem 1.5rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
          এসএমএস সার্ভিস বন্ধ রয়েছে
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          আপনার অনুরোধ অনুযায়ী বাল্ক এসএমএস সার্ভিস এবং এসএমএস প্যানেল ডিঅ্যাক্টিভেট করা হয়েছে।
        </p>
        <Link 
          href="/dashboard" 
          style={{ 
            marginTop: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '0.75rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
