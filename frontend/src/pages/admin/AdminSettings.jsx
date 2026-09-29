import { useState, useEffect, useRef } from "react";
import {
  Save,
  QrCode,
  Store,
  Receipt,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Stamp,
  RefreshCw
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const AdminSettings = () => {
  const { settings: globalSettings, setSettings: setGlobalSettings } = useCart();
  const { success, error } = useNotification();
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef(null);
  const stampInputRef = useRef(null);
  const qrInputRef = useRef(null);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setFormData(res.data);
        }
      } catch (err) {
      }
    };
    fetchSettings();
  }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      const res = await api.updateSettings(formData);
      if (res.success && res.data) {
        setFormData(res.data);
        setGlobalSettings(res.data);
        success("Restaurant configuration saved successfully!");
      }
    } catch (err) {
      error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
  const handleImageUpload = async (field, file) => {
    if (!file || !formData) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setFormData({
        ...formData,
        [field]: dataUrl,
        ...field === "upiQrImage" ? { isCustomQrImage: true } : {}
      });
      success(
        field === "logoUrl" ? "Logo updated \u2014 click Save Configuration to apply" : field === "stampUrl" ? "Hotel stamp/seal updated \u2014 click Save Configuration to apply" : "Custom payment QR uploaded \u2014 click Save Configuration to apply"
      );
    } catch (err) {
      error("Could not read that image file. Please try a JPG, PNG, or SVG.");
    }
  };
  const handleAutoGenerateQr = () => {
    if (!formData) return;
    const upiQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `upi://pay?pa=${formData.upiId}&pn=${encodeURIComponent(formData.restaurantName)}&cu=INR`
    )}`;
    setFormData({ ...formData, upiQrImage: upiQr, isCustomQrImage: false });
    success("Generated a fresh QR from the UPI ID below. Click Save Configuration to apply.");
  };
  if (!formData) {
    return <AdminLayout>
        <div className="py-24 text-center text-xs text-zinc-500">Loading configurations...</div>
      </AdminLayout>;
  }
  return <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Restaurant Profile, Tax & UPI Gateway
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure business details, GSTIN, statutory tax percentages, and dynamic UPI QR code.
            </p>
          </div>

          <button
    onClick={handleSave}
    disabled={isSaving}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 w-fit"
  >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Updating..." : "Save Configuration"}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {
    /* Store Operation Status */
  }
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  Live Store Ordering Availability
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  When closed, customer devices will see "Orders Paused" and cannot place orders.
                </p>
              </div>

              <button
    type="button"
    onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${formData.isOpen ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20" : "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"}`}
  >
                {formData.isOpen ? "\u{1F7E2} Open for Orders" : "\u{1F534} Closed / Paused"}
              </button>
            </div>
          </div>

          {
    /* Business Profile */
  }
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Establishment Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Restaurant Legal / Brand Name
                </label>
                <input
    type="text"
    value={formData.restaurantName}
    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tagline / Brand Motto
                </label>
                <input
    type="text"
    value={formData.tagline}
    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Postal Address
                </label>
                <input
    type="text"
    value={formData.address}
    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Phone Number
                </label>
                <input
    type="text"
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>
            </div>
          </div>

          {
    /* Branding: Logo & Hotel Stamp/Seal */
  }
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Logo &amp; Official Hotel Stamp / Seal (Muhar)
            </h3>
            <p className="text-xs text-zinc-400">
              These appear on the customer-facing site and on every printed tax invoice. Upload your
              own logo and official stamp image to replace the defaults below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {
    /* Logo Upload */
  }
              <div className="text-center p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Restaurant Logo
                </span>
                <div className="w-24 h-24 mx-auto bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                  {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon className="w-8 h-8 text-zinc-300" />}
                </div>
                <input
    ref={logoInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => handleImageUpload("logoUrl", e.target.files?.[0] || null)}
  />
                <button
    type="button"
    onClick={() => logoInputRef.current?.click()}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
  >
                  <Upload className="w-3.5 h-3.5" /> Upload Logo
                </button>
              </div>

              {
    /* Stamp / Seal Upload */
  }
              <div className="text-center p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Official Stamp / Seal (Muhar)
                </span>
                <div className="w-24 h-24 mx-auto bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                  {formData.stampUrl ? <img src={formData.stampUrl} alt="Stamp" className="w-full h-full object-contain" /> : <Stamp className="w-8 h-8 text-zinc-300" />}
                </div>
                <input
    ref={stampInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => handleImageUpload("stampUrl", e.target.files?.[0] || null)}
  />
                <button
    type="button"
    onClick={() => stampInputRef.current?.click()}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
  >
                  <Upload className="w-3.5 h-3.5" /> Upload Stamp / Seal
                </button>
              </div>
            </div>
          </div>

          {
    /* Tax & GST Compliance */
  }
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              Tax (GST) & Service Charge Rates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  GSTIN Registration No.
                </label>
                <input
    type="text"
    value={formData.gstNumber}
    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all font-mono"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Total GST Rate % (CGST + SGST)
                </label>
                <input
    type="number"
    step="0.1"
    value={formData.gstPercentage}
    onChange={(e) => setFormData({ ...formData, gstPercentage: Number(e.target.value) })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                <span className="text-[10px] text-zinc-500 mt-0.5 block">
                  Standard AC restaurant GST is 5.0%
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Service Charge Rate %
                </label>
                <input
    type="number"
    step="0.1"
    value={formData.serviceChargePercentage}
    onChange={(e) => setFormData({ ...formData, serviceChargePercentage: Number(e.target.value) })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                <span className="text-[10px] text-zinc-500 mt-0.5 block">
                  Optional discretionary gratuity (e.g. 2.5%)
                </span>
              </div>
            </div>
          </div>

          {
    /* UPI Payment Gateway */
  }
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              Direct UPI Merchant Payment Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Merchant UPI ID (VPA)
                  </label>
                  <input
    type="text"
    value={formData.upiId}
    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
    placeholder="royalspice@icici"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all font-mono"
  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Payments made by customers on their phones are directly credited to this VPA.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Merchant / Payee Display Name
                  </label>
                  <input
    type="text"
    value={formData.upiMerchantName}
    onChange={(e) => setFormData({ ...formData, upiMerchantName: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <div className="font-bold text-white">Supported UPI Apps:</div>
                  <div>Google Pay • PhonePe • Paytm • BHIM • Cred • Amazon Pay</div>
                </div>

                {formData.isCustomQrImage && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Using your exact uploaded payment QR image. It will NOT be regenerated
                      automatically — upload a new one or click "Auto-Generate" to replace it.
                    </span>
                  </div>}
              </div>

              {
    /* Actual Saved / Custom QR Image */
  }
              <div className="text-center p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Payment QR (Shown to Customers)
                </span>
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
                  {formData.upiQrImage ? <img src={formData.upiQrImage} alt="UPI QR" className="w-full h-full object-contain" /> : <QrCode className="w-10 h-10 text-zinc-300" />}
                </div>
                <div className="text-[10px] text-amber-400 font-mono truncate">{formData.upiId}</div>

                <input
    ref={qrInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => handleImageUpload("upiQrImage", e.target.files?.[0] || null)}
  />
                <button
    type="button"
    onClick={() => qrInputRef.current?.click()}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors"
  >
                  <Upload className="w-3.5 h-3.5" /> Upload Custom QR
                </button>
                <button
    type="button"
    onClick={handleAutoGenerateQr}
    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors"
  >
                  <RefreshCw className="w-3.5 h-3.5" /> Auto-Generate from UPI ID
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>;
};
export {
  AdminSettings
};
