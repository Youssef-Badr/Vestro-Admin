import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";

const initial = { instapayEnabled: true, instapayUrl: "", vodafoneCashEnabled: true, vodafoneCashNumber: "" };
export default function PaymentSettings() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const t = (ar, en) => isRTL ? ar : en;
  useEffect(() => { axios.get("/payment-settings/admin").then(({ data }) => setSettings(data)).catch(() => toast.error(t("تعذر تحميل إعدادات الدفع", "Could not load payment settings"))).finally(() => setLoading(false)); }, []);
  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async (event) => { event.preventDefault(); setSaving(true); try { const { data } = await axios.put("/payment-settings/admin", settings); setSettings(data.settings); toast.success(t("تم حفظ إعدادات الدفع", "Payment settings saved")); } catch (error) { toast.error(error.response?.data?.message || t("تعذر حفظ الإعدادات", "Could not save settings")); } finally { setSaving(false); } };
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-black outline-none focus:border-red-700 dark:border-white/20 dark:bg-zinc-950 dark:text-white";
  if (loading) return <div className="p-8">{t("جارٍ التحميل...", "Loading...")}</div>;
  return <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 p-5 text-slate-900 dark:bg-black dark:text-white md:p-8"><form onSubmit={save} className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow dark:bg-zinc-950"><header><h1 className="text-2xl font-black">{t("إعدادات InstaPay وفودافون كاش", "InstaPay & Vodafone Cash")}</h1><p className="mt-2 text-sm opacity-65">{t("تظهر تفاصيل التحويل للعملاء عند اختيار وسيلة الدفع. تعديل هذه الإعدادات متاح لمدير الموقع فقط.", "Transfer details appear to customers after selecting a payment method. Only site admins can change these settings.")}</p></header>
    <section className="rounded-xl border border-slate-200 p-5 dark:border-white/10"><label className="flex items-center justify-between font-bold"><span>InstaPay</span><input type="checkbox" checked={settings.instapayEnabled} onChange={(e) => update("instapayEnabled", e.target.checked)} /></label><label className="mt-4 block text-sm font-semibold">{t("رابط InstaPay", "InstaPay URL")}<input required type="url" value={settings.instapayUrl} onChange={(e) => update("instapayUrl", e.target.value)} className={field} dir="ltr" /></label><p className="mt-2 text-xs opacity-60">HTTPS link hosted on ipn.eg.</p></section>
    <section className="rounded-xl border border-slate-200 p-5 dark:border-white/10"><label className="flex items-center justify-between font-bold"><span>Vodafone Cash</span><input type="checkbox" checked={settings.vodafoneCashEnabled} onChange={(e) => update("vodafoneCashEnabled", e.target.checked)} /></label><label className="mt-4 block text-sm font-semibold">{t("رقم فودافون كاش", "Vodafone Cash number")}<input required type="tel" value={settings.vodafoneCashNumber} onChange={(e) => update("vodafoneCashNumber", e.target.value)} className={field} dir="ltr" /></label><p className="mt-2 text-xs opacity-60">{t("رقم موبايل مصري صالح.", "Valid Egyptian mobile number.")}</p></section>
    <button disabled={saving} className="rounded-xl bg-red-700 px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? t("جارٍ الحفظ...", "Saving...") : t("حفظ الإعدادات", "Save settings")}</button>
  </form></main>;
}
