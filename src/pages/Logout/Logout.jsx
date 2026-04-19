import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useLanguage } from "../../context/LanguageContext";
import { FiLogOut } from "react-icons/fi";

const Logout = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(() => {
    setLoading(true);

    // حذف التوكن
    localStorage.removeItem("token");

    // تحديث الحالة
    setIsAuthenticated(false);

    // توجيه
    navigate("/login");
  }, [navigate, setIsAuthenticated]);

  // Auto logout بعد 15 دقيقة
  useEffect(() => {
    const timer = setTimeout(handleLogout, 15 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [handleLogout]);

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`
        flex items-center justify-center gap-2
        w-full sm:w-auto
        mt-60 md:mt-0
        px-4 sm:px-5 py-2.5
        rounded-lg font-semibold shadow-md
        transition-all duration-300
        
        ${loading 
          ? "bg-red-400 cursor-not-allowed" 
          : "bg-red-600 hover:bg-red-700 active:scale-95"}
        
        text-white
        focus:outline-none focus:ring-2 focus:ring-red-400
      `}
      title={language === "ar" ? "تسجيل الخروج" : "Logout"}
      aria-label="logout-button"
    >
      <FiLogOut size={18} className={loading ? "animate-pulse" : ""} />

      <span className="text-sm sm:text-base">
        {loading
          ? (language === "ar" ? "جاري الخروج..." : "Logging out...")
          : (language === "ar" ? "تسجيل الخروج" : "Logout")}
      </span>
    </button>
  );
};

export default Logout;