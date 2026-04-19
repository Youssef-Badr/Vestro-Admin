//  --------------------------------------------------------------------------------------------------------------
import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { FiTag, FiTrash2, FiEdit3, FiPackage, FiCheckCircle, FiTruck, FiInfo, FiPower, FiChevronRight } from "react-icons/fi";

const Discounts = () => {
  const { language } = useLanguage();
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  const initialForm = {
    code: "",
    discountType: "percentage",
    percentage: 0,
    buyQuantity: 0,
    getQuantity: 0,
    getDiscount: 0,
    expiresAt: "",
    applicableProducts: [],
    appliesToAll: true,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    usagePerUser: 1,
    freeShipping: false,
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [disRes, prodRes] = await Promise.all([
        axios.get("/discounts"),
        axios.get("/products"),
      ]);
      setDiscounts(disRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error(language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const toggleProductSelection = (id) => {
    setForm((prev) => {
      const isSelected = prev.applicableProducts.includes(id);
      return {
        ...prev,
        applicableProducts: isSelected
          ? prev.applicableProducts.filter((p) => p !== id)
          : [...prev.applicableProducts, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        freeShipping: form.discountType === "free_shipping",
        applicableProducts: form.appliesToAll ? [] : form.applicableProducts,
      };

      if (editId) {
        await axios.put(`/discounts/${editId}`, payload);
        toast.success(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await axios.post("/discounts", payload);
        toast.success(language === "ar" ? "تم الإنشاء بنجاح" : "Created successfully");
      }

      setForm(initialForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const toggleActiveStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/discounts/${id}`, { isActive: !currentStatus });
      toast.dark(language === "ar" ? "تم تحديث الحالة" : "Status Updated");
      fetchData();
    } catch {
      toast.error("Error updating status");
    }
  };

  const startEdit = (d) => {
    setEditId(d._id);
    const productIds = d.applicableProducts?.map((p) => (typeof p === "object" ? p._id : p)) || [];
    setForm({
      ...d,
      expiresAt: d.expiresAt?.slice(0, 10),
      applicableProducts: productIds,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm(language === "ar" ? "حذف هذا الخصم؟" : "Delete this discount?")) return;
    try {
      await axios.delete(`/discounts/${id}`);
      fetchData();
      toast.dark(language === "ar" ? "تم الحذف" : "Deleted");
    } catch { toast.error("Error"); }
  };
return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-all">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 md:mb-12 border-b border-gray-100 mt-16 dark:border-gray-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
              Vestro <span className="text-blue-600">{language === "ar" ? "خصومات" : "Discounts"}</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-2">
              {language === "ar" ? "التحكم الاحترافي بالمتجر" : "Professional Store Control"}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-gray-50 dark:bg-[#111] rounded-[30px] md:rounded-[40px] p-5 sm:p-8 md:p-10 mb-12 md:pb-16 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              
              {/* Col 1: Identity */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600">
                  <FiTag/> 01. {language === "ar" ? "الهوية" : "Identity"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "كود الكوبون" : "Coupon Code"}</label>
                    <input type="text" name="code" value={form.code} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none" placeholder="E.G. VESTRO50" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "نوع العرض" : "Offer Type"}</label>
                    <select name="discountType" value={form.discountType} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none">
                      <option value="percentage">{language === "ar" ? "نسبة مئوية %" : "Percentage %"}</option>
                      <option value="bogo">{language === "ar" ? "اشتري قطعة واحصل على الأخرى مجاناً" : "BOGO (Buy X Get Y Free)"}</option>
                      <option value="bogo_discount">{language === "ar" ? "خصم على القطعة الثانية" : "BOGO Discount %"}</option>
                      <option value="free_shipping">{language === "ar" ? "شحن مجاني 🚚" : "Free Shipping 🚚"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "تاريخ الصلاحية" : "Expiry Date"}</label>
                    <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 outline-none" required />
                  </div>
                </div>
              </div>

              {/* Col 2: Rules */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600">
                  <FiInfo/> 02. {language === "ar" ? "المعايير" : "Parameters"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "الحد الأدنى للشراء" : "Min Order (EGP)"}</label>
                    <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "الاستخدام الكلي" : "Total Limit"}</label>
                    <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "لكل عميل" : "Per User"}</label>
                    <input type="number" name="usagePerUser" value={form.usagePerUser} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 outline-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                    <div className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${form.appliesToAll ? 'bg-black text-white' : 'bg-gray-200 dark:bg-[#222]'}`} onClick={() => handleChange({ target: { name: 'appliesToAll', type: 'checkbox', checked: !form.appliesToAll } })}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" name="appliesToAll" checked={form.appliesToAll} onChange={handleChange} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                        <span className="text-[10px] font-black uppercase">{language === "ar" ? "تطبيق على جميع المنتجات" : "Apply to all products"}</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${form.isActive ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <span className="text-[10px] font-black uppercase">{language === "ar" ? "حالة الكوبون (نشط)" : "Status: Active"}</span>
                      <button 
                        type="button" 
                        onClick={() => setForm(prev => ({...prev, isActive: !prev.isActive}))}
                        className={`w-12 h-6 rounded-full relative transition-all ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${language === 'ar' ? (form.isActive ? 'right-1' : 'right-7') : (form.isActive ? 'left-7' : 'left-1')}`} />
                      </button>
                    </div>
                </div>
              </div>

              {/* Col 3: Values */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600">
                  <FiPackage/> 03. {language === "ar" ? "القيمة" : "Values"}
                </h3>
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[30px] ring-1 ring-gray-200 dark:ring-gray-800 min-h-[180px] flex items-center justify-center">
                   {form.discountType === "percentage" && (
                     <div className="w-full">
                       <label className="text-center block text-[10px] font-black uppercase opacity-40 mb-4 italic">{language === "ar" ? "نسبة الخصم" : "Discount Percentage"}</label>
                       <input type="number" name="percentage" value={form.percentage} onChange={handleChange} className="w-full bg-transparent text-5xl font-black text-center focus:outline-none" />
                       <div className="text-center text-4xl font-black opacity-10">%</div>
                     </div>
                   )}
                   {form.discountType === "free_shipping" && (
                     <div className="py-10 text-center space-y-4">
                        <FiTruck size={50} className="mx-auto text-blue-600 animate-pulse" />
                        <p className="font-black uppercase text-sm tracking-tighter italic">{language === "ar" ? "شحن مجاني مفعل" : "Free Shipping Ready"}</p>
                     </div>
                   )}
                   {(form.discountType === "bogo" || form.discountType === "bogo_discount") && (
                     <div className="space-y-4 w-full">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
                          <span className="text-[10px] font-bold opacity-40 uppercase">{language === "ar" ? "اشتري" : "Buy"}</span>
                          <input type="number" name="buyQuantity" value={form.buyQuantity} onChange={handleChange} className="w-12 bg-transparent font-black text-xl text-center outline-none" />
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
                          <span className="text-[10px] font-bold opacity-40 uppercase">{language === "ar" ? "احصل على" : "Get"}</span>
                          <input type="number" name="getQuantity" value={form.getQuantity} onChange={handleChange} className="w-12 bg-transparent font-black text-xl text-center outline-none" />
                        </div>
                        {form.discountType === "bogo_discount" && (
                          <input type="number" name="getDiscount" value={form.getDiscount} onChange={handleChange} className="w-full bg-black text-white p-3 rounded-xl text-center font-black outline-none" placeholder={language === "ar" ? "خصم الهدية %" : "Gift Discount %"} />
                        )}
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Product Selector */}
            {!form.appliesToAll && (
              <div className="pt-10 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest">
                     {language === "ar" ? "تحديد المنتجات" : "Select Products"} ({form.applicableProducts.length})
                   </h3>
                   <input type="text" placeholder={language === "ar" ? "ابحث عن منتج..." : "Search products..."} className="bg-white dark:bg-[#1a1a1a] border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-full px-6 py-3 text-xs w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                  {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                    <div key={p._id} onClick={() => toggleProductSelection(p._id)} className={`relative p-2 rounded-3xl cursor-pointer transition-all border-2 ${form.applicableProducts.includes(p._id) ? 'border-black dark:border-white bg-white dark:bg-[#222] scale-95 shadow-lg' : 'border-transparent opacity-60 grayscale'}`}>
                      <img src={p.images[0]?.url} alt={p.name} className="w-full aspect-square object-cover rounded-2xl mb-2" />
                      <p className="text-[9px] font-black uppercase truncate text-center px-1">{p.name}</p>
                      {form.applicableProducts.includes(p._id) && <FiCheckCircle className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black rounded-full p-0.5" size={18} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-5 md:py-6 rounded-[25px] md:rounded-[30px] font-black uppercase tracking-[4px] md:tracking-[10px] text-base md:text-lg hover:shadow-2xl transition-all active:scale-[0.98] mt-4">
              {editId ? (language === "ar" ? "تحديث التغييرات" : "Save Changes") : (language === "ar" ? "تفعيل الكوبون" : "Activate Coupon")}
            </button>
          </form>
        </div>

        {/* Display Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {discounts.map(d => {
            const isExpired = new Date(d.expiresAt) < new Date();
            return (
              <div key={d._id} className={`bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-900 rounded-[35px] p-6 md:p-8 relative overflow-hidden group transition-all flex flex-col justify-between ${!d.isActive ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter truncate max-w-[150px]">{d.code}</h2>
                    <button 
                      onClick={() => toggleActiveStatus(d._id, d.isActive)}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded flex items-center gap-1 mt-1 transition-colors ${d.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                    >
                      <FiPower size={10} />
                      {d.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(d)} className="p-2.5 bg-white dark:bg-[#1a1a1a] rounded-full shadow-sm hover:bg-black hover:text-white transition-all"><FiEdit3 size={14}/></button>
                    <button onClick={() => deleteDiscount(d._id)} className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><FiTrash2 size={14}/></button>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[12px] md:text-sm font-black uppercase italic">
                    {d.discountType === 'percentage' && `🔥 ${d.percentage}% ${language === "ar" ? "خصم على الطلب" : "OFF Order"}`}
                    {d.discountType === 'bogo' && `🛍 ${language === "ar" ? "اشتري" : "Buy"} ${d.buyQuantity} ${language === "ar" ? "واحصل على" : "Get"} ${d.getQuantity} ${language === "ar" ? "مجاناً" : "FREE"}`}
                    {d.discountType === 'bogo_discount' && `💸 ${d.getDiscount}% ${language === "ar" ? "خصم على القطعة" : "OFF On Item"}`}
                    {d.discountType === 'free_shipping' && `🚚 ${language === "ar" ? "شحن مجاني" : "FREE SHIPPING"}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      {isExpired ? (language === "ar" ? "منتهي" : "Expired") : (language === "ar" ? "مباشر الآن" : "Live Now")}
                    </span>
                  </div>
                </div>

                {/* Selected Products List */}
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-2 opacity-40">
                    <FiPackage size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {d.appliesToAll ? (language === "ar" ? "جميع المنتجات" : "All Products") : (language === "ar" ? "المنتجات المشمولة" : "Included Products")}
                    </span>
                  </div>
                  {!d.appliesToAll && (
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide pr-1">
                      {d.applicableProducts?.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] p-2 rounded-xl border border-gray-50 dark:border-gray-800">
                          <img 
                            src={typeof p === 'object' ? p.images[0]?.url : products.find(prod => prod._id === p)?.images[0]?.url} 
                            className="w-7 h-7 rounded-lg object-cover" 
                            alt=""
                          />
                          <span className="text-[9px] font-black uppercase truncate flex-1">
                            {typeof p === 'object' ? p.name : products.find(prod => prod._id === p)?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-2">
                  <div className="text-[9px] font-black uppercase opacity-30">
                    {language === "ar" ? "ينتهي:" : "Exp:"} {new Date(d.expiresAt).toLocaleDateString(language === "ar" ? 'ar-EG' : 'en-US')}
                  </div>
                  <div className="text-[9px] font-black uppercase bg-blue-600 text-white px-2.5 py-1 rounded-full italic shrink-0">
                    {language === "ar" ? "الأدنى:" : "Min:"} {d.minOrderAmount} EGP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  // return (
  //   <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen p-4 md:p-8 bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-all">
  //     <div className="max-w-7xl mx-auto">
        
  //       {/* Header */}
  //       <div className="mb-12 border-b border-gray-100 dark:border-gray-900 pb-8 flex justify-between items-end">
  //         <div>
  //           <h1 className="text-5xl font-black italic tracking-tighter uppercase">Vestro <span className="text-blue-600">Discounts</span></h1>
  //           <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-2">Professional Store Control</p>
  //         </div>
  //       </div>

  //       {/* Form Section */}
  //       <div className="bg-gray-50 dark:bg-[#111] rounded-[40px] p-6 md:p-10 mb-16 border border-gray-100 dark:border-gray-800">
  //         <form onSubmit={handleSubmit} className="space-y-10">
  //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
  //             {/* Col 1: Identity */}
  //             <div className="space-y-6">
  //               <h3 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600"><FiTag/> 01. Identity</h3>
  //               <div className="space-y-4">
  //                 <div>
  //                   <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "كود الكوبون" : "Coupon Code"}</label>
  //                   <input type="text" name="code" value={form.code} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" placeholder="E.G. VESTRO50" required />
  //                 </div>
  //                 <div>
  //                   <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "نوع العرض" : "Offer Type"}</label>
  //                   <select name="discountType" value={form.discountType} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800">
  //                     <option value="percentage">Percentage %</option>
  //                     <option value="bogo">BOGO (Buy X Get Y Free)</option>
  //                     <option value="bogo_discount">BOGO Discount %</option>
  //                     <option value="free_shipping">Free Shipping 🚚</option>
  //                   </select>
  //                 </div>
  //                 <div>
  //                   <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "تاريخ الصلاحية" : "Expiry Date"}</label>
  //                   <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800" required />
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Col 2: Rules */}
  //             <div className="space-y-6">
  //               <h3 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600"><FiInfo/> 02. Parameters</h3>
  //               <div className="grid grid-cols-2 gap-4">
  //                 <div className="col-span-2">
  //                   <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "الحد الأدنى للشراء" : "Min Order (EGP)"}</label>
  //                   <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800" />
  //                 </div>
  //                 <div>
  //                   <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "الاستخدام الكلي" : "Total Limit"}</label>
  //                   <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800" />
  //                 </div>
  //                 <div>
  //                   <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{language === "ar" ? "لكل عميل" : "Per User"}</label>
  //                   <input type="number" name="usagePerUser" value={form.usagePerUser} onChange={handleChange} className="w-full bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl font-bold border-none ring-1 ring-gray-200 dark:ring-gray-800" />
  //                 </div>
  //               </div>
                
  //               {/* Toggles */}
  //               <div className="space-y-3">
  //                   <div className={`p-4 rounded-2xl flex items-center justify-between transition-all ${form.appliesToAll ? 'bg-black text-white' : 'bg-gray-200 dark:bg-[#222]'}`}>
  //                     <div className="flex items-center gap-3">
  //                       <input type="checkbox" name="appliesToAll" checked={form.appliesToAll} onChange={handleChange} className="w-5 h-5 accent-blue-600 cursor-pointer" />
  //                       <span className="text-[10px] font-black uppercase">{language === "ar" ? "تطبيق على جميع المنتجات" : "Apply to all products"}</span>
  //                     </div>
  //                   </div>

  //                   <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${form.isActive ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
  //                     <span className="text-[10px] font-black uppercase">{language === "ar" ? "حالة الكوبون (نشط)" : "Status: Active"}</span>
  //                     <button 
  //                       type="button" 
  //                       onClick={() => setForm(prev => ({...prev, isActive: !prev.isActive}))}
  //                       className={`w-12 h-6 rounded-full relative transition-all ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
  //                     >
  //                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${language === 'ar' ? (form.isActive ? 'right-1' : 'right-7') : (form.isActive ? 'left-7' : 'left-1')}`} />
  //                     </button>
  //                   </div>
  //               </div>
  //             </div>

  //             {/* Col 3: Values */}
  //             <div className="space-y-6">
  //               <h3 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600"><FiPackage/> 03. Values</h3>
  //               <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[30px] ring-1 ring-gray-200 dark:ring-gray-800">
  //                  {form.discountType === "percentage" && (
  //                    <div>
  //                      <label className="text-center block text-[10px] font-black uppercase opacity-40 mb-4 italic">Discount Percentage</label>
  //                      <input type="number" name="percentage" value={form.percentage} onChange={handleChange} className="w-full bg-transparent text-5xl font-black text-center focus:outline-none" />
  //                      <div className="text-center text-4xl font-black opacity-10">%</div>
  //                    </div>
  //                  )}
  //                  {form.discountType === "free_shipping" && (
  //                    <div className="py-10 text-center space-y-4">
  //                       <FiTruck size={50} className="mx-auto text-blue-600 animate-pulse" />
  //                       <p className="font-black uppercase text-sm tracking-tighter italic">Free Shipping Ready</p>
  //                    </div>
  //                  )}
  //                  {(form.discountType === "bogo" || form.discountType === "bogo_discount") && (
  //                    <div className="space-y-4">
  //                       <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
  //                         <span className="text-[10px] font-bold opacity-40 uppercase">Buy</span>
  //                         <input type="number" name="buyQuantity" value={form.buyQuantity} onChange={handleChange} className="w-12 bg-transparent font-black text-xl text-center" />
  //                       </div>
  //                       <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
  //                         <span className="text-[10px] font-bold opacity-40 uppercase">Get</span>
  //                         <input type="number" name="getQuantity" value={form.getQuantity} onChange={handleChange} className="w-12 bg-transparent font-black text-xl text-center" />
  //                       </div>
  //                       {form.discountType === "bogo_discount" && (
  //                         <input type="number" name="getDiscount" value={form.getDiscount} onChange={handleChange} className="w-full bg-black text-white p-3 rounded-xl text-center font-black" placeholder="Gift Discount %" />
  //                       )}
  //                    </div>
  //                  )}
  //               </div>
  //             </div>
  //           </div>

  //           {/* Product Selector */}
  //           {!form.appliesToAll && (
  //             <div className="pt-10 border-t border-gray-200 dark:border-gray-800">
  //               <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
  //                  <h3 className="text-sm font-black uppercase tracking-widest">{language === "ar" ? "تحديد المنتجات" : "Select Products"} ({form.applicableProducts.length})</h3>
  //                  <input type="text" placeholder={language === "ar" ? "ابحث عن منتج..." : "Search products..."} className="bg-white dark:bg-[#1a1a1a] border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-full px-6 py-2 text-xs w-full md:w-64" onChange={(e) => setSearchTerm(e.target.value)} />
  //               </div>
  //               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 max-h-96 overflow-y-auto p-4">
  //                 {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
  //                   <div key={p._id} onClick={() => toggleProductSelection(p._id)} className={`relative p-2 rounded-3xl cursor-pointer transition-all border-2 ${form.applicableProducts.includes(p._id) ? 'border-black dark:border-white bg-white dark:bg-[#222] scale-95 shadow-lg' : 'border-transparent opacity-60 grayscale'}`}>
  //                     <img src={p.images[0]?.url} alt={p.name} className="w-full aspect-square object-cover rounded-2xl mb-2" />
  //                     <p className="text-[9px] font-black uppercase truncate text-center px-1">{p.name}</p>
  //                     {form.applicableProducts.includes(p._id) && <FiCheckCircle className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black rounded-full p-0.5" size={18} />}
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>
  //           )}

  //           <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-6 rounded-[30px] font-black uppercase tracking-[10px] text-lg hover:shadow-2xl transition-all active:scale-[0.99]">
  //             {editId ? (language === "ar" ? "تحديث التغييرات" : "Save Changes") : (language === "ar" ? "تفعيل الكوبون" : "Activate Coupon")}
  //           </button>
  //         </form>
  //       </div>

  //       {/* Display Cards */}
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  //         {discounts.map(d => {
  //           const isExpired = new Date(d.expiresAt) < new Date();
  //           return (
  //             <div key={d._id} className={`bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-900 rounded-[35px] p-8 relative overflow-hidden group transition-all ${!d.isActive ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                
  //               <div className="flex justify-between items-start mb-6">
  //                 <div>
  //                   <h2 className="text-3xl font-black italic tracking-tighter">{d.code}</h2>
  //                   <button 
  //                     onClick={() => toggleActiveStatus(d._id, d.isActive)}
  //                     className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 mt-1 transition-colors ${d.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
  //                   >
  //                     <FiPower size={10} />
  //                     {d.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}
  //                   </button>
  //                 </div>
  //                 <div className="flex gap-2">
  //                   <button onClick={() => startEdit(d)} className="p-3 bg-white dark:bg-[#1a1a1a] rounded-full shadow-sm hover:bg-black hover:text-white transition-all"><FiEdit3 size={16}/></button>
  //                   <button onClick={() => deleteDiscount(d._id)} className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><FiTrash2 size={16}/></button>
  //                 </div>
  //               </div>

  //               <div className="mb-6 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800">
  //                 <p className="text-sm font-black uppercase italic">
  //                   {d.discountType === 'percentage' && `🔥 ${d.percentage}% OFF Order`}
  //                   {d.discountType === 'bogo' && `🛍 Buy ${d.buyQuantity} Get ${d.getQuantity} FREE`}
  //                   {d.discountType === 'bogo_discount' && `💸 ${d.getDiscount}% OFF On Item`}
  //                   {d.discountType === 'free_shipping' && `🚚 FREE SHIPPING`}
  //                 </p>
  //                 <div className="mt-2 flex items-center gap-2">
  //                   <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
  //                   <span className="text-[10px] font-bold uppercase opacity-60">{isExpired ? 'Expired' : 'Live Now'}</span>
  //                 </div>
  //               </div>

  //               {/* Selected Products List with Names */}
  //               <div className="space-y-3 mb-8">
  //                 <div className="flex items-center gap-2 opacity-40">
  //                   <FiPackage size={14} />
  //                   <span className="text-[10px] font-black uppercase tracking-widest">
  //                     {d.appliesToAll ? (language === "ar" ? "جميع المنتجات" : "All Products") : (language === "ar" ? "المنتجات المشمولة" : "Included Products")}
  //                   </span>
  //                 </div>
  //                 {!d.appliesToAll && (
  //                   <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide pr-2">
  //                     {d.applicableProducts?.map((p, i) => (
  //                       <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] p-2 rounded-xl border border-gray-50 dark:border-gray-800">
  //                         <img 
  //                           src={typeof p === 'object' ? p.images[0]?.url : products.find(prod => prod._id === p)?.images[0]?.url} 
  //                           className="w-8 h-8 rounded-lg object-cover" 
  //                           alt=""
  //                         />
  //                         <span className="text-[9px] font-black uppercase truncate flex-1">
  //                           {typeof p === 'object' ? p.name : products.find(prod => prod._id === p)?.name}
  //                         </span>
  //                       </div>
  //                     ))}
  //                   </div>
  //                 )}
  //               </div>

  //               <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
  //                 <div className="text-[10px] font-black uppercase opacity-30">Exp: {new Date(d.expiresAt).toLocaleDateString()}</div>
  //                 <div className="text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-1 rounded-full italic">Min: {d.minOrderAmount} EGP</div>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default Discounts;