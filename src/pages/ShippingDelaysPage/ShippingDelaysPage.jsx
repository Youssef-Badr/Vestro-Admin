import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext"; 
import { useTheme } from "../../context/ThemeContext"; 

export default function ShippingDelaysPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // الإعدادات تبدأ بقيم فارغة لحين تحميلها من السيرفر
  const [settings, setSettings] = useState({
    warehouseStuckHours: "",
    maxShippingDays: "",
  });

  const { language } = useLanguage(); // 'ar' أو 'en'
  const { theme } = useTheme(); 

  // قاموس الترجمة للواجهات والكلمات الثابتة
  const t = {
    ar: {
      title: "🚨 تقصيرات الشحن",
      settings: "الإعدادات العالمية",
      warehouseHours: "ساعات تأخير المخزن (كود 10)",
      maxDays: "الحد الأقصى لأيام الشحن",
      save: "حفظ الإعدادات",
      noDelays: "🎉 لا يوجد تأخيرات تطابق بحثك حالياً",
      warehouseDelay: "تأخير مخزن",
      shippingDelay: "تأخير شحن",
      updated: "تم حفظ الإعدادات بنجاح وجاري إعادة حساب التأخيرات...",
      error: "حدث خطأ أثناء الحفظ",
      refresh: "تحديث البيانات",
      unknownGuest: "عميل مجهول",
      searchPlaceholder: "ابحث بالاسم، رقم التتبع، الـ ID، أو التليفون...",
      orderId: "معرف الطلب",
      trackingNumber: "رقم التتبع",
      notAvailable: "غير متاح"
    },
    en: {
      title: "🚨 Shipping Delays",
      settings: "Global Settings",
      warehouseHours: "Warehouse Delay Hours (State 10)",
      maxDays: "Max Shipping Days",
      save: "Save Settings",
      noDelays: "🎉 No delays match your search at the moment",
      warehouseDelay: "Warehouse Delay",
      shippingDelay: "Shipping Delay",
      updated: "Settings updated successfully! Recalculating...",
      error: "Error saving settings",
      refresh: "Refresh Data",
      unknownGuest: "Unknown Guest",
      searchPlaceholder: "Search by name, tracking number, ID, or phone...",
      orderId: "Order ID",
      trackingNumber: "Tracking Number",
      notAvailable: "N/A"
    }
  };

  const currentText = t[language];

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/shipping-delays", { withCredentials: true });
      
      const fetchedOrders = res?.data?.data || [];
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders); 

      if (res?.data?.settings) {
        setSettings({
          warehouseStuckHours: res.data.settings.warehouseStuckHours ?? "",
          maxShippingDays: res.data.settings.maxShippingDays ?? "",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LIVE SEARCH FILTER
  // =========================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase().trim();

    const filtered = orders.filter((order) => {
      const customerName = (order.guestInfo?.name || order.client?.name || order.user?.name || "").toLowerCase();
      const phone = (order.guestInfo?.phone || order.client?.phone || "").toLowerCase();
      const trackingNum = (order.bostaInfo?.trackingNumber || "").toLowerCase();
      const orderId = (order._id || "").toLowerCase();

      return (
        customerName.includes(query) ||
        phone.includes(query) ||
        trackingNum.includes(query) ||
        orderId.includes(query)
      );
    });

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  // =========================
  // UPDATE SETTINGS
  // =========================
  const updateSettings = async () => {
    try {
      await axios.put("/orders/shipping-delays", settings, { withCredentials: true });
      alert(currentText.updated);
      fetchData(); 
    } catch (err) {
      console.error("Error updating settings:", err);
      alert(currentText.error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [theme]); 

  return (
    <div className="min-h-screen p-4 sm:p-6 transition-colors duration-200 bg-gray-100 text-black dark:bg-zinc-950 dark:text-white" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {currentText.title}
        </h1>

        <button
          onClick={fetchData}
          className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition bg-black text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-sm"
        >
          {currentText.refresh}
        </button>
      </div>

      {/* SETTINGS CONTROL PANEL */}
      <div className="p-4 sm:p-5 rounded-xl mb-6 transition-all bg-white shadow-sm dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          ⚙️ {currentText.settings}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {currentText.warehouseHours}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={settings.warehouseStuckHours}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                setSettings({ ...settings, warehouseStuckHours: val });
              }}
              className="border p-2.5 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white border-gray-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
              placeholder="24"
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {currentText.maxDays}
            </label>
            <input
              type="number"
              min="0"
              value={settings.maxShippingDays}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                setSettings({ ...settings, maxShippingDays: val });
              }}
              className="border p-2.5 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white border-gray-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
              placeholder="3"
            />
          </div>
        </div>

        <button
          onClick={updateSettings}
          className="mt-4 w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm text-sm"
        >
          {currentText.save}
        </button>
      </div>

      {/* 🔍 LIVE SEARCH INPUT */}
      <div className="mb-6 relative">
        <div className={`absolute inset-y-0 flex items-center pointer-events-none opacity-50 ${language === "ar" ? "left-0 pl-3" : "start-0 ps-3"}`}>
          <span>🔍</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={currentText.searchPlaceholder}
          className={`w-full p-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white border-gray-300 text-black dark:bg-zinc-900 dark:border-zinc-800 dark:text-white text-sm shadow-sm ${language === "ar" ? "pl-10" : "ps-10"}`}
        />
      </div>

      {/* CARDS LIST SECTION */}
      {loading ? (
        /* Skeleton Loader المتجاوب */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-5 rounded-xl bg-white dark:bg-zinc-900 border-s-4 border-gray-300 dark:border-zinc-700 h-40 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-1/3"></div>
                <div className="h-6 bg-gray-300 dark:bg-zinc-700 rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2 mt-2"></div>
              <div className="h-8 bg-gray-100 dark:bg-zinc-800/50 rounded w-full mt-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-24 mt-3"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-12 font-medium bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-dashed border-gray-200 dark:border-zinc-800 text-sm">
          {currentText.noDelays}
        </p>
      ) : (
        /* Grid متجاوب بالكامل */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`p-5 rounded-xl border-s-4 border-red-600 transition-all bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-base line-clamp-1">
                    {order.guestInfo?.name || order.client?.name || order.user?.name || currentText.unknownGuest}
                  </h3>

                  <span className="text-xs bg-red-600/10 text-red-600 dark:bg-red-600/20 dark:text-red-400 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                    {order.shippingDelay?.type === "WAREHOUSE_STUCK"
                      ? currentText.warehouseDelay
                      : currentText.shippingDelay}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-medium">
                  <span>📞</span> {order.guestInfo?.phone || order.client?.phone || currentText.notAvailable}
                </p>

                {/* كتل تفاصيل الـ ID والـ Tracking مترجمة بالكامل */}
                <div className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono space-y-0.5">
                  <div>{currentText.orderId}: <span className="text-zinc-600 dark:text-zinc-300">#{order._id}</span></div>
                  {order.bostaInfo?.trackingNumber && (
                    <div>{currentText.trackingNumber}: <span className="text-zinc-600 dark:text-zinc-300">#{order.bostaInfo.trackingNumber}</span></div>
                  )}
                </div>

                {/* 🎯 قراءة السبب المترجم القادم من دالة الباك إند مباشرة على حسب لغة السيستم الحالية */}
                <div className="text-sm mt-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                  <span className="me-1">🧾</span> 
                  {order.shippingDelay?.reason?.[language] || order.shippingDelay?.reason || currentText.notAvailable}
                </div>
              </div>

              {/* وقت رصد التأخير متوافق محلياً مع لغة العرض */}
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1 opacity-70 border-t border-gray-100 dark:border-zinc-800/60 pt-2">
                <span>⏱</span> 
                {order.shippingDelay?.detectedAt 
                  ? new Date(order.shippingDelay.detectedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")
                  : currentText.notAvailable}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}