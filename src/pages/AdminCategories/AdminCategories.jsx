import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { 
  Edit, Trash2, Plus, Image as ImageIcon, Move, Check, X, Search, 
  ListPlus, GripVertical, ArrowUpAz, ArrowDownAz, LayoutList 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const AdminCategories = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === "ar";
  const isDark = theme === "dark";

  // States
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState('manual'); // 'manual', 'newest', 'oldest'
  
  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', isActive: true, image: null });
  const [moveData, setMoveData] = useState({ fromId: '', toId: '' });
  const [selectedForBulk, setSelectedForBulk] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔄 جلب البيانات مع دعم الترتيب
  const fetchCategories = async (sort = sortType) => {
    setLoading(true);
    try {
      const sortParam = sort === 'newest' ? 'newest' : sort === 'oldest' ? 'oldest' : 'position';
      const res = await api.get(`/categories?sort=${sortParam}`);
      setCategories(res.data);
    } catch (err) {
      toast.error(isRTL ? "فشل تحميل الأقسام" : "Failed to load categories");
    } finally { setLoading(false); }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await api.get('/products');
      setAllProducts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchCategories(); 
    fetchAllProducts();
  }, [sortType]);

  // ↕️ دالة معالجة الترتيب اليدوي (Drag & Drop)
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    if (sortType !== 'manual') {
      toast.info(isRTL ? "يجب اختيار الوضع اليدوي للترتيب" : "Switch to Manual mode to reorder");
      return;
    }

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCategories(items);

    try {
      const newOrderIds = items.map(cat => cat._id || cat.id);
      await api.patch('/categories/reorder', { newOrderIds });
      toast.success(isRTL ? "تم حفظ الترتيب" : "Order saved");
    } catch (err) {
      toast.error(isRTL ? "فشل حفظ الترتيب" : "Failed to save order");
      fetchCategories();
    }
  };

  // 🔄 دالة حفظ الترتيب العالمي في قاعدة البيانات
  const saveGlobalSortToDB = async (type) => {
    if (type === 'manual') return;

    try {
      setLoading(true);
      await api.post('/categories/update-global-sort', { sortType: type });
      toast.success(isRTL ? "تم تثبيت الترتيب للجميع" : "Global sort updated for all");
      fetchCategories(type); 
    } catch (err) {
      toast.error(isRTL ? "فشل تحديث الترتيب العالمي" : "Failed to update global sort");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAddProducts = async () => {
    const catId = selectedForBulk?._id || selectedForBulk?.id;
    try {
      await api.patch(`/categories/${catId}/add-products`, {
        productIds: selectedProductIds
      });
      toast.success(isRTL ? "تمت إضافة المنتجات بنجاح" : "Products added successfully");
      setIsBulkAddModalOpen(false);
      setSelectedProductIds([]);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? "حدث خطأ ما" : "An error occurred"));
    }
  };

  const handleMoveProducts = async () => {
    try {
      await api.patch('/categories/move-products', {
        fromCategoryId: moveData.fromId,
        toCategoryId: moveData.toId
      });
      toast.success(isRTL ? "تم نقل المنتجات بنجاح" : "Products moved successfully");
      setIsMoveModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? "فشل النقل" : "Move failed"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isRTL ? "هل أنت متأكد من حذف القسم؟" : "Are you sure?")) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success(isRTL ? "تم حذف القسم بنجاح" : "Category deleted");
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || (isRTL ? "لا يمكن حذف قسم يحتوي على منتجات" : "Cannot delete category with products"));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('isActive', formData.isActive);
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, data);
        toast.success(isRTL ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await api.post('/categories', data);
        toast.success(isRTL ? "تم إنشاء القسم بنجاح" : "Category created");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', isActive: true, image: null });
      fetchCategories();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Error"); 
    }
  };

  const filteredProducts = allProducts.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`p-4 md:p-8 min-h-screen transition-colors duration-500 ${isDark ? "bg-[#050505] text-white" : "bg-gray-50 text-black"}`} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Header - Responsive Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start mt-16 md:items-center gap-6 mb-10">
        <div className="w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            {isRTL ? "الأقسام" : "Categories"}
            </h1>
            {/* Sort Controls - Flex Wrap for small screens */}
            <div className={`flex flex-wrap gap-1 mt-4 p-1 rounded-xl w-fit ${isDark ? "bg-zinc-900" : "bg-gray-200"}`}>
                <button 
                    onClick={() => setSortType('manual')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${sortType === 'manual' ? "bg-[#86FE05] text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                    <LayoutList size={14} /> {isRTL ? "يدوي" : "MANUAL"}
                </button>

                <button 
                    onClick={() => {
                        setSortType('newest');
                        saveGlobalSortToDB('newest');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${sortType === 'newest' ? "bg-[#86FE05] text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                    <ArrowDownAz size={14} /> {isRTL ? "الأحدث" : "NEWEST"}
                </button>

                <button 
                    onClick={() => {
                        setSortType('oldest');
                        saveGlobalSortToDB('oldest');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${sortType === 'oldest' ? "bg-[#86FE05] text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                    <ArrowUpAz size={14} /> {isRTL ? "الأقدم" : "OLDEST"}
                </button>
            </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-[#86FE05] text-black px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-[0_0_20px_#86FE05] transition-all text-sm uppercase">
          <Plus size={20} /> {isRTL ? "إضافة قسم" : "Add Category"}
        </button>
      </div>

      {/* Desktop View - Table (md and above) */}
      <div className="hidden md:block">
        <div className={`rounded-[2.5rem] overflow-hidden border ${isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200 shadow-xl"}`}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories-list">
              {(provided) => (
                <table 
                  className="w-full text-left border-collapse"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <thead className={isDark ? "bg-zinc-900/80" : "bg-gray-100"}>
                    <tr className={isRTL ? "text-right" : "text-left"}>
                      <th className="p-6 w-10"></th>
                      <th className="p-6 text-[10px] font-black uppercase opacity-50">{isRTL ? "الصورة" : "Image"}</th>
                      <th className="p-6 text-[10px] font-black uppercase opacity-50">{isRTL ? "الاسم" : "Name"}</th>
                      <th className={`p-6 text-[10px] font-black uppercase opacity-50 ${isRTL ? "text-left" : "text-right"}`}>{isRTL ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, index) => {
                      const id = cat._id || cat.id;
                      return (
                        <Draggable 
                          key={id} 
                          draggableId={id} 
                          index={index}
                          isDragDisabled={sortType !== 'manual'}
                        >
                          {(provided, snapshot) => (
                            <tr 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border-b transition-all ${snapshot.isDragging ? (isDark ? "bg-zinc-800" : "bg-gray-100") : ""} ${isDark ? "border-zinc-800/50 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                            >
                              <td className="p-6 w-10" {...provided.dragHandleProps}>
                                <GripVertical size={20} className={`transition-opacity ${sortType === 'manual' ? "opacity-40 hover:opacity-100 cursor-grab" : "opacity-5 cursor-not-allowed"}`} />
                              </td>

                              <td className="p-6">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800">
                                  {cat.image?.url ? (
                                    <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={20} /></div>
                                  )}
                                </div>
                              </td>
                              <td className="p-6 font-black italic text-xl uppercase tracking-tight">{cat.name}</td>
                              <td className="p-6">
                                <div className={`flex gap-3 ${isRTL ? "justify-start" : "justify-end"}`}>
                                  <button onClick={() => { setSelectedForBulk(cat); setIsBulkAddModalOpen(true); }} className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/40 transition-colors" title={isRTL ? "إضافة منتجات" : "Add Products"}><ListPlus size={18} /></button>
                                  <button onClick={() => { setMoveData({ ...moveData, fromId: id }); setIsMoveModalOpen(true); }} className="p-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/40 transition-colors" title={isRTL ? "نقل المنتجات" : "Move Products"}><Move size={18} /></button>
                                  <button onClick={() => { setEditingId(id); setFormData({ name: cat.name, isActive: cat.isActive, image: null }); setIsModalOpen(true); }} className="p-2 text-zinc-400 hover:text-white transition-colors"><Edit size={18} /></button>
                                  <button onClick={() => handleDelete(id)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Mobile View - Cards (below md) */}
      <div className="md:hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories-list-mobile">
            {(provided) => (
              <div 
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categories.map((cat, index) => {
                  const id = cat._id || cat.id;
                  return (
                    <Draggable 
                      key={id} 
                      draggableId={id} 
                      index={index}
                      isDragDisabled={sortType !== 'manual'}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200"} border rounded-2xl p-4 transition-all ${snapshot.isDragging ? (isDark ? "bg-zinc-800 shadow-lg" : "bg-gray-50 shadow-lg") : ""}`}
                        >
                          {/* Header with drag handle */}
                          <div className="flex items-center gap-3 mb-4">
                            <div {...provided.dragHandleProps}>
                              <GripVertical size={20} className={`transition-opacity ${sortType === 'manual' ? "opacity-40 hover:opacity-100 cursor-grab" : "opacity-5 cursor-not-allowed"}`} />
                            </div>
                            
                            {/* Image */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                              {cat.image?.url ? (
                                <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={20} /></div>
                              )}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black italic uppercase tracking-tight text-sm truncate">{cat.name}</h3>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => { setSelectedForBulk(cat); setIsBulkAddModalOpen(true); }} className="flex-1 p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 transition-colors text-xs font-bold flex items-center justify-center gap-1" title={isRTL ? "إضافة منتجات" : "Add Products"}><ListPlus size={16} /> {isRTL ? "منتجات" : "Add"}</button>
                            <button onClick={() => { setMoveData({ ...moveData, fromId: id }); setIsMoveModalOpen(true); }} className="flex-1 p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/40 transition-colors text-xs font-bold flex items-center justify-center gap-1" title={isRTL ? "نقل المنتجات" : "Move Products"}><Move size={16} /> {isRTL ? "نقل" : "Move"}</button>
                            <button onClick={() => { setEditingId(id); setFormData({ name: cat.name, isActive: cat.isActive, image: null }); setIsModalOpen(true); }} className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(id)} className="p-2 bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* --- Move Modal - Responsive Width --- */}
      <AnimatePresence>
        {isMoveModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className={`${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] w-full max-w-md border`}>
              <h2 className="text-xl md:text-2xl font-black mb-6 italic uppercase">{isRTL ? "نقل المنتجات" : "Move Products"}</h2>
              <select 
                className={`w-full p-4 rounded-2xl border mb-6 outline-none ${isDark ? "bg-black border-zinc-800" : "bg-gray-100 border-gray-200"}`}
                onChange={(e) => setMoveData({...moveData, toId: e.target.value})}
              >
                <option value="">{isRTL ? "اختر القسم الوجهة..." : "Select Target..."}</option>
                {categories.filter(c => (c._id || c.id) !== moveData.fromId).map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
  onClick={handleMoveProducts}
  className="flex-1 bg-[#86FE05] text-black font-black py-4 rounded-2xl uppercase text-xs"
>
  {isRTL ? "تأكيد" : "Confirm"}
</button>

<button
  onClick={() => setIsMoveModalOpen(false)}
  className="flex-1 border border-zinc-700 font-black py-4 rounded-2xl uppercase text-xs"
>
  {isRTL ? "إلغاء" : "Cancel"}
</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Bulk Add Modal - Responsive Height/Width --- */}
      <AnimatePresence>
        {isBulkAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className={`${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} border p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] w-full max-w-2xl h-[90vh] md:h-[85vh] flex flex-col`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-black italic uppercase truncate pr-4">{isRTL ? `إضافة إلى ${selectedForBulk?.name}` : `Add to ${selectedForBulk?.name}`}</h2>
                <button onClick={() => setIsBulkAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full shrink-0"><X /></button>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input type="text" placeholder={isRTL ? "ابحث عن منتج..." : "Search..."} className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none ${isDark ? "bg-black border-zinc-800" : "bg-gray-50 border-gray-200"}`} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredProducts.map(product => (
                  <div key={product._id || product.id} onClick={() => {
                    const id = product._id || product.id;
                    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
                  }} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${selectedProductIds.includes(product._id || product.id) ? "border-[#86FE05] bg-[#86FE05]/10" : isDark ? "border-zinc-800 hover:border-zinc-700" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <img src={product.images?.[0]?.url} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" alt="" />
                      <span className="font-bold text-sm uppercase truncate max-w-[150px] md:max-w-none">{product.name}</span>
                    </div>
                    {selectedProductIds.includes(product._id || product.id) && <Check className="text-[#86FE05]" size={20} />}
                  </div>
                ))}
              </div>
              <button onClick={handleBulkAddProducts} className="w-full bg-[#86FE05] text-black font-black py-5 rounded-2xl uppercase mt-6 shadow-xl active:scale-95 transition-transform">{isRTL ? "تأكيد الإضافة" : "Confirm Addition"}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Add/Edit Category Modal - Responsive --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    dir={isRTL ? "rtl" : "ltr"}
    className={`${
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
    } border p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] w-full max-w-md shadow-2xl`}
  >
    {/* TITLE */}
    <h2 className="text-xl md:text-2xl font-black italic uppercase mb-8">
      {editingId
        ? isRTL
          ? "تعديل قسم"
          : "Edit Category"
        : isRTL
        ? "إضافة قسم جديد"
        : "New Category"}
    </h2>

    <form onSubmit={handleSubmit} className="space-y-6">

      {/* NAME */}
      <input
        type="text"
        required
        placeholder={isRTL ? "اسم القسم" : "Category Name"}
        className={`w-full p-4 rounded-2xl border outline-none ${
          isDark ? "bg-black border-zinc-800" : "bg-gray-50 border-gray-200"
        }`}
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />

      {/* IMAGE */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-black opacity-40">
          {isRTL ? "صورة القسم" : "Category Image"}
        </span>

        <input
          type="file"
          className="text-xs file:bg-[#86FE05] file:border-none file:px-4 file:py-2 file:rounded-lg file:font-black file:cursor-pointer w-full"
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.files[0] })
          }
        />
      </div>

      {/* SAVE */}
      <button
        type="submit"
        className="w-full bg-[#86FE05] text-black font-black py-4 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform"
      >
        {isRTL ? "حفظ" : "Save"}
      </button>

      {/* CANCEL */}
      <button
        type="button"
        onClick={() => setIsModalOpen(false)}
        className="w-full border border-zinc-700 py-4 rounded-2xl uppercase text-xs opacity-50 hover:opacity-100 transition-opacity"
      >
        {isRTL ? "إلغاء" : "Cancel"}
      </button>
    </form>
  </motion.div>
</div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminCategories;
