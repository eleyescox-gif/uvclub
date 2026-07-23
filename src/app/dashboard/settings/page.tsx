import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SettingsForm from "./SettingsForm";
import { getClubSettings } from "@/actions/settings";
import { Settings as SettingsIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import DataClearButton from "./DataClearButton";
import PaymentGatewayToggle from "./PaymentGatewayToggle";
import InterimModeSettingsSwitch from "./InterimModeSettingsSwitch";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const isAdmin = role === "ADMIN" || role === "PRESIDENT" || role === "SECRETARY" || role === "CONTROLLER";
  const canControlSystem = role === "ADMIN" || role === "PRESIDENT" || role === "CONTROLLER";

  const settings = await getClubSettings();

  const pendingRequest = await prisma.dataClearRequest.findFirst({
    where: { status: "PENDING" }
  });
  const pendingRequestExists = !!pendingRequest;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={28} color="var(--primary)" /> সেটিংস ও সিস্টেম কনফিগারেশন
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          প্রতিষ্ঠানের নাম, লোগো, পেমেন্ট গেটওয়ে ও অন্তরবর্তীকালীন কন্ট্রোলার মোড নিয়ন্ত্রণ।
        </p>
      </header>

      {/* 1. Interim Controller Mode Switch System */}
      {isAdmin && (
        <InterimModeSettingsSwitch initialMode={Boolean(settings.noCommitteeMode)} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Organization Identity */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>প্রতিষ্ঠানের পরিচয় ও লোগো (Organization Identity)</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>এই তথ্য ও লোগোটি ড্যাশবোর্ড, ওয়াটারমার্ক ও সকল প্রিন্ট রশিদে দেখাবে।</p>
          
          {isAdmin ? (
            <SettingsForm initialData={settings} />
          ) : (
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(243, 244, 246, 0.5)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Name</span>
                  <p style={{ fontWeight: 500, color: 'var(--foreground)' }}>{settings.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Address</span>
                  <p style={{ fontWeight: 500, color: 'var(--foreground)' }}>{settings.address || "N/A"}</p>
                </div>
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                * শুধুমাত্র এডমিন বা কন্ট্রোলার এই সেটিংস পরিবর্তন করতে পারবেন।
              </p>
            </div>
          )}
        </div>

        {canControlSystem && (
          <>
            {/* Online Payment Gateway control card */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>অনলাইন পেমেন্ট গেটওয়ে কন্ট্রোল (Online Payment Gateway)</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                বিকাশ/নগদ গেটওয়ে সক্রিয় বা নিষ্ক্রিয় করুন। এটি চালু করলে মেম্বাররা বকেয়া চাঁদা সরাসরি অনলাইন গেটওয়ের মাধ্যমে পরিশোধ করতে পারবেন।
              </p>
              
              <PaymentGatewayToggle 
                isActive={settings.paymentGatewayActive} 
                bkashUsername={settings.bkashUsername}
                bkashPassword={settings.bkashPassword}
                bkashAppKey={settings.bkashAppKey}
                bkashAppSecret={settings.bkashAppSecret}
                nagadMerchantId={settings.nagadMerchantId}
                nagadAppKey={settings.nagadAppKey}
              />
            </div>

            {/* Danger Zone */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid #fee2e2', backgroundColor: '#ffffff' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#991b1b' }}>ড্যাশবোর্ড ট্রায়াল ডেটা রিসেট (Danger Zone)</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                সকল ট্রায়াল ডেটা (লেনদেন, বিল, বকেয়া, প্রজেক্ট, ভোট) মুছে ফেলার জন্য অনুরোধ করুন। সদস্য অ্যাকাউন্ট, পদবী এবং সেটিংস মুছবে না।
              </p>
              
              <DataClearButton pendingRequestExists={pendingRequestExists} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
