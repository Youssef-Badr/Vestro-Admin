
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
  const [totalCustomers, setTotalCustomers] = useState(0);
const limit = 40;
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);

     const { data } = await axios.get("/customers", {
  params: {
    page,
    limit,
    search,
  },
});
setTotalCustomers(data.pagination?.totalCustomers || 0);
    setCustomers(data.customers || []);
setTotalPages(data.pagination?.totalPages || 1);

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
}, [page, search]);

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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-4 transition-all">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className={`flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 mt-16 ${isRTL ? "text-right" : "text-left"}`}>

          <div className="w-full">

            <h1 className="text-3xl md:text-4xl font-black uppercase flex items-center gap-3     ">

              <span className="bg-red-700 text-white px-4 py-1 rounded-2xl">
                CRM
              </span>

              {isRTL
                ? "عملاء واتساب"
                : "WhatsApp Customers"}

            </h1>

            <p className="mt-3 text-xs uppercase      opacity-40 font-mono">
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

            <thead className="bg-black text-white dark:bg-zinc-900 uppercase text-xs     ">

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
                    {(page - 1) * limit + idx + 1}
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

          <p className="text-xs uppercase      opacity-40 font-mono">
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

            <div className="px-8 py-4 rounded-2xl border border-black/10 dark:border-white/10 font-mono text-xs     ">
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

              <p className="font-bold      uppercase animate-pulse">
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
