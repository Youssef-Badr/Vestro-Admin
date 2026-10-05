import { useEffect, useState } from "react";
import { Ban, PhoneOff, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";

export default function BlockedPhones() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [phones, setPhones] = useState([]);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const t = ar
    ? { title: "الأرقام المحظورة", desc: "الأرقام المحظورة لا يمكنها إنشاء طلبات جديدة.", phone: "رقم الهاتف", reason: "سبب الحظر (اختياري)", add: "حظر الرقم", empty: "لا توجد أرقام محظورة", remove: "إلغاء الحظر", failed: "تعذر تنفيذ الطلب", confirm: "إلغاء حظر هذا الرقم؟" }
    : { title: "Blocked phones", desc: "Blocked numbers cannot place new orders.", phone: "Phone number", reason: "Reason (optional)", add: "Block number", empty: "No blocked numbers", remove: "Unblock", failed: "Request failed", confirm: "Unblock this number?" };
  const load = async () => {
    try { const { data } = await api.get("/orders/blocked-phones"); setPhones(data.blockedPhones || []); }
    catch (e) { toast.error(e.response?.data?.message || t.failed); }
  };
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!/^01[0125]\d{8}$/.test(digits)) return toast.error(ar ? "أدخل رقم موبايل مصري صحيح" : "Enter a valid Egyptian mobile number");
    setBusy(true);
    try { await api.post("/orders/blocked-phones", { phone: digits, reason }); setPhone(""); setReason(""); toast.success(ar ? "تم حظر الرقم" : "Number blocked"); await load(); }
    catch (e) { toast.error(e.response?.data?.message || t.failed); }
    finally { setBusy(false); }
  };
  const remove = async (item) => {
    if (!window.confirm(t.confirm)) return;
    try { await api.delete(`/orders/blocked-phones/${encodeURIComponent(item.phone)}`); toast.success(ar ? "تم إلغاء الحظر" : "Number unblocked"); await load(); }
    catch (e) { toast.error(e.response?.data?.message || t.failed); }
  };
  return <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 p-5 text-slate-900 dark:bg-zinc-950 dark:text-white">
    <h1 className="flex items-center gap-2 text-2xl font-black"><Ban className="text-red-600"/>{t.title}</h1><p className="mb-6 mt-2 text-sm text-slate-500">{t.desc}</p>
    <form onSubmit={add} className="mb-6 grid gap-4 rounded-2xl bg-white p-5 shadow dark:bg-zinc-900 md:grid-cols-3 md:items-end">
      <label className="text-sm font-bold">{t.phone}<input dir="ltr" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01012345678" className="mt-2 w-full rounded-xl border bg-transparent p-3 dark:border-zinc-700"/></label>
      <label className="text-sm font-bold">{t.reason}<input value={reason} onChange={e=>setReason(e.target.value)} maxLength={300} className="mt-2 w-full rounded-xl border bg-transparent p-3 dark:border-zinc-700"/></label>
      <button disabled={busy} className="rounded-xl bg-red-600 p-3 font-bold text-white disabled:opacity-60">{busy ? "…" : t.add}</button>
    </form>
    <section className="overflow-hidden rounded-2xl bg-white shadow dark:bg-zinc-900"><h2 className="border-b p-4 font-black dark:border-zinc-800">{t.title} ({phones.length})</h2>
      {phones.length ? phones.map(item=><article key={item._id} className="flex items-center justify-between gap-4 border-b p-4 dark:border-zinc-800"><div><b dir="ltr">{item.phone}</b>{item.reason&&<p className="text-sm text-slate-500">{item.reason}</p>}</div><button onClick={()=>remove(item)} className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700"><Trash2 size={15}/>{t.remove}<PhoneOff size={15}/></button></article>) : <p className="p-8 text-center text-slate-500">{t.empty}</p>}
    </section>
  </main>;
}