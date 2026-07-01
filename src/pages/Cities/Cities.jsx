

// import { useState, useEffect } from "react";
// import axios from "../../api/axiosInstance";
// import { toast } from "react-toastify";
// import { useLanguage } from "../../context/LanguageContext";
// import { Trash2, Edit3, CheckSquare, Square, Zap, MapPin, Gift } from "lucide-react";

// const Cities = () => {
//   const { language } = useLanguage();
//   const isRTL = language === "ar";

//   const [cities, setCities] = useState([]);
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [bulkCharge, setBulkCharge] = useState("");
//   const [cityNameAr, setCityNameAr] = useState("");
//   const [cityNameEn, setCityNameEn] = useState("");
//   const [charge, setCharge] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchCities = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("/delivery-charges/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCities(res.data);
//     } catch (error) {
//       toast.error(isRTL ? "حدث خطأ في التحميل" : "Load failed");
//     }
//   };

//   useEffect(() => {
//     fetchCities();
//   }, []);

//   const toggleSelect = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.length === cities.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(cities.map((c) => c._id));
//     }
//   };

//   const handleBulkUpdate = async (e) => {
//     e.preventDefault();
//     if (bulkCharge === "" || selectedIds.length === 0) return;
    
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       await Promise.all(
//         selectedIds.map((id) =>
//           axios.put(
//             `/delivery-charges/${id}`,
//             { charge: Number(bulkCharge) },
//             { headers: { Authorization: `Bearer ${token}` } }
//           )
//         )
//       );
      
//       toast.success(isRTL ? `تم تحديث ${selectedIds.length} مدينة` : `Updated ${selectedIds.length} cities`, { theme: "dark" });
//       setBulkCharge("");
//       setSelectedIds([]);
//       fetchCities();
//     } catch (error) {
//       toast.error(isRTL ? "فشل التحديث الجماعي" : "Bulk update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `/delivery-charges/${editingId}`,
//         { charge: Number(charge) },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(isRTL ? "تم التحديث بنجاح" : "Updated successfully", { theme: "dark" });
//       setEditingId(null);
//       setCharge("");
//       fetchCities();
//     } catch (error) {
//       toast.error(isRTL ? "فشل التحديث" : "Update failed");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm(isRTL ? "هل أنت متأكد من الحذف؟" : "Confirm delete?")) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`/delivery-charges/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success(isRTL ? "تم الحذف" : "Deleted", { theme: "dark" });
//       fetchCities();
//     } catch (error) {
//       toast.error(isRTL ? "فشل الحذف" : "Delete failed");
//     }
//   };

//   return (
//     <div dir={isRTL ? "rtl" : "ltr"} className="p-6 pt-20 md:pt-10 min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
      
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
//         <div>
//           <h1 className="text-3xl font-black      flex items-center gap-3 uppercase">
//             <span className="p-2 bg-[#86FE05] rounded-xl text-black">
//               <MapPin size={24} />
//             </span>
//             {isRTL ? "إدارة شحن المحافظات" : "Shipping Logistics"}
//           </h1>
//           <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase      ">
//             {isRTL ? "اجعل السعر 0 ليظهر كشحن مجاني" : "Set charge to 0 for Free Shipping label"}
//           </p>
//         </div>
        
//         {/* Bulk Action Panel */}
//         {selectedIds.length > 0 && (
//           <form onSubmit={handleBulkUpdate} className="flex gap-2 w-full md:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
//             <div className="relative">
//               <input
//                 type="number"
//                 placeholder="0"
//                 value={bulkCharge}
//                 onChange={(e) => setBulkCharge(e.target.value)}
//                 className="bg-white dark:bg-[#111] border-2 border-[#86FE05]/30 focus:border-[#86FE05] p-3 rounded-2xl w-36 outline-none font-black transition-all dark:text-white"
//               />
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30 uppercase">Egp</span>
//             </div>
//             <button 
//               disabled={loading}
//               className="bg-[#86FE05] text-black px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-black hover:text-[#86FE05] dark:hover:bg-white transition-all shadow-lg flex items-center gap-2"
//             >
//               <Zap size={14} fill="currentColor" />
//               {loading ? "..." : isRTL ? `تحديث (${selectedIds.length})` : `Update (${selectedIds.length})`}
//             </button>
//           </form>
//         )}
//       </div>

//       {/* Edit Form */}
//       {editingId && (
//         <div className="mb-10 p-6 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl animate-in zoom-in duration-300">
//           <h2 className="text-sm font-black uppercase    mb-4 flex items-center gap-2 text-slate-400">
//             <Edit3 size={16} />
//             {isRTL ? `تعديل سعر: ${cityNameAr}` : `Editing: ${cityNameEn}`}
//           </h2>
//           <form onSubmit={handleUpdate} className="flex gap-4 flex-col md:flex-row items-end">
//             <div className="flex-1 w-full">
//               <label className="block text-[10px] font-black uppercase mb-2 opacity-50    ">{isRTL ? "التكلفة الجديدة (0 = مجاني)" : "Fee (0 = Free Shipping)"}</label>
//               <input
//                 type="number"
//                 value={charge}
//                 onChange={(e) => setCharge(e.target.value)}
//                 className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#86FE05] outline-none font-black text-xl transition-all"
//                 autoFocus
//               />
//             </div>
//             <div className="flex gap-3 w-full md:w-auto">
//               <button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase text-xs     hover:bg-[#86FE05] hover:text-black transition-all flex-1">
//                 {isRTL ? "حفظ" : "Save"}
//               </button>
//               <button type="button" onClick={() => setEditingId(null)} className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-6 py-4 rounded-2xl font-black uppercase text-xs     hover:bg-red-500 hover:text-white transition-all flex-1">
//                 {isRTL ? "إلغاء" : "Cancel"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Table Section */}
//       <div className="bg-white dark:bg-[#0F0F0F] rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden transition-all">
//         <div className="overflow-x-auto">
//           <table className="w-full text-center border-collapse">
//             <thead>
//               <tr className="bg-slate-900 dark:bg-black text-white">
//                 <th className="p-5 w-20">
//                   <button onClick={toggleSelectAll} className="hover:text-[#86FE05] transition-colors">
//                     {selectedIds.length === cities.length ? <CheckSquare size={20} className="text-[#86FE05]" /> : <Square size={20} />}
//                   </button>
//                 </th>
//                 <th className="p-5 text-[11px] font-black uppercase    opacity-60">{isRTL ? "المحافظة" : "Province"}</th>
//                 <th className="p-5 text-[11px] font-black uppercase    opacity-60">{isRTL ? "الاسم EN" : "English"}</th>
//                 <th className="p-5 text-[11px] font-black uppercase    opacity-60">{isRTL ? "سعر الشحن" : "Rate"}</th>
//                 <th className="p-3 text-[11px] font-black uppercase    opacity-60 text-right">{isRTL ? "الإجراءات" : "Actions"}</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
//               {cities.map((city) => (
//                 <tr 
//                   key={city._id} 
//                   className={`group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${selectedIds.includes(city._id) ? 'bg-[#86FE05]/5' : ''}`}
//                 >
//                   <td className="p-5">
//                     <button onClick={() => toggleSelect(city._id)} className={`${selectedIds.includes(city._id) ? 'text-[#86FE05]' : 'text-slate-300 dark:text-white/10 group-hover:text-slate-400'}`}>
//                       {selectedIds.includes(city._id) ? <CheckSquare size={20} /> : <Square size={20} />}
//                     </button>
//                   </td>
//                   <td className="p-5 font-black   text-lg">{city.cityAr}</td>
//                   <td className="p-5 text-slate-400 dark:text-slate-500 font-bold   text-sm uppercase">{city.cityEn}</td>
//                   <td className="p-5">
//                     {Number(city.charge) === 0 ? (
//                       <span className="bg-[#86FE05] text-black px-4 py-2 rounded-xl font-black   text-xs uppercase flex items-center justify-center gap-1 w-fit mx-auto shadow-[0_0_15px_rgba(134,254,5,0.2)]">
//                         <Gift size={14} />
//                         {isRTL ? "شحن مجاني" : "Free Shipping"}
//                       </span>
//                     ) : (
//                       <span className="bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-300 px-4 py-2 rounded-xl font-black   border border-slate-200 dark:border-white/5 inline-block">
//                         {city.charge} <small className="text-[10px] opacity-50 uppercase ml-1 font-sans">Egp</small>
//                       </span>
//                     )}
//                   </td>
//                   <td className="p-5">
//                     <div className="flex gap-2 justify-end items-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
//                       <button
//                         onClick={() => {
//                           setEditingId(city._id);
//                           setCharge(city.charge);
//                           setCityNameAr(city.cityAr);
//                           setCityNameEn(city.cityEn);
//                           window.scrollTo({ top: 0, behavior: 'smooth' });
//                         }}
//                         className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-[#86FE05] hover:text-black transition-all"
//                       >
//                         <Edit3 size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(city._id)}
//                         className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cities;

import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import { Trash2, Edit3, CheckSquare, Square, Zap, MapPin, Gift } from "lucide-react";

const Cities = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [cities, setCities] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCharge, setBulkCharge] = useState("");
  const [cityNameAr, setCityNameAr] = useState("");
  const [cityNameEn, setCityNameEn] = useState("");
  const [charge, setCharge] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/delivery-charges/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCities(res.data);
    } catch (error) {
      toast.error(isRTL ? "حدث خطأ في التحميل" : "Load failed");
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cities.map((c) => c._id));
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (bulkCharge === "" || selectedIds.length === 0) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) =>
          axios.put(
            `/delivery-charges/${id}`,
            { charge: Number(bulkCharge) },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      
      toast.success(isRTL ? `تم تحديث ${selectedIds.length} مدينة` : `Updated ${selectedIds.length} cities`, { theme: "dark" });
      setBulkCharge("");
      setSelectedIds([]);
      fetchCities();
    } catch (error) {
      toast.error(isRTL ? "فشل التحديث الجماعي" : "Bulk update failed");
    } finally {
      loading && setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/delivery-charges/${editingId}`,
        { charge: Number(charge) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isRTL ? "تم التحديث بنجاح" : "Updated successfully", { theme: "dark" });
      setEditingId(null);
      setCharge("");
      fetchCities();
    } catch (error) {
      toast.error(isRTL ? "فشل التحديث" : "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isRTL ? "هل أنت متأكد من الحذف؟" : "Confirm delete?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/delivery-charges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(isRTL ? "تم الحذف" : "Deleted", { theme: "dark" });
      fetchCities();
    } catch (error) {
      toast.error(isRTL ? "فشل الحذف" : "Delete failed");
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-4 md:p-6 pt-16 md:pt-10 min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6">
        <div>
          <h1 className="text-xl md:text-3xl font-black      flex items-center gap-2 md:gap-3 uppercase">
            <span className="p-2 bg-red-700 rounded-xl text-black">
              <MapPin size={20} className="md:w-6 md:h-6" />
            </span>
            {isRTL ? "إدارة شحن المحافظات" : "Shipping Logistics"}
          </h1>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase      ">
            {isRTL ? "اجعل السعر 0 ليظهر كشحن مجاني" : "Set charge to 0 for Free Shipping label"}
          </p>
        </div>
        
        {/* Bulk Action Panel */}
        {selectedIds.length > 0 && (
          <form onSubmit={handleBulkUpdate} className="flex gap-2 w-full md:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="relative flex-1 md:flex-initial">
              <input
                type="number"
                placeholder="0"
                value={bulkCharge}
                onChange={(e) => setBulkCharge(e.target.value)}
                className="bg-white dark:bg-[#111] border-2 border-[#86FE05]/30 focus:border-red-700 p-3 rounded-2xl w-full md:w-36 outline-none font-black transition-all dark:text-white"
              />
              <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30 uppercase`}>Egp</span>
            </div>
            <button 
              disabled={loading}
              className="bg-red-700 text-white px-4 md:px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-black hover:text-red-700 dark:hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Zap size={14} fill="currentColor" />
              {loading ? "..." : isRTL ? `تحديث (${selectedIds.length})` : `Update (${selectedIds.length})`}
            </button>
          </form>
        )}
      </div>

      {/* Edit Form */}
      {editingId && (
        <div className="mb-6 md:mb-10 p-4 md:p-6 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl animate-in zoom-in duration-300">
          <h2 className="text-xs md:text-sm font-black uppercase    mb-4 flex items-center gap-2 text-slate-400">
            <Edit3 size={16} />
            {isRTL ? `تعديل سعر: ${cityNameAr}` : `Editing: ${cityNameEn}`}
          </h2>
          <form onSubmit={handleUpdate} className="flex gap-3 flex-col md:flex-row items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black uppercase mb-2 opacity-50    ">{isRTL ? "التكلفة الجديدة (0 = مجاني)" : "Fee (0 = Free Shipping)"}</label>
              <input
                type="number"
                value={charge}
                onChange={(e) => setCharge(e.target.value)}
                className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-3 md:p-4 rounded-2xl w-full focus:ring-2 focus:ring-red-700 outline-none font-black text-lg md:text-xl transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="submit" className="bg-red-700 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl font-black uppercase text-xs     hover:bg-black hover:text-red-700 transition-all flex-1 md:flex-none">
                {isRTL ? "حفظ" : "Save"}
              </button>
              <button type="button" onClick={() => setEditingId(null)} className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-black uppercase text-xs     hover:bg-red-500 hover:text-white transition-all flex-1 md:flex-none">
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Container Section */}
      <div className="bg-white dark:bg-[#0F0F0F] rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden transition-all">
        
        {/* 1. Mobile & Tablet View (Cards Layout) */}
        <div className="block md:hidden p-4">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-xs font-black uppercase opacity-60">{isRTL ? "تحديد الكل" : "Select All"}</span>
            <button onClick={toggleSelectAll} className="hover:text-red-700 transition-colors">
              {selectedIds.length === cities.length ? <CheckSquare size={22} className="text-red-700" /> : <Square size={22} />}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {cities.map((city) => (
              <div 
                key={city._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${selectedIds.includes(city._id) ? 'bg-red-700/5 border-red-700/30' : 'bg-slate-50/50 dark:bg-black/20 border-slate-100 dark:border-white/5'}`}
              >
                <div className="flex justify-between items-start">
                  <button onClick={() => toggleSelect(city._id)} className={`${selectedIds.includes(city._id) ? 'text-red-700' : 'text-slate-300 dark:text-white/20'}`}>
                    {selectedIds.includes(city._id) ? <CheckSquare size={22} /> : <Square size={22} />}
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(city._id);
                        setCharge(city.charge);
                        setCityNameAr(city.cityAr);
                        setCityNameEn(city.cityEn);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-red-700 hover:text-white transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(city._id)}
                      className="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div>
                    <h3 className="font-black   text-base">{city.cityAr}</h3>
                    <p className="text-slate-400 dark:text-slate-500 font-bold   text-xs uppercase">{city.cityEn}</p>
                  </div>

                  <div>
                    {Number(city.charge) === 0 ? (
                      <span className="bg-red-700 text-white px-3 py-1.5 rounded-xl font-black   text-[10px] uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(239,65,65,0.2)]">
                        <Gift size={12} />
                        {isRTL ? "مجاني" : "Free"}
                      </span>
                    ) : (
                      <span className="bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-300 px-3 py-1.5 rounded-xl font-black   border border-slate-200 dark:border-white/5 text-sm">
                        {city.charge} <small className="text-[9px] opacity-50 uppercase font-sans">Egp</small>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Desktop View (Original Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-black text-white">
                <th className="p-5 w-20">
                  <button onClick={toggleSelectAll} className="hover:text-red-700 transition-colors">
                    {selectedIds.length === cities.length ? <CheckSquare size={20} className="text-red-700" /> : <Square size={20} />}
                  </button>
                </th>
                <th className="p-5 text-[11px] font-black uppercase    opacity-60">{isRTL ? "المحافظة" : "Province"}</th>
                <th className="p-5 text-[11px] font-black uppercase    opacity-60">{isRTL ? "الاسم EN" : "English"}</th>
                <th className="p-5 text-[11px] font-black uppercase    opacity-60">{isRTL ? "سعر الشحن" : "Rate"}</th>
                <th className="p-3 text-[11px] font-black uppercase    opacity-60 text-right">{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {cities.map((city) => (
                <tr 
                  key={city._id} 
                  className={`group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${selectedIds.includes(city._id) ? 'bg-red-700/5' : ''}`}
                >
                  <td className="p-5">
                    <button onClick={() => toggleSelect(city._id)} className={`${selectedIds.includes(city._id) ? 'text-red-700' : 'text-slate-300 dark:text-white/10 group-hover:text-slate-400'}`}>
                      {selectedIds.includes(city._id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="p-5 font-black   text-lg">{city.cityAr}</td>
                  <td className="p-5 text-slate-400 dark:text-slate-500 font-bold   text-sm uppercase">{city.cityEn}</td>
                  <td className="p-5">
                    {Number(city.charge) === 0 ? (
                      <span className="bg-red-700 text-white px-4 py-2 rounded-xl font-black   text-xs uppercase flex items-center justify-center gap-1 w-fit mx-auto shadow-[0_0_15px_rgba(239,65,65,0.2)]">
                        <Gift size={14} />
                        {isRTL ? "شحن مجاني" : "Free Shipping"}
                      </span>
                    ) : (
                      <span className="bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-300 px-4 py-2 rounded-xl font-black   border border-slate-200 dark:border-white/5 inline-block">
                        {city.charge} <small className="text-[10px] opacity-50 uppercase ml-1 font-sans">Egp</small>
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2 justify-end items-center lg:opacity-0 lg:group-hover:opacity-100 transition-all transform lg:translate-x-2 lg:group-hover:translate-x-0">
                      <button
                        onClick={() => {
                          setEditingId(city._id);
                          setCharge(city.charge);
                          setCityNameAr(city.cityAr);
                          setCityNameEn(city.cityEn);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-[#86FE05] hover:text-black transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(city._id)}
                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cities;