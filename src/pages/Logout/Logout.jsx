import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useLanguage } from "../../context/LanguageContext";
import { FiLogOut } from "react-icons/fi";

const Logout = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { language } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  // تسجيل خروج تلقائي بعد 15 دقيقة (900000 مللي ثانية)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLogout();
    }, 15 * 60 * 1000); // 15 دقيقة

    // تنظيف الـ timer لو المستخدم خرج من الصفحة قبل الوقت
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={handleLogout}
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`md:mt-0 flex items-center justify-center gap-2 mt-16 md:pt-0
        bg-red-600 hover:bg-red-700 
        text-white font-semibold
        px-5 py-2 rounded-lg shadow-md
        transition duration-300
        focus:outline-none focus:ring-2 focus:ring-red-400
        `}
      style={{ minWidth: "120px" }}
      title={language === "ar" ? "تسجيل الخروج" : "Logout"}
    >
      <FiLogOut size={20} />
      {language === "ar" ? "تسجيل الخروج" : "Logout"}
    </button>
  );
};

export default Logout;
