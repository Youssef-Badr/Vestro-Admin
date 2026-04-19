import React, { useEffect, useState } from 'react';
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from 'react-toastify';
import { Loader2, Phone, Trash2, CheckCircle } from "lucide-react";

const AbandonedOrders = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      // بنكلم الرووت اللي إنت لسه عامله
      const res = await axios.get('/orders/abandoned');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      toast.error(language === "ar" ? "فشل في جلب البيانات" : "Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteOrder = async (id) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف هذه السلة؟" : "Are you sure?")) return;
    try {
      await axios.delete(`/orders/${id}`);
      toast.success(language === "ar" ? "تم الحذف" : "Deleted");
      fetchData();
    } catch {
      toast.error(language === "ar" ? "فشل الحذف" : "Failed to delete");
    }
  };

  // الدالة اللي هتحول الأوردر لـ Paid وتخليه يظهر في صفحة Orders العادية
  const handleMarkAsPaid = async (id) => {
    if (!window.confirm(language === "ar" ? "هل أكمل العميل الدفع يدوياً؟" : "Mark as paid?")) return;
    try {
      // بنبعت طلب تحديث الحالة لـ Paid و Processing
      await axios.put(`/orders/${id}/status`, { status: "Paid" });
      toast.success(language === "ar" ? "تم تحويل الطلب للأوردرات بنجاح" : "Moved to Orders");
      fetchData(); // هيختفي من هنا لأنه مابقاش Abandoned
    } catch {
      toast.error("Error updating status");
    }
  };

  const openWhatsApp = (phone) => {
    const message = language === "ar" 
      ? "أهلاً بك من Vestro، لاحظنا وجود طلب غير مكتمل في سلتك، هل تواجه مشكلة في الدفع؟" 
      : "Hi from Vestro, we noticed an incomplete order in your cart.";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    return (
      order.guestInfo?.name?.toLowerCase().includes(q) ||
      order.guestInfo?.phone?.includes(search)
    );
  });

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen pt-16 md:pt-0 text-gray-900 dark:text-gray-100" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            ⚠️ {language === "ar" ? "السلات المتروكة" : "Abandoned Carts"}
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={language === "ar" ? "🔍 بحث بالاسم أو الهاتف..." : "🔍 Search with phone..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded-md transition hover:bg-blue-700">
             {language === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-t-4 border-amber-500 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                    {order.status}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => deleteOrder(order._id)} className="p-1 text-red-500 hover:bg-red-50 rounded transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                   {/* قائمة المنتجات المعدلة */}
                   <ul className="list-none space-y-3 border-b pb-3 dark:border-gray-700">
                    {order.orderItems.map((item, idx) => (
                      <li key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-md">
                        {/* اسم المنتج بارز */}
                        <div className="font-bold text-sm text-blue-700 dark:text-blue-400 mb-1 uppercase">
                          {item.name}
                        </div>
                        {/* تفاصيل السعر والكمية واللون */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.quantity} × {item.price} EGP
                          </span>
                          <span className="text-[10px] bg-white dark:bg-gray-600 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-500">
                            {item.color} / {item.size}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* بيانات العميل */}
                  <div className="text-sm space-y-1 pt-2">
                    <p><span className="font-bold">{language === "ar" ? "الاسم:" : "Name:"}</span> {order.guestInfo?.name}</p>
                    <p><span className="font-bold">{language === "ar" ? "الهاتف:" : "Phone:"}</span> {order.guestInfo?.phone}</p>
                    <p><span className="font-bold">{language === "ar" ? "المدينة:" : "City:"}</span> {order.shippingAddress?.city}</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-2">
                      {order.totalPrice} EGP
                    </p>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="mt-6 flex gap-2 border-t pt-4 dark:border-gray-700">
                <button 
                  onClick={() => handleMarkAsPaid(order._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md flex items-center justify-center gap-1 text-xs font-bold transition"
                >
                  <CheckCircle size={16} /> {language === "ar" ? "تم الدفع" : "Paid"}
                </button>
                <button 
                  onClick={() => openWhatsApp(order.guestInfo?.phone)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-white py-2 rounded-md flex items-center justify-center gap-1 text-xs font-bold transition"
                >
                  <Phone size={16} className="text-green-500" /> WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AbandonedOrders;