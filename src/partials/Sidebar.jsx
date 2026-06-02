import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  LayoutDashboard,
  ChevronRight,
  Megaphone,
  PlusCircle ,
  Globe,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const Sidebar = () => {
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const isDark = theme === "dark";
  const isRTL = language === "ar";

  const [sidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
  if (window.innerWidth >= 1024) {
    setSidebarOpen(true);
  }
}, []);

useEffect(() => {
  const onResize = () => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
      document.body.style.overflow = "auto";
    }
  };

  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);

useEffect(() => {
  if (window.innerWidth < 1024) {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [sidebarOpen]);

  const navLinks = useMemo(
    () => [
      {
        to: "/",
        label: isRTL ? "الرئيسية" : "Dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      { to: "/products", label: isRTL ? "المنتجات" : "Products", icon: "🧥" },
      { to: "/inventory", label: isRTL ? "المخزن" : "stock management", icon: "📦" },
      { to: "/orders", label: isRTL ? "الطلبات" : "Orders", icon: "📦" },
      {
        to: "/abandoned",
        label: isRTL ? "مدفوعات الفيزا" : "Visa Payments",
        icon: "💳",
      },
      { to: "/customers", label: isRTL ? "العملاء" : "Customers", icon: "👤" },
      { to: "/cities", label: isRTL ? "مدن الشحن" : "Cities", icon: "🏙️" },
      {
        to: "/discounts",
        label: isRTL ? "الخصومات" : "Discounts",
        icon: "🎟️",
      },
      {
        to: "/categories",
        label: isRTL ? "الأقسام" : "Categories",
        icon: "🏷️",
      },
      { to: "/bundles", label: isRTL ? "العروض" : "Bundles", icon: "📦" },
      {
        to: "/announcements",
        label: isRTL ? "الإعلانات" : "Ads",
        icon: "📢",
      },
//       {
  //   to: "/campaigns",
  //   label: isRTL ? "الحملات" : "Campaigns",
//   icon: <Megaphone size={18} />,
// },
// {
  //   to: "/campaigns/create",
  //   label: isRTL ? "إنشاء حملة" : "Create Campaign",
  //   icon: <PlusCircle size={18} />,
  // },
  
  {
    to: "/home-settings",
    label: isRTL ? "الرئيسية" : "Home Settings",
    icon: "⚙️",
  },
  {
    to: "/user-management",
    label: isRTL ? "المستخدمين" : "Users",
    icon: "👥",
  },
  { to: "/audit-logs", label: isRTL ? "السجل" : "Logs", icon: "📜" },
  { to: "/meta-catalog-sync", label: isRTL ? "مزامنة كتالوج Meta" : "Meta Catalog Sync", icon: "�" },



  { to: "/whatsapp-settings", label: isRTL ? "إعدادات واتساب" : "WhatsApp Settings", icon: "⚙️" },
  { to: "/message-logs", label: isRTL ? "سجلات الرسائل التسويقية" : "Message Logs", icon: "📜" },
  { to: "/ShippingDelaysPage", label: isRTL ? "تأخيرات الشحن" : "Shipping Delays", icon: "⏱️" },

  { to: "/logout", label: isRTL ? "خروج" : "Logout", icon: "🚪" },
    ],
    [isRTL]
  );
  
  const sidebarBg = isDark
  ? "bg-black border-white/10 text-white"
  : "bg-white border-slate-200 text-black";
  
  const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-slate-100";
  
  const activeStyle = "bg-red-700 text-white shadow-lg";

  return (
    <>
      {/* MOBILE TOPBAR */}
      <header
        className={`lg:hidden fixed top-0 inset-x-0 z-50 h-16 border-b backdrop-blur-xl px-3 flex items-center justify-between ${sidebarBg} bg-opacity-95`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-7 rounded-full bg-red-700" />
          <h1 className="text-xl font-black   tracking-tight uppercase">
            Vestro
          </h1>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center active:scale-95 transition"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* SIDEBAR */}
     <aside
  className={`fixed top-0 h-full overflow-hidden z-50 w-[280px] sm:w-[300px] lg:w-[290px]
  transition-all duration-300 ease-out border
  ${sidebarBg}
  ${
    sidebarOpen
      ? "translate-x-0"
      : isRTL
      ? "translate-x-full"
      : "-translate-x-full"
  }
  ${isRTL ? "right-0 border-l" : "left-0 border-r"}
  lg:translate-x-0`}
>
        {/* HEADER */}
        <div className="h-16 lg:h-auto px-4 lg:px-6 pt-3 lg:pt-7 pb-3 border-b border-inherit flex items-center justify-between">
       <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 rounded-full bg-red-700" />
              <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Vestro
              </h2>
            </div>

            {/* السطر الثاني: يجمع Core Admin والزرار جنباً إلى جنب */}
            <div className="flex items-center gap-2.5 mt-1">
              <p className="text-[9px] uppercase font-bold tracking-[0.25em] opacity-40 select-none text-zinc-900 dark:text-zinc-100">
                Core Admin
              </p>

              {/* زرار الأيقونة الفخم ملاصق وجنب الكلمة مباشرة */}
              <a
                href="https://vestro.net"
                target="_blank"
                rel="noopener noreferrer"
                title={isRTL ? "زيارة الموقع الإلكتروني" : "Visit Website"}
                className="group flex items-center justify-center w-5 h-5 rounded-md bg-red-500/10 hover:bg-red-700 border border-red-500/20 hover:border-red-600 text-red-700 dark:text-red-400 hover:text-white transition-all duration-200 active:scale-90 shrink-0 relative overflow-hidden"
              >
                <div className="relative flex items-center justify-center w-full h-full">
                  {/* أيقونة الكرة الأرضية بحجم متناسق */}
                  <Globe size={20} strokeWidth={2} className="transition-transform duration-200 group-hover:scale-75 group-hover:opacity-0" />
                  
                  {/* السهم يظهر مكانها عند الـ Hover */}
                  <span className="absolute text-[9px] font-bold opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 text-white">
                    ↗
                  </span>
                </div>
              </a>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl bg-red-700 text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAV */}
       <nav className="h-full overflow-y-auto px-3 py-3 space-y-1.5 pb-32 pt-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() =>
                  window.innerWidth < 1024 && setSidebarOpen(false)
                }
                className={`group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-black transition-all duration-200
                ${
                  isActive
                    ? activeStyle
                    : `opacity-80 ${hoverBg} hover:opacity-100`
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base shrink-0">{link.icon}</span>

                  <span className="truncate">{link.label}</span>
                </div>

                {isActive && (
                  <ChevronRight
                    size={15}
                    className={`${isRTL ? "rotate-180" : ""}`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-inherit bg-inherit">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleTheme}
              className={`h-12 rounded-2xl border font-black text-[10px] uppercase flex items-center justify-center gap-2 transition
              ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-black"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? "Light" : "Dark"}
            </button>

            <button
              onClick={toggleLanguage}
              className="h-12 rounded-2xl bg-red-700 text-white font-black text-[10px] uppercase flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Languages size={15} />
              {isRTL ? "EN" : "AR"}
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 lg:hidden bg-black/70 backdrop-blur-sm"
        />
      )}
    </>
  );
};

export default Sidebar;