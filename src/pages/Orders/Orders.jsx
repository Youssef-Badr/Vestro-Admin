
import { useEffect, useState,useMemo  } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext"; // تأكد أن المسار صح حسب ترتيب ملفاتك
import { ORDER_STATUS_CONFIG, STATUS_OPTIONS } from "../../constants/orderConstants";
const Orders = () => {
  const { language } = useLanguage();
const { theme } = useTheme(); 
  const darkMode = theme === "dark";
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null); // الأوردر اللي بنعدله حالياً
  const [coupons, setCoupons] = useState([]); // لإحضار أكواد الخصم من الداتابيز
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [cities, setCities] = useState([]);
const [districts, setDistricts] = useState([]);
const [debouncedSearch, setDebouncedSearch] = useState(search);
const [statusFilter, setStatusFilter] = useState("all");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20); // القيمة الافتراضية اللي طلبها العميل
const [totalOrders, setTotalOrders] = useState(0); // العدد الإجمالي اللي جاي من السيرفر  const openEditModal = (order) => {
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

// 1. عرف متغير خارج الدالة أو استخدم useRef لو حابب تحافظ عليه بين الـ Renders
let abortController = null;

const fetchOrders = async () => {
  // 2. إذا كان فيه طلب شغال، الغيه فوراً
  if (abortController) {
    abortController.abort();
  }

  // 3. أنشئ controller جديد للطلب الحالي
  abortController = new AbortController();

  setLoading(true);
  try {
    const params = new URLSearchParams({
      status: statusFilter,
      startDate: startDate,
      endDate: endDate,
      page: currentPage,
      limit: pageSize,
      archived: debouncedSearch ? "all" : showArchived,
      // archived: showArchived,
      search: debouncedSearch
    });

    // 4. مرر الـ signal جوه طلب الـ axios
    const res = await axios.get(`/orders?${params.toString()}`, {
      signal: abortController.signal
    });
    
    setOrders(res.data.orders || []);
    setTotalOrders(res.data.totalOrders || 0); 

  } catch (err) {
    // 5. مهم جداً: تأكد إننا مش بنظهر Error Toast لو السبب هو إلغاء الطلب (Abort)
    if (err.name === 'CanceledError' || axios.isCancel?.(err)) {
  console.log("Fetch aborted");
  return; 
}

    console.error("Fetch Orders Error:", err);
    toast.error(language === "ar" ? "فشل في جلب الطلبات" : "Failed to fetch orders");
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
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return; 
  }
  fetchOrders();
  
}, [statusFilter, startDate, endDate, currentPage, pageSize, showArchived , debouncedSearch]); 


const allOrders = useMemo(() => {
  const normal = Array.isArray(orders) ? orders : [];
  const archived = Array.isArray(archivedOrders) ? archivedOrders : [];

  // دمج الاتنين + إضافة flag مهم
  return [
    ...normal.map(o => ({ ...o, isArchived: false })),
    ...archived.map(o => ({ ...o, isArchived: true })),
  ];
}, [orders, archivedOrders]);
// 🔥 Product Map (بدل find)
const productMap = useMemo(() => {
  const map = {};
  products.forEach(p => {
  if (!p?._id) return;
  map[p._id] = p;
});
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
    // لازم نبعت الـ status والـ ids (حتى لو أوردر واحد نحطه في array)
    await axios.put(`/orders/${id}/status`, { 
      status: newStatus,
      ids: [id] // الباكيند بتاعك بيقرأ targetIds من هنا
    });
    toast.success(language === "ar" ? "تم تحديث الحالة" : "Status updated");
    fetchOrders();
  } catch (error) {
    toast.error(language === "ar" ? "فشل في تحديث الحالة" : "Failed");
  }
};

  const fetchArchivedOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/orders/archived", { headers });
      setArchivedOrders(res.data);
    } catch (err) {
      toast.error(
        language === "ar"
          ? "فشل في جلب الطلبات المؤرشفة"
          : "Failed to fetch archived orders",
      );
    }
  };
  
 const toggleArchive = async (id, current) => {
  try {
    // 1. لازم نبعت الـ Body فيه القيمة الجديدة عشان الـ Backend يقرأها
    // لو current بـ true (مؤرشف)، هنبعت false (إلغاء أرشفة)
    await axios.put(`/orders/${id}/archive`, { 
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
    
    fetchOrders();
  } catch (err) {
    // ضيف الـ error في الـ console عشان لو حصلت مشكلة تانية تعرفها
    console.error("Archive Toggle Error:", err);
    toast.error(
      language === "ar"
        ? "فشل في تحديث حالة الأرشفة"
        : "Failed to update archive status"
    );
  }
};

  const deleteAllArchived = async () => {
    if (
      !window.confirm(
        language === "ar"
           ? "هل تريد إخفاء كل الطلبات المؤرشفة؟"
        : "Hide all archived orders?"
      )
    )
      return;

    try {
      await axios.put("/orders/delete-all-archived");

      toast.success(
        language === "ar"
          ? "تم إخفاء كل الطلبات المؤرشفة"
        : "All archived orders hidden"
      );

      fetchOrders();
      fetchArchivedOrders();
    } catch {
      toast.error(
        language === "ar"
          ? "فشل في إخفاء الأرشيف"
        : "Failed to hide archived orders"
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
 
// const handleShipToBosta = async (orderId, showToast = true) => {
//   try {
//     // console.log(`--- [START] Shipping Order ID: ${orderId} to Bosta ---`);

//     const res = await axios.post(`/orders/${orderId}/ship-bosta`);

//     // console.log("--- [SUCCESS] Bosta Response Data:", res.data);

//     // بنظهر توست النجاح "فقط" لو showToast بـ true
//     if (res.data.success && showToast) {
//       toast.success(res.data.message);
//     }

//     // بنحدث الجدول فقط لو مش Bulk عشان ميحصلش ريندر كتير
//     if (showToast) fetchOrders();

//     return res.data; // بنرجع الداتا عشان نحتاجها في الـ Bulk

//   } catch (err) {
//     console.error("--- [ERROR] Bosta Shipping Failed ---");
//     const errorMessage = err.response?.data?.message || "حدث خطأ في النظام";

//     // بنظهر توست الخطأ "فقط" لو showToast بـ true
//     if (showToast) {
//       if (err.response?.status === 400) {
//         toast.warning(errorMessage);
//       } else {
//         toast.error(errorMessage);
//       }
//     }

//     // ضروري نـ throw الخطأ عشان الـ Bulk Confirm يحس بيه
//     throw { id: orderId, message: errorMessage };
//   }
// };

// const handleConfirmOrder = async (orderId, showToast = true) => {
//   try {
//     // 1. تحديث الحالة
//     const statusRes = await axios.put(`/orders/${orderId}/status`, { status: "Shipped" });
    
//     // إظهار نجاح الحالة فقط في الزرار المنفرد
//     if (showToast) {
//       // toast.success(statusRes.data.message || "تم التأكيد"); // ممكن تشيل دي لو مش عاوز رسايل كتير
//     }

//     // 2. استدعاء دالة الشحن (هي اللي هتطلع توست النجاح أو التحذير)
//     await handleShipToBosta(orderId, showToast);

//     // تحديث الجدول في حالة الزرار المنفرد
//     if (showToast) fetchOrders();

//   } catch (err) {
//     const msg = err.response?.data?.message || "Confirm failed";

//     // لو ده زرار منفرد (showToast = true)
//     if (showToast) {
//       // إحنا مش هنطلع toast.error هنا لأن handleShipToBosta طلعت الـ toast بتاعها خلاص
//       console.error("Single confirm handled error:", msg);
//       fetchOrders(); // حدث الجدول عشان يظهر التغيير
//     } else {
//       // لو إحنا في Bulk، بنرمي الخطأ عشان دالة الـ Bulk تجمع الـ IDs الفاشلة
//       throw { id: orderId, message: msg };
//     }
//   }
// };

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


const computeFinalTotal = (order) => {
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

 
// تأكد أنك بتستخدم Optional Chaining أو default values
const allOrdersToShow = useMemo(() => {
  const data = showArchived ? archivedOrders : orders;
  return Array.isArray(data) ? data : [];
}, [showArchived, archivedOrders, orders]);

const safeOrders = useMemo(() => {
  return Array.isArray(allOrdersToShow) ? allOrdersToShow : [];
}, [allOrdersToShow]);

const pageCount = useMemo(() => {
  return totalOrders > 0 ? Math.ceil(totalOrders / (pageSize || 20)) : 0;
}, [totalOrders, pageSize]); 


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

    {/* TITLE */}
    <h1 className={`text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2 ${
      darkMode ? 'text-white' : 'text-black'
    }`}>
      <span className="text-red-700">🧾</span>
      {language === "ar" ? "الطلبات" : "Orders"}
    </h1>

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
          const newState = !showArchived;
          setShowArchived(newState);

          if (newState) {
            fetchArchivedOrders();
          } else {
            fetchOrders();
          }
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

      {/* 🗑 DELETE ARCHIVE */}
      {showArchived && (
        <button
          onClick={deleteAllArchived}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
            darkMode
              ? "bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white"
              : "bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          🗑 {language === "ar" ? "مسح الأرشيف" : "Clear"}
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
      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
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

  {/* 📦 ROWS / CARDS */}
  <div className={`divide-y ${darkMode ? 'divide-white/[0.05]' : 'divide-black/[0.05]'}`}>
    {safeOrders?.map((order) => {
      const finalTotal = order.totalPrice ?? computeFinalTotal(order);
      const statusColor = ORDER_STATUS_CONFIG[order.status]?.color || "#888";

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
            href={`https://wa.me/2${order.guestInfo?.phone}`} 
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
                href={`https://wa.me/2${order.guestInfo.secondaryPhone}`} 
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
          <div className="flex items-center justify-between lg:col-span-2">
            <span className={`text-[12px] lg:text-[13px] font-black uppercase truncate tracking-tight ${darkMode ? 'text-white/40' : 'text-black/60'}`}>
              📍 {formatCompactAddress(order.shippingAddress)}
            </span>
          {/* في الموبايل حالة بوسطة تظهر بجانب العنوان */}
<div className="lg:hidden">
  {order.bostaInfo?.currentState?.en ? (
    <div
      className={`px-2 py-0.5 rounded-md text-[9px] font-[1000] uppercase ${
        order.bostaInfo.currentState.code === 45
          ? "bg-green-500/10 text-green-500"
          : order.bostaInfo.currentState.code === 41
          ? "bg-orange-500/10 text-orange-500"
          : order.bostaInfo.currentState.code === 47
          ? "bg-red-500/10 text-red-500"
          : "bg-blue-500/10 text-blue-500"
      }`}
    >
      {language === "ar"
        ? order.bostaInfo.currentState.ar
        : order.bostaInfo.currentState.en}
    </div>
  ) : (
    <span className="text-[9px] opacity-30">—</span>
  )}
</div>
          </div>

          {/* 4. Total (يظهر فقط في الديسكتوب) */}
          <div className={`hidden lg:block lg:col-span-1 text-center font-[1000] italic text-[14px] ${darkMode ? 'text-red-700/50' : 'text-black'}`}>
            {finalTotal.toLocaleString()}
          </div>

     {/* 5 + 6 WRAPPER (Mobile 50/50) */}
<div className="flex gap-2 lg:contents">

  {/* 5. Status Select */}
  <div className="flex-1 lg:col-span-2">
    <select
      value={order.status}
      onChange={(e) => updateStatus(order._id, e.target.value)}
      style={{ color: darkMode ? statusColor : "#000", borderLeft: `3px solid ${statusColor}` }}
      className={`w-full py-2 lg:py-2.5 px-3 rounded-xl text-[12px] font-black uppercase outline-none transition-all appearance-none cursor-pointer ${darkMode ? 'bg-white/5' : 'bg-slate-50 border border-black/5'}`}
    >
      {STATUS_OPTIONS.map((statusKey) => (
        <option key={statusKey} value={statusKey} className="bg-black text-white">
          {ORDER_STATUS_CONFIG[statusKey].icon} {language === "ar" ? ORDER_STATUS_CONFIG[statusKey].ar : ORDER_STATUS_CONFIG[statusKey].en}
        </option>
      ))}
    </select>
  </div>

  {/* 6. Bosta Status */}
<div className="flex-1 flex items-center justify-center lg:col-span-1">
  {order.bostaInfo?.currentState?.ar ? (
    <div
      className={`w-full text-center px-2 py-2 rounded-xl text-[9px] font-black ${
        order.bostaInfo.currentState.code === 45
          ? "bg-green-500/10 text-green-500"
          : order.bostaInfo.currentState.code === 41
          ? "bg-orange-500/10 text-orange-500"
          : order.bostaInfo.currentState.code === 47
          ? "bg-red-500/10 text-red-500"
          : "bg-blue-500/10 text-blue-500"
      }`}
    >
      {language === "ar"
        ? order.bostaInfo.currentState.ar
        : order.bostaInfo.currentState.en}
    </div>
  ) : (
    <span className="text-[10px] font-black opacity-20">—</span>
  )}
</div>

</div>
          {/* 7. Manage Buttons */}
          <div className="flex items-center justify-between border-t lg:border-0 pt-1 lg:pt-0 border-white/5 lg:col-span-1">
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 lg:w-fit mx-auto w-full">
              <button onClick={() => handleConfirmOrder(order._id)} className="flex flex-col lg:flex-row items-center justify-center h-10 lg:h-8 lg:w-8 rounded-lg bg-red-700 text-white lg:bg-red-700/10 lg:text-red-700 hover:bg-red-700 hover:text-white transition-all">
                <span className="text-[12px] lg:text-[10px]">🚚 </span>
                <span className="lg:hidden text-[8px] font-[1000] uppercase mt-1">{language === "ar" ? "تأكيد" : "Confitm"}</span>
              </button>
              <button onClick={() => openEditModal(order)} className="flex flex-col lg:flex-row items-center justify-center h-10 lg:h-8 lg:w-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                <span className="text-[12px] lg:text-[10px]">✏</span>
                <span className="lg:hidden text-[8px] font-[1000] uppercase mt-1">  {language === "ar" ? "تعديل" : "Edit"}
</span>
              </button>
              <button onClick={() => toggleArchive(order._id, order.archived)} className="flex flex-col lg:flex-row items-center justify-center h-10 lg:h-8 lg:w-8 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all">
                <span className="text-[12px] lg:text-[10px]">📦</span>
                <span className="lg:hidden text-[8px] font-[1000] uppercase mt-1">  {language === "ar" ? "أرشيف" : "Arch"}
</span>
              </button>
              <button onClick={() => deleteOrder(order._id)} className="flex flex-col lg:flex-row items-center justify-center h-10 lg:h-8 lg:w-8 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                <span className="text-[12px] lg:text-[10px]">🗑</span>
                <span className="lg:hidden text-[8px] font-[1000] uppercase mt-1">  {language === "ar" ? "حذف" : "Del"}
</span>
              </button>
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

 {isEditModalOpen && editingOrder && (
  <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/80 flex justify-center items-center p-4 animate-in fade-in duration-300">
    <div className={`relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[3.5rem] border shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-500 ${darkMode ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200'}`}>
      
      {/* HEADER SECTION */}
      <div className={`sticky top-0 z-20 flex justify-between items-center p-8 border-b backdrop-blur-xl ${darkMode ? 'bg-black/60 border-white/5' : 'bg-white/80 border-slate-100'}`}>
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-3">
            <span className="text-[#86FE05] drop-shadow-[0_0_10px_rgba(134,254,5,0.4)]">🚀</span>
            {language === "ar" ? "تعديل الطلب الاحترافي" : "Order Control"}
          </h2>
          <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] mt-2 ml-10">Advanced Management Interface</p>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(false)} 
          className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl font-black transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-red-500 hover:text-white' : 'bg-slate-100 text-slate-900 hover:bg-red-500 hover:text-white'}`}
        >
          ×
        </button>
      </div>

      <div className="p-8 space-y-10">
        
        {/* SECTION 1: CUSTOMER & LOGISTICS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-[#86FE05] rounded-full shadow-[0_0_10px_#86FE05]"></div>
            <span className="font-black uppercase italic tracking-widest text-xs opacity-50">Logistics & Client Identity</span>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
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
  className={`w-full p-4 rounded-2xl text-xs font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${
    darkMode
      ? 'bg-black border-white/10 focus:border-[#86FE05] text-white'
      : 'bg-white border-slate-200 focus:border-black text-black'
  }`}
>
  <option value="">Choose City</option>
  {cities.map(c => (
    <option
      key={c._id}
      value={c._id}
      className={darkMode ? "bg-black text-white" : "bg-white text-black"}
    >
      {c.cityAr}
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
  className={`w-full p-4 rounded-2xl text-xs font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${
    darkMode
      ? 'bg-black border-white/10 focus:border-[#86FE05] text-white'
      : 'bg-white border-slate-200 focus:border-black text-black'
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
            <div className="space-y-2">
              <label className="block text-[12px] font-black uppercase tracking-widest opacity-40 ml-2">Phone / الهاتف</label>
              <input 
                type="text" 
                className={`w-full p-4 rounded-2xl text-xs font-black border transition-all outline-none ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-white' : 'bg-white border-slate-200 focus:border-black'}`}
                value={editingOrder.guestInfo?.phone || ""} 
                onChange={(e) => setEditingOrder({...editingOrder, guestInfo: {...editingOrder.guestInfo, phone: e.target.value}})} 
              />
            </div>

            {/* Coupon Code */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 text-[#86FE05]">🎫 Voucher / الخصم</label>
              <select 
                className={`w-full p-4 rounded-2xl text-[11px] font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-[#86FE05]' : 'bg-white border-slate-200 focus:border-black text-blue-600'}`}
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

            {/* Full Address */}
            <div className="md:col-span-4 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Detailed Address / العنوان التفصيلي</label>
              <div className="relative group">
                <textarea 
                  rows="2"
                  className={`w-full p-5 rounded-[1.5rem] text-xs font-black transition-all outline-none border ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-white' : 'bg-white border-slate-200 focus:border-black'}`}
                  placeholder="Street name, landmark..."
                  value={editingOrder.shippingAddress?.address || ""} 
                  onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: { ...editingOrder.shippingAddress, address: e.target.value } })} 
                />
                {editingOrder.shippingAddress?.address && (
                  <button onClick={() => setEditingOrder({...editingOrder, shippingAddress: { ...editingOrder.shippingAddress, address: "" } })} className="absolute top-4 left-4 text-red-500 hover:scale-125 transition-transform">×</button>
                )}
              </div>
            </div>

            {/* Building info grid */}
            <div className="md:col-span-4 grid grid-cols-3 gap-4">
               {['buildingNumber', 'floor', 'apartment'].map((field) => (
                 <div key={field} className="space-y-2">
                   <label className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ml-2">{field}</label>
                   <input 
                    type="text" 
                    className={`w-full p-4 rounded-xl text-xs font-black border transition-all ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-white' : 'bg-white border-slate-200 focus:border-black'}`}
                    value={editingOrder.shippingAddress?.[field] || ""} 
                    onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: { ...editingOrder.shippingAddress, [field]: e.target.value } })} 
                  />
                 </div>
               ))}
            </div>
          </div>
        </div>

   {/* SECTION 2: INVENTORY & CART */}
<div className="space-y-6">
  <div className="flex justify-between items-center px-2">
    <div className="flex items-center gap-3">
      <div className="h-6 w-1 bg-[#86FE05] rounded-full shadow-[0_0_10px_#86FE05]"></div>
      <span className="font-black uppercase italic tracking-widest text-[10px] opacity-60">
        {language === "ar" ? "محتويات الشحنة" : "Package Contents"}
      </span>
    </div>
    
  <select
  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all outline-none appearance-none cursor-pointer ${
    darkMode
      ? "bg-[#86FE05] text-black border-none shadow-[0_10px_30px_rgba(134,254,5,0.3)] hover:scale-105"
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
    + {language === "ar" ? "إضافة منتج جديد" : "ADD ITEM TO ORDER"}
  </option>

  {products.map((p) => (
    <option key={p._id} value={p._id} className="bg-black text-white">
      {p.name} — {p.salePrice || p.price} EGP
    </option>
  ))}
</select>


  </div>



  

  <div className="space-y-4">
  {editingOrder.orderItems.map((item, index) => {
    const originalProduct = products.find(
      (p) => String(p._id) === String(item.product)
    );

    // ===================== IMAGE =====================
    const currentVariation = originalProduct?.variations?.find(
      (v) => v.color === (item.color || item.Color)
    );

    const displayImage =
      currentVariation?.images?.[0]?.url || item.image;

    return (
      <div
  key={index}
  className={`relative group flex flex-col md:flex-row items-start gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${
    darkMode
      ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-[#86FE05]/20"
      : "bg-white border-slate-100 shadow-xl"
  }`}
>

  {/* ===================== IMAGE ===================== */}
  <div className="relative w-24 h-24 md:w-20 md:h-20 shrink-0">
    <div
      className={`absolute inset-0 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 ${
        darkMode ? "bg-[#86FE05]/10" : "bg-slate-100"
      }`}
    />

    {displayImage ? (
      <img
        src={displayImage}
        alt={item.name}
        className="relative z-10 w-full h-full object-cover rounded-2xl shadow-2xl border border-white/5"
      />
    ) : (
      <div className="relative z-10 w-full h-full flex items-center justify-center bg-zinc-800 rounded-2xl text-xl opacity-20">
        📦
      </div>
    )}
  </div>

  {/* ===================== INFO ===================== */}
  <div className="flex-1 min-w-[150px] text-center md:text-left">
    <div className="text-[9px] font-black uppercase opacity-20 tracking-[0.3em] mb-1">
      SKU_{item.product?.slice(-5).toUpperCase()}
    </div>

    <div className="font-black italic uppercase text-lg tracking-tighter group-hover:text-[#80f305] transition-colors leading-none">
      {item.name}
    </div>

    <div className="text-[#62ba05] text-[11px] font-black mt-2 italic tracking-tighter">
      {Number(item.price).toLocaleString()} EGP
    </div>
  </div>

  {/* ===================== PRODUCT / NORMAL ===================== */}
  {!item.isBundle && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full md:w-auto">

      {/* COLOR BOX */}
      <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
        <label className="text-[8px] font-black uppercase opacity-40 ml-1">
          Color
        </label>

        <select
          className="w-full p-3 rounded-xl text-[10px] font-black border"
          value={item.Color || item.color || ""}
          onChange={(e) => {
            const selectedColor = e.target.value;
            const newItems = [...editingOrder.orderItems];

            const matchedVar = originalProduct?.variants?.find(
              (v) => v.options?.Color === selectedColor
            );

            newItems[index] = {
              ...newItems[index],
              Color: selectedColor,
              color: selectedColor,
              options: {
                Color: selectedColor,
                Size:
                  matchedVar?.options?.Size ||
                  newItems[index].Size ||
                  "",
              },
              image:
                matchedVar?.images?.[0]?.url ||
                newItems[index].image,
            };

            setEditingOrder({
              ...editingOrder,
              orderItems: newItems,
            });
          }}
        >
          <option value="">Select Color</option>

          {originalProduct?.options
            ?.find((o) => o.name === "Color")
            ?.values?.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
        </select>
      </div>

      {/* SIZE BOX */}
      <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
        <label className="text-[8px] font-black uppercase opacity-40 ml-1">
          Size
        </label>

        <select
          className="w-full p-3 rounded-xl text-[10px] font-black border"
          value={item.Size || item.size || ""}
          onChange={(e) => {
            const selectedSize = e.target.value;
            const newItems = [...editingOrder.orderItems];

            newItems[index] = {
              ...newItems[index],
              Size: selectedSize,
              size: selectedSize,
              options: {
                ...newItems[index].options,
                Size: selectedSize,
              },
            };

            setEditingOrder({
              ...editingOrder,
              orderItems: newItems,
            });
          }}
        >
          <option value="">Size</option>

          {originalProduct?.variants
            ?.filter(
              (v) =>
                v.options?.Color === (item.Color || item.color)
            )
            ?.map((v) => (
              <option key={v._id} value={v.options?.Size}>
                {v.options?.Size}
              </option>
            ))}
        </select>
      </div>
    </div>
  )}

  {/* ===================== BUNDLE ===================== */}
  {item.isBundle && (
    <div className="w-full mt-4 space-y-3 border-t border-white/10 pt-4">

      <div className="text-[10px] font-black uppercase opacity-50">
        Bundle Items
      </div>

     {item.bundleItems?.map((bi, biIndex) => {
  const product = products.find(
    (p) => String(p._id) === String(bi.product)
  );

  const biImage =
    bi.image ||
    product?.images?.[0]?.url ||
    "";

  return (
    <div
      key={biIndex}
      className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-xl bg-white/5 border border-white/10 items-center"
    >

      {/* ================= IMAGE + NAME ================= */}
      <div className="flex items-center gap-3">

        {/* IMAGE */}
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
          {biImage ? (
            <img
              src={biImage}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-40">
              📦
            </div>
          )}
        </div>

        {/* NAME */}
        <div className="font-bold text-xs">
          {bi.name}
        </div>
      </div>

      {/* ================= COLOR ================= */}
      <select
        value={bi.color || ""}
        onChange={(e) => {
          const newItems = [...editingOrder.orderItems];

          newItems[index].bundleItems[biIndex].color = e.target.value;

          newItems[index].bundleItems[biIndex].options = {
            ...newItems[index].bundleItems[biIndex].options,
            Color: e.target.value,
          };

          setEditingOrder({
            ...editingOrder,
            orderItems: newItems,
          });
        }}
        className="p-2 rounded-lg border bg-black/40"
      >
        <option value="">Color</option>

        {product?.options
          ?.find((o) => o.name === "Color")
          ?.values?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
      </select>

      {/* ================= SIZE ================= */}
      <select
        value={bi.size || ""}
        onChange={(e) => {
          const newItems = [...editingOrder.orderItems];

          newItems[index].bundleItems[biIndex].size = e.target.value;

          newItems[index].bundleItems[biIndex].options = {
            ...newItems[index].bundleItems[biIndex].options,
            Size: e.target.value,
          };

          setEditingOrder({
            ...editingOrder,
            orderItems: newItems,
          });
        }}
        className="p-2 rounded-lg border bg-black/40"
      >
        <option value="">Size</option>

        {product?.variants
          ?.filter((v) => v.options?.Color === bi.color)
          ?.map((v) => (
            <option key={v._id} value={v.options?.Size}>
              {v.options?.Size}
            </option>
          ))}
      </select>

    </div>
  );
})}
    </div>
  )}

  {/* ===================== QTY + DELETE ===================== */}
  <div className="p-3 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-2">

    <input
      type="number"
      value={item.quantity}
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
      className="w-16 p-2 rounded-lg text-center border"
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
      className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500"
    >
      🗑
    </button>
  </div>
</div>
    );
  })}
</div>





</div>

        {/* SECTION 3: FINAL CALCULATION (THE BLACK CARD) */}
        <div className={`p-10 rounded-[3rem] shadow-2xl transition-all ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            
            <div className="flex gap-8 items-center">
              <div className="text-center space-y-2">
                <p className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em]">Logistics / الشحن</p>
                <div className="flex items-center gap-2">
                  <span className="opacity-30 font-black">+</span>
                  <input 
                    type="number" 
                    className="bg-transparent border-b-2 border-current w-24 text-center font-black text-2xl outline-none focus:border-[#86FE05]"
                    value={editingOrder.shippingFee || 0}
                    onChange={(e) => {
                      const fee = Number(e.target.value);
                      const subtotal = editingOrder.orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                      setEditingOrder({ ...editingOrder, shippingFee: fee, totalPrice: subtotal + fee - (editingOrder.discount?.amount || 0) });
                    }}
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em]">Discount / خصم</p>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-black">-</span>
                  <span className="font-black text-2xl text-red-500">{editingOrder.discount?.amount || 0}</span>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-[2rem] text-center min-w-[280px] shadow-xl transform hover:scale-105 transition-transform ${darkMode ? 'bg-black text-[#86FE05]' : 'bg-[#86FE05] text-black'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Total Receivable / الإجمالي</p>
              <div className="flex items-center justify-center gap-2">
                <input 
                  type="number"
                  className="bg-transparent border-none text-5xl font-black text-center w-full focus:ring-0 cursor-text tracking-tighter"
                  value={editingOrder.totalPrice || 0}
                  onChange={(e) => setEditingOrder({...editingOrder, totalPrice: Number(e.target.value)})}
                />
              </div>
              <p className="text-[8px] font-bold mt-4 uppercase tracking-widest opacity-40 italic">Manual override enabled *</p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-4 pt-10 border-t border-white/5">
          <button 
            onClick={() => setIsEditModalOpen(false)} 
            className={`px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
          >
            Abort / إلغاء
          </button>
          <button 
            onClick={handleUpdateOrder} 
            className="px-14 py-5 rounded-2xl bg-[#86FE05] text-black font-black uppercase text-[10px] tracking-widest shadow-[0_15px_40px_rgba(134,254,5,0.3)] hover:scale-105 transition-all"
          >
            Commit Changes / حفظ
          </button>
        </div>

      </div>
    </div>
  </div>
)}

    </div> 
  );

//   return (
//     <div
//       className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen pt-16 md:pt-0 text-gray-900 dark:text-gray-100"
//       dir={language === "ar" ? "rtl" : "ltr"}
//     >
// {/* --- VISTRO HEADER SECTION --- */}
// <div className={`flex flex-col gap-6  mb-8 p-8 rounded-[2.5rem] border transition-all duration-500 ${darkMode ? 'bg-[#0D0D0D] border-white/[0.08] shadow-2xl' : 'bg-white border-black/10 shadow-sm'}`}>
//   <div className="flex flex-col md:flex-row justify-between items-center gap-6">
//     <h1 className={`text-3xl md:text-5xl font-[1000] uppercase tracking-tighter italic leading-none ${darkMode ? 'text-white' : 'text-black'}`}>
//       <span className={`${darkMode ? 'text-[#86FE05]/80' : 'text-black'} not-italic ml-2 drop-shadow-[0_0_10px_rgba(134,254,5,0.2)]`}>🧾</span>
//       {language === "ar" ? "الطلبات" : "Orders"}
//     </h1>

//     <div className="flex gap-3 w-full md:w-auto flex-wrap justify-center">
//       <input
//         type="text"
//         placeholder={language === "ar" ? "🔍     بحث سريع باسم العميل او رقم الهاتف ..." : "🔍 Search by ID or Phone..."}
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className={`flex-grow md:w-72 px-6 py-4 rounded-2xl text-[12px] font-[1000] uppercase transition-all outline-none border ${
//           darkMode 
//           ? "bg-white/[0.05] border-white/20 focus:border-[#86FE05]/40 text-white placeholder:text-white/20" 
//           : "bg-slate-50 border-black/10 focus:border-black text-black placeholder:text-black/40"
//         }`}
//       />

//       <button onClick={handleExportToExcel} className={`px-6 py-4 rounded-2xl text-[11px] font-[1000] uppercase tracking-widest transition-all ${darkMode ? 'bg-white/[0.08] text-white/70 hover:bg-[#86FE05]/20 hover:text-[#86FE05]' : 'bg-black text-white hover:bg-zinc-800'}`}>
//         📥 Export
//       </button>

//       <button 
//         onClick={() => { setShowArchived(!showArchived); if (!showArchived) fetchArchivedOrders(); }}
//         className={`px-6 py-4 rounded-2xl text-[11px] font-[1000] uppercase tracking-widest transition-all ${showArchived ? (darkMode ? 'bg-[#86FE05] text-black shadow-lg' : 'bg-black text-white shadow-xl') : darkMode ? 'bg-white/[0.05] text-white/70' : 'bg-zinc-100 text-black'}`}
//       >
//         {showArchived ? (language === "ar" ? "إخفاء الأرشيف" : "Hide Archive") : (language === "ar" ? "عرض الأرشيف" : "Show Archive")}
//       </button>
//       {/* الزرار الجديد: يظهر فقط جوه الأرشيف */}
//   {showArchived && (
//     <button 
//       onClick={deleteAllArchived}
//       className="px-6 py-4 rounded-2xl text-[11px] font-[1000] uppercase tracking-widest transition-all bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-lg flex items-center gap-2"
//     >
//       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
//       {language === "ar" ? "تصفية الأرشيف نهائياً" : "Clear Archive Permanently"}
//     </button>
//   )}
//     </div>
//   </div>

//   {/* 🔥 بار الفلاتر الجديد (حالات الطلب + التاريخ + حجم الصفحة) */}
//   <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-3xl ${darkMode ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
//     {/* فلتر الحالة */}
//     <select 
//       value={statusFilter}
//       onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
//       className={`p-4 rounded-2xl text-[11px] font-black uppercase outline-none border ${darkMode ? 'bg-black border-white/10 text-[#86FE05]' : 'bg-white border-black/10'}`}
//     >
//       <option value="all">{language === "ar" ? "كل الحالات" : "All Status"}</option>
//       {STATUS_OPTIONS.map(status => (
//         <option key={status} value={status}>
//           {language === "ar" ? ORDER_STATUS_CONFIG[status].ar : ORDER_STATUS_CONFIG[status].en}
//         </option>
//       ))}
//     </select>

//    {/* فلتر التاريخ من */}
// <div className="flex flex-col gap-1">
//   <span className="text-[9px] font-black opacity-50 uppercase px-2">
//     {language === "ar" ? "من تاريخ" : "From Date"}
//   </span>
//   <input 
//     type="date" 
//     value={startDate}
//     onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
//     className={`p-3 rounded-xl text-[11px] font-black outline-none border transition-all ${
//       darkMode 
//       ? 'bg-black border-white/10 text-white [color-scheme:dark]' 
//       : 'bg-white border-black/10 [color-scheme:light]'
//     }`}
//   />
// </div>

// {/* فلتر التاريخ إلى */}
// <div className="flex flex-col gap-1">
//   <span className="text-[9px] font-black opacity-50 uppercase px-2">
//     {language === "ar" ? "إلى تاريخ" : "To Date"}
//   </span>
//   <input 
//     type="date" 
//     value={endDate}
//     onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
//     className={`p-3 rounded-xl text-[11px] font-black outline-none border transition-all ${
//       darkMode 
//       ? 'bg-black border-white/10 text-white [color-scheme:dark]' 
//       : 'bg-white border-black/10 [color-scheme:light]'
//     }`}
//   />
// </div>
//     {/* حجم الصفحة */}
//    <div className="flex flex-col gap-1">
//   <span className="text-[15px] font-black  uppercase px-2">
//     {language === "ar" ? "إظهار الصفحات" : "Show Amount"}
//   </span>
//   <select 
//     value={pageSize}
//     onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
//     className={`p-3 rounded-xl text-[11px] font-black uppercase outline-none border ${
//       darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-black/10'
//     }`}
//   >
//     <option value={50}>50 {language === "ar" ? "طلب" : "Orders"}</option>
//     <option value={100}>100 {language === "ar" ? "طلب" : "Orders"}</option>
//     <option value={0}>{language === "ar" ? "عرض الكل" : "Show All"}</option>
//   </select>
// </div>
//   </div>
// </div>



// {loading ? (
//   <div className="flex justify-center py-20">
//     <div className={`w-12 h-12 border-4 rounded-full animate-spin ${darkMode ? 'border-[#86FE05]/10 border-t-[#86FE05]/60' : 'border-black/10 border-t-black'}`}></div>
//   </div>
// ) : (
//   <div className="flex flex-col gap-6">
//     {/* VISTRO BULK BAR */}
//     {selectedOrderIds.length > 0 && (
//       <div className={`sticky top-24 z-40 p-5 rounded-[2.5rem] shadow-2xl flex flex-wrap justify-between items-center animate-in fade-in slide-in-from-top-4 ${darkMode ? 'bg-[#86FE05]/90 backdrop-blur-md text-black' : 'bg-black text-white'}`}>
//         <div className="font-[1000] italic uppercase text-sm px-4">{selectedOrderIds.length} Selected</div>
//         <div className="flex gap-2 flex-wrap">
//           <button onClick={handleBulkConfirm} className={`px-5 py-2.5 rounded-xl text-[10px] font-[1000] uppercase hover:scale-105 transition-transform ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>🚚 Confirm</button>
//           <button onClick={() => handleBulkArchive(true)} className={`px-5 py-2.5 rounded-xl text-[10px] font-[1000] uppercase ${darkMode ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20'}`}>📦 Archive</button>
//           <button onClick={handleBulkDelete} className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-[1000] uppercase shadow-lg">🗑 Delete</button>
//           <button onClick={() => setSelectedOrderIds([])} className="px-4 py-2.5 text-[10px] font-[1000] uppercase underline decoration-2 underline-offset-4 opacity-70">Clear</button>
//         </div>
//       </div>
//     )}

//   {/* VISTRO TABLE CONTAINER */}
// <div className={`mx-auto w-full max-w-[1600px] rounded-[2rem] md:rounded-[3rem] border overflow-hidden transition-all duration-700 ${darkMode ? 'bg-[#0A0A0A] border-white/[0.08] shadow-2xl' : 'bg-white border-black/10 shadow-xl'}`}>
  
//   {/* HEADER - Desktop Only */}
//   <div className={`hidden lg:grid grid-cols-12 gap-2 p-6 border-b text-[15px] font-[1000] uppercase tracking-[0.2em] ${darkMode ? 'bg-white/[0.03] border-white/[0.08] text-white/40' : 'bg-slate-50 border-black/5 text-black/80'}`}>
//     <div className="col-span-1 flex justify-center">
//       <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} className={`w-5 h-5 ${darkMode ? 'accent-[#86FE05]/60' : 'accent-black'}`} />
//     </div>
//     <div className="col-span-2">{language === "ar" ? "العميل" : "Customer"}</div>
//     <div className="col-span-2">{language === "ar" ? "الهاتف" : "Phone"}</div>
//     <div className="col-span-2">{language === "ar" ? "العنوان" : "Address"}</div>
//     <div className="col-span-1 text-center">{language === "ar" ? "المجموع" : "Total"}</div>
//     <div className="col-span-2 text-center">{language === "ar" ? "الحالة" : "Status"}</div>
//     <div className="col-span-1 text-center">{language === "ar" ? "بوسطة" : "Bosta"}</div>
//     <div className="col-span-1 text-center">{language === "ar" ? "الإدارة" : "Manage"}</div>
//   </div>

//   {/* ROWS / CARDS */}
//   <div className={`divide-y ${darkMode ? 'divide-white/[0.05]' : 'divide-black/[0.05]'}`}>
//     {safeOrders?.map((order) => {
//       const finalTotal = order.totalPrice ?? computeFinalTotal(order);
//       const statusColor = ORDER_STATUS_CONFIG[order.status]?.color || "#888";

//       return (
//         <div key={order._id} className={`group p-5 md:p-6 lg:p-4 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-2 lg:items-center transition-all duration-300 ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'}`}>
          
//           {/* 1. Customer Info */}
//           <div className="flex items-center justify-between lg:col-span-3 lg:contents">
//             <div className="flex items-center gap-3 lg:col-span-3">
//               <input
//                 type="checkbox"
//                 checked={selectedOrderIds.includes(order._id)}
//                 onChange={(e) => {
//                   if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order._id]);
//                   else setSelectedOrderIds(selectedOrderIds.filter((id) => id !== order._id));
//                 }}
//                 className={`min-w-[22px] w-[22px] h-[22px] rounded-lg cursor-pointer ${darkMode ? 'accent-[#86FE05]/60' : 'accent-black'}`}
//               />
//               <div className="flex flex-col truncate">
//                 <span className={`font-[1000] uppercase text-[15px] lg:text-[13px] tracking-tight ${darkMode ? 'text-white/90' : 'text-black'}`}>
//                   {order.customerName || order.guestInfo?.name || "—"}
//                 </span>
//                 <span className={`text-[9px] font-bold opacity-50 uppercase ${darkMode ? 'text-[#86FE05]' : 'text-slate-500'}`}>
//                    {new Date(order.createdAt).toLocaleDateString(language === "ar" ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
//                 </span>
//               </div>
//             </div>
//             <div className="lg:hidden text-right font-[1000] italic text-lg text-[#57a108]">
//                 {finalTotal.toLocaleString()} <span className="text-[12px] not-italic opacity-60">EGP</span>
//             </div>
//           </div>

//         {/* 2. Phone Section */}
// <div className="flex flex-col gap-1 lg:col-span-2">
//   <span className="lg:hidden text-[14px] font-black uppercase tracking-[0.1em]">
//     {language === "ar" ? "الهاتف" : "Phone"}
//   </span>

//   <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">

//     {/* Primary Phone */}
//     <div className="flex items-center gap-2">
//       <span className={`font-black text-[13px] lg:text-[13px] tracking-widest ${darkMode ? 'text-white/80' : 'text-black/70'}`}>
//         {order.guestInfo?.phone || "—"}
//       </span>

//       {order.guestInfo?.phone && (
//         <a
//           href={`https://wa.me/2${order.guestInfo.phone}`}
//           target="_blank"
//           rel="noreferrer"
//           className="text-[#25D366]"
//         >
//           <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.434 5.626 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
//           </svg>
//         </a>
//       )}
//     </div>

//     {/* Secondary Phone */}
//     {order.guestInfo?.secondaryPhone && (
//       <div className="flex items-center gap-2 border-t border-white/5 lg:pt-0.5">
//         <span className={`font-bold text-[10px] opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>
//           {order.guestInfo.secondaryPhone}
//         </span>

//         <a
//           href={`https://wa.me/2${order.guestInfo.secondaryPhone}`}
//           target="_blank"
//           rel="noreferrer"
//           className="text-[#25D366]"
//         >
//           <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.434 5.626 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
//           </svg>
//         </a>
//       </div>
//     )}

//   </div>
// </div>

//           {/* 3. Address Section */}
//           <div className="flex flex-col gap-1 lg:col-span-2">
//             <span className="lg:hidden text-[12px] font-black uppercase tracking-[0.1em]">{language === "ar" ? "العنوان" : "Address"}</span>
//             <span className={`text-[14px] font-black uppercase lg:text-[15px] lg:truncate tracking-tight leading-tight ${darkMode ? 'text-white/40' : 'text-black/60'}`}>
//               {formatCompactAddress(order.shippingAddress)}
//             </span>
//           </div>

//           {/* 4. Total (Desktop) */}
//           <div className={`hidden lg:block lg:col-span-1 text-center font-[1000] italic text-base ${darkMode ? 'text-[#86FE05]/30' : 'text-black'}`}>
//             {finalTotal.toLocaleString()}
//           </div>

//           {/* 5. Status Section */}
//           <div className="lg:col-span-2">
//             <span className="lg:hidden text-[14px] font-black uppercase tracking-[0.1em] mb-1 block">{language === "ar" ? "الحالة" : "Status"}</span>
//             <select
//               value={order.status}
//               onChange={(e) => updateStatus(order._id, e.target.value)}
//               style={{ color: darkMode ? statusColor : "#000", borderColor: `${statusColor}${darkMode ? '20' : '60'}`, borderLeftWidth: '4px' }}
//               className={`w-full p-2.5 lg:p-2 rounded-xl text-[14px] lg:text-[13px] font-black uppercase outline-none transition-all appearance-none cursor-pointer ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}
//             >
//               {STATUS_OPTIONS.map((statusKey) => (
//                 <option key={statusKey} value={statusKey} className="bg-black text-white">
//                    {ORDER_STATUS_CONFIG[statusKey].icon} {language === "ar" ? ORDER_STATUS_CONFIG[statusKey].ar : ORDER_STATUS_CONFIG[statusKey].en}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 6. Bosta Section */}
//           <div className={`flex flex-col lg:col-span-1 justify-center items-center p-2 rounded-xl lg:bg-transparent`}>
//             <span className="lg:hidden text-[12px] font-black opacity-70 mb-1 uppercase">{language === "ar" ? "بوسطة" : "Bosta"}</span>
//             {order.bostaInfo?.currentState ? (
//               <span className={`text-[13px] lg:text-[12px] font-[1000] text-center ${order.bostaInfo.currentState.group === "delivered" ? "text-green-500" : "text-blue-500"}`}>
//                  {language === "ar" ? order.bostaInfo.currentState.ar : order.bostaInfo.currentState.en}
//               </span>
//             ) : (
//               <span className="text-[10px] font-black opacity-20">—</span>
//             )}
//           </div>

//           {/* 7. Manage Section (2x2 Grid on Large Screens) */}
//           <div className="flex items-center justify-between border-t lg:border-0 pt-3 lg:pt-0 border-white/[0.05] lg:col-span-1">
//              <span className="lg:hidden text-[12px] font-black uppercase tracking-[0.1em]">{language === "ar" ? "الإدارة" : "Manage"}</span>
             
//              {/* هنا السحر: grid-cols-4 في الموبايل و grid-cols-2 في الشاشات الكبيرة */}
//              <div className="grid grid-cols-4 lg:grid-cols-2 gap-1 lg:gap-1 lg:w-fit mx-auto">
//                 {/* Confirm */}
//                 <div className="group/tip relative flex flex-col items-center">
//                   <button onClick={() => handleConfirmOrder(order._id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] bg-[#86FE05]/10 text-[#86FE05]/60 hover:bg-[#86FE05] hover:text-black transition-all">✔</button>
//                   <span className="absolute -top-8 scale-0 transition-all rounded bg-black px-2 py-1 text-[9px] text-white group-hover/tip:scale-100 z-50 whitespace-nowrap shadow-xl">تأكيد</span>
//                 </div>
                
//                 {/* Edit */}
//                 <div className="group/tip relative flex flex-col items-center">
//                   <button onClick={() => openEditModal(order)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] bg-blue-500/10 text-blue-500/60 hover:bg-blue-600 hover:text-white transition-all">✏</button>
//                   <span className="absolute -top-8 scale-0 transition-all rounded bg-black px-2 py-1 text-[9px] text-white group-hover/tip:scale-100 z-50 whitespace-nowrap shadow-xl">تعديل</span>
//                 </div>
                
//                 {/* Archive */}
//                 <div className="group/tip relative flex flex-col items-center">
//                   <button onClick={() => toggleArchive(order._id, order.archived)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] bg-yellow-500/10 text-yellow-500/60 hover:bg-yellow-500 hover:text-white transition-all">📦</button>
//                   <span className="absolute -top-8 scale-0 transition-all rounded bg-black px-2 py-1 text-[9px] text-white group-hover/tip:scale-100 z-50 whitespace-nowrap shadow-xl">أرشفة</span>
//                 </div>
                
//                 {/* Delete */}
//                 <div className="group/tip relative flex flex-col items-center">
//                   <button onClick={() => deleteOrder(order._id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] bg-red-500/10 text-red-500/60 hover:bg-red-600 hover:text-white transition-all">🗑</button>
//                   <span className="absolute -top-8 scale-0 transition-all rounded bg-red-600 px-2 py-1 text-[9px] text-white group-hover/tip:scale-100 z-50 whitespace-nowrap shadow-2xl">حذف</span>
//                 </div>
//              </div>
//           </div>

//         </div>
//       );
//     })}
//   </div>
// </div>
//   </div>
// )}




// {/* VISTRO PAGINATION */}
// {pageSize !== 0 && pageCount > 1 && (
//   <div className="flex flex-col items-center gap-6 mt-20 mb-20">
    
//     {/* معلومات الصفحات بشكل شيك */}
//     <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>
//        {language === "ar" ? "الصفحة" : "Page"} {currentPage + 1} {language === "ar" ? "من" : "of"} {pageCount}
//     </span>

//     <div className="flex justify-center items-center gap-8">
//       {/* زر السابق */}
//       <button
//         onClick={() => {
//           setCurrentPage((prev) => Math.max(prev - 1, 0));
//           window.scrollTo({ top: 0, behavior: 'smooth' }); // عشان يطلع لفوق لما يغير الصفحة
//         }}
//         disabled={currentPage === 0}
//         className={`px-10 py-5 rounded-[2rem] font-[1000] uppercase tracking-[0.3em] text-[10px] transition-all border-2 ${
//           darkMode 
//           ? 'bg-white/[0.05] border-white/10 text-white/40 hover:border-[#86FE05]/40 disabled:hover:border-white/10' 
//           : 'bg-white border-black text-black disabled:opacity-20 hover:bg-black hover:text-white'
//         }`}
//       >
//         {language === "ar" ? "السابق" : "Prev"}
//       </button>

//       {/* أرقام الصفحات - عرض ذكي (لو الصفحات كتير ميعملش زحمة) */}
//       <div className="hidden md:flex gap-4">
//         {[...Array(pageCount)].map((_, idx) => {
//           // عرض الصفحات القريبة من الصفحة الحالية فقط لو العدد ضخم
//           if (pageCount > 7 && Math.abs(idx - currentPage) > 2 && idx !== 0 && idx !== pageCount - 1) {
//              if (idx === 1 || idx === pageCount - 2) return <span key={idx} className="opacity-30">...</span>;
//              return null;
//           }

//           return (
//             <button
//               key={idx}
//               onClick={() => {
//                 setCurrentPage(idx);
//                 window.scrollTo({ top: 0, behavior: 'smooth' });
//               }}
//               className={`w-14 h-14 rounded-2xl text-[13px] font-[1000] transition-all duration-500 ${
//                 idx === currentPage 
//                 ? (darkMode ? "bg-[#86FE05]/80 text-black shadow-lg scale-110" : "bg-black text-white scale-110 shadow-xl") 
//                 : (darkMode ? "bg-white/5 text-white/30 hover:opacity-100" : "bg-zinc-100 text-black/40 hover:bg-zinc-200")
//               }`}
//             >
//               {idx + 1}
//             </button>
//           );
//         })}
//       </div>

//       {/* زر التالي */}
//       <button
//         onClick={() => {
//           setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1));
//           window.scrollTo({ top: 0, behavior: 'smooth' });
//         }}
//         disabled={currentPage === pageCount - 1}
//         className={`px-10 py-5 rounded-[2rem] font-[1000] uppercase tracking-[0.3em] text-[10px] transition-all border-2 ${
//           darkMode 
//           ? 'bg-white/[0.05] border-white/10 text-white/40 hover:border-[#86FE05]/40 disabled:hover:border-white/10' 
//           : 'bg-white border-black text-black disabled:opacity-20 hover:bg-black hover:text-white'
//         }`}
//       >
//         {language === "ar" ? "التالي" : "Next"}
//       </button>
//     </div>
//   </div>
// )}


//  {isEditModalOpen && editingOrder && (
//   <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/80 flex justify-center items-center p-4 animate-in fade-in duration-300">
//     <div className={`relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[3.5rem] border shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-500 ${darkMode ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200'}`}>
      
//       {/* HEADER SECTION */}
//       <div className={`sticky top-0 z-20 flex justify-between items-center p-8 border-b backdrop-blur-xl ${darkMode ? 'bg-black/60 border-white/5' : 'bg-white/80 border-slate-100'}`}>
//         <div>
//           <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-3">
//             <span className="text-[#86FE05] drop-shadow-[0_0_10px_rgba(134,254,5,0.4)]">🚀</span>
//             {language === "ar" ? "تعديل الطلب الاحترافي" : "Order Control"}
//           </h2>
//           <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] mt-2 ml-10">Advanced Management Interface</p>
//         </div>
//         <button 
//           onClick={() => setIsEditModalOpen(false)} 
//           className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl font-black transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-red-500 hover:text-white' : 'bg-slate-100 text-slate-900 hover:bg-red-500 hover:text-white'}`}
//         >
//           ×
//         </button>
//       </div>

//       <div className="p-8 space-y-10">
        
//         {/* SECTION 1: CUSTOMER & LOGISTICS */}
//         <div className="space-y-6">
//           <div className="flex items-center gap-3">
//             <div className="h-6 w-1 bg-[#86FE05] rounded-full shadow-[0_0_10px_#86FE05]"></div>
//             <span className="font-black uppercase italic tracking-widest text-xs opacity-50">Logistics & Client Identity</span>
//           </div>

//           <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
//                         {/* city Selection */}

//            <select
//   value={editingOrder.shippingAddress?.city || ""}
//   onChange={async (e) => {
//     const selectedCityId = e.target.value;
//     const selectedCity = cities.find(c => c._id === selectedCityId);
//     if (!selectedCity) return;

//     setEditingOrder(prev => ({
//       ...prev,
//       shippingAddress: {
//         ...prev.shippingAddress,
//         city: selectedCityId,
//         districtName: ""
//       }
//     }));

//     try {
//       const res = await axios.get(`/districts/${selectedCity.bostaCityId}`);
//       setDistricts(res.data);
//     } catch (err) {
//       console.error(err);
//       setDistricts([]);
//     }
//   }}
//   className={`w-full p-4 rounded-2xl text-xs font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${
//     darkMode
//       ? 'bg-black border-white/10 focus:border-[#86FE05] text-white'
//       : 'bg-white border-slate-200 focus:border-black text-black'
//   }`}
// >
//   <option value="">Choose City</option>
//   {cities.map(c => (
//     <option
//       key={c._id}
//       value={c._id}
//       className={darkMode ? "bg-black text-white" : "bg-white text-black"}
//     >
//       {c.cityAr}
//     </option>
//   ))}
// </select>

//             {/* District Selection */}
//             <select
//   value={editingOrder.shippingAddress?.districtName || ""}
//   onChange={(e) =>
//     setEditingOrder(prev => ({
//       ...prev,
//       shippingAddress: {
//         ...prev.shippingAddress,
//         districtName: e.target.value
//       }
//     }))
//   }
//   className={`w-full p-4 rounded-2xl text-xs font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${
//     darkMode
//       ? 'bg-black border-white/10 focus:border-[#86FE05] text-white'
//       : 'bg-white border-slate-200 focus:border-black text-black'
//   }`}
// >
//   <option value="">Choose District</option>
//   {districts.map(d => (
//     <option
//       key={d._id}
//       value={d.nameAr}
//       className={darkMode ? "bg-black text-white" : "bg-white text-black"}
//     >
//       {d.nameAr}
//     </option>
//   ))}
// </select>

//             {/* Phone */}
//             <div className="space-y-2">
//               <label className="block text-[12px] font-black uppercase tracking-widest opacity-40 ml-2">Phone / الهاتف</label>
//               <input 
//                 type="text" 
//                 className={`w-full p-4 rounded-2xl text-xs font-black border transition-all outline-none ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-white' : 'bg-white border-slate-200 focus:border-black'}`}
//                 value={editingOrder.guestInfo?.phone || ""} 
//                 onChange={(e) => setEditingOrder({...editingOrder, guestInfo: {...editingOrder.guestInfo, phone: e.target.value}})} 
//               />
//             </div>

//             {/* Coupon Code */}
//             <div className="space-y-2">
//               <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 text-[#86FE05]">🎫 Voucher / الخصم</label>
//               <select 
//                 className={`w-full p-4 rounded-2xl text-[11px] font-black uppercase border transition-all outline-none appearance-none cursor-pointer ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-[#86FE05]' : 'bg-white border-slate-200 focus:border-black text-blue-600'}`}
//                 value={editingOrder.discount?.code || ""}
//                 onChange={(e) => {
//                   const selectedCode = e.target.value;
//                   const selectedCoupon = coupons.find(c => c.code === selectedCode);
//                   const subtotal = editingOrder.orderItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
//                   let discountValue = 0;
//                   if (selectedCoupon) {
//                     if (selectedCoupon.discountType === "percentage" || selectedCoupon.percentage) {
//                       discountValue = (subtotal * Number(selectedCoupon.percentage || 0)) / 100;
//                     } else {
//                       discountValue = Number(selectedCoupon.amount || selectedCoupon.discountAmount || selectedCoupon.value || 0);
//                     }
//                   }
//                   const currentShipping = Number(editingOrder.shippingFee || 0);
//                   setEditingOrder(prev => ({
//                     ...prev,
//                     discount: { code: selectedCode, amount: discountValue },
//                     totalPrice: subtotal + currentShipping - discountValue
//                   }));
//                 }}
//               >
//                 <option value="">No Discount</option>
//                 {coupons.map(c => <option key={c._id} value={c.code} className="bg-black">{c.code}</option>)}
//               </select>
//             </div>

//             {/* Full Address */}
//             <div className="md:col-span-4 space-y-2">
//               <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Detailed Address / العنوان التفصيلي</label>
//               <div className="relative group">
//                 <textarea 
//                   rows="2"
//                   className={`w-full p-5 rounded-[1.5rem] text-xs font-black transition-all outline-none border ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-white' : 'bg-white border-slate-200 focus:border-black'}`}
//                   placeholder="Street name, landmark..."
//                   value={editingOrder.shippingAddress?.address || ""} 
//                   onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: { ...editingOrder.shippingAddress, address: e.target.value } })} 
//                 />
//                 {editingOrder.shippingAddress?.address && (
//                   <button onClick={() => setEditingOrder({...editingOrder, shippingAddress: { ...editingOrder.shippingAddress, address: "" } })} className="absolute top-4 left-4 text-red-500 hover:scale-125 transition-transform">×</button>
//                 )}
//               </div>
//             </div>

//             {/* Building info grid */}
//             <div className="md:col-span-4 grid grid-cols-3 gap-4">
//                {['buildingNumber', 'floor', 'apartment'].map((field) => (
//                  <div key={field} className="space-y-2">
//                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ml-2">{field}</label>
//                    <input 
//                     type="text" 
//                     className={`w-full p-4 rounded-xl text-xs font-black border transition-all ${darkMode ? 'bg-black border-white/10 focus:border-[#86FE05] text-white' : 'bg-white border-slate-200 focus:border-black'}`}
//                     value={editingOrder.shippingAddress?.[field] || ""} 
//                     onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: { ...editingOrder.shippingAddress, [field]: e.target.value } })} 
//                   />
//                  </div>
//                ))}
//             </div>
//           </div>
//         </div>

//    {/* SECTION 2: INVENTORY & CART */}
// <div className="space-y-6">
//   <div className="flex justify-between items-center px-2">
//     <div className="flex items-center gap-3">
//       <div className="h-6 w-1 bg-[#86FE05] rounded-full shadow-[0_0_10px_#86FE05]"></div>
//       <span className="font-black uppercase italic tracking-widest text-[10px] opacity-60">
//         {language === "ar" ? "محتويات الشحنة" : "Package Contents"}
//       </span>
//     </div>
    
//   <select
//   className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all outline-none appearance-none cursor-pointer ${
//     darkMode
//       ? "bg-[#86FE05] text-black border-none shadow-[0_10px_30px_rgba(134,254,5,0.3)] hover:scale-105"
//       : "bg-black text-white"
//   }`}
//   value=""
//   onChange={(e) => {
//     const prodId = e.target.value;
//     if (!prodId) return;

//     const prod = products.find((p) => p._id === prodId);
//     if (!prod) return;

//     const firstVar =
//       prod.variants?.find(v => v.price != null) || prod.variants?.[0];

//     const newItem = {
//       isBundle: false,

//       product: prod._id,
//       name: prod.name,

//       price: prod.salePrice || prod.price,
//       quantity: 1,

//       image:
//         firstVar?.images?.[0]?.url ||
//         prod.images?.[0]?.url ||
//         "",

//       Color: firstVar?.options?.Color || "",
//       Size: firstVar?.options?.Size || "",

//       variantId: firstVar?._id,

//       bundleItems: [],
//     };

//     const updatedItems = [...editingOrder.orderItems, newItem];

//     const newSubtotal = updatedItems.reduce(
//       (acc, i) => acc + Number(i.price) * Number(i.quantity),
//       0
//     );

//     const shipping = Number(editingOrder.shippingFee || 0);
//     const discount = Number(editingOrder.discount?.amount || 0);

//     setEditingOrder({
//       ...editingOrder,
//       orderItems: updatedItems,
//       totalPrice: Math.round(newSubtotal + shipping - discount),
//     });
//   }}
// >
//   <option value="">
//     + {language === "ar" ? "إضافة منتج جديد" : "ADD ITEM TO ORDER"}
//   </option>

//   {products.map((p) => (
//     <option key={p._id} value={p._id} className="bg-black text-white">
//       {p.name} — {p.salePrice || p.price} EGP
//     </option>
//   ))}
// </select>


//   </div>



  

//   <div className="space-y-4">
//   {editingOrder.orderItems.map((item, index) => {
//     const originalProduct = products.find(
//       (p) => String(p._id) === String(item.product)
//     );

//     // ===================== IMAGE =====================
//     const currentVariation = originalProduct?.variations?.find(
//       (v) => v.color === (item.color || item.Color)
//     );

//     const displayImage =
//       currentVariation?.images?.[0]?.url || item.image;

//     return (
//       <div
//   key={index}
//   className={`relative group flex flex-col md:flex-row items-start gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${
//     darkMode
//       ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-[#86FE05]/20"
//       : "bg-white border-slate-100 shadow-xl"
//   }`}
// >

//   {/* ===================== IMAGE ===================== */}
//   <div className="relative w-24 h-24 md:w-20 md:h-20 shrink-0">
//     <div
//       className={`absolute inset-0 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 ${
//         darkMode ? "bg-[#86FE05]/10" : "bg-slate-100"
//       }`}
//     />

//     {displayImage ? (
//       <img
//         src={displayImage}
//         alt={item.name}
//         className="relative z-10 w-full h-full object-cover rounded-2xl shadow-2xl border border-white/5"
//       />
//     ) : (
//       <div className="relative z-10 w-full h-full flex items-center justify-center bg-zinc-800 rounded-2xl text-xl opacity-20">
//         📦
//       </div>
//     )}
//   </div>

//   {/* ===================== INFO ===================== */}
//   <div className="flex-1 min-w-[150px] text-center md:text-left">
//     <div className="text-[9px] font-black uppercase opacity-20 tracking-[0.3em] mb-1">
//       SKU_{item.product?.slice(-5).toUpperCase()}
//     </div>

//     <div className="font-black italic uppercase text-lg tracking-tighter group-hover:text-[#80f305] transition-colors leading-none">
//       {item.name}
//     </div>

//     <div className="text-[#62ba05] text-[11px] font-black mt-2 italic tracking-tighter">
//       {Number(item.price).toLocaleString()} EGP
//     </div>
//   </div>

//   {/* ===================== PRODUCT / NORMAL ===================== */}
//   {!item.isBundle && (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full md:w-auto">

//       {/* COLOR BOX */}
//       <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
//         <label className="text-[8px] font-black uppercase opacity-40 ml-1">
//           Color
//         </label>

//         <select
//           className="w-full p-3 rounded-xl text-[10px] font-black border"
//           value={item.Color || item.color || ""}
//           onChange={(e) => {
//             const selectedColor = e.target.value;
//             const newItems = [...editingOrder.orderItems];

//             const matchedVar = originalProduct?.variants?.find(
//               (v) => v.options?.Color === selectedColor
//             );

//             newItems[index] = {
//               ...newItems[index],
//               Color: selectedColor,
//               color: selectedColor,
//               options: {
//                 Color: selectedColor,
//                 Size:
//                   matchedVar?.options?.Size ||
//                   newItems[index].Size ||
//                   "",
//               },
//               image:
//                 matchedVar?.images?.[0]?.url ||
//                 newItems[index].image,
//             };

//             setEditingOrder({
//               ...editingOrder,
//               orderItems: newItems,
//             });
//           }}
//         >
//           <option value="">Select Color</option>

//           {originalProduct?.options
//             ?.find((o) => o.name === "Color")
//             ?.values?.map((val) => (
//               <option key={val} value={val}>
//                 {val}
//               </option>
//             ))}
//         </select>
//       </div>

//       {/* SIZE BOX */}
//       <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
//         <label className="text-[8px] font-black uppercase opacity-40 ml-1">
//           Size
//         </label>

//         <select
//           className="w-full p-3 rounded-xl text-[10px] font-black border"
//           value={item.Size || item.size || ""}
//           onChange={(e) => {
//             const selectedSize = e.target.value;
//             const newItems = [...editingOrder.orderItems];

//             newItems[index] = {
//               ...newItems[index],
//               Size: selectedSize,
//               size: selectedSize,
//               options: {
//                 ...newItems[index].options,
//                 Size: selectedSize,
//               },
//             };

//             setEditingOrder({
//               ...editingOrder,
//               orderItems: newItems,
//             });
//           }}
//         >
//           <option value="">Size</option>

//           {originalProduct?.variants
//             ?.filter(
//               (v) =>
//                 v.options?.Color === (item.Color || item.color)
//             )
//             ?.map((v) => (
//               <option key={v._id} value={v.options?.Size}>
//                 {v.options?.Size}
//               </option>
//             ))}
//         </select>
//       </div>
//     </div>
//   )}

//   {/* ===================== BUNDLE ===================== */}
//   {item.isBundle && (
//     <div className="w-full mt-4 space-y-3 border-t border-white/10 pt-4">

//       <div className="text-[10px] font-black uppercase opacity-50">
//         Bundle Items
//       </div>

//      {item.bundleItems?.map((bi, biIndex) => {
//   const product = products.find(
//     (p) => String(p._id) === String(bi.product)
//   );

//   const biImage =
//     bi.image ||
//     product?.images?.[0]?.url ||
//     "";

//   return (
//     <div
//       key={biIndex}
//       className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-xl bg-white/5 border border-white/10 items-center"
//     >

//       {/* ================= IMAGE + NAME ================= */}
//       <div className="flex items-center gap-3">

//         {/* IMAGE */}
//         <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
//           {biImage ? (
//             <img
//               src={biImage}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-xs opacity-40">
//               📦
//             </div>
//           )}
//         </div>

//         {/* NAME */}
//         <div className="font-bold text-xs">
//           {bi.name}
//         </div>
//       </div>

//       {/* ================= COLOR ================= */}
//       <select
//         value={bi.color || ""}
//         onChange={(e) => {
//           const newItems = [...editingOrder.orderItems];

//           newItems[index].bundleItems[biIndex].color = e.target.value;

//           newItems[index].bundleItems[biIndex].options = {
//             ...newItems[index].bundleItems[biIndex].options,
//             Color: e.target.value,
//           };

//           setEditingOrder({
//             ...editingOrder,
//             orderItems: newItems,
//           });
//         }}
//         className="p-2 rounded-lg border bg-black/40"
//       >
//         <option value="">Color</option>

//         {product?.options
//           ?.find((o) => o.name === "Color")
//           ?.values?.map((c) => (
//             <option key={c} value={c}>
//               {c}
//             </option>
//           ))}
//       </select>

//       {/* ================= SIZE ================= */}
//       <select
//         value={bi.size || ""}
//         onChange={(e) => {
//           const newItems = [...editingOrder.orderItems];

//           newItems[index].bundleItems[biIndex].size = e.target.value;

//           newItems[index].bundleItems[biIndex].options = {
//             ...newItems[index].bundleItems[biIndex].options,
//             Size: e.target.value,
//           };

//           setEditingOrder({
//             ...editingOrder,
//             orderItems: newItems,
//           });
//         }}
//         className="p-2 rounded-lg border bg-black/40"
//       >
//         <option value="">Size</option>

//         {product?.variants
//           ?.filter((v) => v.options?.Color === bi.color)
//           ?.map((v) => (
//             <option key={v._id} value={v.options?.Size}>
//               {v.options?.Size}
//             </option>
//           ))}
//       </select>

//     </div>
//   );
// })}
//     </div>
//   )}

//   {/* ===================== QTY + DELETE ===================== */}
//   <div className="p-3 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-2">

//     <input
//       type="number"
//       value={item.quantity}
//       onChange={(e) => {
//         const val = parseInt(e.target.value) || 1;

//         const newItems = [...editingOrder.orderItems];
//         newItems[index].quantity = val;

//         const subtotal = newItems.reduce(
//           (acc, i) => acc + i.price * i.quantity,
//           0
//         );

//         setEditingOrder({
//           ...editingOrder,
//           orderItems: newItems,
//           totalPrice:
//             subtotal +
//             Number(editingOrder.shippingFee || 0) -
//             (editingOrder.discount?.amount || 0),
//         });
//       }}
//       className="w-16 p-2 rounded-lg text-center border"
//     />

//     <button
//       onClick={() => {
//         const newItems = editingOrder.orderItems.filter(
//           (_, i) => i !== index
//         );

//         const subtotal = newItems.reduce(
//           (acc, i) => acc + i.price * i.quantity,
//           0
//         );

//         setEditingOrder({
//           ...editingOrder,
//           orderItems: newItems,
//           totalPrice:
//             subtotal +
//             Number(editingOrder.shippingFee || 0) -
//             (editingOrder.discount?.amount || 0),
//         });
//       }}
//       className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500"
//     >
//       🗑
//     </button>
//   </div>
// </div>
//     );
//   })}
// </div>





// </div>

//         {/* SECTION 3: FINAL CALCULATION (THE BLACK CARD) */}
//         <div className={`p-10 rounded-[3rem] shadow-2xl transition-all ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
//           <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            
//             <div className="flex gap-8 items-center">
//               <div className="text-center space-y-2">
//                 <p className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em]">Logistics / الشحن</p>
//                 <div className="flex items-center gap-2">
//                   <span className="opacity-30 font-black">+</span>
//                   <input 
//                     type="number" 
//                     className="bg-transparent border-b-2 border-current w-24 text-center font-black text-2xl outline-none focus:border-[#86FE05]"
//                     value={editingOrder.shippingFee || 0}
//                     onChange={(e) => {
//                       const fee = Number(e.target.value);
//                       const subtotal = editingOrder.orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
//                       setEditingOrder({ ...editingOrder, shippingFee: fee, totalPrice: subtotal + fee - (editingOrder.discount?.amount || 0) });
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="text-center space-y-2">
//                 <p className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em]">Discount / خصم</p>
//                 <div className="flex items-center gap-2">
//                   <span className="text-red-500 font-black">-</span>
//                   <span className="font-black text-2xl text-red-500">{editingOrder.discount?.amount || 0}</span>
//                 </div>
//               </div>
//             </div>

//             <div className={`p-8 rounded-[2rem] text-center min-w-[280px] shadow-xl transform hover:scale-105 transition-transform ${darkMode ? 'bg-black text-[#86FE05]' : 'bg-[#86FE05] text-black'}`}>
//               <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Total Receivable / الإجمالي</p>
//               <div className="flex items-center justify-center gap-2">
//                 <input 
//                   type="number"
//                   className="bg-transparent border-none text-5xl font-black text-center w-full focus:ring-0 cursor-text tracking-tighter"
//                   value={editingOrder.totalPrice || 0}
//                   onChange={(e) => setEditingOrder({...editingOrder, totalPrice: Number(e.target.value)})}
//                 />
//               </div>
//               <p className="text-[8px] font-bold mt-4 uppercase tracking-widest opacity-40 italic">Manual override enabled *</p>
//             </div>
//           </div>
//         </div>

//         {/* FOOTER ACTIONS */}
//         <div className="flex justify-end gap-4 pt-10 border-t border-white/5">
//           <button 
//             onClick={() => setIsEditModalOpen(false)} 
//             className={`px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
//           >
//             Abort / إلغاء
//           </button>
//           <button 
//             onClick={handleUpdateOrder} 
//             className="px-14 py-5 rounded-2xl bg-[#86FE05] text-black font-black uppercase text-[10px] tracking-widest shadow-[0_15px_40px_rgba(134,254,5,0.3)] hover:scale-105 transition-all"
//           >
//             Commit Changes / حفظ
//           </button>
//         </div>

//       </div>
//     </div>
//   </div>
// )}

//     </div> 
//   );
};
export default Orders;