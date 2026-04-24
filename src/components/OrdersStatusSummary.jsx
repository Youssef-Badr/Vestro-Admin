import React from "react";
import { useLanguage } from "../../src/context/LanguageContext";
import { useTheme } from "../../src/context/ThemeContext";
import { CheckCircle2, CreditCard, Clock, XCircle, TrendingUp } from "lucide-react";

const OrdersStatusSummary = ({ data }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRTL = language === "ar";
  
  const summary = data || { completed: 0, pending: 0, paid: 0, canceled: 0 };

  const statusItems = [
  {
    id: "completed",
    label: isRTL ? "مكتملة" : "Completed",
    value: summary.completed,
    icon: <CheckCircle2 size={22} />,
    color: "#86FE05",
    bg: "rgba(134,254,5,0.08)",
  },
  {
    id: "paid",
    label: isRTL ? "مدفوعة" : "Paid",
    value: summary.paid,
    icon: <CreditCard size={22} />,
    color: "#86FE05",
    bg: "rgba(134,254,5,0.08)",
  },
  {
    id: "pending",
    label: isRTL ? "قيد المعالجة" : "Processing",
    value: summary.pending,
    icon: <Clock size={22} />,
    color: "#FFA500",
    bg: "rgba(255,165,0,0.08)",
  },
  {
    id: "canceled",
    label: isRTL ? "ملغاة" : "Canceled",
    value: summary.canceled,
    icon: <XCircle size={22} />,
    color: "#FF3B3B",
    bg: "rgba(255,59,59,0.08)",
  },
];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full">
      {/* Grid نظامي: 1 عمود في الموبايل الصغير، 2 في التابلت، و 4 في الشاشات الكبيرة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statusItems.map((item) => (
          <div
            key={item.id}
            className={`group relative overflow-hidden p-6 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 border ${
              isDark 
                ? "bg-[#0c0c0c] border-white/5 shadow-2xl" 
                : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"
            } ${item.shadow}`}
          >
            {/* الديكور الجانبي (المؤشر) */}
            <div 
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-[4px] opacity-40 group-hover:opacity-100 transition-all duration-500`}
              style={{ backgroundColor: item.color }}
            ></div>

            <div className="flex items-center gap-5">
              {/* Icon Container */}
              <div 
                className="p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 shadow-inner"
                style={{ 
                  backgroundColor: `${item.color}15`, 
                  color: item.color,
                  boxShadow: `inset 0 0 15px ${item.color}10` 
                }}
              >
                {item.icon}
              </div>

              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-40 italic">
                  {item.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.value}
                  </h3>
                  <span className="text-[8px] font-bold opacity-20 uppercase tracking-widest">
                    {isRTL ? "طلب" : "Units"}
                  </span>
                </div>
              </div>

              {/* سهم مؤشر صغير للشياكة */}
              <div className="opacity-0 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={16} style={{ color: item.color }} />
              </div>
            </div>

            {/* تأثير الإضاءة الخلفية (Glow) */}
            <div 
              className="absolute -bottom-10 -right-10 w-24 h-24 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: item.color }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersStatusSummary;