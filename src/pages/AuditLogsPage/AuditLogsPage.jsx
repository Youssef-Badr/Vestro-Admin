import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          System Audit Logs
        </h2>
        {selectedLogs.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition"
          >
            Delete Selected ({selectedLogs.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto border dark:border-gray-700 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs uppercase">
              <th className="p-4 border-b">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    e.target.checked
                      ? setSelectedLogs(logs.map((l) => l._id))
                      : setSelectedLogs([])
                  }
                />
              </th>
              <th className="p-4 border-b">Responsible User</th>
              <th className="p-4 border-b">Action</th>
              <th className="p-4 border-b">Entity</th>
              <th className="p-4 border-b">Details</th>
              <th className="p-4 border-b">IP Address</th>
              <th className="p-4 border-b">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700 text-gray-700 dark:text-gray-300">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-10 italic">
                  Loading...
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log._id)}
                      onChange={() => handleSelect(log._id)}
                    />
                  </td>
                  {/* 🟢 عرض الاسم فوق والإيميل تحت */}
                  <td className="p-4">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {log.userName || "System"}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {log.userEmail || "no-email"}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.action.includes("DELETE")
                          ? "bg-red-100 text-red-700"
                          : log.action.includes("CREATE")
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
  <div className="flex items-center gap-2">
    <span 
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold shadow-sm transition-all ${
        log.entity === "Order Gomla" 
          ? "bg-amber-100 text-amber-800 border border-amber-300" // لون ذهبي مميز للجملة
          : "bg-blue-50 text-blue-700 border border-blue-100" // لون أزرق هادي للعادي
      }`}
    >
      {/* أيقونة الشنطة للجملة وأيقونة الورقة للعادي */}
      <span>{log.entity === "Order Gomla" ? "📦" : "📄"}</span>
      
      {log.entity}
      
      {/* علامة إضافية لو "جملة" عشان التأكيد */}
      {log.entity === "Order Gomla" && (
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
      )}
    </span>
  </div>
</td>
                <td className="p-4">
  <div
    className="text-xs break-words min-w-[300px] max-w-[500px] leading-relaxed text-gray-700 dark:text-gray-300"
    title={log.details}
  >
    {log.details}
  </div>
</td>
                  <td className="p-4 font-mono text-[10px] text-gray-400">
                    {log.ip || "::1"}
                  </td>
                  {/* 🟢 تنسيق الوقت والتاريخ (وقت فوق وتاريخ تحت) */}
                  <td className="p-4 text-[11px] font-medium leading-tight">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                    <div className="text-[9px] text-gray-400 font-normal">
                      {new Date(log.createdAt).toLocaleDateString([], {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-30 text-xs font-bold"
        >
          Prev
        </button>
        <span className="text-xs dark:text-white">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-30 text-xs font-bold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditLogsPage;
