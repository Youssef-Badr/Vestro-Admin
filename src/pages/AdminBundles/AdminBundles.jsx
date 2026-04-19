import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Plus, Trash2, Edit, Save, X, ToggleLeft, ToggleRight, 
  Package, Image as ImageIcon, RefreshCcw, CheckCircle2, 
  Link as LinkIcon, Layers, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext"; 
import { useTheme } from "../../context/ThemeContext";

const AdminBundles = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isRTL = language === "ar";
  
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    bundlePrice: "",
    items: [], 
relatedProduct: [],
    isActive: true,
    showInNavbar: true,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetchLoading(true);
    try {
      const [bundleRes, productRes] = await Promise.all([
        api.get("/bundles"),
        api.get("/products")
      ]);
      setBundles(bundleRes.data.bundles);
      setProducts(productRes.data.products || productRes.data);
    } catch (err) {
      toast.error(isRTL ? "فشل في تحميل البيانات" : "Failed to load data");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      return toast.warning(isRTL ? "اختر منتجات للعرض أولاً" : "Select products first");
    }
    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("bundlePrice", formData.bundlePrice);
    data.append("isActive", formData.isActive);
    data.append("showInNavbar", formData.showInNavbar);
    // 🔥 التعديل هنا: إرسال مصفوفة المنتجات المرتبطة كـ String
  data.append("relatedProduct", JSON.stringify(formData.relatedProduct));
    data.append("items", JSON.stringify(formData.items));
    if (formData.image instanceof File) data.append("image", formData.image);

    try {
      if (editingBundle) {
        await api.put(`/bundles/${editingBundle._id}`, data);
        toast.success(isRTL ? "✅ تم التحديث بنجاح" : "✅ Updated successfully");
      } else {
        await api.post("/bundles", data);
        toast.success(isRTL ? "🎉 تم إنشاء العرض بنجاح" : "🎉 Created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving bundle");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId) => {
    const isSelected = formData.items.some(i => i.product === productId);
    if (isSelected) {
      setFormData({ ...formData, items: formData.items.filter(i => i.product !== productId) });
    } else {
      setFormData({ ...formData, items: [...formData.items, { product: productId }] });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", bundlePrice: "", items: [], relatedProduct: [], isActive: true, showInNavbar: true, image: null });
    setImagePreview(null);
    setEditingBundle(null);
  };

  if (fetchLoading) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <RefreshCcw className="animate-spin text-indigo-500/80" size={50} />
    </div>
  );

  return (
    <div className={`p-4 md:p-10 min-h-screen bg-[#FDFDFD] dark:bg-gray-950 transition-colors duration-500 ${isRTL ? "font-cairo" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Header - Luxury Vestro Style */}
      <div className="flex flex-col mt-16 md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-gray-100 flex items-center gap-5">
            <div className="bg-indigo-950 dark:bg-indigo-900 p-3.5 rounded-[1.8rem] text-indigo-100 shadow-2xl border border-indigo-800/20">
              <Layers size={35} />
            </div>
            {isRTL ? "إدارة العروض" : "Vestro Bundles"}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-4 text-lg font-medium tracking-tight">
            {isRTL ? "تحكم في عروضك المجمعة الحصرية" : "Control your exclusive master offers"}
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: '#312e81' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full md:w-auto bg-indigo-900 dark:bg-indigo-800 text-white px-12 py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-900/10 transition-all flex items-center justify-center gap-3 border border-indigo-700/30"
        >
          <Plus size={22} /> 
          {isRTL ? "إضافة عرض فاخر" : "Create Master Bundle"}
        </motion.button>
      </div>

      {/* Bundle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {bundles.map((bundle, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            key={bundle._id}
            className="bg-white dark:bg-gray-900/40 rounded-[3rem] border border-slate-100 dark:border-gray-800/50 p-7 shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all relative overflow-hidden group backdrop-blur-sm"
          >
            {/* Soft Status Badge */}
            <div className={`absolute top-8 left-8 z-10 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${bundle.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
              {bundle.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "متوقف" : "Paused")}
            </div>

            <div className="relative mb-8 overflow-hidden rounded-[2.5rem] shadow-inner bg-gray-50 dark:bg-gray-800">
              <img src={bundle.image?.url} alt="" className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                 <span className="text-white/80 text-xs font-bold tracking-widest uppercase"><Eye size={14} className="inline mr-1"/> {bundle.slug}</span>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-800 dark:text-gray-100 mb-3 truncate px-2">{bundle.name}</h3>
            
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-indigo-900 dark:text-indigo-400">{bundle.bundlePrice} <small className="text-[10px] tracking-tighter uppercase opacity-60">EGP</small></span>
                  <span className="text-sm text-slate-400 line-through font-bold opacity-50">{bundle.originalPrice} EGP</span>
               </div>
              {/* داخل الكارت (Bundle Card) ابحث عن أيقونة LinkIcon */}
{bundle.relatedProduct && bundle.relatedProduct.length > 0 && (
  <div className="bg-slate-50 dark:bg-gray-800 p-3.5 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm text-indigo-500 flex items-center gap-2">
    <LinkIcon size={20} />
    <span className="text-[10px] font-black">{bundle.relatedProduct.length}</span>
  </div>
)}
            </div>

            {/* Product Stack - Muted Colors */}
            <div className="flex items-center gap-4 mb-10 bg-slate-50/50 dark:bg-gray-800/30 p-5 rounded-[2rem] border border-slate-100 dark:border-gray-800/50">
               <div className="flex -space-x-4 rtl:space-x-reverse">
                 {bundle.items?.map((item, idx) => (
                   <img 
                      key={idx} 
                      src={item.product?.images?.[0]?.url || "/placeholder.jpg"} 
                      className="w-14 h-14 rounded-full border-[5px] border-white dark:border-gray-900 object-cover shadow-md"
                      alt="v"
                   />
                 ))}
               </div>
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-gray-700">
                {bundle.items?.length} {isRTL ? "قطع" : "Items"}
               </span>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
  setEditingBundle(bundle);
  setFormData({
    name: bundle.name,
    bundlePrice: bundle.bundlePrice,
    isActive: bundle.isActive,
    showInNavbar: bundle.showInNavbar,
    // 🔥 التعديل هنا: سحب الـ IDs فقط من المصفوفة
    relatedProduct: Array.isArray(bundle.relatedProduct) 
      ? bundle.relatedProduct.map(p => p._id || p) 
      : (bundle.relatedProduct ? [bundle.relatedProduct._id || bundle.relatedProduct] : []),
    items: bundle.items.map(i => ({ product: i.product?._id || i.product })),
  });
  setImagePreview(bundle.image?.url);
  setShowModal(true);
}}
                className="flex-[2.5] flex items-center justify-center gap-2 py-5 bg-indigo-900 dark:bg-indigo-800 text-white rounded-[1.8rem] font-black hover:bg-indigo-950 transition-all shadow-lg shadow-indigo-900/10"
              >
                <Edit size={18} /> {isRTL ? "تعديل" : "Edit"}
              </button>
              <button 
                onClick={() => { if(window.confirm(isRTL ? 'حذف العرض؟' : 'Delete?')) api.delete(`/bundles/${bundle._id}`).then(fetchInitialData)}}
                className="flex-1 flex items-center justify-center py-5 text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-[1.8rem] hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-900/20"
              >
                <Trash2 size={22} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Luxury Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-950 w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-[4rem] p-8 md:p-14 shadow-3xl relative custom-scrollbar border border-slate-100 dark:border-gray-800"
            >
              <button onClick={() => setShowModal(false)} className={`absolute top-10 ${isRTL ? 'left-10' : 'right-10'} p-4 bg-slate-50 dark:bg-gray-900 dark:text-white rounded-full hover:scale-110 transition-transform border border-slate-100 dark:border-gray-800`}>
                <X size={24} />
              </button>

              <div className="mb-14 text-center">
                <h2 className="text-4xl font-black text-slate-900 dark:text-gray-100 mb-4 uppercase tracking-tight">
                  {editingBundle ? (isRTL ? "تحديث العرض الفاخر" : "Update Elite Bundle") : (isRTL ? "إطلاق عرض جديد" : "Launch New Bundle")}
                </h2>
                <div className="h-1.5 w-28 bg-indigo-900 dark:bg-indigo-500 mx-auto rounded-full"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.25em] px-2">{isRTL ? "اسم العرض" : "Bundle Identity"}</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                           className="w-full bg-slate-50 dark:bg-gray-900/50 dark:text-white p-7 rounded-[2rem] border-2 border-transparent focus:border-indigo-900/20 dark:focus:border-indigo-500/20 focus:bg-white outline-none transition-all font-bold text-lg" 
                           placeholder={isRTL ? "أدخل اسماً جذاباً" : "Enter a catchy name"} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.25em] px-2">{isRTL ? "سعر العرض" : "Luxury Pricing"}</label>
                    <input required type="number" value={formData.bundlePrice} onChange={e => setFormData({...formData, bundlePrice: e.target.value})} 
                           className="w-full bg-slate-50 dark:bg-gray-900/50 dark:text-indigo-400 p-7 rounded-[2rem] border-2 border-transparent focus:border-indigo-900/20 outline-none transition-all font-black text-2xl text-indigo-900" 
                           placeholder="0.00" />
                  </div>
                </div>

                {/* استبدل الـ select القديم بهذا الكود */}
<div className="space-y-4">
  <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.25em] px-2 flex items-center gap-2">
    <LinkIcon size={14} />
    {isRTL ? "المنتجات المرتبطة" : "Related Products"}
  </label>

  {/* 🔥 GRID بدل الزحمة */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto p-3 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border">

    {products.map((p) => {
      const isSelected = formData.relatedProduct.includes(p._id);

      return (
        <button
          key={p._id}
          type="button"
          onClick={() => {
            const current = formData.relatedProduct;
            if (current.includes(p._id)) {
              setFormData({
                ...formData,
                relatedProduct: current.filter(id => id !== p._id),
              });
            } else {
              setFormData({
                ...formData,
                relatedProduct: [...current, p._id],
              });
            }
          }}
          className={`flex items-center gap-2 p-2 rounded-xl transition-all border text-left ${
            isSelected
              ? "bg-indigo-900 text-white border-indigo-900"
              : "bg-white dark:bg-gray-800 text-slate-600 border-slate-200 dark:border-gray-700"
          }`}
        >
          {/* 🖼️ صورة صغيرة */}
          <img
            src={p.images?.[0]?.url}
            alt={p.name}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />

          {/* 🏷️ اسم المنتج */}
          <span className="text-[10px] font-bold line-clamp-2 leading-tight">
            {p.name}
          </span>

          {/* ✔ Selected */}
          {isSelected && (
            <CheckCircle2 size={12} className="ml-auto flex-shrink-0" />
          )}
        </button>
      );
    })}

    {products.length === 0 && (
      <span className="text-xs text-slate-400 col-span-full text-center">
        {isRTL ? "لا توجد منتجات" : "No products available"}
      </span>
    )}
  </div>
</div>
                {/* Grid Selection - High End */}
                <div className="space-y-6">
                   <div className="flex justify-between items-end px-3">
                     <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.25em]">{isRTL ? "قطع العرض المختارة" : "Elite Selection"}</label>
                     <span className="text-[10px] font-black text-white bg-indigo-900 dark:bg-indigo-600 px-5 py-2 rounded-full shadow-lg uppercase tracking-widest">{formData.items.length} {isRTL ? "محدد" : "Selected"}</span>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 max-h-[480px] overflow-y-auto p-6 bg-slate-50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-gray-800 custom-scrollbar">
                      {products.map(product => {
                        const isSelected = formData.items.some(i => i.product === product._id);
                        return (
                        <motion.div 
  key={product._id}
  whileTap={{ scale: 0.95 }}
  onClick={() => toggleProduct(product._id)}
  className={`relative cursor-pointer group rounded-2xl overflow-hidden border-2 transition-all duration-500 shadow-sm ${
    isSelected
      ? 'border-indigo-900 dark:border-indigo-500 bg-white dark:bg-gray-800'
      : 'border-transparent bg-white dark:bg-gray-800/50 hover:border-slate-200'
  }`}
>
  {/* 🔽 صورة أصغر */}
  <img
    src={product.images?.[0]?.url || "/placeholder.jpg"}
    className="w-full h-24 sm:h-28 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
  />

  {/* 🔽 padding أصغر */}
  <div className="p-2">
    <p className="text-[10px] font-black truncate dark:text-white uppercase tracking-tight">
      {product.name}
    </p>
    <p className="text-[10px] text-indigo-900 dark:text-indigo-400 font-black mt-1">
      {product.salePrice || product.price} EGP
    </p>
  </div>

  {isSelected && (
    <div className="absolute top-2 right-2 bg-indigo-900 dark:bg-indigo-500 text-white rounded-full p-1.5 shadow-xl">
      <CheckCircle2 size={12} />
    </div>
  )}
</motion.div>
                        )
                      })}
                   </div>
                </div>

                {/* Upload Section - Muted & Premium */}
                <div className="flex flex-col lg:flex-row gap-10 items-center bg-slate-50 dark:bg-gray-900/50 p-10 rounded-[3.5rem] border border-slate-100 dark:border-gray-800/50">
                  <div className="flex-1 w-full">
                    <label className="block text-center border-4 border-dashed border-slate-200 dark:border-gray-800 rounded-[3rem] p-14 cursor-pointer hover:border-indigo-900/20 hover:bg-white dark:hover:bg-gray-900 transition-all group relative overflow-hidden">
                       <ImageIcon className="mx-auto text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-500 mb-5 transition-colors" size={55} />
                       <span className="text-xl font-black text-slate-600 dark:text-gray-300 block mb-2">{isRTL ? "صورة غلاف الباندل" : "Bundle Master Art"}</span>
                       <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">{isRTL ? "جودة عالية 1:1" : "High Quality 1:1 Ratio"}</span>
                       <input type="file" hidden onChange={(e) => {
                         const file = e.target.files[0];
                         if(file) {
                           setFormData({...formData, image: file});
                           setImagePreview(URL.createObjectURL(file));
                         }
                       }} />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="relative group">
                      <img src={imagePreview} className="w-64 h-64 rounded-[3.5rem] object-cover shadow-3xl border-[12px] border-white dark:border-gray-900 ring-1 ring-slate-100 dark:ring-gray-800" />
                      <button onClick={() => { setImagePreview(null); setFormData({...formData, image: null}) }} 
                              className="absolute -top-5 -right-5 bg-rose-500 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform ring-4 ring-white dark:ring-gray-950">
                        <X size={20}/>
                      </button>
                    </div>
                  )}
                </div>

                {/* Muted Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <label className="flex items-center justify-between p-8 bg-slate-50 dark:bg-gray-900/50 rounded-[2.5rem] cursor-pointer border border-transparent hover:border-indigo-900/10 transition-all group">
                        <span className="font-black text-sm text-slate-700 dark:text-gray-300 uppercase tracking-widest">{isRTL ? "القائمة العلوية" : "Menu Visibility"}</span>
                        <input type="checkbox" checked={formData.showInNavbar} onChange={e => setFormData({...formData, showInNavbar: e.target.checked})} className="w-7 h-7 accent-indigo-900 dark:accent-indigo-500" />
                    </label>
                    <label className="flex items-center justify-between p-8 bg-slate-50 dark:bg-gray-900/50 rounded-[2.5rem] cursor-pointer border border-transparent hover:border-emerald-500/10 transition-all group">
                        <span className="font-black text-sm text-slate-700 dark:text-gray-300 uppercase tracking-widest">{isRTL ? "حالة التفعيل" : "Active Status"}</span>
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-7 h-7 accent-emerald-500" />
                    </label>
                </div>

                {/* Final Submit - Luxury Indigo */}
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: '#1e1b4b' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="w-full bg-indigo-950 dark:bg-indigo-900 text-white py-9 rounded-[3rem] font-black text-2xl shadow-3xl shadow-indigo-950/20 transition-all disabled:bg-slate-300 flex items-center justify-center gap-5 uppercase tracking-widest"
                >
                  {loading ? <RefreshCcw className="animate-spin" /> : <Save size={35} />}
                  {isRTL ? (editingBundle ? "تحديث البيانات" : "نشر العرض الفاخر") : (editingBundle ? "Update Records" : "Launch Luxury")}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 50px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default AdminBundles;