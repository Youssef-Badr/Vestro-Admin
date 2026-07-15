/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";

const PendingReviews = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/products/pending-reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error(
        isArabic
          ? "فشل في جلب التقييمات المعلقة"
          : "Failed to load pending reviews"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleModerate = async (productId, reviewId, action) => {
    if (action === "reject") {
      const confirmDelete = window.confirm(
        isArabic
          ? "هل أنت متأكد من رفض وحذف هذا التقييم؟"
          : "Are you sure you want to reject and delete this review?"
      );
      if (!confirmDelete) return;
    }

    try {
      setActionLoading(reviewId);
      const res = await axios.put(`/products/reviews/${productId}/${reviewId}`, { action });
      
      toast.success(
        isArabic
          ? action === "approve"
            ? "تم قبول ونشر التقييم بنجاح!"
            : "تم حذف التقييم بنجاح"
          : res.data.message
      );

      setReviews((prev) => prev.filter((item) => item.reviewId !== reviewId));
    } catch (err) {
      console.error("Error moderating review:", err);
      toast.error(
        isArabic
          ? "حدث خطأ أثناء معالجة التقييم"
          : "Error updating review status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${
              i < rating 
                ? "text-red-750 fill-red-700" 
                : "text-gray-200 dark:text-zinc-800 fill-none"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.583-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-gray-500 dark:text-zinc-400 gap-3">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-zinc-800 border-t-red-700 rounded-full animate-spin"></div>
        <p className="text-xs font-bold">
          {isArabic ? "جاري تحميل التقييمات المعلقة..." : "Loading pending reviews..."}
        </p>
      </div>
    );
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen p-4 sm:p-6 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* هيدر الصفحة والتحكم */}
        <div className="relative overflow-hidden p-5 rounded-2xl border border-gray-150 dark:border-zinc-900 bg-gray-50/50 dark:bg-[#111]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* خط جمالي جانبي */}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-700"></div>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase flex items-center gap-2">
              {isArabic ? "مراجعة التقييمات" : "Review Moderation"}
              <span className="text-[10px] bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-500 border border-red-200/50 dark:border-red-900/30 px-2 py-0.5 rounded-md font-bold">
                {isArabic ? "معلقة" : "Pending"}
              </span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 mt-1 text-xs">
              {isArabic
                ? "إدارة وقبول آراء العملاء المعلقة لمتجر VESTRO."
                : "Manage and moderate pending customer reviews for VESTRO store."}
            </p>
          </div>

          <button
            onClick={fetchPendingReviews}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 text-black dark:text-zinc-200 border border-gray-200 dark:border-zinc-800 rounded-lg font-black text-xs transition-all active:scale-[0.95] shadow-sm"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
            </svg>
            {isArabic ? "تحديث القائمة" : "Refresh"}
          </button>
        </div>

        {/* شبكة التقييمات - Responsive Grid تدعم من شاشات الموبايل الصغيرة حتى شاشات الـ 4K */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-[#111]/30 border border-gray-150 dark:border-zinc-900 rounded-2xl relative overflow-hidden">
            {/* دائرة ديكورية خلفية */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-700/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-red-700/5 border border-red-700/10 text-red-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-base font-black">
              {isArabic ? "لا توجد تقييمات معلقة حالياً" : "No pending reviews"}
            </h3>
            <p className="text-gray-400 dark:text-zinc-500 mt-1 text-xs max-w-xs mx-auto">
              {isArabic
                ? "تمت مراجعة جميع آراء العملاء المضافة بنجاح."
                : "All submitted reviews have been moderated."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reviews.map((review) => (
              <div
                key={review.reviewId}
                className="group relative rounded-xl border border-gray-150 dark:border-zinc-900 bg-white dark:bg-[#111] p-4 flex flex-col justify-between gap-4 hover:border-red-700/30 dark:hover:border-red-700/40 hover:shadow-lg transition-all duration-200"
              >
                {/* شريط جمالي علوي يظهر عند تمرير الماوس (Hover) */}
                <span className="absolute top-0 left-4 right-4 h-0.5 bg-red-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-350 origin-center"></span>

                {/* البيانات الأساسية */}
                <div className="space-y-3">
                  {/* رأس الكارت (صورة المنتج ومعلومات بسيطة) */}
                  <div className="flex items-center gap-2.5">
                    {review.productImage ? (
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-zinc-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-zinc-900 text-gray-400 dark:text-zinc-650 border border-gray-100 dark:border-zinc-800 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="block text-[9px] font-black text-red-750 uppercase tracking-wider">
                        {isArabic ? "المنتج" : "Product"}
                      </span>
                      <p className="text-xs font-black truncate group-hover:text-red-750 transition-colors">
                        {review.productName}
                      </p>
                    </div>
                  </div>

                  {/* خط فاصل داخلي رفيع جداً */}
                  <div className="border-t border-gray-100 dark:border-zinc-900/60 pt-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{review.name}</span>
                        <span className="text-[9px] text-gray-400 dark:text-zinc-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            isArabic ? "ar-EG" : "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/* تعليق العميل (صغير ومريح للقراءة) */}
                    <div className="mt-2.5 p-2.5 rounded-lg text-xs italic leading-relaxed whitespace-pre-wrap bg-gray-50/70 dark:bg-black/30 border border-gray-100/50 dark:border-zinc-900/40 text-gray-600 dark:text-zinc-400">
                      &ldquo; {review.comment || (isArabic ? "لا توجد رسالة نصية..." : "No text comment...")} &rdquo;
                    </div>
                  </div>
                </div>

                {/* أزرار التحكم والعمليات المدمجة بالتساوي */}
                <div className="flex items-center gap-2 pt-1">
                  {/* قبول ونشر */}
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleModerate(review.productId, review.reviewId, "approve")}
                    className="flex-1 py-1.5 px-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-100 dark:disabled:bg-zinc-900 text-white font-black text-xs rounded-lg transition-all active:scale-[0.96] flex items-center justify-center gap-1"
                  >
                    {actionLoading === review.reviewId ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {isArabic ? "قبول" : "Approve"}
                      </>
                    )}
                  </button>

                  {/* رفض */}
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleModerate(review.productId, review.reviewId, "reject")}
                    className="py-1.5 px-2.5 font-bold text-xs rounded-lg transition-all border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-850 text-gray-600 dark:text-zinc-400 active:scale-[0.96] flex items-center justify-center gap-1"
                  >
                    {actionLoading === review.reviewId ? (
                      <span className="w-3.5 h-3.5 border-2 border-gray-400 dark:border-zinc-650 border-t-zinc-300 dark:border-t-zinc-500 rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {isArabic ? "رفض" : "Reject"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* فوتر بسيط وراقي */}
        <p className="text-center text-[9px] tracking-widest uppercase pt-6 border-t border-gray-100 dark:border-zinc-950 text-gray-400 dark:text-zinc-600">
          VESTRO STORE SECURE PANEL &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default PendingReviews;