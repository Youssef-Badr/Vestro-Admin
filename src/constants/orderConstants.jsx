// src/constants/orderConstants.js

export const ORDER_STATUS_CONFIG = {
  // 1. حالات البداية (مطابقة للباكيند)
  Placed: { 
    ar: "اوردر جديد", 
    en: "New Order", 
    color: "#86FE05", 
    icon: "✨",
    description: { ar: "تم استلام الطلب بنجاح", en: "Order successfully placed" }
  },
  Confirmed: { 
    ar: "تم التأكيد", 
    en: "Confirmed", 
    color: "#00E5FF", 
    icon: "✔️",
    description: { ar: "تم مراجعة الطلب وتأكيده", en: "Order reviewed and confirmed" }
  },

  // 2. حالات التجهيز والشحن
  Processing: { 
    ar: "جاري التجهيز", 
    en: "Processing", 
    color: "#FFD700", 
    icon: "📦",
    description: { ar: "الطلب قيد التغليف الآن", en: "Order is being packed" }
  },
  Shipped: { 
    ar: "تم الشحن", 
    en: "Shipped", 
    color: "#9370DB", 
    icon: "🚚",
    description: { ar: "الطلب مع شركة الشحن", en: "Order is with the courier" }
  },
  Out_for_Delivery: { 
    ar: "جاري التوصيل", 
    en: "Out for Delivery", 
    color: "#00BFFF", 
    icon: "📍",
    description: { ar: "المندوب في طريقه إليك", en: "Courier is on the way" }
  },

  // 3. حالات النهاية الناجحة
  Delivered: { 
    ar: "تم التسليم", 
    en: "Delivered", 
    color: "#00FF00", 
    icon: "✅",
    description: { ar: "تم استلام الطلب بنجاح", en: "Order delivered successfully" }
  },

  // 4. حالات الدفع (عشان تظهر في الداشبورد صح)
  Paid: { 
    ar: "تم الدفع", 
    en: "Paid", 
    color: "#86FE05", 
    icon: "💰",
    description: { ar: "تم تحصيل المبلغ بنجاح", en: "Payment received successfully" }
  },
  Pending_Payment: { 
    ar: "في انتظار الدفع", 
    en: "Pending Payment", 
    color: "#FFA500", 
    icon: "⏳",
    description: { ar: "بإنتظار إتمام عملية الدفع", en: "Waiting for payment completion" }
  },

  // 5. حالات المشاكل والانتظار
  On_Hold: { 
    ar: "قيد الانتظار", 
    en: "On Hold", 
    color: "#FFA500", 
    icon: "⚠️",
    description: { ar: "هناك مشكلة تحتاج تواصل", en: "A issue requires contact" }
  },
  Failed_Attempt: { 
    ar: "فشل توصيل", 
    en: "Failed Attempt", 
    color: "#FF4500", 
    icon: "🚫",
    description: { ar: "لم يتم الرد على المندوب", en: "No response to courier" }
  },

  // 6. حالات الإلغاء والارتجاع
  Cancelled: { 
    ar: "ملغي", 
    en: "Cancelled", 
    color: "#FF3B3B", 
    icon: "❌",
    description: { ar: "تم إلغاء الطلب", en: "Order has been cancelled" }
  },
  Returned: { 
    ar: "مرتجع", 
    en: "Returned", 
    color: "#708090", 
    icon: "🔙",
    description: { ar: "تم إرجاع المنتج للمخزن", en: "Product returned to warehouse" }
  },
  Exchange_Requested: { 
    ar: "طلب استبدال", 
    en: "Exchange Requested", 
    color: "#FF8C00", 
    icon: "🔄",
    description: { ar: "العميل يرغب في الاستبدال", en: "Customer wants an exchange" }
  },
  Refunded: { 
    ar: "تم رد المبلغ", 
    en: "Refunded", 
    color: "#4682B4", 
    icon: "💸",
    description: { ar: "تم إعادة الأموال للعميل", en: "Money refunded to customer" }
  }
};

export const STATUS_OPTIONS = Object.keys(ORDER_STATUS_CONFIG);