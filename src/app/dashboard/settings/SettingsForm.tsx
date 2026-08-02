"use client";

import { useState } from "react";
import { updateClubSettings } from "@/actions/settings";
import { Save, Loader2, Building, MapPin, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { compressImageToWebP } from "@/lib/imageCompressor";

interface SettingsFormProps {
  initialData: {
    name: string;
    logo: string | null;
    paidLogo?: string | null;
    watermarkLogo?: string | null;
    address: string | null;
  };
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [logoBase64, setLogoBase64] = useState(initialData.logo || "");
  const [paidLogoBase64, setPaidLogoBase64] = useState(initialData.paidLogo || "");
  const [watermarkLogoBase64, setWatermarkLogoBase64] = useState(initialData.watermarkLogo || "");
  const router = useRouter();

  const handleLogoUpload = async (file: File | undefined, setter: (val: string) => void, defaultVal: string) => {
    if (file) {
      try {
        const compressedWebP = await compressImageToWebP(file, 500, 500, 0.7);
        setter(compressedWebP);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else {
      setter(defaultVal);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateClubSettings(formData);

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      router.refresh(); // Refresh the page to reflect changes
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>Settings updated successfully!</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Organization Name</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <Building size={18} />
          </div>
          <input 
            type="text" 
            name="name"
            defaultValue={initialData.name}
            required
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none' }} 
            placeholder="e.g. United Vision"
          />
        </div>
      </div>

      {/* Organization Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Upload Logo (প্রতিষ্ঠানের লগো)</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <ImageIcon size={18} />
          </div>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleLogoUpload(e.target.files?.[0], setLogoBase64, initialData.logo || "")}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', background: '#fff' }} 
          />
          <input type="hidden" name="logo" value={logoBase64} />
        </div>
        {logoBase64 && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'inline-block', backgroundColor: '#fff' }}>
            <img src={logoBase64} alt="Logo Preview" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
        )}
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Upload an image to replace the default 'UV' text logo.</span>
      </div>

      {/* Paid Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Upload Paid Logo (পেইড সিল লগো)</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <ImageIcon size={18} />
          </div>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleLogoUpload(e.target.files?.[0], setPaidLogoBase64, initialData.paidLogo || "")}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', background: '#fff' }} 
          />
          <input type="hidden" name="paidLogo" value={paidLogoBase64} />
        </div>
        {paidLogoBase64 && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'inline-block', backgroundColor: '#fff' }}>
            <img src={paidLogoBase64} alt="Paid Logo Preview" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
        )}
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>রশিদে প্রদর্শিত হওয়ার জন্য গোল পেইড সিল লগো আপলোড করুন।</span>
      </div>

      {/* Watermark Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Upload Watermark Logo (রশিদের জলছাপ লগো)</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <ImageIcon size={18} />
          </div>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleLogoUpload(e.target.files?.[0], setWatermarkLogoBase64, initialData.watermarkLogo || "")}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', background: '#fff' }} 
          />
          <input type="hidden" name="watermarkLogo" value={watermarkLogoBase64} />
        </div>
        {watermarkLogoBase64 && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'inline-block', backgroundColor: '#fff' }}>
            <img src={watermarkLogoBase64} alt="Watermark Logo Preview" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
        )}
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>রশিদের ব্যাকগ্রাউন্ডে জলছাপ হিসেবে ব্যবহার করার জন্য লগো আপলোড করুন।</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Address</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#9ca3af' }}>
            <MapPin size={18} />
          </div>
          <textarea 
            name="address"
            defaultValue={initialData.address || ""}
            rows={3}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }} 
            placeholder="Full address of the organization"
          ></textarea>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
        Save Changes
      </button>
    </form>
  );
}
