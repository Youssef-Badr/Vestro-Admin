import React, { memo } from "react";
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
} from "recharts";

const monthsMap = {
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// استلمنا viewType من الـ props عشان نعرف إحنا بنرسم إيه
const RevenueChart = ({ data, viewType }) => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();

  // --- تكتيك تحضير البيانات الذكي ---
  const formatChartData = () => {
    if (!data || data.length === 0) return [];

    if (viewType === "weekly") {
      // لو العرض أسبوعي: بنعرض الأسابيع كما جاءت من السيرفر
      return data.map((item) => ({
        label: language === "ar" ? `أسبوع ${item._id}` : `Week ${item._id}`,
        revenue: item.revenue,
      }));
    } else {
      // لو العرض شهري: بنملأ الـ 12 شهر (الأصفار + بيانات السيرفر)
      return Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1;
        const serverData = data.find((d) => d._id === monthIndex);
        return {
          label: language === "ar" ? monthsMap.ar[i] : monthsMap.en[i],
          revenue: serverData ? serverData.revenue : 0,
        };
      });
    }
  };

  const chartData = formatChartData();
  const vestroGreen = "#86FE05";

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="w-full"
    >
      <div className="w-full h-[350px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={vestroGreen} stopOpacity={0.4} />
                <stop offset="50%" stopColor={vestroGreen} stopOpacity={0.1} />
                <stop offset="95%" stopColor={vestroGreen} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="0" 
              vertical={false} 
              stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
            />
            
            <XAxis
              dataKey="label"
              reversed={language === "ar"}
              tick={{ fontSize: 10, fill: darkMode ? "#444" : "#999", fontWeight: 800 }}
              tickLine={false}
              axisLine={false}
              dy={15}
            />
            
            <YAxis hide={true} domain={[0, 'auto']} />
            
            <Tooltip
              cursor={{ stroke: vestroGreen, strokeWidth: 2, strokeDasharray: '5 5' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${darkMode ? 'bg-black/90 border-white/10' : 'bg-white/90 border-gray-100'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                        {payload[0].payload.label}
                      </p>
                      <p className="text-xl font-black text-[#86FE05]">
                        {payload[0].value.toLocaleString()} 
                        <span className="text-[10px] opacity-50 ml-1">EGP</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={vestroGreen}
              strokeWidth={5}
              fillOpacity={1}
              fill="url(#glowGradient)"
              strokeLinecap="round"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(RevenueChart);
