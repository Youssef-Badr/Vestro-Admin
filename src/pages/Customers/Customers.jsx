import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";
import { 
  UserCheck, Trash2, Search, Phone, 
  ChevronLeft, ChevronRight, Fingerprint, Calendar
} from "lucide-react";

const CustomersTable = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/customers", {
        params: { page, search },
      });
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error(isRTL ? "❌ فشل المزامنة" : "❌ Sync Failed");
    } finally {
      setLoading(false);
    }
  }, [page, search, isRTL]);

  useEffect(() => { fetchCustomers(); }, [page, fetchCustomers]);

  const handleDelete = async (cust) => {
    const id = cust.isGuest ? cust.phone : cust.clientId;
    if (window.confirm(isRTL ? `حذف ${cust.name}؟` : `Delete ${cust.name}?`)) {
      try {
        await axios.delete(`/customers/${id}?isGuest=${cust.isGuest}`);
        toast.success(isRTL ? "✅ تم الحذف" : "✅ Deleted");
        fetchCustomers();
      } catch (err) {
        toast.error(isRTL ? "❌ فشل الحذف" : "❌ Error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] text-gray-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-center mb-10 gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="w-full">
            <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-3 uppercase">
              <span className="bg-[#86FE05] text-black px-3 py-1 rounded-xl not-italic tracking-normal">CRM</span>
              {isRTL ? "قاعدة البيانات" : "Database"}
            </h1>
            <p className="text-xs opacity-40 mt-2 font-mono tracking-[0.2em] uppercase">
              {isRTL ? "حصرياً لطلبات الـ Delivered" : "Exclusively Delivered Orders Only"}
            </p>
          </div>

          <div className="relative group w-full md:w-auto">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 opacity-20`} size={18} />
            <input
              type="text"
              placeholder={isRTL ? "بحث عن عميل..." : "Search Identity..."}
              className={`w-full md:w-80 py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} bg-gray-100 dark:bg-white/5 border border-transparent focus:border-[#86FE05] rounded-2xl outline-none transition-all`}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-hidden rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
          <table className={`w-full text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
            <thead className="bg-gray-50 dark:bg-white/[0.03] text-[14px] uppercase tracking-widest opacity-50">
              <tr>
                <th className="p-6 text-center">#</th>
                <th className="p-6">{isRTL ? "العميل" : "Profile"}</th>
                <th className="p-6 text-center">{isRTL ? "الحالة" : "Class"}</th>
                <th className="p-6 text-center">{isRTL ? "الإنفاق" : "Spent"}</th>
                <th className="p-6 text-center">{isRTL ? "آخر طلب" : "Last Order"}</th>
                <th className="p-6 text-center">{isRTL ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              {customers.map((cust, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all group">
                  <td className="p-6 text-center font-mono opacity-20">{(page-1)*10+idx+1}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#86FE05]">
                        {cust.isGuest ? <Fingerprint size={20} className="text-gray-400" /> : <UserCheck size={20} />}
                      </div>
                      <div>
                        <div className="font-bold text-base leading-none mb-1">{cust.name}</div>
                        <div className="text-[10px] opacity-40 flex items-center gap-1 font-mono uppercase italic">
                          <Phone size={10} /> {cust.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`text-[12px] font-black px-3 py-1 rounded-full ${cust.isGuest ? 'bg-gray-100 dark:bg-white/10 text-gray-400' : 'bg-[#86FE05]/20 text-[#69c605]'}`}>
                      {cust.isGuest ? 'GUEST' : 'MEMBER'}
                    </span>
                  </td>
                  <td className="p-6 text-center font-bold font-mono">
                    {cust.totalSpent.toLocaleString()} <span className="text-[10px] opacity-30">EGP</span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold opacity-80">
                        {new Date(cust.lastOrderDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                      </span>
                      <span className="text-[9px] opacity-30 uppercase tracking-tighter italic">
                        {cust.totalOrders} {isRTL ? 'طلبات' : 'Orders'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => handleDelete(cust)} className="p-3 text-red-500/40 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {customers.map((cust, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem]">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center">
                      {cust.isGuest ? <Fingerprint className="text-gray-400" /> : <UserCheck className="text-[#86FE05]" />}
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-bold text-lg leading-tight">{cust.name}</h3>
                      <p className="text-xs opacity-40 font-mono tracking-tighter">{cust.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(cust)} className="p-2 text-red-500/30"><Trash2 size={20}/></button>
               </div>
               
               <div className="grid grid-cols-3 gap-2 border-t border-gray-200 dark:border-white/5 pt-5">
                  <div className="text-center border-r border-gray-200 dark:border-white/5">
                    <p className="text-[12px] uppercase opacity-40 mb-1">{isRTL ? "إجمالي" : "Spent"}</p>
                    <p className="font-bold text-[#86FE05] text-xs">{cust.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="text-center border-r border-gray-200 dark:border-white/5">
                    <p className="text-[12px] uppercase opacity-40 mb-1">{isRTL ? "اخر طلب" : "Last Order"}</p>
                    <p className="font-bold text-[10px]">{new Date(cust.lastOrderDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] uppercase opacity-40 mb-1">{isRTL ? "الطلبات" : "Orders"}</p>
                    <p className="font-bold text-xs">{cust.totalOrders}</p>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className={`mt-10 flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
           <p className="text-[14px] opacity-30 font-mono tracking-[0.3em] uppercase">SYNC_STATUS: SECURE_LINK_ACTIVE</p>
           <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl disabled:opacity-10 hover:text-[#86FE05] transition-all"><ChevronLeft size={20}/></button>
              <div className="px-8 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl font-mono text-xs font-bold tracking-widest">{page} / {totalPages}</div>
              <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl disabled:opacity-10 hover:text-[#86FE05] transition-all"><ChevronRight size={20}/></button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CustomersTable;