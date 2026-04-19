import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext"; // ✅ استدعاء الكونتكست

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage(); // ✅ اللغة

  // النصوص حسب اللغة
  const t = {
    en: {
      title: "📢 Manage Announcements",
      placeholder: "Enter announcement text",
      add: "Add",
      deactivate: "Deactivate",
      activate: "Activate",
      delete: "Delete",
      empty: "No announcements yet.",
      confirm: "Are you sure you want to delete this announcement?",
    },
    ar: {
      title: "📢 إدارة الإعلانات",
      placeholder: "أدخل نص الإعلان",
      add: "إضافة",
      deactivate: "إلغاء التفعيل",
      activate: "تفعيل",
      delete: "حذف",
      empty: "لا توجد إعلانات بعد.",
      confirm: "هل أنت متأكد أنك تريد حذف هذا الإعلان؟",
    },
  };

  const lang = t[language] || t.en;

  // جلب كل الإعلانات (Admin Dashboard)
  const getAnnouncements = async () => {
    try {
      const { data } = await axios.get("/announcement/all");
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch announcements");
    }
  };

  useEffect(() => {
    getAnnouncements();
  }, []);

  // إضافة إعلان جديد (غير مفعل افتراضيًا)
  const handleAdd = async () => {
    if (!text.trim()) return toast.error(lang.placeholder);
    setLoading(true);
    try {
      const { data } = await axios.post("/announcement", { text, active: false });
      setAnnouncements((prev) => [data, ...prev]);
      setText("");
      toast.success("✅ " + lang.add);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add announcement");
    }
    setLoading(false);
  };

  // تفعيل/تعطيل إعلان
  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(`/announcement/${id}`);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? data : a))
      );
      toast.success(
        `Announcement ${data.active ? lang.activate : lang.deactivate}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update announcement");
    }
  };

  // حذف إعلان
  const handleDelete = async (id) => {
    if (!window.confirm(lang.confirm)) return;
    try {
      await axios.delete(`/announcement/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast.success(lang.delete + " ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-14">
      {/* العنوان */}
      <h1 className="text-3xl font-bold mb-6 mt-6 text-gray-900 dark:text-gray-100">
        {lang.title}
      </h1>

      {/* إضافة إعلان */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={lang.placeholder}
          className="flex-1 px-3 py-2 border rounded-md 
                     border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 
                     focus:ring-blue-500 dark:focus:ring-blue-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md 
                     hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                     transition-colors duration-200"
          disabled={loading}
        >
          {lang.add}
        </button>
      </div>

      {/* قائمة الإعلانات */}
      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a._id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-lg transition
              ${a.active 
                ? "bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600" 
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"}`}
          >
            <span className={`text-gray-900 dark:text-gray-100 ${!a.active ? "opacity-70" : ""}`}>
              {a.text}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(a._id)}
                className={`px-3 py-1 rounded-md text-white transition-colors duration-200
                  ${a.active 
                    ? "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700" 
                    : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"}`}
              >
                {a.active ? lang.deactivate : lang.activate}
              </button>
              <button
                onClick={() => handleDelete(a._id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 
                           text-white rounded-md transition-colors duration-200"
              >
                {lang.delete}
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {lang.empty}
          </p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
