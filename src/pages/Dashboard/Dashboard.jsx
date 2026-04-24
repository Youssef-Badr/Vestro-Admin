import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useTheme } from "../../../src/context/ThemeContext";
import {
  Package,
  Users,
  ShoppingBag,
  Truck,
  DollarSign,
  Zap,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { ORDER_STATUS_CONFIG } from "../../constants/orderConstants";

const RevenueChart = lazy(() => import("../../components/RevenueChart"));

function Dashboard() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const isRTL = language === "ar";
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    viewType: "monthly",
  });

  const [dashboardStats, setDashboardStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    netSales: 0,
    totalShipping: 0,
    statusSummary: {},
    chartData: [],
  });

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await axios.get("orders/stats", {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setDashboardStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const num = (value) => Number(value || 0).toLocaleString();

  const pageBg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardDark = "bg-[#0c0c0c] border-white/10 text-white";
  const cardLight = "bg-white border-slate-200 text-black shadow-sm";
  const card = isDark ? cardDark : cardLight;

  const stats = useMemo(
    () => [
      {
        title: isRTL ? "صافي البيع" : "Net Sales",
        value: num(dashboardStats.netSales),
        icon: <Zap size={16} />,
        red: true,
      },
      {
        title: isRTL ? "الإيراد" : "Revenue",
        value: num(dashboardStats.revenue),
        icon: <DollarSign size={16} />,
      },
      {
        title: isRTL ? "الشحن" : "Shipping",
        value: num(dashboardStats.totalShipping),
        icon: <Truck size={16} />,
      },
      {
        title: isRTL ? "الطلبات" : "Orders",
        value: num(dashboardStats.orders),
        icon: <Package size={16} />,
      },
      {
        title: isRTL ? "المنتجات" : "Products",
        value: num(dashboardStats.products),
        icon: <ShoppingBag size={16} />,
      },
      {
        title: isRTL ? "العملاء" : "Customers",
        value: num(dashboardStats.customers),
        icon: <Users size={16} />,
      },
    ],
    [dashboardStats, isRTL]
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen px-3 sm:px-4 md:px-6 pb-6 transition-all ${pageBg}`}
    >
      {/* top spacing */}
      <div className="h-20 md:h-16" />

      {/* header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none">
            Vestro{" "}
            <span className="text-red-700">
              {isRTL ? "لوحة التحكم" : "Dashboard"}
            </span>
          </h1>

          <p className="text-[12px] md:text-[10px] mt-1 uppercase tracking-[0.25em] opacity-50 font-bold">
            {isRTL ? "ملخص سريع للأداء" : "Fast Business Overview"}
          </p>
        </div>

        {/* controls */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`h-10 rounded-xl border flex items-center px-2 gap-2 ${card}`}
          >
            <Calendar size={13} className="text-red-700" />

            <select
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: Number(e.target.value) })
              }
              className="bg-transparent w-full text-[11px] font-bold outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="text-black">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              setFilters({
                ...filters,
                viewType:
                  filters.viewType === "monthly" ? "weekly" : "monthly",
              })
            }
            className="h-10 rounded-xl bg-red-700 text-white text-[10px] font-black uppercase"
          >
            {filters.viewType === "monthly"
              ? isRTL
                ? "شهري"
                : "Monthly"
              : isRTL
              ? "أسبوعي"
              : "Weekly"}
          </button>

          <button
            onClick={fetchStats}
            className={`h-10 rounded-xl border flex items-center justify-center ${card}`}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {stats.map((item, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-2 ${
              item.red
                ? "bg-red-700 border-red-700 text-white"
                : card
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center">
                {item.icon}
              </div>

              <span className="text-[9px] font-black uppercase opacity-60">
                #{i + 1}
              </span>
            </div>

            <p className="text-[14px] uppercase font-black opacity-60 mb-1 truncate">
              {item.title}
            </p>

            <h3 className="text-base md:text-xl font-black leading-none">
              {loading ? "..." : item.value}
            </h3>
          </div>
        ))}
      </div>

      {/* bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-4">
        {/* status */}
        <div className={`rounded-3xl border p-4 ${card}`}>
          <div className="mb-3">
            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">
              {isRTL ? "حالات الطلبات" : "Order Status"}
            </h4>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {Object.entries(dashboardStats.statusSummary || {}).map(
              ([key, count]) => {
                const config = ORDER_STATUS_CONFIG[key] || {
                  ar: key,
                  en: key,
                  icon: "•",
                };

                return (
                  <div
                    key={key}
                    className="rounded-2xl bg-red-700 text-white px-3 py-2 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{config.icon}</span>

                      <span className="text-[10px] font-black truncate">
                        {isRTL ? config.ar : config.en}
                      </span>
                    </div>

                    <span className="text-sm font-black">{count}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* chart */}
        <div className={`xl:col-span-2 rounded-3xl border p-4 ${card}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">
              {isRTL ? "نمو الإيرادات" : "Revenue Growth"}
            </h4>

            <span className="px-2 py-1 rounded-full bg-red-700 text-white text-[9px] font-black">
              LIVE
            </span>
          </div>

          <Suspense
            fallback={
              <div className="h-[220px] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
            }
          >
            <div dir="ltr" className="h-[220px] md:h-[320px]">
              <RevenueChart
                data={dashboardStats.chartData}
                viewType={filters.viewType}
              />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;