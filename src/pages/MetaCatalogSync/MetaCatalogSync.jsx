import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const MetaCatalogSync = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // 🚀 ستيت مخصصة لتخزين بيانات المزامنة الحقيقية القادمة من السيرفر
  const [metaConfig, setMetaConfig] = useState({
    catalogId: "",
    accessToken: "",
    configLoading: true
  });

  const { theme } = useTheme();
  const { language } = useLanguage();

  // 🔄 جلب البيانات الحقيقية من الباك إند بمجرد تحميل الصفحة
  useEffect(() => {
    const fetchMetaConfig = async () => {
      try {
        const res = await axios.get("/meta-catalog/meta-config");
        setMetaConfig({
          catalogId: res.data.catalogId,
          accessToken: res.data.accessToken,
          configLoading: false
        });
      } catch (err) {
        console.error("Error fetching Meta config:", err);
        setMetaConfig({
          catalogId: language === "ar" ? "فشل التحميل" : "Error Loading",
          accessToken: language === "ar" ? "فشل التحميل" : "Error Loading",
          configLoading: false
        });
      }
    };
    fetchMetaConfig();
  }, [language]);

  const handleSync = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/meta-sync-all");

      setResult(res.data);

      toast.success(
        language === "ar"
          ? "تمت مزامنة الكتالوج بنجاح"
          : "Meta Catalog Sync Completed"
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (language === "ar"
            ? "فشلت مزامنة الكتالوج"
            : "Meta Sync Failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen p-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-950 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`rounded-2xl p-8 border backdrop-blur-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800 shadow-xl shadow-black/20"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            {language === "ar"
              ? "إدارة كتالوج ميتا"
              : "Meta Catalog Management"}
          </h1>

          <p
            className={`mb-8 text-sm ${
              theme === "dark" ? "text-slate-400" : "text-gray-600"
            }`}
          >
            {language === "ar"
              ? "مزامنة مباشرة بين الموقع و Meta Commerce Manager"
              : "Server-to-Server Integration using Meta System User Token"}
          </p>

          {/* 📊 كروت عرض البيانات الحقيقية المستلمة من الـ Environment Variables */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div
              className={`p-5 rounded-xl border transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-950/50 border-slate-800"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div
                className={`text-xs font-semibold uppercase tracking-wider ${
                  theme === "dark" ? "text-slate-500" : "text-gray-400"
                }`}
              >
                Catalog ID
              </div>

              <div className="font-mono mt-2 text-base font-medium break-all text-rose-500">
                {metaConfig.configLoading ? (
                  <span className="animate-pulse opacity-60">
                    {language === "ar" ? "جاري التحميل..." : "Loading..."}
                  </span>
                ) : (
                  metaConfig.catalogId
                )}
              </div>
            </div>

            <div
              className={`p-5 rounded-xl border transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-950/50 border-slate-800"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div
                className={`text-xs font-semibold uppercase tracking-wider ${
                  theme === "dark" ? "text-slate-500" : "text-gray-400"
                }`}
              >
                Access Token
              </div>

              <div className="font-mono mt-2 text-base font-medium break-all text-emerald-500">
                {metaConfig.configLoading ? (
                  <span className="animate-pulse opacity-60">
                    {language === "ar" ? "جاري التحميل..." : "Loading..."}
                  </span>
                ) : (
                  metaConfig.accessToken
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl mb-8 border transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-950/30 border-slate-800/60"
                : "bg-gray-50 border-gray-150"
            }`}
          >
            <h2 className="font-semibold text-lg mb-3">
              {language === "ar"
                ? "مزامنة الكتالوج الشاملة"
                : "Full Catalog Synchronization"}
            </h2>

            <p
              className={`mb-6 text-sm leading-relaxed ${
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              }`}
            >
              {language === "ar"
                ? "تحديث ومزامنة جميع المنتجات والفاريانتس النشطة فوراً من قاعدة البيانات الحالية إلى Meta Commerce Manager بشكل آمن."
                : "Synchronizes all active products and variants from the VESTRO database to Meta Commerce Manager instantly."}
            </p>

            <button
              onClick={handleSync}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-red-600/10 active:scale-[0.98]"
            >
              {loading
                ? language === "ar"
                  ? "جاري المزامنة..."
                  : "Synchronizing..."
                : language === "ar"
                ? "مزامنة جميع المنتجات الآن"
                : "Sync All Products Now"}
            </button>
          </div>

          {/* 📄 نافذة عرض الـ JSON Response الناتجة عن المزامنة */}
          {result && (
            <div
              className={`border rounded-xl p-5 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-emerald-950/10 border-emerald-800/60 text-emerald-400"
                  : "bg-emerald-50/60 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                {language === "ar" ? "نتيجة استجابة السيرفر" : "Server Sync Response"}
              </div>

              <pre className="text-xs font-mono overflow-auto max-h-72 whitespace-pre-wrap bg-black/10 dark:bg-black/30 p-4 rounded-lg border border-black/5">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaCatalogSync;