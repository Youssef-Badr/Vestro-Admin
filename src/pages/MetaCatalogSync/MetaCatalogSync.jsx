import { useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const MetaCatalogSync = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { theme } = useTheme();
  const { language } = useLanguage();

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
      className={`min-h-screen p-8 ${
        theme === "dark"
          ? "bg-slate-950 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`rounded-2xl p-8 border ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-gray-200"
          }`}
        >
          <h1 className="text-3xl font-bold mb-2">
            {language === "ar"
              ? "إدارة كتالوج ميتا"
              : "Meta Catalog Management"}
          </h1>

          <p
            className={`mb-8 ${
              theme === "dark"
                ? "text-slate-400"
                : "text-gray-600"
            }`}
          >
            {language === "ar"
              ? "مزامنة مباشرة بين الموقع و Meta Commerce Manager"
              : "Server-to-Server Integration using Meta System User Token"}
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-slate-800"
                  : "bg-gray-100"
              }`}
            >
              <div
                className={`text-sm ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-gray-500"
                }`}
              >
                Catalog ID
              </div>

              <div className="font-mono mt-2">
                123456789012345
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-slate-800"
                  : "bg-gray-100"
              }`}
            >
              <div
                className={`text-sm ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-gray-500"
                }`}
              >
                Access Token
              </div>

              <div className="font-mono mt-2">
                EAAB********************
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl mb-8 ${
              theme === "dark"
                ? "bg-slate-800"
                : "bg-gray-100"
            }`}
          >
            <h2 className="font-semibold mb-4">
              {language === "ar"
                ? "مزامنة الكتالوج"
                : "Catalog Synchronization"}
            </h2>

            <p
              className={`mb-6 ${
                theme === "dark"
                  ? "text-slate-400"
                  : "text-gray-600"
              }`}
            >
              {language === "ar"
                ? "مزامنة جميع المنتجات والفاريانتس النشطة من قاعدة بيانات VESTRO إلى Meta Commerce Manager."
                : "Synchronizes all active products and variants from the VESTRO database to Meta Commerce Manager."}
            </p>

            <button
              onClick={handleSync}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
            >
              {loading
                ? language === "ar"
                  ? "جاري المزامنة..."
                  : "Synchronizing..."
                : language === "ar"
                ? "مزامنة جميع المنتجات"
                : "Sync All Products"}
            </button>
          </div>

          {result && (
            <div
              className={`border rounded-xl p-4 ${
                theme === "dark"
                  ? "bg-green-900/20 border-green-600"
                  : "bg-green-50 border-green-400"
              }`}
            >
              <div className="font-semibold mb-2">
                {language === "ar"
                  ? "نتيجة المزامنة"
                  : "Sync Result"}
              </div>

              <pre className="text-sm overflow-auto whitespace-pre-wrap">
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