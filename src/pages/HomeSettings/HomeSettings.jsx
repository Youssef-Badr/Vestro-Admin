import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify"; // التغيير للمكتبة المطلوبة

export default function HomeSettings() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // لمعاينة الصورة الجديدة قبل الرفع
  const [selectedFile, setSelectedFile] = useState(null); // لتخزين الملف المختار
  
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    isActive: true,
    image: { url: "", public_id: "" }
  });

  // 1. جلب البيانات عند التحميل
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings/hero");
        setFormData(res.data);
        if (res.data.image?.url) {
          setImagePreview(res.data.image.url);
        }
      } catch (err) {
        toast.error("فشل في جلب البيانات");
      }
    };
    fetchSettings();
  }, []);

  // 2. اختيار صورة جديدة (Local Preview)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); // عرض معاينة فورية
    }
  };

  // 3. حذف الصورة (من الواجهة)
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: { url: "", public_id: "" } });
  };

  // 4. حفظ التعديلات (إرسال FormData للباك-اند)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // نستخدم FormData لأننا نرسل ملف حقيقي
      const data = new FormData();
      data.append("titleAr", formData.titleAr);
      data.append("titleEn", formData.titleEn);
      data.append("subtitleAr", formData.subtitleAr);
      data.append("subtitleEn", formData.subtitleEn);
      data.append("isActive", formData.isActive);

      if (!imagePreview && !selectedFile) {
      data.append("removeImage", "true");
    }
      
      if (selectedFile) {
        data.append("image", selectedFile); // اسم الحقل 'image' مطابق للباك-اند
      }

      const res = await api.put("/settings/hero/update", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("تم التحديث بنجاح!");
      setFormData(res.data.settings);
      setSelectedFile(null); // تصغير الحالة بعد الرفع
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-300 mt-14">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter border-l-8 border-[#86FE05] pl-4">
          Home Page <span className="text-[#86FE05]">Settings</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl">
          
          {/* Status Switch */}
          <div className="flex items-center justify-between p-6 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div>
              <h3 className="font-bold text-lg">حالة قسم الهيرو (Hero Section)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">إظهار أو إخفاء البانر العلوي من الموقع تماماً</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`w-16 h-8 rounded-full transition-all relative ${formData.isActive ? "bg-[#86FE05]" : "bg-zinc-400 dark:bg-zinc-700"}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.isActive ? "left-9" : "left-1"}`} />
            </button>
          </div>

          {/* Text Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Arabic Content */}
            <div className="space-y-4 p-4 rounded-2xl bg-white dark:bg-black border border-gray-50 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#86FE05]">Arabic Version</span>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase">العنوان الرئيسي</label>
                <input
                  type="text"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-[#86FE05]/20 focus:border-[#86FE05] transition-all"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase">العنوان الفرعي</label>
                <textarea
                  rows="3"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-[#86FE05]/20 focus:border-[#86FE05] transition-all"
                  value={formData.subtitleAr}
                  onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })}
                />
              </div>
            </div>

            {/* English Content */}
            <div className="space-y-4 p-4 rounded-2xl bg-white dark:bg-black border border-gray-50 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#86FE05]">English Version</span>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase">Main Title</label>
                <input
                  type="text"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-[#86FE05]/20 focus:border-[#86FE05] transition-all"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase">Subtitle</label>
                <textarea
                  rows="3"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-[#86FE05]/20 focus:border-[#86FE05] transition-all"
                  value={formData.subtitleEn}
                  onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-wider">Banner Background Image</label>
            <div className="relative group border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl p-4 transition-all hover:border-[#86FE05]/50 bg-white dark:bg-black">
              {imagePreview ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Hero Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transform transition-transform hover:scale-105"
                    >
                      Delete Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
                  <div className="bg-[#86FE05]/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#86FE05]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">Click to upload banner</span>
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all shadow-lg ${
              loading 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-[#86FE05] text-black hover:bg-[#75e004] hover:shadow-[#86FE05]/20 active:scale-[0.98]"
            }`}
          >
            {loading ? "Processing..." : "Save Configuration"}
          </button>
        </form>
      </div>
    </div>
  );
}