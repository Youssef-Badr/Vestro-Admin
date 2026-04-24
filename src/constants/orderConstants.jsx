// src/constants/orderConstants.js
export const ORDER_STATUS_CONFIG = {
  // =========================
  // 🟢 ORDER LIFECYCLE
  // =========================

  Placed: {
    ar: "اوردر جديد",
    en: "New Order",
    color: "#DC2626",
    icon: "✨",
  },

  Confirmed: {
    ar: "تم التأكيد",
    en: "Confirmed",
    color: "#00E5FF",
    icon: "✔️",
  },

  Processing: {
    ar: "جاري التجهيز",
    en: "Processing",
    color: "#FFD700",
    icon: "⚙️",
  },

  Packed: {
    ar: "تم التعبئة",
    en: "Packed",
    color: "#FFA500",
    icon: "📦",
  },

  Ready_For_Shipment: {
    ar: "جاهز للشحن",
    en: "Ready for Shipment",
    color: "#FFB020",
    icon: "🚀",
  },

  Shipped: {
    ar: "تم الشحن",
    en: "Shipped",
    color: "#7C3AED",
    icon: "🚚",
  },

  Out_for_Delivery: {
    ar: "جاري التوصيل",
    en: "Out for Delivery",
    color: "#00BFFF",
    icon: "📍",
  },

  Delivered: {
    ar: "تم التسليم",
    en: "Delivered",
    color: "#00FF7F",
    icon: "✅",
  },

  // =========================
  // 💳 PAYMENT
  // =========================

  Pending_Payment: {
    ar: "في انتظار الدفع",
    en: "Pending Payment",
    color: "#FFA500",
    icon: "⏳",
  },

  Paid: {
    ar: "تم الدفع",
    en: "Paid",
    color: "#22C55E",
    icon: "💰",
  },

  Payment_Failed: {
    ar: "فشل الدفع",
    en: "Payment Failed",
    color: "#EF4444",
    icon: "❌",
  },

  Refunded: {
    ar: "تم رد المبلغ",
    en: "Refunded",
    color: "#60A5FA",
    icon: "💸",
  },

  Partially_Refunded: {
    ar: "استرجاع جزئي",
    en: "Partially Refunded",
    color: "#38BDF8",
    icon: "↩️",
  },

  // =========================
  // ⚠️ ISSUES / OPERATIONS
  // =========================

  On_Hold: {
    ar: "قيد الانتظار",
    en: "On Hold",
    color: "#F59E0B",
    icon: "⚠️",
  },

  Delayed: {
    ar: "متأخر",
    en: "Delayed",
    color: "#F97316",
    icon: "⏱️",
  },

  Failed_Attempt: {
    ar: "فشل التوصيل",
    en: "Failed Attempt",
    color: "#EF4444",
    icon: "🚫",
  },

  Address_Issue: {
    ar: "مشكلة في العنوان",
    en: "Address Issue",
    color: "#FB7185",
    icon: "📍",
  },

  Customer_Unreachable: {
    ar: "العميل غير متاح",
    en: "Customer Unreachable",
    color: "#9CA3AF",
    icon: "📵",
  },

  Rescheduled: {
    ar: "تم إعادة الجدولة",
    en: "Rescheduled",
    color: "#A78BFA",
    icon: "🔁",
  },

  // =========================
  // 🔄 RETURNS / EXCHANGE
  // =========================

  Return_Requested: {
    ar: "طلب استرجاع",
    en: "Return Requested",
    color: "#F97316",
    icon: "↩️",
  },

  Return_Approved: {
    ar: "تم قبول الاسترجاع",
    en: "Return Approved",
    color: "#34D399",
    icon: "✅",
  },

  Returned: {
    ar: "مرتجع",
    en: "Returned",
    color: "#64748B",
    icon: "📦",
  },

  Exchange_Requested: {
    ar: "طلب استبدال",
    en: "Exchange Requested",
    color: "#F59E0B",
    icon: "🔄",
  },

  Exchange_Approved: {
    ar: "تم قبول الاستبدال",
    en: "Exchange Approved",
    color: "#22C55E",
    icon: "✅",
  },

  Exchange_Shipped: {
    ar: "تم شحن الاستبدال",
    en: "Exchange Shipped",
    color: "#8B5CF6",
    icon: "🚚",
  },

  // =========================
  // 🏭 WAREHOUSE
  // =========================

  In_Warehouse: {
    ar: "في المخزن",
    en: "In Warehouse",
    color: "#94A3B8",
    icon: "🏭",
  },

  Quality_Check: {
    ar: "فحص الجودة",
    en: "Quality Check",
    color: "#06B6D4",
    icon: "🔬",
  },

  Packaging: {
    ar: "جاري التغليف",
    en: "Packaging",
    color: "#EAB308",
    icon: "📦",
  },

  Assigned_To_Courier: {
    ar: "تم إسناده للمندوب",
    en: "Assigned to Courier",
    color: "#3B82F6",
    icon: "🧑‍✈️",
  },
};


export const STATUS_OPTIONS = Object.keys(ORDER_STATUS_CONFIG);