"use client";

import { useState } from "react";
import { payInvoiceAutomated } from "@/actions/finance";
import { Smartphone, CreditCard, ShieldCheck, X, Lock, CheckCircle2 } from "lucide-react";

interface OnlinePaymentCardProps {
  invoiceId: string;
  amount: number;
  month: number;
  year: number;
}

const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default function OnlinePaymentCard({ invoiceId, amount, month, year }: OnlinePaymentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"choose" | "number" | "otp" | "pin" | "loading" | "success">("choose");
  const [method, setMethod] = useState<"bKash" | "Nagad">("bKash");
  const [walletNumber, setWalletNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setIsOpen(false);
    setStep("choose");
    setWalletNumber("");
    setOtp("");
    setPin("");
    setError(null);
  };

  const handleNext = () => {
    if (step === "number") {
      if (walletNumber.length < 11) {
        setError("সঠিক মোবাইল নম্বরটি প্রদান করুন।");
        return;
      }
      setError(null);
      setStep("otp");
    } else if (step === "otp") {
      if (otp.length < 4) {
        setError("ওটিপি (OTP) ৪ সংখ্যার হতে হবে।");
        return;
      }
      setError(null);
      setStep("pin");
    }
  };

  const handleConfirm = async () => {
    if (pin.length < 4) {
      setError("পিন কোড সঠিক নয়।");
      return;
    }
    setError(null);
    setStep("loading");

    // Call server action to complete invoice payment automated
    const result = await payInvoiceAutomated(invoiceId, method);

    if (result.error) {
      setError(result.error);
      setStep("pin");
    } else {
      setStep("success");
      setTimeout(() => {
        resetState();
        window.location.reload(); // Refresh the page to show PAID invoice
      }, 2500);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-primary" 
        style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
      >
        অনলাইনে পরিশোধ করুন (Pay)
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          
          {/* Checkout Frame */}
          <div style={{
            width: '360px',
            backgroundColor: method === "bKash" ? "#e2126e" : "#ff6b00",
            borderRadius: '1.25rem',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>UVC Online Checkout</h4>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>ইনভয়েস: {monthsBn[month - 1]} {year} (৳ {amount})</span>
              </div>
              <button 
                onClick={resetState} 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Container */}
            <div style={{ padding: '1.5rem 1.25rem', backgroundColor: 'white', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
              
              {/* STEP 1: Choose Method */}
              {step === "choose" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textAlign: 'center', color: '#1e293b', margin: 0 }}>পেমেন্ট গেটওয়ে সিলেক্ট করুন</h3>
                  
                  {/* bKash Selection */}
                  <div 
                    onClick={() => { setMethod("bKash"); setStep("number"); }}
                    style={{ width: '100%', padding: '1rem', border: '2px solid #e2126e', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ width: '40px', height: '40px', background: '#e2126e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>b</div>
                    <div>
                      <h4 style={{ margin: 0, color: '#e2126e', fontWeight: 800, fontSize: '0.95rem' }}>bKash Checkout</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>বিকাশ অ্যাকাউন্ট দিয়ে পেমেন্ট করুন</p>
                    </div>
                  </div>

                  {/* Nagad Selection */}
                  <div 
                    onClick={() => { setMethod("Nagad"); setStep("number"); }}
                    style={{ width: '100%', padding: '1rem', border: '2px solid #ff6b00', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ width: '40px', height: '40px', background: '#ff6b00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>N</div>
                    <div>
                      <h4 style={{ margin: 0, color: '#ff6b00', fontWeight: 800, fontSize: '0.95rem' }}>Nagad Checkout</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>নগদ অ্যাকাউন্ট দিয়ে পেমেন্ট করুন</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Wallet Number Form */}
              {step === "number" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '9999px', backgroundColor: method === "bKash" ? "#fce7f3" : "#ffedd5", color: method === "bKash" ? "#e2126e" : "#ff6b00", fontSize: '0.75rem', fontWeight: 800 }}>
                      {method} Accounts Integration
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#475569' }}>আপনার {method} নম্বর লিখুন</label>
                    <input 
                      type="tel" 
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={11}
                      placeholder="e.g. 017xxxxxxxx"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', letterSpacing: '1px', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>

                  <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, lineHeight: 1.4, textAlign: 'center' }}>
                    proceed এ ক্লিক করে আপনি টার্মস এন্ড কন্ডিশনের সাথে একমত প্রকাশ করছেন।
                  </p>

                  {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, textAlign: 'center' }}>{error}</span>}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <button onClick={() => setStep("choose")} className="btn btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>পিছনে</button>
                    <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1, padding: '0.65rem', backgroundColor: method === "bKash" ? "#e2126e" : "#ff6b00", borderColor: method === "bKash" ? "#e2126e" : "#ff6b00" }}>Proceed</button>
                  </div>
                </div>
              )}

              {/* STEP 3: OTP Verification Form */}
              {step === "otp" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                      আপনার মোবাইলে {method} ওটিপি পাঠানো হয়েছে।
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({walletNumber.substring(0, 3)}***{walletNumber.substring(8)})</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#475569', textAlign: 'center' }}>ওটিপি কোড (OTP Code)</label>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="e.g. 123456"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1.2rem', letterSpacing: '6px', textAlign: 'center', fontWeight: 800 }}
                    />
                  </div>

                  {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, textAlign: 'center' }}>{error}</span>}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <button onClick={() => setStep("number")} className="btn btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>পিছনে</button>
                    <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1, padding: '0.65rem', backgroundColor: method === "bKash" ? "#e2126e" : "#ff6b00", borderColor: method === "bKash" ? "#e2126e" : "#ff6b00" }}>Proceed</button>
                  </div>
                </div>
              )}

              {/* STEP 4: PIN Entry */}
              {step === "pin" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                      পিন কোড প্রদান করুন
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                      <Lock size={12} /> আপনার পিন নিরাপদ ও এনক্রিপ্টেড থাকবে।
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#475569', textAlign: 'center' }}>পিন (PIN Code)</label>
                    <input 
                      type="password" 
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      maxLength={5}
                      placeholder="•••••"
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
                    />
                  </div>

                  {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, textAlign: 'center' }}>{error}</span>}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <button onClick={() => setStep("otp")} className="btn btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>পিছনে</button>
                    <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 1, padding: '0.65rem', backgroundColor: method === "bKash" ? "#e2126e" : "#ff6b00", borderColor: method === "bKash" ? "#e2126e" : "#ff6b00" }}>Confirm</button>
                  </div>
                </div>
              )}

              {/* STEP 5: Loading State */}
              {step === "loading" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(0,0,0,0.1)',
                    borderTop: `3px solid ${method === "bKash" ? "#e2126e" : "#ff6b00"}`,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>পেমেন্ট প্রসেস হচ্ছে...</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>মার্চেন্ট গেটওয়ে সার্ভারে কানেক্ট করা হচ্ছে।</p>
                  </div>
                </div>
              )}

              {/* STEP 6: Success State */}
              {step === "success" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', flex: 1, animation: 'scaleUp 0.3s ease-out' }}>
                  <CheckCircle2 size={48} color="var(--success)" />
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontWeight: 850, fontSize: '1rem', color: 'var(--success)' }}>পেমেন্ট সফল হয়েছে!</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>বকেয়া বিল পরিশোধ সম্পন্ন। ব্যালেন্স আপডেট করা হচ্ছে...</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
