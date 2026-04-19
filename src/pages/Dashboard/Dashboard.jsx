import React, { lazy, Suspense, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../../src/context/LanguageContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { 
  TrendingUp, Package, Users, ShoppingBag, 
  Truck, DollarSign, Activity, Zap, Calendar, ChevronDown 
} from "lucide-react";
import { ORDER_STATUS_CONFIG } from "../../constants/orderConstants"; 

const RevenueChart = lazy(() => import("../../components/RevenueChart"));

function Dashboard() {
  const { language } = useLanguage();
  const { theme } = useTheme(); 
  const isDark = theme === "dark"; 
  const isRTL = language === "ar";
  
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    viewType: "monthly",
  });

  const [dashboardStats, setDashboardStats] = useState({
    products: 0, orders: 0, customers: 0, revenue: 0, netSales: 0, totalShipping: 0,
    statusSummary: {}, chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("orders/stats", {
          params: { ...filters },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDashboardStats(res.data);
      } catch (error) { console.error("Dashboard error:", error); }
    };
    fetchStats();
  }, [filters]);

  const stats = [
    { 
        title: isRTL ? "صافي المبيعات (Delivered)" : "Net Sales (Delivered)", 
        value: dashboardStats.netSales?.toLocaleString() || 0, 
        icon: <Zap size={22} fill={isDark ? "#000" : "#fff"} strokeWidth={0} />, 
        style: "bg-[#86FE05] text-black shadow-[0_20px_50px_rgba(134,254,5,0.25)] border-transparent scale-105 z-10" 
    },
    { 
        title: isRTL ? "إجمالي الإيرادات" : "Total Revenue", 
        value: dashboardStats.revenue?.toLocaleString() || 0, 
        icon: <DollarSign size={22} className="text-[#86FE05]" />, 
        style: isDark ? "bg-[#0A0A0A] border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
    },
    { 
        title: isRTL ? "عوائد الشحن المحصلة" : "Shipping Fees (Delivered)", 
        value: dashboardStats.totalShipping?.toLocaleString() || 0, 
        icon: <Truck size={22} className="opacity-40" />, 
        style: isDark ? "bg-[#0D0D0D]/50 border-white/[0.03] text-white/50" : "bg-slate-50 border-slate-200 text-slate-500 shadow-sm" 
    },
    { 
        title: isRTL ? "إجمالي الطلبات" : "Total Orders", 
        value: dashboardStats.orders || 0, 
        icon: <Package size={22} />, 
        style: isDark ? "bg-[#0A0A0A] border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm" 
    },
    { 
        title: isRTL ? "المنتجات" : "Products", 
        value: dashboardStats.products || 0, 
        icon: <ShoppingBag size={22} />, 
        style: isDark ? "bg-[#0A0A0A] border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm" 
    },
    { 
        title: isRTL ? "العملاء" : "Customers", 
        value: dashboardStats.customers || 0, 
        icon: <Users size={22} />, 
        style: isDark ? "bg-[#0A0A0A] border-white/5 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm" 
    },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen px-4 md:px-8 pb-10 transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className="h-28 md:h-20 w-full"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
            Vestro <span className="opacity-20 font-light not-italic text-xl md:text-2xl">{isRTL ? "القيادة" : "Control"}</span>
          </h1>
          <p className="text-[10px] mt-2 font-bold uppercase tracking-[0.4em] opacity-40">
             {isRTL ? "تحليلات الأرباح المحققة فقط" : "Verified Revenue Analytics Only"}
          </p>
        </div>

        {/* Filters */}
        <div className={`flex flex-col sm:flex-row items-stretch gap-3 p-1.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`relative flex items-center px-4 py-2 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <Calendar size={14} className="text-[#86FE05] mx-2" />
            <select 
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer appearance-none pr-6"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y} className="text-black">{y}</option>)}
            </select>
          </div>

          <div className={`flex rounded-xl p-0.5 ${isDark ? 'bg-black/40' : 'bg-slate-100'}`}>
            {["monthly", "weekly"].map((type) => (
              <button 
                key={type}
                onClick={() => setFilters({...filters, viewType: type})}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                    filters.viewType === type ? "bg-[#86FE05] text-black shadow-lg" : "text-slate-500"
                }`}
              >
                {isRTL ? (type === "monthly" ? "شهري" : "أسبوعي") : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        {stats.map((stat, index) => (
          <div key={index} className={`relative p-5 md:p-6 rounded-[2.5rem] border-t-2 transition-all duration-500 hover:-translate-y-2 ${stat.style}`}>
             <div className="flex flex-col h-full justify-between gap-6 md:gap-8">
                <div className={`p-2.5 w-fit rounded-xl ${index === 0 ? 'bg-black/10' : 'bg-slate-500/10'}`}>{stat.icon}</div>
                <div>
                   <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${index === 0 ? 'text-black/50' : 'opacity-40'}`}>{stat.title}</p>
                   <h3 className="text-xl md:text-3xl font-black tracking-tighter leading-none">{stat.value}</h3>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
        {/* Logistics */}
        <div className={`xl:col-span-1 p-6 md:p-8 rounded-[3rem] border ${isDark ? 'bg-[#080808] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-30 italic">{isRTL ? "إحصائيات الحالات" : "Logistics"}</h4>
           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {Object.entries(dashboardStats.statusSummary || {}).map(([key, count]) => {
                const config = ORDER_STATUS_CONFIG[key] || { ar: key, en: key, color: "#444", icon: "•" };
                return (
                  <div key={key} className={`flex justify-between items-center p-4 rounded-[1.8rem] border border-transparent hover:bg-white/5 transition-all ${isDark ? '' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-xl opacity-60">{config.icon}</span>
                      <p className="text-[10px] font-black uppercase">{isRTL ? config.ar : config.en}</p>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-[#86FE05]">{count}</span>
                  </div>
                );
             })}
           </div>
        </div>

        {/* Growth Chart */}
        <div className={`xl:col-span-2 p-6 md:p-8 rounded-[3rem] border ${isDark ? 'bg-[#080808] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
           <div className="flex justify-between items-center mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">{isRTL ? "مخطط النمو المالي" : "Financial Growth"}</h4>
              <div className="text-[9px] font-black bg-[#86FE05]/10 px-3 py-1 rounded-full text-[#86FE05]">
                {isRTL ? "صافي الربح الفعلي" : "Real Net Profit"}
              </div>
           </div>
           <Suspense fallback={<div className="h-72 animate-pulse bg-slate-500/10 rounded-3xl" />}>
              <div dir="ltr" className="h-[300px] md:h-[380px] w-full"> 
                 <RevenueChart data={dashboardStats.chartData} viewType={filters.viewType} />
              </div>
           </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;