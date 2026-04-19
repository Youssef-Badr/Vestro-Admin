// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Menu } from "lucide-react";
// import { useTheme } from "../context/ThemeContext";
// import { useLanguage } from "../context/LanguageContext";

// const Sidebar = () => {
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const openButtonRef = useRef(null);
//   const { theme, toggleTheme } = useTheme();
//   const { language, toggleLanguage } = useLanguage();

//   // افتح sidebar تلقائياً عند تغيير اللغة
//   useEffect(() => {
//     if (window.innerWidth >= 1024) {
//       setSidebarOpen(true);
//     }
//   }, [language]);

//  const navLinks = [
//     {
//       to: "/",
//       label: language === "ar" ? "لوحة التحكم" : "Dashboard",
//       icon: "🏠",
//     },
//     {
//       to: "/products",
//       label: language === "ar" ? "المنتجات" : "Products",
//       icon: "🧥",
//     },
//     {
//       to: "/orders",
//       label: language === "ar" ? "الطلبات" : "Orders",
//       icon: "📦",
//     },
//     {
//       to: "/abandoned", 
//       label: language === "ar" ? "سلات متروكة" : "Abandoned Carts",
//       icon: "⚠️",
//     },
//     {
//       to: "/Customers",
//       label: language === "ar" ? "العملاء" : "Customers",
//       icon: "👤",
//     },
//     {
//       to: "/payments",
//       label: language === "ar" ? "الدفع" : "Payments",
//       icon: "💳",
//     },
//     {
//       to: "/cities",
//       label: language === "ar" ? "مدن الشحن" : "Shipping Cities",
//       icon: "🏙️",
//     },
//     {
//       to: "/discounts",
//       label: language === "ar" ? "رموز الخصم" : "Discount Codes",
//       icon: "🎟️",
//     },
//     {
//       to: "/announcements",
//       label: language === "ar" ? "الإعلانات" : "Announcements",
//       icon: "📢",
//     },

// {
//       to: "/user-management",
//       label: language === "ar" ? "إدارة المستخدمين" : "User Management",
//       icon: "👥",
//     },


//     // ✅ إضافة سجل العمليات هنا
//     {
//       to: "/audit-logs",
//       label: language === "ar" ? "سجل العمليات" : "Audit Logs",
//       icon: "📜",
//     },

     
//     {
//       to: "/logout",
//       label: language === "ar" ? "تسجيل الخروج" : "Logout",
//       icon: "🚪",
//     },
//   ];

//   // دالة لإغلاق الـ sidebar مع إعادة التركيز على زر الفتح
//   const closeSidebar = () => {
//     setSidebarOpen(false);
//     openButtonRef.current?.focus();
//   };

//   return (
//     <>
//       {/* شريط علوي للهواتف فقط */}
//       <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50 flex items-center justify-between p-4 text-gray-900 dark:text-gray-100">
//         <div className="text-xl font-bold">
//           {language === "ar" ? "لوحة التحكم" : "Admin Dashboard"}
//         </div>
//         <button
//           ref={openButtonRef}
//           onClick={() => setSidebarOpen((prev) => !prev)}
//           aria-label={
//             sidebarOpen
//               ? language === "ar"
//                 ? "إغلاق القائمة الجانبية"
//                 : "Close sidebar"
//               : language === "ar"
//               ? "فتح القائمة الجانبية"
//               : "Open sidebar"
//           }
//           aria-expanded={sidebarOpen}
//           aria-controls="sidebar"
//           className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
//         >
//           <Menu />
//         </button>
//       </div>

//       {/* الشريط الجانبي */}
//       <aside
//         id="sidebar"
//         key={language} // يعيد التركيب عند تغير اللغة
//         className={`fixed top-0 h-full w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-r shadow-md transform transition-transform z-50
//           ${
//             sidebarOpen
//               ? "translate-x-0"
//               : language === "ar"
//               ? "translate-x-full"
//               : "-translate-x-full"
//           }
//           ${language === "ar" ? "right-0 border-l" : "left-0 border-r"}
//           md:static md:translate-x-0
//         `}
//         aria-hidden={!sidebarOpen && window.innerWidth < 768}
//         tabIndex={-1}
//       >
//         <div className="text-2xl font-bold p-6 border-b hidden md:block">
//           {language === "ar" ? "لوحة التحكم" : "Admin Dashboard"}
//         </div>
//         <nav
//           className="px-4 py-6"
//           aria-label={
//             language === "ar"
//               ? "روابط التنقل الجانبي"
//               : "Sidebar navigation links"
//           }
//         >
//           <ul className="space-y-2">
//             {navLinks.map((link) => (
//               <li key={link.to}>
//                 <Link
//                   to={link.to}
//                   onClick={() => {
//                     if (window.innerWidth < 1024) closeSidebar();
//                   }}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
//                     location.pathname === link.to
//                       ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
//                       : "hover:bg-gray-100 dark:hover:bg-gray-700"
//                   }`}
//                 >
//                   <span aria-hidden="true">{link.icon}</span>
//                   <span>{link.label}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* أزرار تغيير الثيم واللغة */}
//         <div className="px-4 py-6 border-t flex flex-col gap-3">
//           <button
//             onClick={toggleTheme}
//             className="w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//           >
//             {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//           </button>
//           <button
//             onClick={toggleLanguage}
//             className="w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//           >
//             {language === "en" ? "🇪🇬 عربي" : "🇬🇧 English"}
//           </button>
//         </div>
//       </aside>

//       {/* خلفية شفافة عند فتح القائمة على الموبايل */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
//           onClick={closeSidebar}
//           aria-hidden="true"
//         ></div>
//       )}
//     </>
//   );
// };

// export default Sidebar;

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Languages, LayoutDashboard, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const Sidebar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openButtonRef = useRef(null);
  
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  
  const isDark = theme === "dark";
  const isRTL = language === "ar";

  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, [language]);

  const navLinks = [
    { to: "/", label: isRTL ? "الرئيسية" : "Dashboard", icon: <LayoutDashboard size={22} /> },
    { to: "/products", label: isRTL ? "المنتجات" : "Products", icon: "🧥" },
    { to: "/orders", label: isRTL ? "الطلبات" : "Orders", icon: "📦" },
{ to: "/abandoned", label: isRTL ? "حالات دفع الفيزا" : "Abandoned Carts", icon: "💳" },
    { to: "/Customers", label: isRTL ? "العملاء" : "Customers", icon: "👤" },
    // { to: "/payments", label: isRTL ? "الدفع" : "Payments", icon: "💳" },
    { to: "/cities", label: isRTL ? "مدن الشحن" : "Shipping Cities", icon: "🏙️" },
    { to: "/discounts", label: isRTL ? "رموز الخصم" : "Discount Codes", icon: "🎟️" },
    { to: "/categories", label: isRTL ? "إدارة الاقسام" : "Categories Management", icon: "🏷️" },
    { to: "/Bundles", label: isRTL ? "إدارة العروض" : "Manage Bundles", icon: "📦" },
    { to: "/announcements", label: isRTL ? "الإعلانات" : "Announcements", icon: "📢" },
    { to: "/home-settings", label: isRTL ? "إعدادات الصفحة الرئيسية" : "Home Settings", icon: "⚙️" },
    { to: "/user-management", label: isRTL ? "المستخدمين" : "Users", icon: "👥" },
    { to: "/audit-logs", label: isRTL ? "سجل العمليات" : "Logs", icon: "📜" },
    { to: "/logout", label: isRTL ? "خروج" : "Logout", icon: "🚪" },
  ];

  const sidebarBg = isDark ? "bg-black border-white/10" : "bg-white border-slate-200";
  const textColor = isDark ? "text-white" : "text-slate-900";
  const activeStyle = isDark 
    ? "bg-[#86FE05] text-black shadow-[0_0_40px_rgba(134,254,5,0.3)] scale-[1.02]" 
    : "bg-slate-900 text-white shadow-xl scale-[1.02]";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={`md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between p-5 border-b backdrop-blur-md ${sidebarBg} ${textColor} bg-opacity-80`}>
        <div className="text-2xl font-black italic tracking-tighter uppercase text-[#86FE05]">VESTRO</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 rounded-2xl bg-[#86FE05]/10 text-[#86FE05]">
          {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <aside className={`fixed top-0 h-full w-80 transition-all duration-500 z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]
          ${sidebarBg} ${textColor}
          ${sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}
          ${isRTL ? "right-0 border-l" : "left-0 border-r"} md:static md:translate-x-0`}>
        
        {/* Logo Section */}
        <div className="p-10 mb-6">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-10 bg-[#86FE05] rounded-full shadow-[0_0_20px_#86FE05]"></div>
             <h2 className="text-4xl font-black uppercase italic tracking-[calc(-0.05em)] leading-none">Vestro</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-20 mt-3 px-6 italic">Core Admin</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-6 overflow-y-auto custom-scrollbar space-y-2 pt-20 md:pt-0">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={`group relative flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-500
                  ${isActive ? activeStyle : `opacity-40 hover:opacity-100 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                `}
              >
                <div className="flex items-center gap-5">
                  <span className={`text-xl transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    {link.icon}
                  </span>
                  <span className={`text-sm md:text-base font-black uppercase tracking-tighter ${isRTL ? 'font-bold' : ''}`}>
                    {link.label}
                  </span>
                </div>
                {isActive && <ChevronRight size={16} className={`${isRTL ? 'rotate-180' : ''} opacity-50`} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-8 border-t space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex gap-3">
             <button onClick={toggleTheme} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
                {isDark ? <Sun size={20} className="text-[#86FE05] mb-2" /> : <Moon size={20} className="mb-2" />}
                <span className="text-[9px] font-black uppercase tracking-widest">{isDark ? "Light" : "Dark"}</span>
             </button>

             <button onClick={toggleLanguage} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
                <Languages size={20} className={`mb-2 ${isDark ? 'text-[#86FE05]' : 'text-slate-600'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{isRTL ? "EN" : "AR"}</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-all duration-700" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Sidebar;