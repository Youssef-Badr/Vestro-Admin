import Sidebar from "../../partials/Sidebar";
import { useLanguage } from "../../context/LanguageContext";

const AdminLayout = ({ children }) => {
  const { language } = useLanguage();

  const isRTL = language === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-white dark:bg-black"
    >
      <Sidebar />

      <main
        className={`min-h-screen transition-all duration-300
        pt-16 lg:pt-0
        ${
          isRTL
            ? "lg:mr-[290px]"
            : "lg:ml-[290px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;