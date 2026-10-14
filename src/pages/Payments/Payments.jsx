import { useCallback, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";

const PAGE_SIZE = 20;

const isWalletPaymentOrder = (order) => {
  const method = String(order.paymentMethod || "").trim().toLowerCase();
  return ["instapay", "insta pay", "انستا باي", "إنستا باي"].includes(method);
};

const Payments = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const visibleOrders = orders.filter(isWalletPaymentOrder);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/orders", {
        params: {
          paymentMethod: "manual_transfer",
          includePendingPayment: true,
          page,
          limit: PAGE_SIZE,
        },
      });
      setOrders(Array.isArray(data.orders) ? data.orders.filter(isWalletPaymentOrder) : []);
      setTotalPages(Math.max(1, data.totalPages || 1));
    } catch {
      toast.error(isRTL ? "فشل تحميل طلبات إنستا باي" : "Failed to load wallet transfer orders");
    } finally {
      setLoading(false);
    }
  }, [isRTL, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const markAsPaid = async (orderId) => {
    try {
      await axios.put(`/orders/${orderId}/pay/admin`);
      toast.success(isRTL ? "تم تأكيد الدفع" : "Payment confirmed");
      fetchOrders();
    } catch {
      toast.error(isRTL ? "تعذر تأكيد الدفع" : "Could not confirm payment");
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-white px-4 py-4 text-black transition-colors dark:bg-black dark:text-white md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 border-b border-black/10 pb-3 text-3xl font-extrabold dark:border-white/10">
          {isRTL ? "مدفوعات إنستا باي" : "Wallet Transfer Payments"}
        </h1>
        <p className="mb-8 text-sm text-black/60 dark:text-white/60">
          {isRTL ? "طلبات العملاء وإثباتات التحويل المرفوعة" : "Customer orders and uploaded transfer receipts"}
        </p>

        {loading ? (
          <p className="py-12 text-center text-black/50 dark:text-white/50">{isRTL ? "جارٍ تحميل الطلبات..." : "Loading payments..."}</p>
        ) : visibleOrders.length === 0 ? (
          <p className="py-12 text-center text-black/50 dark:text-white/50">{isRTL ? "لا توجد طلبات إنستا باي" : "No wallet transfer orders found"}</p>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => {
              const proofUrl = order.proofImage?.url || order.paymentProof;
              const customerName = order.guestInfo?.name || order.customerName || (isRTL ? "عميل" : "Customer");
              const isPaid = Boolean(order.isPaid);

              return (
                <article key={order._id} className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-bold">{customerName}</p>
                    <p className="text-sm text-black/65 dark:text-white/65">{isRTL ? "الهاتف:" : "Phone:"} {order.guestInfo?.phone || "—"}</p>
                    <p className="text-sm text-black/65 dark:text-white/65">{isRTL ? "رقم الطلب:" : "Order:"} {order._id}</p>
                    <p className="text-sm text-black/65 dark:text-white/65">{isRTL ? "الإجمالي:" : "Total:"} {order.totalPrice?.toLocaleString(isRTL ? "ar-EG" : "en-US")} {isRTL ? "ج.م" : "EGP"}</p>
                    <p className="text-sm text-black/50 dark:text-white/50">{new Date(order.createdAt).toLocaleString(isRTL ? "ar-EG" : "en-US")}</p>
                    <span className="inline-flex rounded-full border border-black/15 px-3 py-1 text-xs font-bold dark:border-white/20">
                      {isPaid ? (isRTL ? "تم تأكيد الدفع" : "Paid") : (isRTL ? "بانتظار المراجعة" : "Awaiting review")}
                    </span>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    {proofUrl ? (
                      <button type="button" onClick={() => setModalImage(proofUrl)} className="rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                        <img src={proofUrl} alt={isRTL ? "إثبات الدفع" : "Payment proof"} className="h-32 w-32 rounded-lg border border-black/20 object-cover dark:border-white/20" />
                      </button>
                    ) : (
                      <p className="text-sm text-black/50 dark:text-white/50">{isRTL ? "لا توجد صورة إثبات" : "No payment proof attached"}</p>
                    )}
                    {!isPaid && (
                      <button type="button" onClick={() => markAsPaid(order._id)} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                        {isRTL ? "تأكيد الدفع" : "Mark as paid"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <nav dir="ltr" aria-label={isRTL ? "ترقيم صفحات المدفوعات" : "Payments pagination"} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" dir={isRTL ? "rtl" : "ltr"} disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="min-w-24 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white dark:text-black">
            {isRTL ? "السابق" : "Previous"}
          </button>
          <span dir={isRTL ? "rtl" : "ltr"} className="min-w-28 rounded-xl border border-black/10 px-4 py-2 text-center text-sm font-bold text-black/70 dark:border-white/15 dark:text-white/70">
            {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <button type="button" dir={isRTL ? "rtl" : "ltr"} disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="min-w-24 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white dark:text-black">
            {isRTL ? "التالي" : "Next"}
          </button>
        </nav>
      </div>

      {modalImage && (
        <div onClick={() => setModalImage(null)} className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 p-4">
          <img src={modalImage} alt={isRTL ? "إثبات الدفع مكبر" : "Payment proof enlarged"} className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain" onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={() => setModalImage(null)} className="absolute right-6 top-4 text-4xl text-white" aria-label={isRTL ? "إغلاق" : "Close"}>&times;</button>
        </div>
      )}
    </div>
  );
};

export default Payments;
