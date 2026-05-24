import { useEffect, useState,useMemo,useRef, useCallback   } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext"; // تأكد أن المسار صح حسب ترتيب ملفاتك
import { ORDER_STATUS_CONFIG, STATUS_OPTIONS } from "../../constants/orderConstants";
import { Clock, X, Calendar, User, ArrowRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const Orders = () => {
  const { language } = useLanguage();
const { theme } = useTheme(); 
  const darkMode = theme === "dark";
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null); // الأوردر اللي بنعدله حالياً
  const [coupons, setCoupons] = useState([]); // لإحضار أكواد الخصم من الداتابيز
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [auditOrder, setAuditOrder] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [cities, setCities] = useState([]);
const [districts, setDistricts] = useState([]);
const [debouncedSearch, setDebouncedSearch] = useState(search);
const [shipmentTypeFilter, setShipmentTypeFilter] = useState("Delivery");
const [shipmentTypes, setShipmentTypes] = useState([]);
const [shipmentStatuses, setShipmentStatuses] = useState([]);
const [shipmentStatusFilter, setShipmentStatusFilter] = useState("all");
const [financeStatuses, setFinanceStatuses] = useState([]);
const [statusFilter, setStatusFilter] = useState("all");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [openMenu, setOpenMenu] = useState(null);
const [pageSize, setPageSize] = useState(30); // القيمة الافتراضية اللي طلبها العميل
const [totalOrders, setTotalOrders] = useState(0); // العدد الإجمالي اللي جاي من السيرفر  const openEditModal = (order) => {
const filters = {
  statusFilter,
  startDate,
  endDate,
  currentPage,
  pageSize,
  showArchived,
  debouncedSearch,
};
const formatWhatsappNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/\D/g, ""); // يشيل + وأي رموز
};

const fetchShipmentTypes = async () => {
  try {
    const res = await axios.get("/orders/shipment-types");

    setShipmentTypes(res.data || []);
  } catch (err) {
    console.log(err);
  }
};

const fetchShipmentStatuses = async (type) => {
  try {
    const res = await axios.get(
      `/orders/shipment-statuses/${type}`
    );

    setShipmentStatuses(res.data || []);
  } catch (err) {
    console.log(err);
  }
};

const getCurrentShipmentStatus = (order) => {
  if (order.shipmentType === "Delivery") return order.deliveryStatus;
  if (order.shipmentType === "Exchange") return order.exchangeStatus;
  if (order.shipmentType === "Return") return order.returnStatus;
  return order.status;
};

const updateShipmentStatus = async (id, status) => {
  try {
    await axios.put("/orders/shipment-status", {
      id,
      status,
    });

    toast.success("Status updated");

    setOrders((prev) =>
      prev.map((o) => {

        if (o._id !== id) return o;

        // ✅ Delivery
        if (o.shipmentType === "Delivery") {
          return {
            ...o,
            deliveryStatus: status,
          };
        }

        // ✅ Exchange
        if (o.shipmentType === "Exchange") {
          return {
            ...o,
            exchangeStatus: status,
          };
        }

        // ✅ Return
        if (o.shipmentType === "Return") {
          return {
            ...o,
            returnStatus: status,
          };
        }

        return o;
      })
    );

  } catch (err) {
    toast.error("Failed to update status");
  }
};

const fetchFinanceStatuses = async () => {
  try {
    const res = await axios.get("/orders/finance-statuses");
    setFinanceStatuses(res.data || []);
  } catch (err) {
    console.log(err);
  }
};

const updateFinanceStatus = async (id, financeStatus) => {
  try {
    await axios.put("/orders/finance-status", {
      id,
      financeStatus,
    });

    toast.success("Finance status updated");

    setOrders((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, financeStatus } : o
      )
    );
  } catch (err) {
    toast.error("Failed to update finance status");
  }
};

const updateShipmentType = async (id, shipmentType) => {
  try {
    await axios.put("/orders/shipment-type", {
      id,
      shipmentType,
    });

    toast.success("Shipment type updated");

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o._id !== id) return o;

        return {
          ...o,
          shipmentType,

          deliveryStatus:
            shipmentType === "Delivery"
              ? "Placed"
              : null,

          exchangeStatus:
            shipmentType === "Exchange"
              ? "Exchange_Requested"
              : null,

          returnStatus:
            shipmentType === "Return"
              ? "Return_Requested"
              : null,
        };
      });

      // 🔥 مهم جدًا: رجّع نفس ترتيب الفلتر الحالي
      return updated.filter((o) => {
        if (shipmentTypeFilter === "all") return true;
        return o.shipmentType === shipmentTypeFilter;
      });
    });

  } catch (err) {
    toast.error("Failed to update shipment type");
  }
};


useEffect(() => {
  fetchFinanceStatuses();
}, []);




useEffect(() => {
  fetchShipmentTypes();
}, []);

useEffect(() => {
  fetchShipmentStatuses(shipmentTypeFilter);

  setStatusFilter("all");
}, [shipmentTypeFilter]);

useEffect(() => {
  const handleClickOutside = () => {
    setOpenMenu(null);
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);



  const openEditModal = (order) => {
    setEditingOrder(JSON.parse(JSON.stringify(order))); // نسخة عميقة للأوردر
    fetchCoupons(); // تحديث الأكواد
    setIsEditModalOpen(true); // فتح المودال
  };


const handleUpdateOrder = async () => {
  try {
    console.log("🟡 START UPDATE ORDER");

     const itemsToSubmit = editingOrder.orderItems.map((item, index) => {
  const isBundle = item.isBundle;

  // ===================== BUNDLE =====================
  if (isBundle) {
    const cleanBundleItems = Array.isArray(item.bundleItems)
      ? item.bundleItems.map((bi) => ({
          product: bi.product,

          variantId: bi.variantId || "",

          name: bi.name || "",
          image: bi.image || "",

          price: Number(bi.price || 0),

          color: bi.color || "",
          size: bi.size || "",

          options: {
            Color: bi.options?.Color || bi.color || "",
            Size: bi.options?.Size || bi.size || "",
          },
        }))
      : [];

    return {
      isBundle: true,
      bundle: item.bundle || item.product,

      name: item.name || "Bundle",
      quantity: Number(item.quantity) || 1,

      price: Number(item.price || 0),

      image: item.image || "",

      color: "bundle",
      size: "bundle",

      bundleItems: cleanBundleItems,
    };
  }

  // ===================== PRODUCT =====================
  const productId =
    typeof item.product === "object"
      ? item.product._id
      : item.product;

  const fullProduct = products.find(
    (p) => String(p._id) === String(productId)
  );

  if (!fullProduct) {
    throw new Error(`Product ${index + 1} not found`);
  }

  const selectedColor =
    item.Color || item.color || item.options?.Color || "";

  const selectedSize =
    item.Size || item.size || item.options?.Size || "";

  const matchedVariant = fullProduct.variants?.find(
    (v) =>
      String(v.options?.Color) === String(selectedColor) &&
      String(v.options?.Size) === String(selectedSize)
  );

  const variantId = matchedVariant?._id || item.variantId;

  if (!variantId) {
    throw new Error(`Variant missing for product ${index + 1}`);
  }

  const price =
    matchedVariant?.price ??
    fullProduct?.salePrice ??
    fullProduct?.price ??
    0;

  return {
    product: fullProduct._id,
    variantId,

    name: fullProduct.name,

    price: Number(price),
    quantity: Number(item.quantity) || 1,

    image: fullProduct.images?.[0]?.url || "",

    color: selectedColor,
    size: selectedSize,

    options: {
      Color: selectedColor,
      Size: selectedSize,
    },
  };
});
    // ================= CLEAN PAYLOAD =================
    const finalPayload = {
      orderItems: itemsToSubmit,
      shippingAddress: editingOrder.shippingAddress,
      status: editingOrder.status,
      shippingFee: Number(editingOrder.shippingFee || 0),
      totalPrice: Number(editingOrder.totalPrice || 0),

      name: editingOrder.guestInfo?.name,
      email: editingOrder.guestInfo?.email,
      phone: editingOrder.guestInfo?.phone,
      secondaryPhone: editingOrder.guestInfo?.secondaryPhone || "",
    };

   

    const response = await axios.put(
      `/orders/${editingOrder._id}`,
      finalPayload
    );

    if (response.data.success) {
      toast.success("Order Updated Successfully!");

      setOrders((prev) =>
        prev.map((o) =>
          o._id === editingOrder._id ? response.data.order : o
        )
      );

      setIsEditModalOpen(false);
    }
  } catch (err) {
    console.error("🔥 ERROR:", err);
    alert(err.response?.data?.message || err.message);
  }
};

// الأفضل استخدام useRef بدل let (أثبت في React)
const abortControllerRef = useRef(null);

const fetchOrders = async () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  const controller = new AbortController();
  abortControllerRef.current = controller;

  setLoading(true);

  try {
    const params = new URLSearchParams();

    params.append("status", statusFilter || "all");
    params.append("shipmentType", shipmentTypeFilter || "Delivery");
    params.append(
  "shipmentStatus",
  shipmentStatusFilter || "all"
);
    params.append("startDate", startDate || "");
    params.append("endDate", endDate || "");
    params.append("page", currentPage || 1);
    params.append("limit", pageSize || 50);
    params.append("search", debouncedSearch || "");

    // 🔥 أهم سطر هنا
    if (showArchived === true) {
      params.append("archived", "true");
    } else {
      params.append("archived", "false");
    }

    const res = await axios.get(`/orders?${params.toString()}`, {
      signal: controller.signal,
    });

 setOrders(res.data.orders || []);
setTotalOrders(res.data.totalOrders || 0);


  } catch (err) {
    if (err.name === "CanceledError") return;

    toast.error(
      language === "ar"
        ? "فشل في جلب الطلبات"
        : "Failed to fetch orders"
    );
  } finally {
    setLoading(false);
  }
};



  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (err) {
      toast.error(
        language === "ar" ? "فشل في جلب المنتجات" : "Failed to fetch products",
      );
    }
  };

  const fetchDeliveryCharges = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/delivery-charges/all", { headers });
      setDeliveryCharges(res.data);
    } catch (err) {
      console.warn(
        language === "ar"
          ? "تعذر جلب رسوم الشحن (ربما تحتاج صلاحيات)"
          : "Could not fetch delivery charges (may require admin token):",
        err?.response?.status,
      );
      setDeliveryCharges([]);
    }
  };

// 1. هنجيب الداتا الثابتة (اللي مش بتتغير بالفلاتر) مرة واحدة فقط عند فتح الصفحة
useEffect(() => {
  const fetchStaticData = async () => {
    try {
      // بنستخدم Promise.all عشان يبعت الـ 4 طلبات مع بعض ويستنى ردهم أسرع
      await Promise.all([
        fetchProducts(),
        fetchDeliveryCharges(),
        fetchCoupons(),
        fetchCities()
      ]);
    } catch (err) {
      console.error("Error loading setup data:", err);
    }
  };

  fetchStaticData();
}, []); 

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(handler); // تنظيف التايمر لو اليوزر كتب حرف جديد
}, [search]);

useEffect(() => {
  setCurrentPage(1);
}, [statusFilter, startDate, endDate, showArchived]);

useEffect(() => {
  const handler = setTimeout(() => {
    fetchOrders();
  }, 200);

  return () => clearTimeout(handler);
}, [statusFilter, shipmentTypeFilter, shipmentStatusFilter, startDate, endDate, currentPage, pageSize, showArchived, debouncedSearch]);


const productMap = useMemo(() => {
  const map = {};
  for (const p of products) {
    if (p?._id) map[p._id] = p;
  }
  return map;
}, [products]);

const deliveryMap = useMemo(() => {
  const map = {};
  deliveryCharges.forEach(c => {
    if (!c?.city) return;
    map[c.city.toLowerCase().trim()] = c.charge;
  });
  return map;
}, [deliveryCharges]);
  const fetchCoupons = async () => {
  try {
    const res = await axios.get("/discounts"); // تأكد من المسار الصحيح عندك
    setCoupons(res.data);
  } catch (err) { console.error("Error fetching coupons"); }
};

 const getProductInfo = (productId) => {
  if (!productId) {
    return { name: "Unknown product", price: 0 };
  }

  const product = productMap[String(productId)];

  return product
    ? { name: product.name, price: product.price || 0 }
    : { name: "Unknown product", price: 0 };
};

  const getChargeForCity = (cityName, fallback = 0) => {
  if (!cityName) return fallback;

  const charge = deliveryMap[cityName.toLowerCase().trim()];

  return charge !== undefined ? Number(charge) : fallback;
};

  const deleteOrder = async (id) => {
    if (
      !window.confirm(
        language === "ar"
          ? "هل أنت متأكد من حذف هذا الطلب؟"
          : "Are you sure you want to delete this order?",
      )
    )
      return;
    try {
      await axios.delete(`/orders/${id}`);
      toast.success(language === "ar" ? "تم حذف الطلب" : "Order deleted");
      fetchOrders();
    } catch {
      toast.error(
        language === "ar" ? "فشل في حذف الطلب" : "Failed to delete order",
      );
    }
  };
  
const updateStatus = async (id, newStatus) => {
  try {
    const res = await axios.put(`/orders/${id}/status`, {
      status: newStatus,
      ids: [id]
    });

    const updatedOrder = res.data.order;

    if (updatedOrder) {
      // 1. تحديث الجدول
      setOrders((prev) => {
        const index = prev.findIndex((o) => o._id === id);
        if (index === -1) return prev;

        const updatedList = [...prev];
        updatedList[index] = {
          ...updatedList[index],
          ...updatedOrder,
        };

        return updatedList;
      });

      // 2. 🔥 أهم سطر (تحديث المودال مباشرة)
      setAuditOrder((prev) =>
        prev && prev._id === id
          ? { ...prev, ...updatedOrder }
          : prev
      );

      toast.success(
        language === "ar"
          ? "تم تحديث الحالة بنجاح"
          : "Status updated successfully"
      );
    }
  } catch (error) {
    console.error("Status Update Error:", error);
    toast.error(
      language === "ar"
        ? "فشل في تحديث الحالة"
        : "Failed to update status"
    );
  }
};
 
 const toggleArchive = async (id, current) => {
  try {
    // 1. نبعت الـ Body فيه القيمة الجديدة عشان الـ Backend يقرأها
    const res = await axios.put(`/orders/${id}/archive`, { 
      archiveAction: !current 
    });

    toast.success(
      language === "ar"
        ? !current
          ? "تم أرشفة الطلب بنجاح"
          : "تم إلغاء أرشفة الطلب"
        : !current
          ? "Order archived"
          : "Order unarchived"
    );
    
    // 🎯 بدل ما تعمل fetchOrders() كاملة وتبطأ الصفحة وتعمل رينديرينج لكل حاجة،
    // نحدث حالة الأرشفة محلياً فوراً، ولو الصفحة بتعرض غير المؤرشف فقط، بنشيله من الـ list
    setOrders((prev) => 
      prev.map((order) => 
        order._id === id 
          ? { ...order, archived: !current, auditLog: res.data.order?.auditLog || order.auditLog } 
          : order
      ).filter((order) => {
        // لو الصفحة الحالية بتعرض الأرشيف بس أو العكس، شيل الأوردر اللي حالته اتقلبت
        if (showArchived === true) return order.archived === true;
        if (showArchived === false) return order.archived === false;
        return true;
      })
    );

  } catch (err) {
    console.error("Archive Toggle Error:", err);
    toast.error(
      language === "ar"
        ? "فشل في تحديث حالة الأرشفة"
        : "Failed to update archive status"
    );
  }
};

  const handleDeleteAllArchived = async () => {
  if (
    !window.confirm(
      language === "ar"
        ? "هل أنت متأكد من اخفاء كل الطلبات المؤرشفة نهائياً؟"
        : "Are you sure you want to permanently delete all archived orders?"
    )
  )
    return;

  try {
    await axios.put("/orders/delete-all-archived");

    toast.success(
      language === "ar"
        ? "تم اخفاء الأرشيف بنجاح"
        : "Archived orders deleted successfully"
    );

    fetchOrders();
  } catch {
    toast.error(
      language === "ar"
        ? "فشل في اخفاء الأرشيف"
        : "Failed to delete archive"
    );
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "Paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "Pending_Payment": // إضافة دي
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

const updateAllowToOpenPackage = async (id, value) => {
  // 1. Optimistic update للجدول
  setOrders((prev) =>
    prev.map((o) =>
      o._id === id ? { ...o, allowToOpenPackage: value } : o
    )
  );

  // 2. تحديث المودال لو مفتوح
  setAuditOrder((prev) =>
    prev?._id === id
      ? { ...prev, allowToOpenPackage: value }
      : prev
  );

  try {
    await axios.put(`/orders/${id}`, {
      allowToOpenPackage: value,
    });
  } catch (err) {
    // rollback الجدول
    setOrders((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, allowToOpenPackage: !value } : o
      )
    );

    // rollback المودال
    setAuditOrder((prev) =>
      prev?._id === id
        ? { ...prev, allowToOpenPackage: !value }
        : prev
    );
  }
};

const updateFlexShipping = async (id, value) => {
  // 1. UI update
  setOrders((prev) =>
    prev.map((o) =>
      o._id === id
        ? {
            ...o,
            flexShippingInfo: {
              ...o.flexShippingInfo,
              amountToBeCollected: value,
              overriddenByAdmin: true,
            },
          }
        : o
    )
  );

  // 2. update modal
  setAuditOrder((prev) =>
    prev?._id === id
      ? {
          ...prev,
          flexShippingInfo: {
            ...prev.flexShippingInfo,
            amountToBeCollected: value,
            overriddenByAdmin: true,
          },
        }
      : prev
  );

  try {
    await axios.put(`/orders/${id}`, {
      flexShippingInfo: {
        amountToBeCollected: value,
        overriddenByAdmin: true,
      },
    });
  } catch (err) {
    // rollback
    setOrders((prev) =>
      prev.map((o) =>
        o._id === id
          ? {
              ...o,
              flexShippingInfo: {
                ...o.flexShippingInfo,
                amountToBeCollected: !value,
                overriddenByAdmin: false,
              },
            }
          : o
      )
    );

    setAuditOrder((prev) =>
      prev?._id === id
        ? {
            ...prev,
            flexShippingInfo: {
              ...prev.flexShippingInfo,
              amountToBeCollected: !value,
              overriddenByAdmin: false,
            },
          }
        : prev
    );
  }
};

  const handleShipToBosta = async (orderId, showToast = true) => {
  try {
    const res = await axios.post(`/orders/${orderId}/ship-bosta`);

    if (res.data.success && showToast) {
      toast.success(res.data.message);
    }

    if (showToast) fetchOrders();

    return res.data;

  } catch (err) {
    const errorMessage = err.response?.data?.message || "حدث خطأ في النظام";

    if (showToast) {
      if (err.response?.status === 400) {
        toast.warning(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }

    throw { id: orderId, message: errorMessage };
  }
};

const handleConfirmOrder = async (orderId, showToast = true) => {
   if (
      !window.confirm(
        language === "ar"
          ? "هل أنت متأكد من شحن هذا الطلب؟"
          : "Are you sure you want to delete this order?",
      )
    )
      return;
  try {
    // ❌ ممنوع تغيير الحالة من الفرونت

    // 1. إرسال الأوردر للشحن مباشرة
    const shipRes = await handleShipToBosta(orderId, showToast);

    // 2. تحديث الجدول فقط لو النجاح حصل
    if (shipRes?.success && showToast) {
      fetchOrders();
    }

    return shipRes;

  } catch (err) {
    const msg = err.message || "Confirm failed";

    if (showToast) {
      console.error("Single confirm handled error:", msg);
      fetchOrders();
    } else {
      throw { id: orderId, message: msg };
    }
  }
};
 

// bulk actions
const handleBulkConfirm = async () => {
  if (selectedOrderIds.length === 0) return;

  const loadingToast = toast.info("جاري المعالجة...", { autoClose: false });
  const failedOrders = [];
  let successCount = 0;

  for (const id of selectedOrderIds) {
    try {
      // نبعت false عشان "نخرس" التوستس الفردية تماماً
      await handleConfirmOrder(id, false);
      successCount++;
    } catch (err) {
      // بنجمع الـ ID والرسالة
      failedOrders.push({ id: err.id, msg: err.message });
    }
  }

  toast.dismiss(loadingToast);

  // الحالة 1: كله نجح
  if (failedOrders.length === 0) {
    toast.success(`تم شحن جميع الأوردرات (${successCount}) بنجاح! ✅`);
  } 
  // الحالة 2: فيه أخطاء
  else {
    if (successCount > 0) {
      toast.success(`تم شحن ${successCount} أوردر بنجاح.`);
    }

    // تجميع كل الأوردرات اللي فشلت في رسالة واحدة بدل توستس كتير
    const errorNames = failedOrders.map(f => f.id?.slice(-4)).join(", ");
    toast.error(`فشل شحن الأوردرات رقم: (${errorNames}) بسبب: ${failedOrders[0].msg}`, {
      autoClose: 10000 // تقعد فترة أطول عشان تتشاف
    });
  }

  setSelectedOrderIds([]);
  fetchOrders();
};

const handleBulkDelete = async () => {
  if (selectedOrderIds.length === 0) return;

  // تأكيد من المستخدم قبل الحذف (أفضل للـ UX)
  if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف الأوردرات المختارة؟" : "Are you sure?")) return;

  try {
    // 1. تغيير axios.post لـ axios.delete
    // 2. وضع الـ ids جوه كائن data
    await axios.delete("/orders/bulk-delete", {
      data: { ids: selectedOrderIds }
    });

    toast.success(language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
    
    setSelectedOrderIds([]); // تصفير المختار
    fetchOrders(); // تحديث الجدول
    
  } catch (err) {
    console.error("Bulk Delete Error:", err);
    const msg = err.response?.data?.message || "Delete failed";
    toast.error(msg);
  }
};





const fetchCities = async () => {
  try {
    const res = await axios.get("/delivery-charges/public");
    setCities(res.data);
  } catch (err) {
    console.error("Error fetching cities");
  }
};


  // ✅ تحديث دالة الـ Edit Modal لتشمل الحقول الجديدة
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    // دعم تحديث الحقول العميقة مثل shippingAddress.buildingNumber
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditingOrder(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setEditingOrder(prev => ({ ...prev, [name]: value }));
    }
  };

  // دالة لاختصار العناوين الطويلة في الجدول
  const formatCompactAddress = (address) => {
    if (!address) return "—";
    const { cityName, districtName, buildingNumber, floor, apartment } = address;
    // شكل مختصر: القاهرة، المعادي (ع:5، د:2)
    let details = [];
    if (buildingNumber) details.push(`ع:${buildingNumber}`);
    if (floor) details.push(`د:${floor}`);
    if (apartment) details.push(`ش:${apartment}`);
    
    return `${cityName || ""}, ${districtName || ""} `;
  };



  const handleBulkArchive = async (action) => {
  if (selectedOrderIds.length === 0) return;
  try {
    // نرسل الـ IDs مع حالة الأرشفة (true للأرشفة، false لإلغاء الأرشفة)
    await axios.put("/orders/bulk-archive", { 
      ids: selectedOrderIds, 
      archiveAction: action 
    });
    
    toast.success(language === "ar" ? "تم تحديث الأرشيف بنجاح" : "Archive updated");
    setSelectedOrderIds([]); // تصغير القائمة بعد التنفيذ
    fetchOrders(); // تحديث البيانات
  } catch (err) {
    toast.error(err.response?.data?.message || "Archive failed");
  }
};

const computeProductsTotal = (order) => {
  if (!order?.orderItems || !Array.isArray(order.orderItems)) return 0;
  
  return order.orderItems.reduce((acc, item) => {
    const unitPrice = Number(item?.price) || 0; 
    const qty = Number(item?.quantity || item?.qty) || 0;
    return acc + (unitPrice * qty);
  }, 0);
};
// دالة سريعة لتنسيق التاريخ والوقت بالشكل العربي للوحة التحكم
const formatAuditDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};



useEffect(() => {
  if (isEditModalOpen && editingOrder?.shippingAddress?.city) {
const cityId = editingOrder?.shippingAddress?.city;

const cityObj = cities.find(c => c._id === cityId);
    if (!cityObj) return setDistricts([]);

    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`/districts/${cityObj.bostaCityId}`);
        setDistricts(res.data);
      } catch (err) {
        console.error("Error fetching districts:", err);
        setDistricts([]);
      }
    };

    fetchDistricts();
  }
}, [isEditModalOpen, editingOrder?.shippingAddress?.city, cities]);


const computeFinalTotal =(order)  => {
  if (!order) return 0;
  if (order.totalPrice !== undefined && order.totalPrice !== null) {
    return Number(order.totalPrice);
  }

  const productsTotal = computeProductsTotal(order);
  const city = order.shippingAddress?.city;
  const shippingFee = Number(order.shippingFee) || getChargeForCity(city, 0);
  const discount = Number(order.discount?.amount) || 0;
  
  return productsTotal + shippingFee - discount;
};

const handleSelectAll = (checked) => {
  if (checked) {
setSelectedOrderIds(allOrdersToShow.map(o => o._id));
  } else {
    setSelectedOrderIds([]);
  }
};

  const handleExportToExcel = () => {
  // 🔥 لو في selected استخدمهم، لو لا استخدم كل الأوردرات
  const dataToExport =
    selectedOrderIds.length > 0
      ? orders.filter(order => selectedOrderIds.includes(order._id))
      : orders;

  if (!dataToExport.length) {
    alert(
      language === "ar"
        ? "لا توجد طلبات للتصدير"
        : "No orders to export"
    );
    return;
  }

  const excelData = dataToExport.map((order) => {
  const productsText = (order.orderItems || [])
  .map((item) => {
    const qty = item?.quantity ?? item?.qty ?? 1;
const productId = item?.product?._id || item?.product;
const { name, price } = getProductInfo(productId);
      const unitPrice = item.price ?? price ?? 0;
      const total = unitPrice * qty;

      return `${name} - ${qty} × ${unitPrice} = ${total} EGP`;
    })
    .join("\n");

  const city = order.shippingAddress?.city || "—";

  // 🔥 سريع بدل find
  const shippingFee = getChargeForCity(city, order.shippingFee || 0);

  // دول تمام
  const productsTotal = computeProductsTotal(order);
  const discount = order.discount?.amount || 0;
  const finalTotal = order.totalPrice ?? computeFinalTotal(order);

  return {
    "المنتجات المطلوبة": productsText,
    الاسم: order.guestInfo?.name || order.user?.name || "N/A",
    "البريد الإلكتروني":
      order.guestInfo?.email || order.user?.email || "N/A",
    "رقم الهاتف": order.guestInfo?.phone || "N/A",
    "  رقم الهاتف التاني": order.guestInfo?.secondaryPhone || "N/A",
    "المدينة (شحن)": `${city} (${shippingFee} EGP)`,
    العنوان: order.shippingAddress?.address || "N/A",
    "طريقة الدفع": order.paymentMethod || "N/A",
    "مجموع المنتجات": productsTotal,
    "قيمة الخصم": discount,
    "سعر الشحن": shippingFee,
    "الإجمالي النهائي": finalTotal,
    الحالة: order.status || "N/A",
    "كود الخصم": order.discount?.code || "None",
    "تاريخ الطلب": new Date(order.createdAt).toLocaleString(
      language === "ar" ? "ar-EG" : "en-US"
    ),
  };
});

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    language === "ar" ? "الطلبات" : "Orders"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  // 🔥 اسم فايل ذكي
  const fileName =
    selectedOrderIds.length > 0
      ? `selected_orders_${new Date().toISOString().slice(0, 10)}.xlsx`
      : `all_orders_${new Date().toISOString().slice(0, 10)}.xlsx`;

  saveAs(file, fileName);
};

 const allOrdersToShow = useMemo(() => orders || [], [orders]);



const pageCount = useMemo(() => {
  return totalOrders > 0
    ? Math.ceil(totalOrders / (pageSize || 30))
    : 0;
}, [totalOrders, pageSize]);


const buildWhatsAppMessage = (order) => {
  const name = order.customerName || order.guestInfo?.name || "";
  const phone = order.guestInfo?.phone || "";
    const discount = Number(order.discount?.amount) || 0;

  const city =
    order.shippingAddress?.cityName ||
    order.shippingAddress?.cityOtherName ||
    "";

  const address = `
مدينة: ${city} 
مركز: ${order.shippingAddress?.districtName || ""}
العنوان بالكامل 
${order.shippingAddress?.address || ""}
عمارة: ${order.shippingAddress?.buildingNumber || "-"}
دور: ${order.shippingAddress?.floor || "-"}
شقة: ${order.shippingAddress?.apartment || "-"}
`;

  // 🛍️ المنتجات
  const itemsText = order.orderItems
    ?.map((item, index) => {
      // 🟣 BUNDLE
      if (item.isBundle) {
        const bundleItems = item.bundleItems
          ?.map(
            (b) => `   - ${b.name} (${b.size || "-"} / ${b.color || "-"})`
          )
          .join("\n");

        return `📦 عرض ${index + 1}
${item.name}
السعر: ${item.price} جنيه
الكمية: ${item.quantity}

المحتويات:
${bundleItems}`;
      }

      // 🟢 منتج عادي
      return `🛍️ منتج ${index + 1}
${item.name}
المقاس: ${item.size || "-"}
اللون: ${item.color || "-"}
السعر: ${item.price} جنيه
الكمية: ${item.quantity}`;
    })
    .join("\n\n");

  // 💰 الحسابات
  const shipping = order.shippingFee || 0;
  const total = order.totalPrice || 0;

  const message = `
اهلا ب حضرتك ي فندم 🥰
مع حضرتك خدمة عملاء Vestro

حضرتك طالب اوردر على بيانات 👇🏻

👤 الاسم:
${name}

📞 الهاتف:
${phone}

📍 العنوان:
${address}

🛒 تفاصيل الاوردر:
${itemsText}

💰 ملخص الطلب:
سعر المنتجات: ${total - shipping} جنيه
الشحن: ${shipping} جنيه
${discount > 0 ? `الخصم: -${discount} جنيه` : `الخصم: 0 جنيه`}
الإجمالي: ${total} جنيه

يرجي اخبارنا ب الوزن والطول للتأكيد علي المقاس 🙏
`;

  return encodeURIComponent(message);
};

 return (
    <div
      className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen pt-4 md:pt-0 text-gray-900 dark:text-gray-100"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
{/* --- VISTRO HEADER SECTION (COMPACT) --- */}
<div className={`flex flex-col gap-4 mb-4 p-3 md:p-4 rounded-2xl border transition-all duration-500 ${
  darkMode
    ? 'bg-[#0D0D0D] border-white/[0.06] shadow-lg'
    : 'bg-white border-black/10 shadow-sm'
}`}>

  {/* TITLE + ACTIONS */}
  <div className="flex flex-col md:flex-row justify-between items-center gap-3">

   <div className="flex items-center justify-between gap-3 flex-nowrap">

  {/* TITLE */}
  <h1 className={`text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2 whitespace-nowrap ${
    darkMode ? "text-white" : "text-black"
  }`}>
    <span className="text-red-700">🧾</span>
    {language === "ar" ? "الطلبات" : "Orders"}
  </h1>


<select
  value={shipmentTypeFilter}
  onChange={(e) => {
    setShipmentTypeFilter(e.target.value);
    setCurrentPage(1);
  }}
  className={`px-3 py-2 rounded-xl text-xs font-black uppercase border shrink-0 transition-all ${
    darkMode
      ? "bg-black border-white/10 text-white"
      : "bg-white border-black/10 text-black"
  }`}
>
  {shipmentTypes.map((type) => (
    <option key={type.value} value={type.value} className="${type.color}">
      {type.icon} {language === "ar" ? type.ar : type.en}
    </option>
  ))}
</select>



 

</div>
    {/* ACTIONS */}
    <div className="flex gap-2 w-full md:w-auto flex-wrap justify-center">

      <input
        type="text"
        placeholder={language === "ar" ? "بحث..." : "Search..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`flex-1 md:w-56 px-4 py-2 rounded-xl text-[11px] font-bold uppercase outline-none border ${
          darkMode
            ? "bg-white/[0.05] border-white/10 text-white placeholder:text-white/20"
            : "bg-slate-50 border-black/10 text-black placeholder:text-black/40"
        }`}
      />

      <button
        onClick={handleExportToExcel}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
          darkMode
            ? 'bg-white/[0.08] text-white/70 hover:bg-red-700 hover:text-white'
            : 'bg-black text-white hover:bg-zinc-800'
        }`}
      >
        📥
      </button>
{/* ARCHIVE TOGGLE */}
<button
  onClick={() => {
     setShowArchived(prev => !prev);
  setCurrentPage(1);   
  }}
  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
    showArchived
      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
      : darkMode
        ? 'bg-white/[0.05] text-white/70 hover:bg-red-500/10 hover:text-red-500'
        : 'bg-zinc-100 text-black hover:bg-red-50'
  }`}
>
  <span>📦</span>
  {showArchived
    ? (language === "ar" ? "الرئيسية" : "Main")
    : (language === "ar" ? "الأرشيف" : "Archive")
  }
</button>
{showArchived && (
  <button
    onClick={handleDeleteAllArchived}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${
      darkMode
        ? "bg-white/[0.05] text-red-400 hover:bg-red-500/10 hover:text-red-500"
        : "bg-red-50 text-red-600 hover:bg-red-100"
    }`}
  >
    🗑 {language === "ar" ? "مسح الأرشيف" : "Clear Archive"}
  </button>
)}

    </div>
  </div>

  {/* FILTERS */}
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-2xl ${
    darkMode ? 'bg-white/[0.02]' : 'bg-slate-50'
  }`}>

    {/* STATUS */}
    <select
      value={statusFilter}
    onChange={(e) => {
  setLoading(true); // 👈 أهم سطر
  setStatusFilter(e.target.value);
  setCurrentPage(1);
}}
      className={`p-2 rounded-xl text-[10px] font-black uppercase border ${
        darkMode ? 'bg-black border-white/10 text-red-700' : 'bg-white border-black/10'
      }`}
    >
      <option value="all">
        {language === "ar" ? "كل الحالات" : "All"}
      </option>

      {STATUS_OPTIONS.map(status => (
        <option key={status} value={status}>
          {language === "ar"
            ? ORDER_STATUS_CONFIG[status].ar
            : ORDER_STATUS_CONFIG[status].en}
        </option>
      ))}
    </select>

 {/* SHIPMENT STATUS FILTER */}
<select
  value={shipmentStatusFilter}
  onChange={(e) => {
    setShipmentStatusFilter(e.target.value);
    setCurrentPage(1);
  }}
  className={`p-2 rounded-xl text-[10px] font-black uppercase border ${
    darkMode
      ? "bg-black border-white/10 text-white"
      : "bg-white border-black/10 text-black"
  }`}
>
  <option value="all">
    {language === "ar"
      ? "كل حالات الشحنة"
      : "All Shipment Statuses"}
  </option>

  {shipmentStatuses.map((status) => (
    <option key={status.value} value={status.value}>
      {status.icon} {language === "ar" ? status.ar : status.en}
    </option>
  ))}
</select>

    {/* FROM */}
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className={`p-2 rounded-xl text-[10px] font-black border ${
        darkMode
          ? 'bg-black border-white/10 text-white [color-scheme:dark]'
          : 'bg-white border-black/10'
      }`}
    />

    {/* TO */}
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className={`p-2 rounded-xl text-[10px] font-black border ${
        darkMode
          ? 'bg-black border-white/10 text-white [color-scheme:dark]'
          : 'bg-white border-black/10'
      }`}
    />

    {/* PAGE SIZE */}
    <select
      value={pageSize}
      onChange={(e) => setPageSize(Number(e.target.value))}
      className={`p-2 rounded-xl text-[10px] font-black uppercase border ${
        darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-black/10'
      }`}
    >
      <option value={50}>50</option>
      <option value={100}>100</option>
      <option value={0}>
        {language === "ar" ? "الكل" : "All"}
      </option>
    </select>

  </div>
</div>


{loading ? (
  <div className="flex justify-center py-20">
    <div className={`w-12 h-12 border-4 rounded-full animate-spin ${darkMode ? 'border-red-700/10 border-t-red-700' : 'border-black/10 border-t-black'}`}></div>
  </div>
) : (
  <div className="flex flex-col gap-6">
    {/* VISTRO BULK BAR */}
{selectedOrderIds.length > 0 && (
  <div className={`sticky top-24 z-40 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-wrap justify-between items-center animate-in fade-in slide-in-from-top-4 ${darkMode ? 'bg-red-700 backdrop-blur-md text-white' : 'bg-black text-white'}`}>
    
    <div className="font-[1000] italic uppercase text-sm px-4 mb-2 md:mb-0">
      {selectedOrderIds.length} {language === "ar" ? "تم تحديد" : "Selected"}
    </div>

    <div className="flex gap-2 flex-wrap items-center">
      {/* Bulk Confirm */}
      <button onClick={handleBulkConfirm} className="px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-[1000] uppercase bg-white text-black hover:bg-gray-100 transition-all flex items-center gap-1.5">
        <span>🚚</span>
        {language === "ar" ? "تأكيد الشحن" : "Confirm"}
      </button>

      {/* Bulk Archive - الجديد */}
     {/* Bulk Archive Button */}
<button 
  onClick={() => handleBulkArchive(true)} // بنبعت true عشان نأرشفهم
  className="px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-[1000] uppercase bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg transition-all flex items-center gap-1.5"
>
  <span>📦</span>
  {language === "ar" ? "أرشفة الكل" : "Archive"}
</button>

      {/* Bulk Delete */}
      <button onClick={handleBulkDelete} className="bg-red-900 text-white px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-[1000] uppercase shadow-lg hover:bg-red-800 transition-all flex items-center gap-1.5">
        <span>🗑</span>
        {language === "ar" ? "حذف الكل" : "Delete"}
      </button>

      {/* Clear Selection */}
      <button onClick={() => setSelectedOrderIds([])} className="px-3 py-2.5 text-[10px] font-[1000] uppercase underline decoration-2 underline-offset-4 opacity-70 text-white hover:opacity-100 transition-all">
        {language === "ar" ? "إلغاء" : "Clear"}
      </button>
    </div>
  </div>
)}

   {/* VISTRO TABLE CONTAINER */}
<div className={`mx-auto w-full max-w-[1600px] rounded-[1.5rem] md:rounded-[3rem] border overflow-hidden transition-all duration-700 ${darkMode ? 'bg-[#0A0A0A] border-white/[0.08] shadow-2xl' : 'bg-white border-black/10 shadow-xl'}`}>
  
  {/* 🖥️ HEADER - يظهر فقط في الشاشات الكبيرة */}
  <div className={`hidden lg:grid grid-cols-12 gap-2 p-6 border-b text-[13px] font-[1000] uppercase tracking-[0.15em] ${darkMode ? 'bg-white/[0.03] border-white/[0.08] text-white/40' : 'bg-slate-50 border-black/5 text-black/80'}`}>
    <div className="col-span-1 flex justify-center"><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} className="w-5 h-5 accent-red-700" /></div>
    <div className="col-span-2">{language === "ar" ? "العميل" : "Customer"}</div>
    <div className="col-span-2">{language === "ar" ? "الهاتف" : "Phone"}</div>
    <div className="col-span-2">{language === "ar" ? "العنوان" : "Address"}</div>
    <div className="col-span-1 text-center">{language === "ar" ? "المجموع" : "Total"}</div>
    <div className="col-span-2 text-center">{language === "ar" ? "الحالة" : "Status"}</div>
    <div className="col-span-1 text-center">{language === "ar" ? "بوسطة" : "Bosta"}</div>
    <div className="col-span-1 text-center">{language === "ar" ? "الإدارة" : "Manage"}</div>
  </div>
  
{/* 📱 MOBILE SELECT ALL BAR (ABOVE CARDS) */}
<div className="lg:hidden w-full mb-3">
  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
    darkMode ? "bg-[#0D0D0D] border-white/10" : "bg-white border-black/10"
  }`}>

    <input
      type="checkbox"
      onChange={(e) => handleSelectAll(e.target.checked)}
      className="w-5 h-5 accent-red-700"
    />

    <span className={`text-[12px] font-black uppercase ${
      darkMode ? "text-white/80" : "text-black"
    }`}>
      {language === "ar" ? "تحديد الكل" : "Select All"}
    </span>

  </div>
</div>
  {/* 📦 ROWS / CARDS */}
  <div className={`divide-y ${darkMode ? 'divide-white/[0.05]' : 'divide-black/[0.05]'}`}>
    {allOrdersToShow?.map((order) => {
      
      const finalTotal = order.totalPrice ?? computeFinalTotal(order);
      const statusColor = ORDER_STATUS_CONFIG[order.status]?.color || "#888";
      const getOrderPhone = (order) => {
  return (
    order?.guestInfo?.phone ||          // 👈 guest
    order?.client?.phone ||             // 👈 لو ضفت phone في client
    order?.user?.phone ||               // 👈 لو موجود في user
    ""
  );
};

const getOrderSecondaryPhone = (order) => {
  return (
    order?.guestInfo?.secondaryPhone ||
    order?.client?.secondaryPhone ||
    ""
  );
};
      const waPhone = formatWhatsappNumber(getOrderPhone(order));
const waSecondary = formatWhatsappNumber(getOrderSecondaryPhone(order));

      return (
        <div key={order._id} className={`group p-3 md:p-6 lg:p-4 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-2 lg:items-center transition-all duration-300 ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'}`}>
          
          {/* 1. Customer Section (Checkbox + Name + Date) */}
          <div className="flex items-center justify-between lg:col-span-2 lg:contents">
            <div className="flex items-center gap-3 lg:col-span-3">
              <input
                type="checkbox"
                checked={selectedOrderIds.includes(order._id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order._id]);
                  else setSelectedOrderIds(selectedOrderIds.filter((id) => id !== order._id));
                }}
                className="min-w-[18px] w-[18px] h-[18px] rounded-md cursor-pointer accent-red-700"
              />
              <div className="flex flex-col truncate">
                <span className={`font-[1000] uppercase text-[15px] lg:text-[13px] tracking-tight ${darkMode ? 'text-white/90' : 'text-black'}`}>
                  {order.customerName || order.guestInfo?.name || "—"}
                </span>
                <span className={`text-[9px] font-bold opacity-50 uppercase ${darkMode ? 'text-red-700' : 'text-slate-500'}`}>
                  {new Date(order.createdAt).toLocaleDateString(language === "ar" ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            {/* سعر الموبايل يختفي في الديسكتوب */}
            <div className="lg:hidden font-[1000] italic text-[18px] text-red-700">
              {finalTotal.toLocaleString()} <span className="text-[10px] not-italic opacity-60">EGP</span>
            </div>
          </div>

       {/* 2. Phone Section - يدعم العربي والإنجليزي */}
<div className={`flex flex-row lg:flex-col gap-3 lg:gap-1 lg:col-span-2 border-t lg:border-0 pt-1 lg:pt-0 border-white/5`}>
    
    {/* الرقم الأول */}
    <div className="flex items-center gap-1.5 min-w-fit">
        <span className={`font-black text-[12px] lg:text-[13px] tracking-widest ${darkMode ? 'text-white/80' : 'text-black/70'}`}>
            {order.guestInfo?.phone || "—"}
            
        </span>
        <a 
          href={`https://wa.me/${waPhone}?text=${buildWhatsAppMessage(order)}`}
            target="_blank" 
            rel="noreferrer" 
            className="text-[#25D366] hover:scale-110 transition-transform"
        >
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.434 5.626 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        </a>
    </div>

    {/* الرقم الثاني */}
    {order.guestInfo?.secondaryPhone && (
        <div className={`
            flex items-center gap-1.5 min-w-fit transition-all
            /* في الموبايل: خط فاصل حسب الاتجاه */
            border-s border-white/10 ps-3 
            /* في الديسكتوب: تحت بعض، الخط يختفي والمسافة تتعدل */
            lg:border-s-0 lg:ps-0 lg:border-t lg:pt-1
        `}>
            <span className={`font-bold text-[10px] lg:text-[11px] opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>
                {order.guestInfo.secondaryPhone}
            </span>
            <a 
               href={`https://wa.me/${waSecondary}?text=${buildWhatsAppMessage(order)}`}
                target="_blank" 
                rel="noreferrer" 
                className="text-[#25D366] hover:scale-110 transition-transform"
            >
                <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.434 5.626 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </a>
        </div>
    )}
</div>
     {/* 3. Address Section */}
<div className="flex items-center justify-between lg:col-span-2 gap-2">

  {/* 📍 Address */}
  <span className={`text-[12px] lg:text-[13px] font-black uppercase truncate tracking-tight
    ${darkMode ? 'text-white/40' : 'text-black/60'}`}>
    📍 {formatCompactAddress(order.shippingAddress)}
  </span>

  {/* 🔥 MOBILE CENTER FLEX SHIPPING */}
  <div className="flex lg:hidden items-center justify-center flex-1">

    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">

      <span className="text-[11px] font-black uppercase opacity-80">
        {language === "ar" ? "فليكس شيب" : "Ship"}
      </span>

    <input
  type="number"
  value={order.flexShippingInfo?.amountToBeCollected ?? order.shippingFee}
  onChange={(e) =>
    updateFlexShipping(order._id, Number(e.target.value))
  }
  disabled={order.bostaInfo?.deliveryId}
  className="w-12 h-6 bg-transparent text-center text-[11px] font-black text-black
  border border-black/20 rounded-md
  focus:border-red-600 focus:ring-1 focus:ring-red-600/30
  outline-none transition"
/>

    </div>

  </div>

  {/* 🔥 OPEN PACKAGE (MOBILE ONLY - RIGHT SIDE) */}
  <div className="flex lg:hidden items-center gap-2 shrink-0">

    <label className="relative inline-flex items-center cursor-pointer scale-75">

      <input
        type="checkbox"
        checked={order.allowToOpenPackage}
        disabled={order.bostaInfo?.deliveryId}
        onChange={(e) =>
          updateAllowToOpenPackage(order._id, e.target.checked)
        }
        className="sr-only peer"
      />

      <div className="w-7 h-4 bg-gray-300 rounded-full peer peer-checked:bg-red-700 transition-all"></div>

      <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-3"></div>

    </label>

    <span className="text-[13px] font-black uppercase opacity-80 whitespace-nowrap">
      {language === "ar" ? "فتح الشحنة" : "Open Package"}
    </span>

  </div>

</div>

          {/* 4. Total (يظهر فقط في الديسكتوب) */}
          <div className={`hidden lg:block lg:col-span-1 text-center font-[1000] italic text-[14px] ${darkMode ? 'text-red-700/50' : 'text-black'}`}>
            {finalTotal.toLocaleString()}
          </div>

     {/* 5 + 6 WRAPPER (Mobile 50/50) */}
<div className="flex gap-2 lg:contents">
{/* 5. Order Status + Audit Button */}
<div className="flex flex-col gap-2 flex-1 lg:col-span-2">

  {/* Order Status + Audit */}
  <div className="flex items-center gap-2">

    {/* Order Status */}
    <div className="flex-1">
      <select
        value={order.status}
        onChange={(e) => updateStatus(order._id, e.target.value)}
        style={{
          color: darkMode ? statusColor : "#000",
          borderLeft: `3px solid ${statusColor}`,
        }}
        className={`w-full py-2 lg:py-2.5 px-3 rounded-xl text-[12px] font-black uppercase outline-none transition-all appearance-none cursor-pointer ${
          darkMode
            ? "bg-white/5"
            : "bg-slate-50 border border-black/5"
        }`}
      >
        {STATUS_OPTIONS.map((statusKey) => (
          <option
            key={statusKey}
            value={statusKey}
            className="bg-black text-white"
          >
            {ORDER_STATUS_CONFIG[statusKey].icon}{" "}
            {language === "ar"
              ? ORDER_STATUS_CONFIG[statusKey].ar
              : ORDER_STATUS_CONFIG[statusKey].en}
          </option>
        ))}
      </select>
    </div>

   {/* Audit Button */}
<button
  onClick={() => setAuditOrder(order)}
  className={`shrink-0 h-[42px] px-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 backdrop-blur-md font-black ${
    darkMode
      ? "bg-black border-red-700/40 text-white hover:bg-red-700/10 hover:border-red-700"
      : "bg-white border-red-700/20 text-black hover:bg-red-700/5 hover:border-red-700"
  }`}
>
  <Clock className="w-4 h-4 text-red-700" />

  <span className="hidden sm:inline text-[15px] font-black whitespace-nowrap">
    {language === "ar" ? "سجل الحركة" : "Audit Log"}
  </span>
</button>
  </div>

  {/* Shipment Status */}
  <select
    value={getCurrentShipmentStatus(order)}
    onChange={(e) =>
      updateShipmentStatus(order._id, e.target.value)
    }
    className={`w-full py-2 px-3 rounded-xl text-[12px] font-black uppercase border ${
      darkMode
        ? "bg-black border-white/10 text-white"
        : "bg-white border-black/10 text-black"
    }`}
  >
    {shipmentStatuses.map((status) => (
      <option key={status.value} value={status.value}>
        {status.icon} {language === "ar" ? status.ar : status.en}
      </option>
    ))}
  </select>

  {/* Finance Status */}
  <select
    value={order.financeStatus || "Pending_Accounting"}
    onChange={(e) =>
      updateFinanceStatus(order._id, e.target.value)
    }
    className={`w-full px-2 py-2 rounded-xl text-[11px] font-black uppercase border ${
      darkMode
        ? "bg-black border-white/10 text-white"
        : "bg-white border-black/10 text-black"
    }`}
  >
    {financeStatuses.map((st) => (
      <option key={st.value} value={st.value}>
        {st.icon ? st.icon + " " : ""}
        {language === "ar" ? st.ar : st.en}
      </option>
    ))}
  </select>

</div>
 

 {/* 6. Bosta Status */}
<div className="flex-1 flex items-center justify-center lg:col-span-1">
  {order.bostaInfo?.currentState?.code !== undefined ? (
    <div
      className={`w-full text-center px-2 py-2 rounded-xl text-[9px] font-black ${
        order.bostaInfo.currentState.code === 45
          ? "bg-green-500/10 text-green-500"
          : order.bostaInfo.currentState.code === 41
          ? "bg-orange-500/10 text-orange-500"
          : order.bostaInfo.currentState.code === 47
          ? "bg-red-500/10 text-red-500"
          : order.bostaInfo.currentState.code === 46
          ? "bg-purple-500/10 text-purple-500"
          : "bg-blue-500/10 text-blue-500"
      }`}
    >
      {language === "ar"
        ? order.bostaInfo.currentState.ar || "غير معروف"
        : order.bostaInfo.currentState.en || "Unknown"}
    </div>
  ) : (
    <span className="text-[10px] font-black opacity-20">—</span>
  )}
</div>

</div>
          {/* 7. Manage Buttons */}
          <div className="flex items-center justify-between border-t lg:border-0 pt-1 lg:pt-0 border-white/5 lg:col-span-1">
        <div className="flex flex-col lg:gap-3 lg:w-fit mx-auto w-full">

  {/* 🔥 FLEX SHIPPING (DESKTOP ONLY - ABOVE OPEN PACKAGE) */}
  <div className="hidden lg:flex items-center justify-between gap-3 px-2 py-1 rounded-lg bg-white/5 border border-white/10">

    <span className="text-[10px] font-black uppercase opacity-60">
      {language === "ar" ? "فليكس شحن" : "Flex Ship"}
    </span>

    <input
      type="number"
      value={order.flexShippingInfo?.amountToBeCollected ?? order.shippingFee}
      onChange={(e) =>
        updateFlexShipping(order._id, Number(e.target.value))
      }
      disabled={order.bostaInfo?.deliveryId}
      className="w-16 h-7 px-2 rounded-md bg-black/30 text-white text-[12px] font-black outline-none border border-white/10 text-center"
    />
  </div>

  {/* 🔥 OPEN PACKAGE (DESKTOP ONLY - ABOVE) */}
  <div className="hidden lg:flex items-center justify-between gap-3 px-2 py-1 rounded-lg bg-white/5 border border-white/10">

    <span className="text-[10px] font-black uppercase opacity-60">
      {language === "ar" ? "فتح الشحنة" : "Open Package"}
    </span>

    <input
      type="checkbox"
      checked={order.allowToOpenPackage}
      disabled={order.bostaInfo?.deliveryId}
      onChange={(e) =>
        updateAllowToOpenPackage(order._id, e.target.checked)
      }
      className="w-4 h-4 accent-red-700"
    />
  </div>

  {/* 🔥 ACTION BUTTONS GRID */}
  <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 items-center">

    {/* CONFIRM */}
    <button
      onClick={() => handleConfirmOrder(order._id)}
      className="flex flex-col items-center justify-center h-10 lg:h-9 rounded-lg bg-red-700 text-white lg:bg-red-700/10 lg:text-red-700 hover:bg-red-700 hover:text-white transition-all"
    >
      <span className="text-[12px] lg:text-[10px]">🚚</span>
      <span className="lg:hidden text-[10px] font-[1000] uppercase mt-1">
        {language === "ar" ? "تأكيد" : "Confirm"}
      </span>
    </button>

    {/* EDIT */}
    <button
      onClick={() => openEditModal(order)}
      className="flex flex-col items-center justify-center h-10 lg:h-9 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
    >
      <span className="text-[12px] lg:text-[10px]">✏</span>
      <span className="lg:hidden text-[10px] font-[1000] uppercase mt-1">
        {language === "ar" ? "تعديل" : "Edit"}
      </span>
    </button>

    {/* ARCHIVE */}
    <button
      onClick={() => toggleArchive(order._id, order.archived)}
      className="flex flex-col items-center justify-center h-10 lg:h-9 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all"
    >
      <span className="text-[12px] lg:text-[10px]">📦</span>
      <span className="lg:hidden text-[10px] font-[1000] uppercase mt-1">
        {language === "ar" ? "أرشيف" : "Arch"}
      </span>
    </button>

    {/* DELETE */}
    <button
      onClick={() => deleteOrder(order._id)}
      className="flex flex-col items-center justify-center h-10 lg:h-9 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all"
    >
      <span className="text-[12px] lg:text-[10px]">🗑</span>
      <span className="lg:hidden text-[10px] font-[1000] uppercase mt-1">
        {language === "ar" ? "حذف" : "Del"}
      </span>
    </button>
{/* SHIPMENT TYPE WRAPPER */}
<div className="relative">

  <button
    onClick={(e) => {
      e.stopPropagation();
      setOpenMenu(openMenu === order._id ? null : order._id);
    }}
    className="flex flex-col items-center justify-center h-10 lg:h-9 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all w-full"
  >
    <span className="text-[12px] lg:text-[10px] opacity-0 lg:opacity-100"><span>
  {order.shipmentType === "Delivery" && " توصيل"}
  {order.shipmentType === "Exchange" && "🔄 استبدال"}
  {order.shipmentType === "Return" && "↩️ استرجاع"}
</span>
</span>
    <span className="lg:hidden text-[10px] font-[1000] uppercase mt-1">
<span>
  {order.shipmentType === "Delivery" && "🚚 توصيل"}
  {order.shipmentType === "Exchange" && "🔄 استبدال"}
  {order.shipmentType === "Return" && "↩️ استرجاع"}
</span>
    </span>
  </button>

 {openMenu === order._id && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    
    {/* BACKDROP */}
    <div
      onClick={() => setOpenMenu(null)}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    />

    {/* MODAL */}
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-[260px] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]"
    >
      <button
  onClick={() => setOpenMenu(null)}
  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition"
>
  ✕
</button>

      {/* HEADER */}
      <div className="text-[11px] text-center py-3 border-b border-white/10 text-white/70">
        {language === "ar" ? "تغيير نوع الشحنة" : "Change Shipment Type"}
      </div>

      {/* OPTIONS */}
      <div className="flex flex-col">

        <button
          onClick={() => {
            updateShipmentType(order._id, "Delivery");
            setOpenMenu(null);
          }}
          className={`px-4 py-3 text-[13px] flex items-center justify-between transition hover:bg-white/10 ${
            order.shipmentType === "Delivery"
              ? "bg-blue-500/20 text-blue-400"
              : "text-white"
          }`}
        >
          🚚 {language === "ar" ? "توصيل" : "Delivery"}
        </button>

        <button
          onClick={() => {
            updateShipmentType(order._id, "Exchange");
            setOpenMenu(null);
          }}
          className={`px-4 py-3 text-[13px] flex items-center justify-between transition hover:bg-white/10 ${
            order.shipmentType === "Exchange"
              ? "bg-orange-500/20 text-orange-400"
              : "text-white"
          }`}
        >
          🔄 {language === "ar" ? "استبدال" : "Exchange"}
        </button>

        <button
          onClick={() => {
            updateShipmentType(order._id, "Return");
            setOpenMenu(null);
          }}
          className={`px-4 py-3 text-[13px] flex items-center justify-between transition hover:bg-white/10 ${
            order.shipmentType === "Return"
              ? "bg-red-500/20 text-red-400"
              : "text-white"
          }`}
        >
          ↩️ {language === "ar" ? "استرجاع" : "Return"}
        </button>

      </div>
    </div>
  </div>
)}

</div>

  </div>
</div>
          </div>

        </div>
      );
    })}
  </div>
</div>
  </div>
)}










{/* VISTRO PAGINATION */}
{pageSize !== 0 && pageCount > 1 && (
  <div className="flex flex-col items-center gap-6 mt-20 mb-20">
    <span className={`text-[10px] font-[1000] uppercase tracking-widest opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>
       {language === "ar" ? "الصفحة" : "Page"} {currentPage + 1} / {pageCount}
    </span>
    <div className="flex justify-center items-center gap-4">
      <button
        onClick={() => { setCurrentPage((p) => Math.max(p - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={currentPage === 0}
        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all border-2 ${darkMode ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-black text-black disabled:opacity-20'}`}
      >
        {language === "ar" ? "السابق" : "Prev"}
      </button>
      <button
        onClick={() => { setCurrentPage((p) => Math.min(p + 1, pageCount - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={currentPage === pageCount - 1}
        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all border-2 ${darkMode ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-black text-black disabled:opacity-20'}`}
      >
        {language === "ar" ? "التالي" : "Next"}
      </button>
    </div>
  </div>
)}


<AnimatePresence>
  {auditOrder && (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setAuditOrder(null)}
        className="absolute inset-0"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className={`relative flex flex-col w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border shadow-2xl ${
          darkMode
            ? "bg-black border-red-700/20 text-white"
            : "bg-white border-red-700/10 text-black"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-20 flex items-center justify-between px-4 sm:px-5 py-3 border-b backdrop-blur-xl ${
            darkMode
              ? "bg-black/90 border-red-700/10"
              : "bg-white/90 border-red-700/10"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-700/10 border border-red-700/20 shrink-0">
              <Clock className="w-4 h-4 text-red-700" />
            </div>

            <div className="min-w-0">
              <h3 className="text-[14px] sm:text-lg font-black truncate">
                {language === "ar"
                  ? "سجل حركة الطلب"
                  : "Order Audit Log"}
              </h3>

              <p
                className={`text-[10px] sm:text-xs truncate ${
                  darkMode ? "text-white/40" : "text-black/40"
                }`}
              >
                {language === "ar"
                  ? "تتبع جميع التعديلات والعمليات"
                  : "Track all updates and actions"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAuditOrder(null)}
            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
              darkMode
                ? "hover:bg-red-700/10 text-white/60 hover:text-white"
                : "hover:bg-red-700/5 text-black/60 hover:text-black"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4">

          {auditOrder.auditLog && auditOrder.auditLog.length > 0 ? (

            <div className="relative">

              {/* Line */}
              <div className="absolute top-0 bottom-0 right-[9px] w-[2px] bg-red-700/15" />

              <div className="space-y-3 sm:space-y-4">

                {auditOrder.auditLog.map((log, index) => {

                  const isCreated =
                    log.action === "ORDER_CREATED";

                  const isManual =
                    log.action === "ORDER_MANUALLY_UPDATED";

                  const isFinance =
                    log.action === "FINANCE_STATUS_UPDATED";

                  const isFastPatch =
                    log.action === "ORDER_FAST_PATCH";

                  const badgeStyle = isCreated
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : isManual
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : isFinance
                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                    : isFastPatch
                    ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                    : "bg-red-700/10 text-red-700 border-red-700/20";

                  return (
                    <motion.div
                      key={log._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative pr-7"
                    >

                      {/* Dot */}
                      <div
                        className={`absolute right-[3px] top-5 w-3 h-3 rounded-full border-2 bg-black ${
                          isCreated
                            ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,.5)]"
                            : "border-red-700"
                        }`}
                      />

                      {/* Card */}
                      <div
                        className={`rounded-2xl border p-3 sm:p-4 transition-all ${
                          darkMode
                            ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.05]"
                            : "bg-black/[0.02] border-black/5 hover:bg-black/[0.03]"
                        }`}
                      >

                        {/* Top */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                          <span
                            className={`px-2 py-1 rounded-full border text-[9px] sm:text-[10px] font-black uppercase ${badgeStyle}`}
                          >
                            {log.action}
                          </span>

                          <div
                            className={`flex items-center gap-1 text-[10px] sm:text-xs ${
                              darkMode
                                ? "text-white/40"
                                : "text-black/40"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatAuditDate(log.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className={`text-[11px] sm:text-sm leading-relaxed font-medium ${
                            darkMode
                              ? "text-white/90"
                              : "text-black/80"
                          }`}
                        >
                          {log.description}
                        </p>

                        {/* Status Change */}
                        {(log.oldStatus || log.newStatus) && (
                          <div
                            className={`mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border px-2 py-1.5 w-fit text-[10px] sm:text-xs ${
                              darkMode
                                ? "bg-black border-white/5"
                                : "bg-white border-black/5"
                            }`}
                          >

                            <span
                              className={`px-2 py-0.5 rounded-lg line-through ${
                                darkMode
                                  ? "bg-white/5 text-white/40"
                                  : "bg-black/5 text-black/40"
                              }`}
                            >
                              {log.oldStatus || "-"}
                            </span>

                            <ArrowRight className="w-3 h-3 text-red-700 rotate-180" />

                            <span className="px-2 py-0.5 rounded-lg bg-red-700/10 text-red-700 font-black border border-red-700/10">
                              {log.newStatus}
                            </span>
                          </div>
                        )}

                        {/* Footer */}
                        <div
                          className={`mt-3 pt-2 border-t flex items-center flex-wrap gap-1.5 text-[10px] sm:text-xs ${
                            darkMode
                              ? "border-white/5 text-white/40"
                              : "border-black/5 text-black/40"
                          }`}
                        >
                          <User className="w-3 h-3" />

                          <span>
                            {language === "ar"
                              ? "المسؤول:"
                              : "Admin:"}
                          </span>

                          <span
                            className={`font-bold ${
                              darkMode
                                ? "text-white/80"
                                : "text-black/80"
                            }`}
                          >
                            {log.updatedBy}
                          </span>

                          {log.userId && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] border ${
                                darkMode
                                  ? "bg-white/5 border-white/5 text-white/30"
                                  : "bg-black/5 border-black/5 text-black/30"
                              }`}
                            >
                              ID: {log.userId}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          ) : (

            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Info className="w-8 h-8 text-red-700 mb-2" />

              <p
                className={`text-sm font-medium ${
                  darkMode
                    ? "text-white/50"
                    : "text-black/50"
                }`}
              >
                {language === "ar"
                  ? "لا يوجد سجل حركات حالياً"
                  : "No audit logs available"}
              </p>
            </div>

          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>


 {isEditModalOpen && editingOrder && (
  <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/80 flex justify-center items-center p-4 animate-in fade-in duration-300">
    <div className={`relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[1rem] border  transition-all duration-500 ${darkMode ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200'}`}>
      
      {/* HEADER SECTION */}
      <div className={`sticky top-0 z-20 flex justify-between items-center p-8 pb-2 border-b backdrop-blur-xl ${darkMode ? 'bg-black/60 border-white/5' : 'bg-white/80 border-slate-100'}`}>
        <div>
          <h2 className="text-sm md:text-4xl font-black uppercase  leading-none flex items-center gap-3">
            <span >🚀</span>
            {language === "ar" ? "تعديل طلب " : "Edit Order "}#{editingOrder._id.toUpperCase()}
          </h2>
        
        </div>
        <button 
          onClick={() => setIsEditModalOpen(false)} 
          className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl font-black transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-red-500 hover:text-white' : 'bg-slate-100 text-slate-900 hover:bg-red-500 hover:text-white'}`}
        >
          ×
        </button>
      </div>

      <div className="p-8 py-2 space-y-3">
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-red-700 rounded-full "></div>
            <span className="font-black uppercase  text-lg opacity-80"> {language === "ar" ? " بيانات العميل " : "Client Identity Order "}</span>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-1 p-2 rounded-[1rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        {/* city Selection */}

         <select
  value={editingOrder.shippingAddress?.city || ""}
  onChange={async (e) => {
    const selectedCityId = e.target.value;
    const selectedCity = cities.find(c => c._id === selectedCityId);
    if (!selectedCity) return;

    setEditingOrder(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        city: selectedCityId,
        districtName: ""
      }
    }));

    try {
      const res = await axios.get(`/districts/${selectedCity.bostaCityId}`);
      setDistricts(res.data);
    } catch (err) {
      console.error(err);
      setDistricts([]);
    }
  }}
  className={`w-full h-9 px-2 text-xs font-bold uppercase rounded-lg border outline-none cursor-pointer transition-all ${
    darkMode
      ? 'bg-black border-white/10 focus:border-red-700 text-white'
      : 'bg-white border-slate-200 focus:border-red-700 text-black'
  }`}
>
  <option value="">Choose City</option>
  {cities.map(c => (
    <option
      key={c._id}
      value={c._id}
      className={darkMode ? "bg-black text-white" : "bg-white text-black"}
    >
      {language === "ar" ? c.cityAr : c.cityEn}
    </option>
  ))}
</select>

            {/* District Selection */}
          <select
  value={editingOrder.shippingAddress?.districtName || ""}
  onChange={(e) =>
    setEditingOrder(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        districtName: e.target.value
      }
    }))
  }
  className={`w-full h-9 px-2 text-xs font-bold uppercase rounded-lg border outline-none cursor-pointer transition-all ${
    darkMode
      ? 'bg-black border-white/10 focus:border-red-700 text-white'
      : 'bg-white border-slate-200 focus:border-red-700 text-black'
  }`}
>
  <option value="">Choose District</option>
  {districts.map(d => (
    <option
      key={d._id}
      value={d.nameAr}
      className={darkMode ? "bg-black text-white" : "bg-white text-black"}
    >
      {d.nameAr}  
    </option>
  ))}
</select>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-[12px] font-black uppercase  opacity-40 ml-2"> {language === "ar" ? "الهاتف" : "Phone"}</label>
              <input 
                type="text" 
                className={`w-full p-2 rounded-2xl text-xs font-black border transition-all outline-none ${darkMode ? 'bg-black border-white/10 focus:border-red-700 text-white' : 'bg-white border-slate-200 focus:border-red-700 text-black'}`}
                value={editingOrder.guestInfo?.phone || ""} 
                onChange={(e) => setEditingOrder({...editingOrder, guestInfo: {...editingOrder.guestInfo, phone: e.target.value}})} 
              />
            </div>

            {/* Coupon Code */}
            <div className="space-y-1">
              <label className="block text-[13px] font-black uppercase opacity-70 ml-2 text-black "> {language === "ar" ? "🎫 الخصم" : "🎫 Voucher" } </label>
              <select 
                className={`w-full p-2 rounded-2xl text-[11px] font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-[#86FE05]' : 'bg-white border-slate-200 focus:border-red-700 text-red-700'}`}
                value={editingOrder.discount?.code || ""}
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  const selectedCoupon = coupons.find(c => c.code === selectedCode);
                  const subtotal = editingOrder.orderItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
                  let discountValue = 0;
                  if (selectedCoupon) {
                    if (selectedCoupon.discountType === "percentage" || selectedCoupon.percentage) {
                      discountValue = (subtotal * Number(selectedCoupon.percentage || 0)) / 100;
                    } else {
                      discountValue = Number(selectedCoupon.amount || selectedCoupon.discountAmount || selectedCoupon.value || 0);
                    }
                  }
                  const currentShipping = Number(editingOrder.shippingFee || 0);
                  setEditingOrder(prev => ({
                    ...prev,
                    discount: { code: selectedCode, amount: discountValue },
                    totalPrice: subtotal + currentShipping - discountValue
                  }));
                }}
              >
                <option value="">No Discount</option>
                {coupons.map(c => <option key={c._id} value={c.code} className="bg-black">{c.code}</option>)}
              </select>
            </div>

           <div className="col-span-2 md:col-span-4 space-y-1">
  <label className="block text-[10px] font-bold uppercase opacity-40 ml-1">
    {language === "ar" ? "العنوان التفصيلي" : "Detailed Address"}
  </label>

  <div className="relative">
    <textarea
      rows="2"
      className={`w-full h-14 px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-all ${
        darkMode
          ? "bg-black border-white/10 focus:border-red-700 text-white"
          : "bg-white border-slate-200 focus:border-red-700 text-black"
      }`}
      placeholder="Street name, landmark..."
      value={editingOrder.shippingAddress?.address || ""}
      onChange={(e) =>
        setEditingOrder({
          ...editingOrder,
          shippingAddress: {
            ...editingOrder.shippingAddress,
            address: e.target.value,
          },
        })
      }
    />

    {editingOrder.shippingAddress?.address && (
      <button
        onClick={() =>
          setEditingOrder({
            ...editingOrder,
            shippingAddress: {
              ...editingOrder.shippingAddress,
              address: "",
            },
          })
        }
        className="absolute top-2 left-2 text-red-500 text-sm"
      >
        ×
      </button>
    )}
  </div>
</div>

    <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-2">

  {[
    { key: "buildingNumber", label: language === "ar" ? "مبنى" : "Building" },
    { key: "floor", label: language === "ar" ? "طابق" : "Floor" },
    { key: "apartment", label: language === "ar" ? "شقة" : "Apt" },
  ].map((field) => (
    <div key={field.key} className="space-y-1">

      <label className="block text-[10px] font-bold uppercase opacity-50 ml-1">
        {field.label}
      </label>

      <input
        type="text"
        className={`w-full h-6 px-2 rounded-lg text-xs font-semibold border outline-none transition-all ${
          darkMode
            ? "bg-black border-white/10 focus:border-red-700 text-white"
            : "bg-white border-slate-200 focus:border-red-700 text-black"
        }`}
        value={editingOrder.shippingAddress?.[field.key] || ""}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            shippingAddress: {
              ...editingOrder.shippingAddress,
              [field.key]: e.target.value,
            },
          })
        }
      />

    </div>
  ))}
</div>
          </div>
        </div>

   {/* SECTION 2: INVENTORY & CART */}
<div className="space-y-3">
 <div className="flex items-center justify-between px-2 gap-2 overflow-hidden">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-2 md:gap-3 min-w-0">
    
    <div className="h-4 md:h-6 w-[2px] md:w-1 bg-red-700 rounded-full"></div>

    <span className="font-bold uppercase text-[14px] md:text-xs tracking-wide opacity-90 truncate">
      {language === "ar" ? "محتويات الشحنة" : "Package Contents"}
    </span>

  </div>

  {/* RIGHT SIDE */}
  <select
    className={`flex-shrink-0 max-w-[110px] md:max-w-none h-8 md:h-11 px-2 md:px-5 text-[9px] md:text-[11px] font-bold uppercase rounded-lg md:rounded-2xl border outline-none cursor-pointer transition-all ${
      darkMode
        ? "bg-red-700 text-black border-none   hover:scale-[1.03]"
        : "bg-black text-white"
    }`}
    value=""
    onChange={(e) => {
      const prodId = e.target.value;
      if (!prodId) return;

      const prod = products.find((p) => p._id === prodId);
      if (!prod) return;

      const firstVar =
        prod.variants?.find(v => v.price != null) || prod.variants?.[0];

      const newItem = {
        isBundle: false,
        product: prod._id,
        name: prod.name,
        price: prod.salePrice || prod.price,
        quantity: 1,
        image:
          firstVar?.images?.[0]?.url ||
          prod.images?.[0]?.url ||
          "",
        Color: firstVar?.options?.Color || "",
        Size: firstVar?.options?.Size || "",
        variantId: firstVar?._id,
        bundleItems: [],
      };

      const updatedItems = [...editingOrder.orderItems, newItem];

      const newSubtotal = updatedItems.reduce(
        (acc, i) => acc + Number(i.price) * Number(i.quantity),
        0
      );

      const shipping = Number(editingOrder.shippingFee || 0);
      const discount = Number(editingOrder.discount?.amount || 0);

      setEditingOrder({
        ...editingOrder,
        orderItems: updatedItems,
        totalPrice: Math.round(newSubtotal + shipping - discount),
      });
    }}
  >
    <option value="">
      + {language === "ar" ? "إضافة منتج" : "Add Product"}
    </option>

    {products.map((p) => (
      <option key={p._id} value={p._id} className="bg-red-700 text-white">
        {p.name} — {p.salePrice || p.price} EGP
      </option>
    ))}
  </select>

</div>


  

 <div className="space-y-1">
  {editingOrder.orderItems.map((item, index) => {
    const originalProduct = products.find(
      (p) => String(p._id) === String(item.product)
    );

    // ===================== IMAGE LOGIC =====================
    // البحث عن الـ Variant المطابق للون والمقاس معاً المختارين حالياً في هذا العنصر
    const currentVariation = originalProduct?.variants?.find(
      (v) => 
        v.options?.Color === (item.Color || item.color) &&
        v.options?.Size === (item.Size || item.size)
    );

    // اختيار الصورة بناءً على الترتيب: صورة الـ variant الحالي -> ثم الصورة الأساسية للمنتج -> ثم الصورة الاحتياطية في الـ item
    const displayImage =
      currentVariation?.images?.[0]?.url ||
      originalProduct?.images?.[0]?.url ||
      item.image;

    return (
      <div
        key={index}
        className={`relative group flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 rounded-[1.2rem] border transition-all duration-300 ${
          darkMode
            ? "bg-white/[0.02] border-white/5 hover:border-red-700/50"
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        {/* ================= TOP: IMAGE + NAME ================= */}
        <div className="flex items-center gap-2 md:min-w-[160px]">
          {/* IMAGE */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
            <img
              src={displayImage}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg border border-white/5"
            />
          </div>

          {/* NAME + PRICE */}
          <div className="flex flex-col">
            <div className="font-black uppercase text-[11px] md:text-sm leading-tight">
              {item.name}
            </div>

            <div className="text-red-700 text-[9px] font-black">
              {Number(item.price).toLocaleString()} EGP
            </div>
          </div>
        </div>

        {/* ================= MIDDLE: COLOR + SIZE (NON-BUNDLE ITEMS) ================= */}
        {!item.isBundle && (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-1 flex-1">
            {/* COLOR SELECT */}
            <select
              className="p-1 md:p-2 rounded-md text-[9px] font-black border"
              value={item.Color || item.color || ""}
              onChange={(e) => {
                const selectedColor = e.target.value;
                const currentSize = item.Size || item.size || "";
                const newItems = [...editingOrder.orderItems];

                // البحث عن الـ variant المطابق للون الجديد والمقاس الحالي
                const matchedVar = originalProduct?.variants?.find(
                  (v) => v.options?.Color === selectedColor && v.options?.Size === currentSize
                ) || originalProduct?.variants?.find(
                  (v) => v.options?.Color === selectedColor // Fallback لأول مقاس متاح من هذا اللون إذا لم يطابق المقاس الحالي
                );

                newItems[index] = {
                  ...newItems[index],
                  Color: selectedColor,
                  color: selectedColor,
                  options: {
                    Color: selectedColor,
                    Size: matchedVar?.options?.Size || currentSize,
                  },
                  image: matchedVar?.images?.[0]?.url || newItems[index].image,
                };

                setEditingOrder({
                  ...editingOrder,
                  orderItems: newItems,
                });
              }}
            >
              <option value="">Color</option>
              {originalProduct?.options
                ?.find((o) => o.name === "Color")
                ?.values?.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
            </select>

            {/* SIZE SELECT */}
            <select
              className="p-1 md:p-2 rounded-md text-[9px] font-black border"
              value={item.Size || item.size || ""}
              onChange={(e) => {
                const selectedSize = e.target.value;
                const currentColor = item.Color || item.color || "";
                const newItems = [...editingOrder.orderItems];

                // البحث عن الـ variant المطابق للمقاس الجديد واللون الحالي لجلب الصورة الصحيحة تماماً
                const matchedVar = originalProduct?.variants?.find(
                  (v) => v.options?.Color === currentColor && v.options?.Size === selectedSize
                );

                newItems[index] = {
                  ...newItems[index],
                  Size: selectedSize,
                  size: selectedSize,
                  options: {
                    ...newItems[index].options,
                    Size: selectedSize,
                  },
                  image: matchedVar?.images?.[0]?.url || newItems[index].image,
                };

                setEditingOrder({
                  ...editingOrder,
                  orderItems: newItems,
                });
              }}
            >
              <option value="">Size</option>
              {originalProduct?.variants
                ?.filter((v) => v.options?.Color === (item.Color || item.color))
                ?.map((v) => (
                  <option key={v._id} value={v.options?.Size}>
                    {v.options?.Size}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* ================= MIDDLE: BUNDLE ITEMS DISPLAY ================= */}
        {item.isBundle && (
          <div className="flex flex-col gap-2 flex-1">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div className="text-[10px] md:text-xs font-black uppercase text-red-700 tracking-wide">
                Bundle Items
              </div>

              <div className="text-[8px] md:text-[10px] px-2 py-[2px] rounded-full bg-red-700/10 text-red-700 font-bold">
                {item.bundleItems?.length || 0} items
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="flex flex-col gap-2">
              {item.bundleItems?.map((bItem, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl border 
                             bg-white/5 backdrop-blur-md 
                             hover:border-red-700/40 transition-all duration-300"
                >
                  {/* LEFT: NAME */}
                  <div className="flex flex-col">
                    <span className="font-bold text-[10px] md:text-xs uppercase tracking-wide">
                      {bItem.name}
                    </span>
                    <span className="text-[8px] opacity-60">
                      Bundle product #{i + 1}
                    </span>
                  </div>

                  {/* RIGHT: VARIANTS BADGES */}
                  <div className="flex items-center gap-2">
                    {/* COLOR BADGE */}
                    <span className="text-[8px] md:text-[10px] px-2 py-[2px] rounded-full 
                                   bg-black text-white font-bold uppercase">
                      {bItem.Color || bItem.color || "NO COLOR"}
                    </span>

                    {/* SIZE BADGE */}
                    <span className="text-[8px] md:text-[10px] px-2 py-[2px] rounded-full 
                                   bg-red-700 text-white font-bold uppercase">
                      {bItem.Size || bItem.size || "NO SIZE"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= BOTTOM: QTY + DELETE ================= */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={item.quantity}
            min="1"
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              const newItems = [...editingOrder.orderItems];
              newItems[index].quantity = val;

              const subtotal = newItems.reduce(
                (acc, i) => acc + i.price * i.quantity,
                0
              );

              setEditingOrder({
                ...editingOrder,
                orderItems: newItems,
                totalPrice:
                  subtotal +
                  Number(editingOrder.shippingFee || 0) -
                  (editingOrder.discount?.amount || 0),
              });
            }}
            className="w-10 p-1 rounded text-center border text-[9px]"
          />

          <button
            onClick={() => {
              const newItems = editingOrder.orderItems.filter(
                (_, i) => i !== index
              );

              const subtotal = newItems.reduce(
                (acc, i) => acc + i.price * i.quantity,
                0
              );

              setEditingOrder({
                ...editingOrder,
                orderItems: newItems,
                totalPrice:
                  subtotal +
                  Number(editingOrder.shippingFee || 0) -
                  (editingOrder.discount?.amount || 0),
              });
            }}
            className="w-7 h-7 rounded bg-red-700/10 text-red-700 text-xs transition-colors hover:bg-red-700 hover:text-white"
          >
            🗑
          </button>
        </div>
      </div>
    );
  })}
</div>


</div>

      {/* SECTION 3: FINAL CALCULATION */}
<div
  className={`p-4 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl transition-all ${
    darkMode ? "bg-white text-black" : "bg-slate-900 text-white"
  }`}
>
  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 md:gap-10">

    {/* LEFT SIDE */}
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-center w-full md:w-auto">

      {/* SHIPPING */}
      <div className="text-center space-y-1 md:space-y-2">
        <p className="text-[14px] md:text-[9px] font-black uppercase opacity-90 tracking-widest">
                  {language === "ar" ? "الشحن" : "Shipping"} 

        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="opacity-30 font-black">+</span>
          <input
            type="number"
            className="bg-transparent border-b border-current w-20 md:w-24 text-center font-black text-lg md:text-2xl outline-none focus:border-red-700"
            value={editingOrder.shippingFee || 0}
            onChange={(e) => {
              const fee = Number(e.target.value);
              const subtotal = editingOrder.orderItems.reduce(
                (acc, i) => acc + i.price * i.quantity,
                0
              );
              setEditingOrder({
                ...editingOrder,
                shippingFee: fee,
                totalPrice:
                  subtotal + fee - (editingOrder.discount?.amount || 0),
              });
            }}
          />
        </div>
      </div>

      {/* DISCOUNT */}
      <div className="text-center space-y-1 md:space-y-2">
        <p className="text-[14px] md:text-[9px] font-black uppercase opacity-90 ">
                {language === "ar" ? "خصم" : "Discount"}

        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="text-red-700 font-black">-</span>
          <span className="font-black text-lg md:text-2xl text-red-700">
            {editingOrder.discount?.amount || 0}
          </span>
        </div>
      </div>
    </div>

    {/* TOTAL CARD */}
    <div
      className={`p-4 md:p-8 rounded-xl md:rounded-[2rem] text-center w-full md:min-w-[280px] shadow-xl transition-transform ${
        darkMode
          ? "bg-red-700 text-black"
          : "bg-red-700 text-white"
      }`}
    >
      <p className="text-[14px] md:text-[10px] font-black uppercase tracking-widest mb-3 opacity-90">
            {language === "ar" ? "الإجمالي" : "Total"}

      </p>

      <input
        type="number"
        className="bg-transparent border-none text-3xl md:text-5xl font-black text-center w-full outline-none"
        value={editingOrder.totalPrice || 0}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            totalPrice: Number(e.target.value),
          })
        }
      />

    
    </div>
  </div>
</div>

{/* FOOTER */}
<div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-6 md:pt-10 border-t border-white/5">

  <button
    onClick={() => setIsEditModalOpen(false)}
    className={`px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[14px] md:text-[10px] tracking-widest transition-all ${
      darkMode
        ? "bg-white/5 text-white hover:bg-white/10"
        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
    }`}
  >
         {language === "ar" ? " إلغاء" : " Abort"}

  </button>

  <button
    onClick={handleUpdateOrder}
    className="px-8 md:px-14 py-3 md:py-5 rounded-xl md:rounded-2xl bg-red-700 text-white font-black uppercase text-[14px] md:text-[10px] tracking-widest shadow-lg hover:scale-105 transition-all"
  >
          {language === "ar" ? "حفظ " : " Commit"}

  </button>
</div>

      </div>
    </div>
  </div>
)}










    </div> 
  );

};
export default Orders;
