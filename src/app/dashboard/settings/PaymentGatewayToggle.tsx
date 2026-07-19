"use client";

import { useState } from "react";
import { togglePaymentGateway, updateGatewayInfo } from "@/actions/settings";
import { ShieldCheck } from "lucide-react";

interface PaymentGatewayToggleProps {
  isActive: boolean;
  bkashUsername?: string | null;
  bkashPassword?: string | null;
  bkashAppKey?: string | null;
  bkashAppSecret?: string | null;
  nagadMerchantId?: string | null;
  nagadAppKey?: string | null;
}

export default function PaymentGatewayToggle({ 
  isActive, 
  bkashUsername = "",
  bkashPassword = "",
  bkashAppKey = "",
  bkashAppSecret = "",
  nagadMerchantId = "",
  nagadAppKey = ""
}: PaymentGatewayToggleProps) {
  const [checked, setChecked] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    const newChecked = !checked;
    const result = await togglePaymentGateway(newChecked);
    if (result.error) {
      alert(result.error);
    } else {
      setChecked(newChecked);
    }
    setLoading(false);
  };

  const handleSaveInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateGatewayInfo(formData);

    if (result.error) {
      setError(result.error);
    } else {
      alert("পেমেন্ট গেটওয়ের মার্চেন্ট এপিআই (API) তথ্য সফলভাবে সংরক্ষিত হয়েছে।");
    }
    setSaveLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toggle Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: checked ? '1px solid var(--border)' : 'none', paddingBottom: checked ? '1rem' : 0 }}>
        <label style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: '52px', 
          height: '28px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}>
          <input 
            type="checkbox" 
            checked={checked} 
            disabled={loading}
            onChange={handleToggle}
            style={{ opacity: 0, width: 0, height: 0 }} 
          />
          <span style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: checked ? 'var(--primary)' : '#cbd5e1',
            borderRadius: '34px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <span style={{
              position: 'absolute',
              height: '20px', width: '20px',
              left: '4px', bottom: '4px',
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: checked ? 'translateX(24px)' : 'none'
            }} />
          </span>
        </label>
        
        <span style={{ 
          fontSize: '0.9rem', 
          fontWeight: 700, 
          color: checked ? 'var(--primary)' : '#64748b' 
        }}>
          {loading ? "আপডেট হচ্ছে..." : (checked ? "অনলাইন গেটওয়ে সক্রিয় (Active)" : "অনলাইন গেটওয়ে নিষ্ক্রিয় (Inactive)")}
        </span>
      </div>

      {/* Gateway API Credentials */}
      {checked && (
        <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} /> মার্চেন্ট গেটওয়ে এপিআই (Merchant API Credentials)
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              রিয়েল অটোমেটেড গেটওয়ে চালু করতে এপিআই কি (API Key) গুলো এখানে বসিয়ে দিতে হবে। মেম্বাররা বকেয়া ইনভয়েসে ক্লিক করলে এই এপিআই-এর মাধ্যমে পেমেন্ট কমপ্লিট হবে।
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* bKash API */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2126e', margin: '0 0 0.75rem 0' }}>bKash Checkout API Settings</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <input 
                    type="text" 
                    name="bkashUsername" 
                    defaultValue={bkashUsername || ""} 
                    placeholder="bKash API Username" 
                    style={{ padding: '0.55rem 0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                  />
                  <input 
                    type="password" 
                    name="bkashPassword" 
                    defaultValue={bkashPassword || ""} 
                    placeholder="bKash API Password" 
                    style={{ padding: '0.55rem 0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                  />
                  <input 
                    type="text" 
                    name="bkashAppKey" 
                    defaultValue={bkashAppKey || ""} 
                    placeholder="bKash App Key" 
                    style={{ padding: '0.55rem 0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                  />
                  <input 
                    type="password" 
                    name="bkashAppSecret" 
                    defaultValue={bkashAppSecret || ""} 
                    placeholder="bKash App Secret" 
                    style={{ padding: '0.55rem 0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              {/* Nagad API */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ff6b00', margin: '0 0 0.75rem 0' }}>Nagad Merchant API Settings</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <input 
                    type="text" 
                    name="nagadMerchantId" 
                    defaultValue={nagadMerchantId || ""} 
                    placeholder="Nagad Merchant ID" 
                    style={{ padding: '0.55rem 0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                  />
                  <input 
                    type="password" 
                    name="nagadAppKey" 
                    defaultValue={nagadAppKey || ""} 
                    placeholder="Nagad Public/Private Secret Key" 
                    style={{ padding: '0.55rem 0.8rem', borderRadius: '0.375rem', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={saveLoading} 
            className="btn btn-primary" 
            style={{ padding: '0.65rem', fontWeight: 700, alignSelf: 'flex-start', minWidth: '180px' }}
          >
            {saveLoading ? "সংরক্ষণ হচ্ছে..." : "এপিআই তথ্য সংরক্ষণ করুন"}
          </button>
        </form>
      )}
    </div>
  );
}
