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

  const Card = ({ icon, title, value }) => (
    <div className="p-5 rounded-2xl border bg-white dark:bg-black border-gray-200 dark:border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-red-700">{icon}</div>
        <div>
          <p className="text-xs opacity-50 uppercase">
            {title}
          </p>
          <p className="font-bold text-sm">{value}</p>
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-700 text-white"
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
        <div className="mt-10 p-4 border border-red-700/30 rounded-2xl text-sm text-red-700">
          {isRTL
            ? "هذه الصفحة تُستخدم فقط لعرض حالة تكامل WhatsApp API."
            : "This page is used to monitor WhatsApp API integration status."}
        </div>

      </div>
    </div>
  );
}