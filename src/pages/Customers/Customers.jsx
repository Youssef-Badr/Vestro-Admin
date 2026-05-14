// import React, { useEffect, useState, useCallback } from "react";
// import axios from "../../api/axiosInstance";
// import { useLanguage } from "../../context/LanguageContext";
// import { toast } from "react-toastify";
// import { 
//   UserCheck, Trash2, Search, Phone, 
//   ChevronLeft, ChevronRight, Fingerprint, Calendar
// } from "lucide-react";

// const CustomersTable = () => {
//   const { language } = useLanguage();
//   const isRTL = language === "ar";

//   const [customers, setCustomers] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchCustomers = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get("/customers", {
//         params: { page, search },
//       });
//       setCustomers(data.customers);
//       setTotalPages(data.totalPages);
//     } catch (error) {
//       toast.error(isRTL ? "❌ فشل المزامنة" : "❌ Sync Failed");
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, isRTL]);

//   useEffect(() => { fetchCustomers(); }, [page, fetchCustomers]);

//   const handleDelete = async (cust) => {
//     const id = cust.isGuest ? cust.phone : cust.clientId;
//     if (window.confirm(isRTL ? `حذف ${cust.name}؟` : `Delete ${cust.name}?`)) {
//       try {
//         await axios.delete(`/customers/${id}?isGuest=${cust.isGuest}`);
//         toast.success(isRTL ? "✅ تم الحذف" : "✅ Deleted");
//         fetchCustomers();
//       } catch (err) {
//         toast.error(isRTL ? "❌ فشل الحذف" : "❌ Error");
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white dark:bg-[#080808] text-gray-900 dark:text-white p-4  md:p-8 transition-colors duration-300">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header */}
//         <div className={`flex flex-col md:flex-row justify-between items-center mb-10 mt-20  gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
//           <div className="w-full">
//             <h1 className="text-4xl font-black  tracking-tighter italic flex items-center gap-3 uppercase">
//               <span className="bg-[#86FE05] text-black px-3 py-1 rounded-xl not-italic tracking-normal">CRM</span>
//               {isRTL ? "قاعدة البيانات" : "Database"}
//             </h1>
//             <p className="text-xs opacity-40 mt-2 font-mono tracking-[0.2em] uppercase">
//               {isRTL ? "حصرياً لطلبات الـ Delivered" : "Exclusively Delivered Orders Only"}
//             </p>
//           </div>

//           <div className="relative group w-full md:w-auto">
//             <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 opacity-20`} size={18} />
//             <input
//               type="text"
//               placeholder={isRTL ? "بحث عن عميل..." : "Search Identity..."}
//               className={`w-full md:w-80 py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} bg-gray-100 dark:bg-white/5 border border-transparent focus:border-[#86FE05] rounded-2xl outline-none transition-all`}
//               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             />
//           </div>
//         </div>

//         {/* Desktop Table */}
//         <div className="hidden lg:block overflow-hidden rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
//           <table className={`w-full text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
//             <thead className="bg-gray-50 dark:bg-white/[0.03] text-[14px] uppercase tracking-widest opacity-50">
//               <tr>
//                 <th className="p-6 text-center">#</th>
//                 <th className="p-6">{isRTL ? "العميل" : "Profile"}</th>
//                 <th className="p-6 text-center">{isRTL ? "الحالة" : "Class"}</th>
//                 <th className="p-6 text-center">{isRTL ? "الإنفاق" : "Spent"}</th>
//                 <th className="p-6 text-center">{isRTL ? "آخر طلب" : "Last Order"}</th>
//                 <th className="p-6 text-center">{isRTL ? "إجراء" : "Action"}</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
//               {customers.map((cust, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all group">
//                   <td className="p-6 text-center font-mono opacity-20">{(page-1)*10+idx+1}</td>
//                   <td className="p-6">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#86FE05]">
//                         {cust.isGuest ? <Fingerprint size={20} className="text-gray-400" /> : <UserCheck size={20} />}
//                       </div>
//                       <div>
//                         <div className="font-bold text-base leading-none mb-1">{cust.name}</div>
//                         <div className="text-[10px] opacity-40 flex items-center gap-1 font-mono uppercase italic">
//                           <Phone size={10} /> {cust.phone}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="p-6 text-center">
//                     <span className={`text-[12px] font-black px-3 py-1 rounded-full ${cust.isGuest ? 'bg-gray-100 dark:bg-white/10 text-gray-400' : 'bg-[#86FE05]/20 text-[#69c605]'}`}>
//                       {cust.isGuest ? 'GUEST' : 'MEMBER'}
//                     </span>
//                   </td>
//                   <td className="p-6 text-center font-bold font-mono">
//                     {cust.totalSpent.toLocaleString()} <span className="text-[10px] opacity-30">EGP</span>
//                   </td>
//                   <td className="p-6 text-center">
//                     <div className="flex flex-col items-center">
//                       <span className="text-xs font-bold opacity-80">
//                         {new Date(cust.lastOrderDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
//                       </span>
//                       <span className="text-[9px] opacity-30 uppercase tracking-tighter italic">
//                         {cust.totalOrders} {isRTL ? 'طلبات' : 'Orders'}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="p-6 text-center">
//                     <button onClick={() => handleDelete(cust)} className="p-3 text-red-500/40 hover:text-red-500 transition-colors">
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile View */}
//         <div className="lg:hidden space-y-4">
//           {customers.map((cust, idx) => (
//             <div key={idx} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem]">
//                <div className="flex justify-between items-start mb-6">
//                   <div className="flex items-center gap-4">
//                     <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center">
//                       {cust.isGuest ? <Fingerprint className="text-gray-400" /> : <UserCheck className="text-[#86FE05]" />}
//                     </div>
//                     <div className={isRTL ? 'text-right' : 'text-left'}>
//                       <h3 className="font-bold text-lg leading-tight">{cust.name}</h3>
//                       <p className="text-xs opacity-40 font-mono tracking-tighter">{cust.phone}</p>
//                     </div>
//                   </div>
//                   <button onClick={() => handleDelete(cust)} className="p-2 text-red-500/30"><Trash2 size={20}/></button>
//                </div>
               
//                <div className="grid grid-cols-3 gap-2 border-t border-gray-200 dark:border-white/5 pt-5">
//                   <div className="text-center border-r border-gray-200 dark:border-white/5">
//                     <p className="text-[12px] uppercase opacity-40 mb-1">{isRTL ? "إجمالي" : "Spent"}</p>
//                     <p className="font-bold text-[#86FE05] text-xs">{cust.totalSpent.toLocaleString()}</p>
//                   </div>
//                   <div className="text-center border-r border-gray-200 dark:border-white/5">
//                     <p className="text-[12px] uppercase opacity-40 mb-1">{isRTL ? "اخر طلب" : "Last Order"}</p>
//                     <p className="font-bold text-[10px]">{new Date(cust.lastOrderDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-[12px] uppercase opacity-40 mb-1">{isRTL ? "الطلبات" : "Orders"}</p>
//                     <p className="font-bold text-xs">{cust.totalOrders}</p>
//                   </div>
//                </div>
//             </div>
//           ))}
//         </div>

//         {/* Pagination */}
//         <div className={`mt-10 flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
//            <p className="text-[14px] opacity-30 font-mono tracking-[0.3em] uppercase">SYNC_STATUS: SECURE_LINK_ACTIVE</p>
//            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
//               <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl disabled:opacity-10 hover:text-[#86FE05] transition-all"><ChevronLeft size={20}/></button>
//               <div className="px-8 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl font-mono text-xs font-bold tracking-widest">{page} / {totalPages}</div>
//               <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl disabled:opacity-10 hover:text-[#86FE05] transition-all"><ChevronRight size={20}/></button>
//            </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default CustomersTable;
import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";

import {
  UserCheck,
  Trash2,
  Search,
  Phone,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  MessageCircle,
  ShieldCheck,
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

      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 1);

    } catch (error) {

      toast.error(
        isRTL
          ? "فشل تحميل العملاء"
          : "Failed To Load Customers"
      );

    } finally {
      setLoading(false);
    }
  }, [page, search, isRTL]);

  useEffect(() => {
    fetchCustomers();
  }, [page, fetchCustomers]);

  const toggleMarketing = async (cust) => {
  try {

    await axios.put(`/customers/${cust._id}/marketing`, {
      optIn: !cust.optIn,
    });

    fetchCustomers();

  } catch (err) {
    toast.error("Failed");
  }
};
  const handleDelete = async (cust) => {
    try {

      if (
        !window.confirm(
          isRTL
            ? `حذف ${cust.name} ؟`
            : `Delete ${cust.name}?`
        )
      ) {
        return;
      }

      await axios.delete(`/customers/${cust._id}`);

      toast.success(
        isRTL
          ? "تم حذف العميل"
          : "Customer Deleted"
      );

      fetchCustomers();

    } catch (err) {

      toast.error(
        isRTL
          ? "فشل الحذف"
          : "Delete Failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-8 transition-all">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className={`flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 mt-24 ${isRTL ? "text-right" : "text-left"}`}>

          <div className="w-full">

            <h1 className="text-4xl md:text-5xl font-black uppercase flex items-center gap-3 tracking-tight">

              <span className="bg-red-700 text-white px-4 py-1 rounded-2xl">
                CRM
              </span>

              {isRTL
                ? "عملاء واتساب"
                : "WhatsApp Customers"}

            </h1>

            <p className="mt-3 text-xs uppercase tracking-[0.3em] opacity-40 font-mono">
              META ADS + WEBSITE CUSTOMERS
            </p>

          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-80">

            <Search
              size={18}
              className={`absolute top-1/2 -translate-y-1/2 opacity-40 ${
                isRTL ? "right-4" : "left-4"
              }`}
            />

            <input
              type="text"
              placeholder={
                isRTL
                  ? "بحث عن عميل..."
                  : "Search customer..."
              }
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`w-full py-4 rounded-2xl border bg-gray-100 dark:bg-zinc-900 border-black/10 dark:border-white/10 focus:border-red-700 outline-none transition-all ${
                isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
              }`}
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="hidden lg:block overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">

          <table className={`w-full ${isRTL ? "text-right" : "text-left"}`}>

            <thead className="bg-black text-white dark:bg-zinc-900 uppercase text-xs tracking-widest">

              <tr>

                <th className="p-6 text-center">#</th>

                <th className="p-6">
                  {isRTL ? "العميل" : "Customer"}
                </th>
                
 <th className="p-6">
                  {isRTL ? "التحكم في التسويق" : "Marketing Control"}
                </th>
                <th className="p-6 text-center">
                  WhatsApp
                </th>

                <th className="p-6 text-center">
                  {isRTL ? "التسويق" : "Marketing"}
                </th>

                <th className="p-6 text-center">
                  {isRTL ? "المصدر" : "Source"}
                </th>

                <th className="p-6 text-center">
                  {isRTL ? "الطلبات" : "Orders"}
                </th>

                <th className="p-6 text-center">
                  {isRTL ? "الإنفاق" : "Spent"}
                </th>

                <th className="p-6 text-center">
                  {isRTL ? "آخر ظهور" : "Last Seen"}
                </th>

                <th className="p-6 text-center">
                  {isRTL ? "إجراء" : "Action"}
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/5">

              {customers.map((cust, idx) => (

                <tr
                  key={cust._id}
                  className="hover:bg-red-700/5 transition-all"
                >

                  {/* INDEX */}
                  <td className="p-6 text-center opacity-40 font-mono">
                    {(page - 1) * 10 + idx + 1}
                  </td>

                  {/* CUSTOMER */}
                  <td className="p-6">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">

                        {cust.clientId ? (
                          <UserCheck size={20} />
                        ) : (
                          <Fingerprint size={20} />
                        )}

                      </div>

                      <div>

                        <h2 className="font-bold text-base">
                          {cust.name || "Unknown"}
                        </h2>

                        <p className="text-xs opacity-50 flex items-center gap-1 mt-1">
                          <Phone size={12} />
                          {cust.phone}
                        </p>

                        {cust.email && (
                          <p className="text-[11px] opacity-40 mt-1">
                            {cust.email}
                          </p>
                        )}

                      </div>

                    </div>

                  </td>
<td className="p-6 text-center">

  {/* OPT OUT STATE */}
  {cust.optIn ? (
    <button
      onClick={() => toggleMarketing(cust)}
      className="px-3 py-2 rounded-xl bg-red-700 text-white text-xs font-bold"
    >
      OPT-OUT
    </button>
  ) : (
    <div className="flex flex-col items-center gap-1">

      <button
        onClick={() => toggleMarketing(cust)}
        className="px-3 py-2 rounded-xl bg-black text-white border text-xs font-bold"
      >
        OPT-IN
      </button>

      {cust.optOutDate && (
        <p className="text-[10px] opacity-50">
          Opted out:{" "}
          {new Date(cust.optOutDate).toLocaleDateString()}
        </p>
      )}

    </div>
  )}

</td>


                  {/* WHATSAPP */}
                  <td className="p-6 text-center">

                    <div className="flex justify-center">

                      <div
                        className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          cust.optIn
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >

                        <MessageCircle size={13} />

                        {cust.optIn ? "OPT-IN" : "OPT-OUT"}

                      </div>

                    </div>

                  </td>

                  {/* MARKETING */}
                  <td className="p-6 text-center">

                    <div className="flex justify-center">

                      {cust.optIn ? (
                        <ShieldCheck
                          size={18}
                          className="text-green-600"
                        />
                      ) : (
                        <ShieldCheck
                          size={18}
                          className="text-red-600"
                        />
                      )}

                    </div>

                  </td>

                  {/* SOURCE */}
                  <td className="p-6 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        cust.source === "ads"
                          ? "bg-red-700 text-white"
                          : "bg-black text-white dark:bg-white dark:text-black"
                      }`}
                    >
                      {cust.source || "website"}
                    </span>

                  </td>

                  {/* ORDERS */}
                  <td className="p-6 text-center font-bold">
                    {cust.totalOrders || 0}
                  </td>

                  {/* SPENT */}
                  <td className="p-6 text-center font-bold">
                    {cust.totalSpent || 0}
                    <span className="text-xs opacity-40 ml-1">
                      EGP
                    </span>
                  </td>

                  {/* LAST SEEN */}
                  <td className="p-6 text-center">

                    <div className="flex flex-col items-center">

                      <span className="text-xs">
                        {cust.lastSeen
                          ? new Date(cust.lastSeen).toLocaleDateString(
                              isRTL ? "ar-EG" : "en-US"
                            )
                          : "--"}
                      </span>

                      <span className="text-[10px] opacity-40 mt-1 uppercase">
                        {cust.optInSource || "website"}
                      </span>

                    </div>

                  </td>

                  {/* ACTION */}
                  <td className="p-6 text-center">

                    <button
                      onClick={() => handleDelete(cust)}
                      className="p-3 rounded-xl hover:bg-red-700/10 text-red-700 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-4">

          {customers.map((cust) => (

            <div
              key={cust._id}
              className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-zinc-950 p-6"
            >

              <div className="flex justify-between items-start">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">

                    {cust.clientId ? (
                      <UserCheck size={22} />
                    ) : (
                      <Fingerprint size={22} />
                    )}

                  </div>

                  <div>

                    <h2 className="font-bold text-lg">
                      {cust.name || "Unknown"}
                    </h2>

                    <p className="text-xs opacity-50 mt-1">
                      {cust.phone}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => handleDelete(cust)}
                  className="text-red-700"
                >
                  <Trash2 size={20} />
                </button>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-3 mt-6">

                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-black">
                  <p className="text-xs opacity-50 uppercase">
                    Orders
                  </p>

                  <p className="font-black text-2xl mt-1">
                    {cust.totalOrders || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-black">
                  <p className="text-xs opacity-50 uppercase">
                    Spent
                  </p>

                  <p className="font-black text-2xl mt-1 text-red-700">
                    {cust.totalSpent || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-black">
                  <p className="text-xs opacity-50 uppercase">
                    WhatsApp
                  </p>

                  <p
                    className={`font-bold mt-1 ${
                      cust.optIn
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {cust.optIn ? "OPT-IN" : "OPT-OUT"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-black">
                  <p className="text-xs opacity-50 uppercase">
                    Source
                  </p>

                  <p className="font-bold mt-1 uppercase">
                    {cust.source || "website"}
                  </p>
                </div>

              </div>

            </div>

          ))}

        </div>

        {/* PAGINATION */}
        <div className={`mt-10 flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? "md:flex-row-reverse" : ""}`}>

          <p className="text-xs uppercase tracking-[0.3em] opacity-40 font-mono">
            META CRM READY
          </p>

          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="px-8 py-4 rounded-2xl border border-black/10 dark:border-white/10 font-mono text-xs tracking-widest">
              {page} / {totalPages}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl px-8 py-5 shadow-2xl">

              <p className="font-bold tracking-widest uppercase animate-pulse">
                Loading CRM...
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default CustomersTable;