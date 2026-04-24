// import React, { memo } from "react";
// import { useLanguage } from "../../src/context/LanguageContext";
// import { useTheme } from "../../src/context/ThemeContext";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const monthsMap = {
//   ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
//   en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
// };

// // استلمنا viewType من الـ props عشان نعرف إحنا بنرسم إيه
// const RevenueChart = ({ data, viewType }) => {
//   const { language } = useLanguage();
//   const { darkMode } = useTheme();

//   // --- تكتيك تحضير البيانات الذكي ---
//   const formatChartData = () => {
//     if (!data || data.length === 0) return [];

//     if (viewType === "weekly") {
//       // لو العرض أسبوعي: بنعرض الأسابيع كما جاءت من السيرفر
//       return data.map((item) => ({
//         label: language === "ar" ? `أسبوع ${item._id}` : `Week ${item._id}`,
//         revenue: item.revenue,
//       }));
//     } else {
//       // لو العرض شهري: بنملأ الـ 12 شهر (الأصفار + بيانات السيرفر)
//       return Array.from({ length: 12 }, (_, i) => {
//         const monthIndex = i + 1;
//         const serverData = data.find((d) => d._id === monthIndex);
//         return {
//           label: language === "ar" ? monthsMap.ar[i] : monthsMap.en[i],
//           revenue: serverData ? serverData.revenue : 0,
//         };
//       });
//     }
//   };

//   const chartData = formatChartData();
//   const vestroGreen = "#86FE05";

//   return (
//     <div
//       dir={language === "ar" ? "rtl" : "ltr"}
//       className="w-full"
//     >
//       <div className="w-full h-[350px] relative z-10">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
//             <defs>
//               <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor={vestroGreen} stopOpacity={0.4} />
//                 <stop offset="50%" stopColor={vestroGreen} stopOpacity={0.1} />
//                 <stop offset="95%" stopColor={vestroGreen} stopOpacity={0} />
//               </linearGradient>
//             </defs>
            
//             <CartesianGrid 
//               strokeDasharray="0" 
//               vertical={false} 
//               stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
//             />
            
//             <XAxis
//               dataKey="label"
//               reversed={language === "ar"}
//               tick={{ fontSize: 10, fill: darkMode ? "#444" : "#999", fontWeight: 800 }}
//               tickLine={false}
//               axisLine={false}
//               dy={15}
//             />
            
//             <YAxis hide={true} domain={[0, 'auto']} />
            
//             <Tooltip
//               cursor={{ stroke: vestroGreen, strokeWidth: 2, strokeDasharray: '5 5' }}
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   return (
//                     <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${darkMode ? 'bg-black/90 border-white/10' : 'bg-white/90 border-gray-100'}`}>
//                       <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
//                         {payload[0].payload.label}
//                       </p>
//                       <p className="text-xl font-black text-[#86FE05]">
//                         {payload[0].value.toLocaleString()} 
//                         <span className="text-[10px] opacity-50 ml-1">EGP</span>
//                       </p>
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
            
//             <Area
//               type="monotone"
//               dataKey="revenue"
//               stroke={vestroGreen}
//               strokeWidth={5}
//               fillOpacity={1}
//               fill="url(#glowGradient)"
//               strokeLinecap="round"
//               animationDuration={1500}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default memo(RevenueChart);

import React, { memo, useMemo, useState } from "react";
import { useLanguage } from "../../src/context/LanguageContext";
import { useTheme } from "../../src/context/ThemeContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RevenueChart = ({ analytics }) => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();

  const [viewType, setViewType] = useState("month");

  // 🎨 VESTRO DARK RED PALETTE
  const vestroRed = "#dc2626"; // main red
  const vestroRedGlow = "#ef4444";
  const vestroBlue = "#3b82f6";

  // ==============================
  // 📊 DATA
  // ==============================
  const chartData = useMemo(() => {
    if (!analytics) return [];

    const current = analytics?.[viewType]?.current || {};
    const previous = analytics?.[viewType]?.previous || {};

    return [
      {
        name: "Previous",
        revenue: previous.revenue || 0,
        orders: previous.orders || 0,
      },
      {
        name: "Current",
        revenue: current.revenue || 0,
        orders: current.orders || 0,
      },
    ];
  }, [analytics, viewType]);

  // ==============================
  // 📈 GROWTH
  // ==============================
  const growth = useMemo(() => {
    const current = analytics?.[viewType]?.current?.revenue || 0;
    const previous = analytics?.[viewType]?.previous?.revenue || 0;

    if (!previous) return 100;
    return ((current - previous) / previous) * 100;
  }, [analytics, viewType]);

  const isPositive = growth >= 0;

  // ==============================
  // 🎯 UI
  // ==============================
  return (
    <div className="w-full">

      {/* 🔘 TOGGLE (Dark Red Style) */}
      <div className="flex gap-2 mb-4 bg-black/30 p-1 rounded-2xl w-fit border border-white/10">
        {["week", "month", "year"].map((type) => (
          <button
            key={type}
            onClick={() => setViewType(type)}
            className={`px-4 py-1 rounded-xl text-xs font-black uppercase transition-all ${
              viewType === type
                ? "bg-red-700 text-white shadow-lg"
                : darkMode
                ? "text-white/60 hover:text-white"
                : "text-black/60 hover:text-black"
            }`}
          >
            {type === "week"
              ? language === "ar" ? "أسبوع" : "Week"
              : type === "month"
              ? language === "ar" ? "شهر" : "Month"
              : language === "ar" ? "سنة" : "Year"}
          </button>
        ))}
      </div>

      {/* 📈 GROWTH BADGE */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`text-sm font-black px-2 py-1 rounded-lg ${
            isPositive
              ? "text-red-400 bg-red-500/10"
              : "text-red-500 bg-red-900/20"
          }`}
        >
          {isPositive ? "▲" : "▼"} {growth.toFixed(1)}%
        </span>

        <span className="text-xs opacity-50">
          {language === "ar"
            ? "مقارنة بالفترة السابقة"
            : "vs previous period"}
        </span>
      </div>

      {/* 📊 CHART */}
      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>

            <defs>
              {/* 🔥 RED GLOW */}
              <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={vestroRedGlow} stopOpacity={0.4} />
                <stop offset="95%" stopColor={vestroRed} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* GRID DARK ONLY */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}
            />

            <XAxis
              dataKey="name"
              tick={{ fill: darkMode ? "#aaa" : "#444", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis hide />

            {/* 🎯 TOOLTIP DARK RED */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div
                    className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-md ${
                      darkMode
                        ? "bg-black/95 border-white/10 text-white"
                        : "bg-white border-black/10"
                    }`}
                  >
                    <p className="text-xs opacity-60 mb-1">
                      {payload[0]?.payload?.name}
                    </p>

                    <p className="text-red-500 font-black text-sm">
                      {payload[0]?.value?.toLocaleString()} EGP
                    </p>

                    <p className="text-xs opacity-60">
                      Orders: {payload[1]?.value}
                    </p>
                  </div>
                );
              }}
            />

            <Legend />

            {/* 🔴 REVENUE (MAIN) */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={vestroRed}
              strokeWidth={3}
              fill="url(#redGlow)"
            />

            {/* 🔵 ORDERS (SECONDARY) */}
            <Area
              type="monotone"
              dataKey="orders"
              stroke={vestroBlue}
              strokeWidth={2}
              fill="transparent"
            />

          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(RevenueChart);