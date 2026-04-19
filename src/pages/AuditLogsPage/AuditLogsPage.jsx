import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const { language } = useLanguage();
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/audit-logs?page=${page}&limit=15`);
      setLogs(data.logs);
      console.log(data.logs);
      setTotalPages(data.pages);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load logs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSelect = (id) => {
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedLogs.length} logs?`)) return;
    try {
      await axios.post("/audit-logs/delete-multiple", { logIds: selectedLogs });
      toast.success("Logs deleted");
      setSelectedLogs([]);
      fetchLogs();
    } catch (err) {
      toast.error("Delete failed");
    }
  };
return (
  <div className={`w-full min-h-screen p-3 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md transition-all ${language === 'ar' ? 'rtl' : 'ltr'}`}>
    
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-14 md:mt-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
        {language === "ar" ? "سجلات مراقبة النظام" : "System Audit Logs"}
      </h2>
      
      {selectedLogs.length > 0 && (
        <button
          onClick={handleDeleteSelected}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition text-sm font-bold active:scale-95 flex items-center justify-center gap-2"
        >
          <span>{language === "ar" ? "حذف المحدد" : "Delete Selected"}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">({selectedLogs.length})</span>
        </button>
      )}
    </div>

    {/* 🟢 Mobile View: Cards Layout */}
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {loading ? (
        <div className="text-center p-10 italic text-gray-500 dark:text-gray-400">
          {language === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      ) : (
        logs.map((log) => (
          <div key={log._id} className="relative bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Checkbox */}
            <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'}`}>
               <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                checked={selectedLogs.includes(log._id)}
                onChange={() => handleSelect(log._id)}
              />
            </div>

            {/* User Info */}
            <div className="mb-3">
              <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {log.userName || (language === "ar" ? "النظام" : "System")}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 px-4">{log.userEmail || "no-email"}</div>
            </div>

            {/* Action & Entity */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                log.action.includes("DELETE") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                log.action.includes("CREATE") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
                {log.action}
              </span>
              
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                log.entity === "Order Gomla" 
                ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" 
                : "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              }`}>
                <span>{log.entity === "Order Gomla" ? "📦" : "📄"}</span>
                {log.entity}
              </span>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 mb-3">
              <span className="font-bold block mb-1 opacity-50 uppercase text-[9px] border-b dark:border-gray-700 pb-1 mb-2">
                {language === "ar" ? "التفاصيل" : "Details"}
              </span>
              {log.details}
            </div>

            {/* Footer: IP & Date */}
            <div className="flex justify-between items-center pt-2 text-[9px] text-gray-400 dark:text-gray-500 font-mono">
              <span>IP: {log.ip || "::1"}</span>
              <div className={`text-right leading-tight ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                <div className="dark:text-gray-300">{new Date(log.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                <div>{new Date(log.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: "2-digit", month: "short", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* 🔵 Desktop View: Table */}
    <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200 text-[11px] uppercase tracking-wider">
            <th className="p-4 border-b dark:border-gray-700">
              <input
                type="checkbox"
                className="rounded dark:bg-gray-700 dark:border-gray-600"
                onChange={(e) =>
                  e.target.checked ? setSelectedLogs(logs.map((l) => l._id)) : setSelectedLogs([])
                }
              />
            </th>
            <th className={`p-4 border-b dark:border-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === "ar" ? "المسؤول" : "Responsible User"}
            </th>
            <th className={`p-4 border-b dark:border-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === "ar" ? "الإجراء" : "Action"}
            </th>
            <th className={`p-4 border-b dark:border-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === "ar" ? "الكيان" : "Entity"}
            </th>
            <th className={`p-4 border-b dark:border-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === "ar" ? "التفاصيل" : "Details"}
            </th>
            <th className={`p-4 border-b dark:border-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === "ar" ? "عنوان IP" : "IP Address"}
            </th>
            <th className={`p-4 border-b dark:border-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === "ar" ? "التوقيت" : "Timestamp"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
          {!loading && logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td className="p-4">
                <input
                  type="checkbox"
                  className="rounded dark:bg-gray-700 dark:border-gray-600"
                  checked={selectedLogs.includes(log._id)}
                  onChange={() => handleSelect(log._id)}
                />
              </td>
              <td className="p-4">
                <div className="font-bold text-gray-900 dark:text-gray-100">{log.userName || (language === "ar" ? "النظام" : "System")}</div>
                <div className="text-[10px] text-gray-400">{log.userEmail || "no-email"}</div>
              </td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  log.action.includes("DELETE") ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : 
                  log.action.includes("CREATE") ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : 
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                }`}>
                  {log.action}
                </span>
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                  log.entity === "Order Gomla" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>
                  {log.entity}
                </span>
              </td>
              <td className="p-4">
                <div className="text-[11px] break-words max-w-[300px] leading-relaxed dark:text-gray-400" title={log.details}>
                  {log.details}
                </div>
              </td>
              <td className="p-4 font-mono text-[10px] text-gray-400 dark:text-gray-500">{log.ip || "::1"}</td>
              <td className="p-4 text-[11px] font-medium leading-tight dark:text-gray-300">
                {new Date(log.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: "2-digit", minute: "2-digit", hour12: true })}
                <div className="text-[9px] text-gray-400 dark:text-gray-500 font-normal">
                  {new Date(log.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 text-xs font-bold transition-all dark:text-white shadow-sm"
        >
          {language === "ar" ? "السابق" : "Prev"}
        </button>
        <span className="text-xs dark:text-white font-medium px-4">
          {language === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 text-xs font-bold transition-all dark:text-white shadow-sm"
        >
          {language === "ar" ? "التالي" : "Next"}
        </button>
      </div>
    </div>
  </div>
);

};

export default AuditLogsPage;
