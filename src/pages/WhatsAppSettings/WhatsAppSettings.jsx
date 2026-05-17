import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import {
  MessageCircle,
  Phone,
  Key,
  Webhook,
  Activity,
  RefreshCw,
  Lock, // استيراد أيقونة القفل للتوكن
} from "lucide-react";
export default function WhatsAppSettings() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/whatsapp/settings");

      setData(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

 // دالة لتشفير التوكن وإظهار أول 6 أحرف فقط مع حظر الرؤية والنسخ تماماً
  const formatAccessToken = (token) => {
    if (!token) return "-";
    if (token.length <= 6) return token;
    
    const visiblePart = token.substring(0, 6);
    
    return (
      <div 
        className="flex items-center gap-2 font-mono tracking-wider select-none bg-gray-50/50 dark:bg-neutral-950/40 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/[0.03] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الحروف الـ 6 الأولى الواضحة لمعرفة هوية التوكن */}
        <span className="text-red-700 dark:text-red-400 font-black text-xs md:text-sm shrink-0">
          {visiblePart}
        </span>
        
        {/* التشفير الثابت بالبلور والنقاط لمنع الاختراق البصري */}
        <span className="blur-[2.5px] opacity-35 text-[10px] truncate max-w-[160px] tracking-widest font-bold select-none pointer-events-none">
          ••••••••••••••••••••••••••••••••
        </span>
      </div>
    );
  };

  const Card = ({ icon, title, value }) => (
    <div className="p-5 rounded-2xl border bg-white dark:bg-black border-gray-200 dark:border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3 w-full min-w-0">
        <div className="text-red-700 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs opacity-50 uppercase truncate">
            {title}
          </p>
          <div className="font-bold text-sm truncate mt-0.5">
            {value}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 px-4 bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">
              {isRTL ? "إعدادات واتساب" : "WhatsApp Settings"}
            </h1>
            <p className="text-xs opacity-50 mt-1">
              {isRTL
                ? "حالة الاتصال مع واتساب API"
                : "WhatsApp API connection status"}
            </p>
          </div>

          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 transition-colors"
          >
            <RefreshCw size={16} />
            {isRTL ? "تحديث" : "Refresh"}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center opacity-60">
            {isRTL ? "جار التحميل..." : "Loading..."}
          </div>
        )}

        {/* DASHBOARD */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-4">

            <Card
              icon={<MessageCircle />}
              title={isRTL ? "الحالة" : "Status"}
              value={
                data?.connected
                  ? "CONNECTED ✅"
                  : "DISCONNECTED ❌"
              }
            />

            <Card
              icon={<Phone />}
              title={isRTL ? "رقم الهاتف" : "Phone Number ID"}
              value={data?.phoneNumberId || "-"}
            />

            <Card
              icon={<Key />}
              title={isRTL ? "Business ID" : "Business Account"}
              value={data?.businessAccountId || "-"}
            />

            {/* 🔐 كارت الأكسيس توكن المضاف حديثاً مع حماية البلور */}
            <Card
              icon={<Lock size={20} />}
              title={isRTL ? "رمز الوصول (Access Token)" : "Access Token"}
              value={formatAccessToken(data?.accessToken)}
            />

            <Card
              icon={<Webhook />}
              title={isRTL ? "Webhook" : "Webhook Status"}
              value={
                data?.webhookVerified
                  ? "ACTIVE"
                  : "INACTIVE"
              }
            />

            <Card
              icon={<Activity />}
              title={isRTL ? "آخر حدث" : "Last Event"}
              value={
                data?.lastWebhookEvent
                  ? new Date(
                      data.lastWebhookEvent
                    ).toLocaleString()
                  : "-"
              }
            />

          </div>
        )}

        {/* FOOTER WARNING */}
        <div className="mt-10 p-4 border border-red-700/30 rounded-2xl text-sm text-red-700 bg-red-50/10 backdrop-blur-sm">
          {isRTL
            ? "هذه الصفحة تُستخدم فقط لعرض حالة تكامل WhatsApp API وحماية البيانات الحساسة."
            : "This page is used to monitor WhatsApp API integration status and protect sensitive credentials."}
        </div>

      </div>
    </div>
  );
}