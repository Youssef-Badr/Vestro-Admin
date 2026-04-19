import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";

const Payments = () => {
  const { language } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "/orders"
      );
      setOrders(res.data);
    } catch {
      toast.error(
        language === "ar"
          ? "فشل في تحميل الطلبات"
          : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="p-6 max-w-6xl mx-auto bg-gray-900 min-h-screen text-gray-100 mt-16 rounded-lg shadow-lg pt-16 md:pt-0"
      style={{ textAlign: language === "ar" ? "right" : "left" }}
    >
      <h1 className="text-3xl font-extrabold mb-8 text-indigo-400 border-b border-indigo-600 pb-3">
        {language === "ar" ? "نظرة عامة على المدفوعات" : "Payments Overview"}
      </h1>

      {loading ? (
        <p className={`text-center text-gray-400 ${language === "ar" ? "text-right" : "text-left"}`}>
          {language === "ar" ? "جارٍ تحميل الطلبات..." : "Loading orders..."}
        </p>
      ) : orders.length === 0 ? (
        <p className={`text-center text-gray-500 ${language === "ar" ? "text-right" : "text-left"}`}>
          {language === "ar" ? "لا توجد طلبات." : "No orders found."}
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              <div
                className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 ${
                  language === "ar" ? "xl:flex-row-reverse" : ""
                }`}
              >
                <div className={`${language === "ar" ? "text-right" : "text-left"}`}>
                  <p className="mb-1 text-indigo-300 font-semibold">
                    {language === "ar" ? "العميل:" : "Customer:"}{" "}
                    <span className="text-gray-200 " >
                      {order.guestInfo?.name || (language === "ar" ? "مجهول" : "Unknown")}
                    </span>{" "}
                    -{" "}
                    <span className="text-gray-200" >
                      {order.guestInfo?.phone || (language === "ar" ? "لا يوجد هاتف" : "No phone")}
                    </span>
                  </p>
                  <p className="mb-1 text-indigo-300 font-semibold">
                    {language === "ar" ? "طريقة الدفع:" : "Payment Method:"}{" "}
                    <span className="text-gray-200 capitalize">
                      {order.paymentMethod}
                    </span>
                  </p>

                  {!order.proofImage?.url &&
                    !order.paymentProof &&
                    order.transactionId && (
                      <p className="text-gray-400 mt-2">
                        <strong>
                          {language === "ar" ? "رقم المعاملة:" : "Transaction ID:"}
                        </strong>{" "}
                        {order.transactionId}
                      </p>
                    )}

                  {!order.proofImage?.url &&
                    !order.paymentProof &&
                    !order.transactionId && (
                      <p className="text-red-500 mt-2">
                        {language === "ar"
                          ? "لم يتم تقديم إثبات الدفع"
                          : "No payment proof provided"}
                      </p>
                    )}
                </div>

                {["vodafone cash", "instapay"].includes(
                  order.paymentMethod?.toLowerCase()
                ) &&
                  (order.proofImage?.url || order.paymentProof) && (
                    <img
                    
                      src={order.proofImage?.url || order.paymentProof}
                      alt={
                        language === "ar"
                          ? "إثبات الدفع"
                          : "Payment Proof"
                      }
                      className="cursor-pointer rounded-lg max-w-[150px] xl:max-w-[120px] self-center border border-indigo-500 hover:border-indigo-400 transition duration-300 shadow-lg"
                      onClick={() =>
                        setModalImage(order.proofImage?.url || order.paymentProof)
                      }
                      title={
                        language === "ar"
                          ? "اضغط للتكبير"
                          : "Click to enlarge"
                      }
                    />
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-pointer"
        >
          <img
            src={modalImage}
            alt={
              language === "ar"
                ? "إثبات الدفع مكبر"
                : "Payment Proof Enlarged"
            }
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-8 right-8 text-white text-4xl font-extrabold hover:text-indigo-400 transition duration-200"
            aria-label={language === "ar" ? "إغلاق النافذة" : "Close modal"}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default Payments;
