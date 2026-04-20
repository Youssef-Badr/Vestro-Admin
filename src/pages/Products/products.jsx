// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import axios from "../../api/axiosInstance";
// import { toast } from "react-toastify";
// import { useLanguage } from "../../context/LanguageContext";
// import imageCompression from "browser-image-compression";
// import {
//   FaEdit,
//   FaImage,
//   FaTools,
//   FaTrash,
//   FaPlus,
//   FaEye,
//   FaCommentDots,
//   FaStar,
// } from "react-icons/fa";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// const Products = () => {
//   const { language } = useLanguage();
//   const [products, setProducts] = useState([]);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [featured, setFeatured] = useState(false);
//   const [newProduct, setNewProduct] = useState({
//     name: "",
//     description: "",
//     originalPrice: "",
//     salePrice: "",
//     targetStock: "", // 👈 أضف هذا الحقل
//     category: [],
//     images: [], // كل صور المنتج المرفوعة (رفع جماعي)
//     options: [
//       // الخصائص اللي التاجر بيحددها
//       { name: "Color", values: [] },
//       { name: "Size", values: [] },
//     ],
//     variants: [], // دي هتتولد تلقائياً (التباديل)
//     customSections: [], // الأقسام اللي التاجر هيكريتها بنفسه
//     sizeChartFile: null,
//   });
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [imagesToDelete, setImagesToDelete] = useState([]);
//   const [showReviewsModal, setShowReviewsModal] = useState(false);
//   const [selectedProductReviews, setSelectedProductReviews] = useState([]);
//   const [allCategories, setAllCategories] = useState([]);
//   const [showCatModal, setShowCatModal] = useState(false);
//   const [newCategory, setNewCategory] = useState({
//     name: "",
//     slug: "",
//     isActive: true,
//   });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   // ننده الأقسام أول ما الصفحة تفتح
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get("/categories");
//         setAllCategories(response.data);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };
//     fetchCategories();
//   }, []);

//   const handleCreateCategory = async () => {
//     try {
//       const response = await axios.post("/categories", newCategory);
//       if (response.status === 201 || response.status === 200) {
//         // تحديث قائمة الفئات اللي معروضة في الـ UI فوراً
//         setAllCategories([...allCategories, response.data]);
//         setShowCatModal(false); // إغلاق المودال
//         setNewCategory({ name: "", slug: "", isActive: true }); // تصفير البيانات
//         toast.success("تم إضافة الفئة بنجاح! 🎉");
//       }
//     } catch (error) {
//       console.error("Error creating category:", error);
//       toast.error("فشل في إضافة الفئة");
//     }
//   };

//   useEffect(() => {
//     if (editingProduct) {
//       setFeatured(editingProduct.featured || false);
//     }
//   }, [editingProduct]);

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get("/products");
//       setProducts(res.data);
//     } catch (err) {
//       console.error("Error fetching products:", err);
//     }
//   };

//  const generateVariants = (options, oldVariants = []) => {
//   const combinations = options.reduce((acc, option) => {
//     if (!option.values?.length) return acc;
//     if (acc.length === 0) return option.values.map((val) => ({ [option.name]: val }));

//     const res = [];
//     acc.forEach((item) => {
//       option.values.forEach((val) => {
//         res.push({ ...item, [option.name]: val });
//       });
//     });
//     return res;
//   }, []);

//   return combinations.map((combo) => {
//     const typeString = Object.entries(combo)
//       .map(([k, v]) => `${k}:${v}`)
//       .join("|");

//     const existing = oldVariants.find((v) => v.type === typeString);

//     return {
//       type: typeString,
//       options: combo, // 🔥 ضيف السطر ده عشان نحتفظ بالـ Object {Color: "Red", Size: "XL"}
//       price: existing?.price ?? 0,
//       stock: existing?.stock ?? 0,
//       imageIndex: existing?.imageIndex ?? null,
//       images: existing?.images ?? [],
//     };
//   });
// };

//  const handleGenerateVariants = () => {
//   const currentData = editingProduct || newProduct;
//   const setData = editingProduct ? setEditingProduct : setNewProduct;

//   const newVariants = generateVariants(
//     currentData.options,
//     currentData.variants || []
//   );

//   setData((prev) => ({
//     ...prev,
//     variants: newVariants,
//   }));
// };

//   const compressImages = async (files) => {
//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     const compressedFiles = [];
//     for (let i = 0; i < files.length; i++) {
//       try {
//         const compressedFile = await imageCompression(files[i], options);
//         compressedFiles.push(compressedFile);
//       } catch (error) {
//         console.error("Compression error:", error);
//         compressedFiles.push(files[i]);
//       }
//     }
//     return compressedFiles;
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     // تحديد الـ State النشط (إضافة ولا تعديل)
//     const isEditing = editingProduct !== null;
//     const currentData = isEditing ? editingProduct : newProduct;
//     const setData = isEditing ? setEditingProduct : setNewProduct;

//     const newImagesWithPreviews = [];

//     files.forEach((file) => {
//       // 1. توليد رابط مؤقت للعرض فقط (Preview)
//       const previewUrl = URL.createObjectURL(file);

//       newImagesWithPreviews.push({
//         url: previewUrl, // عشان الـ <img src={url} /> تشتغل فوراً
//         file: file, // ده الملف الحقيقي (Binary) اللي هيتبعت للباك-إيند
//         isNew: true, // علامة لينا عشان نعرف إن دي صورة لسه مأترفتش
//       });
//     });

//     // 2. تحديث الـ State بالمصفوفة الجديدة
//     setData({
//       ...currentData,
//       images: [...(currentData.images || []), ...newImagesWithPreviews],
//     });
//   };

//   // ✅ إضافة قسم جديد (Dynamic Sections) - طلبك الخاص بـ "شغل عالي"
//   const addCustomSection = () => {
//     setNewProduct((prev) => ({
//       ...prev,
//       customSections: [
//         ...prev.customSections,
//         { sectionTitle: "", sectionDescription: "", sectionImages: [] },
//       ],
//     }));
//   };

//   const handleEditImageChange = async (e, variationIndex = null) => {
//     if (!editingProduct) return;
//     const files = e.target.files;
//     if (files.length === 0) return;
//     const compressed = await compressImages(files);
//     if (variationIndex !== null) {
//       const updatedVariations = [...editingProduct.variations];
//       updatedVariations[variationIndex].newImages = compressed;
//       setEditingProduct({ ...editingProduct, variations: updatedVariations });
//     } else {
//       setEditingProduct({ ...editingProduct, newImages: compressed });
//     }
//   };

//   const removeImageFromUI = (e, index, public_id) => {
//     if (e) e.stopPropagation();

//     // تحديد الـ State النشط حالياً (تعديل ولا إضافة)
//     const isEditing = editingProduct !== null;
//     const currentData = isEditing ? editingProduct : newProduct;
//     const setData = isEditing ? setEditingProduct : setNewProduct;

//     // حماية: لو الداتا مش موجودة ميعملش حاجة
//     if (!currentData || !currentData.images) return;

//     const updatedImages = [...currentData.images];
//     updatedImages.splice(index, 1);

//     setData({
//       ...currentData,
//       images: updatedImages,
//     });
//   };

//   const applyStockToAll = (value) => {
//     const updatedVariants = newProduct.variants.map((v) => ({
//       ...v,
//       stock: Number(value),
//     }));
//     setNewProduct({ ...newProduct, variants: updatedVariants });
//   };

//   const deleteProduct = async (id) => {
//     // 1. رسائل التأكيد (مظبوطة عندك بس ممكن تخليها في متغير عشان النضافة)
//     const confirmMsg =
//       language === "ar"
//         ? "هل أنت متأكد أنك تريد حذف هذا المنتج؟"
//         : "Are you sure you want to delete this product?";

//     if (!window.confirm(confirmMsg)) return;

//     // const toastId = toast.loading(language === "ar" ? "جاري الحذف..." : "Deleting...");

//     try {
//       const token = localStorage.getItem("token");

//       // تأكد إن المسار بيبدأ بـ /api لو إنت مش ضابط الـ BaseURL في axios
//       await axios.delete(`/products/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast.success(
//         language === "ar"
//           ? "🗑️ تم حذف المنتج بنجاح"
//           : "🗑️ Product deleted successfully",
//       );

//       // تحديث القائمة فوراً
//       fetchProducts();
//     } catch (err) {
//       console.error("Delete error:", err);

//       // 2. إظهار رسالة الخطأ اللي جاية من السيرفر لو موجودة
//       const errorMsg =
//         err.response?.data?.message ||
//         (language === "ar"
//           ? "❌ فشل حذف المنتج"
//           : "❌ Failed to delete product");

//       toast.error(errorMsg, { id: toastId });

//       // 3. لو الـ Token انتهى (401) ممكن تعمل Logout أو توجهه لصفحة اللوجن
//       if (err.response?.status === 401) {
//         // logic: logout or redirect
//       }
//     }
//   };

 

// const handleSaveProduct = async () => {
//   try {
//     const formData = new FormData();
//     const currentProduct = editingProduct || newProduct;
//     const isEdit = !!editingProduct;

//     // --- 1️⃣ البيانات الأساسية ---
//     formData.append("name", currentProduct.name);
//     formData.append("description", currentProduct.description);
    
//     // إرسال الكاتيجوري كمصفوفة JSON (بما إنه بياخد كذا قيمة)
//     const categories = Array.isArray(currentProduct.category) 
//       ? currentProduct.category 
//       : currentProduct.category ? [currentProduct.category] : [];
//     formData.append("category", JSON.stringify(categories));

//    // --- 💰 منطق الأسعار (الحل النهائي لمنع الـ NaN والـ 100%) ---
// const originalPrice = Number(currentProduct.originalPrice) || 0;

// // التأكد إن سعر الخصم "رقم" سليم أو خليه نص فاضي تماماً
// let salePriceToSend = "";
// if (currentProduct.salePrice !== "" && currentProduct.salePrice !== null) {
//   const parsedSale = Number(currentProduct.salePrice);
//   // لو هو رقم سليم وأصغر من الأصلي، نبعته.. غير كدة يروح فاضي
//   if (!isNaN(parsedSale) && parsedSale > 0 && parsedSale < originalPrice) {
//     salePriceToSend = parsedSale;
//   }
// }

// formData.append("originalPrice", originalPrice);
// formData.append("salePrice", salePriceToSend); // هيروح يا إما رقم صح يا إما "" (والباك إند هيتعامل معاها)
//     formData.append("featured", featured);

//     if (currentProduct.targetStock) {
//       formData.append("targetStock", currentProduct.targetStock);
//     }

//  // داخل handleSaveProduct
// const cleanedVariantsForServer = currentProduct.variants.map((v) => {
//   return {
//     type: v.type, // النص مثل (أحمر / XL)
    
//     // 🔥 هذا السطر هو الأهم لحل مشكلة السلة والمخزون
//     // نرسل كائن الخيارات { Color: "red", Size: "XL" }
//     options: v.options || {}, 

//     price: Number(v.price),
//     stock: Number(v.stock),
//     imageIndex: v.imageIndex !== null ? Number(v.imageIndex) : null,
//   };
// });

//     formData.append("options", JSON.stringify(currentProduct.options || []));
//     formData.append("variants", JSON.stringify(cleanedVariantsForServer));
//     formData.append("customSections", JSON.stringify(currentProduct.customSections || []));

//     // --- 3️⃣ إدارة الصور ---
//     const existingImages = [];
//     currentProduct.images.forEach((img) => {
//       if (img.isNew && img.file) {
//         formData.append("images", img.file);
//       } else if (!img.isNew) {
//         existingImages.push(img);
//       }
//     });

//     formData.append("existingImages", JSON.stringify(existingImages));

//     if (imagesToDelete && imagesToDelete.length > 0) {
//       formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
//     }

//     if (currentProduct.sizeChartFile) {
//       formData.append("size_chart", currentProduct.sizeChartFile);
//     }

//     // --- 4️⃣ إرسال الطلب ---
//     const token = localStorage.getItem("token");
//     const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
//     const apiPath = isEdit ? `/api/products/${editingProduct._id}` : "/api/products";

//     await axios({
//       method: isEdit ? "put" : "post",
//       url: `${baseURL}${apiPath}`,
//       data: formData,
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     toast.success(language === "ar" ? "✅ تم الحفظ بنجاح" : "✅ Saved Successfully");
//     setEditingProduct(null);
//     setShowModal(false);
//     fetchProducts();

//   } catch (err) {
//     console.error("--- ❌ Error Details ---", err.response?.data);
//     const msg = err.response?.data?.message || "Error saving product";
//     toast.error(msg);
//   }
// };

//   const reorderImages = (variationIndex, startIndex, endIndex) => {
//     if (!editingProduct) return;

//     // 1. إنشاء نسخة من التنوعات لتجنب التعديل المباشر
//     const updatedVariations = [...editingProduct.variations];

//     // 2. نسخ مصفوفة الصور للتنوع المحدد
//     const imagesToReorder = Array.from(
//       updatedVariations[variationIndex].images,
//     );

//     // 3. تطبيق منطق السحب والإفلات
//     const [removed] = imagesToReorder.splice(startIndex, 1); // إزالة العنصر من الموضع الأصلي
//     imagesToReorder.splice(endIndex, 0, removed); // إضافته في الموضع الجديد

//     // 4. تحديث الصور في التنوع
//     updatedVariations[variationIndex].images = imagesToReorder;

//     // 5. تحديث حالة التعديل (هذا مهم لتحديث واجهة المستخدم)
//     setEditingProduct({ ...editingProduct, variations: updatedVariations });
//   };

//   const onDragEnd = (result, variationIndex) => {
//     // التحقق من الإسقاط الصحيح
//     if (!result.destination) {
//       return;
//     }

//     const startIndex = result.source.index;
//     const endIndex = result.destination.index;

//     // استدعاء دالة إعادة الترتيب
//     reorderImages(variationIndex, startIndex, endIndex);
//   };

//   const openAddModal = () => {
//     setEditingProduct(null);
//     setFeatured(false);
//     setNewProduct({
//       name: "",
//       description: "",
// category: [], // 🔥 لازم Array      originalPrice: "",
//       salePrice: "",
//       salePercentage: "",
//       countInStock: "",
//       targetStock: "", // 👈 أضف هذا الحقل
//       images: [], // مصفوفة الصور الجماعية
//       options: [
//         { name: "Color", values: [] },
//         { name: "Size", values: [] },
//         { name: "Type", values: [] },
//       ],
//       variants: [], // هتتولد تلقائياً
//       customSections: [], // الأقسام الديناميكية
//       sizeChartFile: null,
//     });
//     setShowModal(true);
//   };

//   const openEditModal = (product) => {
//     setImagesToDelete([]);
//     setFeatured(product.featured || false);

//     // 1️⃣ تجهيز الصور الأساسية (تحويلها لروابط فقط للمعاينة)
//     const preparedImages = (product.images || []).map((img) => ({
//       ...img,
//       url: img.url || img, // نضمن إننا بناخد الرابط سواء كان Object أو String
//       isNew: false, // علامة عشان نفرق بين القديم والجديد في الـ Save
//     }));

//    const preparedVariants = (product.variants || []).map((v) => {
//   let imageIndex = "";

//   if (v.images && v.images.length > 0) {
//     const variantImageUrl = v.images[0].url;

//     const index = product.images.findIndex(
//       (img) => img.url === variantImageUrl
//     );

//     if (index !== -1) {
//       imageIndex = String(index);
//     }
//   }

//   return {
//     ...v,
//     images: (v.images || []).map((img) =>
//       typeof img === "object" ? img.url : img
//     ),
//     imageIndex, // ✅ كده رجعناه صح
//   };
// });
//    setEditingProduct({
//   ...product,
//   // 3️⃣ تحويل الفئات دايمًا لمصفوفة من الـ IDs
//   category: Array.isArray(product.category)
//     ? product.category.map((c) => (typeof c === "object" ? c._id : c))
//     : product.category
//     ? [typeof product.category === "object" ? product.category._id : product.category]
//     : [],
    
//   options: product.options || [],
//   variants: preparedVariants, // النسخة المعدلة للمعاينة
//   images: preparedImages,     // النسخة المعدلة للمعاينة
//   customSections: (product.customSections || []).map((section) => ({
//     ...section,
//     image: section.image?.url || section.image || null,
//   })),
//   sizeChartFile: null,
// });

//     setShowModal(true);
//   };


// const handlePriceChange = (e) => {

//   const { name, value } = e.target;

  

//   // تحديد الـ State اللي هنشتغل عليه

//   const data = editingProduct || newProduct;

//   const setData = editingProduct ? setEditingProduct : setNewProduct;



//   // 1. تحويل القيمة لرقم أو نص فاضي

//   const updatedValue = value === "" ? "" : Number(value);

  

//   // 2. إنشاء نسخة جديدة من البيانات وتحديث الحقل المطلوب

//   const updatedData = {

//     ...data,

//     [name]: updatedValue,

//   };



//   // 3. حساب النسبة بناءً على القيم "الجديدة"

//   const original = Number(updatedData.originalPrice) || 0;

//   const sale = Number(updatedData.salePrice) || 0;



//   if (sale > 0 && original > 0 && sale < original) {

//     const percentage = ((original - sale) / original) * 100;

//     updatedData.salePercentage = Math.round(percentage);

//   } else {

//     // تصفير النسبة تماماً لو الشروط مختلة

//     updatedData.salePercentage = "";

//   }



//   // 4. تحديث الـ State بالبيانات الكاملة الجديدة

//   setData(updatedData);

// };

//   const openReviewsModal = (reviews) => {
//     setSelectedProductReviews(reviews);
//     setShowReviewsModal(true);
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const renderProductCards = () => (
//     <div className="md:hidden grid gap-4 grid-cols-1">
      
//       {products.map((product) => (
        
//         <div
//           key={product._id}
//           className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
//         >
          
//           <div className="flex items-start gap-4 mb-4">
//             <img
//               src={
//                 product.images?.[0]?.url ||
//                 "https://via.placeholder.com/400x400?text=No+Image"
//               }
//               alt={product.name}
//               className="w-20 h-20 object-cover rounded-md border dark:border-gray-600"
//             />

//             <div className="flex-1 min-w-0">
//               {" "}
//               {/* min-w-0 تمنع كسر التصميم لو الاسم طويل جداً */}
//               <h3 className="text-lg font-bold truncate">
//                 {language === "ar" ? "الاسم" : "Name"}:
//                 <span className="font-normal ms-1">{product.name}</span>
//               </h3>
//               <div className="flex items-center flex-wrap gap-1 mt-1">
//                 <span className="text-sm text-gray-500">
//                   {language === "ar" ? "السعر:" : "Price:"}
//                 </span>
//                 {product.salePrice ? (
//                   <>
//                     <span className="text-gray-400 line-through text-xs">
//                       {product.originalPrice}{" "}
//                       {language === "ar" ? "جنيه" : "EGP"}
//                     </span>
//                     <span className="font-bold text-green-600 dark:text-green-400">
//                       {product.salePrice} {language === "ar" ? "جنيه" : "EGP"}
//                     </span>
//                     {product.salePercentage && (
//                       <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
//                         -{product.salePercentage}%
//                       </span>
//                     )}
//                   </>
//                 ) : (
//                   <span className="font-bold text-green-600 dark:text-green-400">
//                     {product.originalPrice ?? product.price}{" "}
//                     {language === "ar" ? "جنيه" : "EGP"}
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm mt-1">
//                 <span className="text-gray-500">
//                   {language === "ar" ? "الفئة:" : "Category:"}
//                 </span>
//                 <span className="ms-1 text-indigo-600 dark:text-indigo-400 font-medium">
//                   {Array.isArray(product.category)
//                     ? product.category.join(", ")
//                     : product.category}
//                 </span>
//               </p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               onClick={() => openReviewsModal(product.reviews || [])}
//               className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-900/50 transition-colors"
//             >
//               <FaCommentDots className="text-sm" />
//               {language === "ar" ? "التقييمات" : "Reviews"}
//             </button>

//             <button
//               onClick={() => {
//                 // إزالة التكرار في الصور باستخدام Set
//                 const uniqueImages = Array.from(
//                   new Set(
//                     [
//                       ...(product.images || []),
//                       ...(product.variations?.flatMap((v) => v.images) || []),
//                     ].map((img) => JSON.stringify(img)),
//                   ),
//                 ).map((str) => JSON.parse(str));

//                 setSelectedImages(uniqueImages);
//                 setShowImageModal(true);
//               }}
//               className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50 transition-colors"
//             >
//               <FaEye className="text-sm" />
//               {language === "ar" ? "الصور" : "Images"}
//             </button>

//             <button
//               onClick={() => openEditModal(product)}
//               className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50 transition-colors"
//             >
//               <FaEdit className="text-sm" />
//               {language === "ar" ? "تعديل" : "Edit"}
//             </button>

//             <button
//               onClick={() => deleteProduct(product._id)}
//               className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 transition-colors"
//             >
//               <FaTrash className="text-sm" />
//               {language === "ar" ? "حذف" : "Delete"}
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   const renderModalContent = () => {
//     const isEditing = editingProduct !== null;
//     const data = isEditing ? editingProduct : newProduct;
//     const setData = isEditing ? setEditingProduct : setNewProduct;

//     const handleVariantChange = (index, field, value) => {
//   const isEditing = editingProduct !== null;
//   const currentData = isEditing ? editingProduct : newProduct;
//   const setData = isEditing ? setEditingProduct : setNewProduct;

//   const updatedVariants = [...currentData.variants];

//   if (field === "imageIndex") {
//     // 🧠 لو مسح الصورة
//     if (value === null || value === "") {
//       updatedVariants[index] = {
//         ...updatedVariants[index],
//         imageIndex: null,
//         images: [],
//       };
//     } else {
//       const selectedImage = currentData.images[value];
// const imageUrl =
//   typeof selectedImage === "object"
//     ? selectedImage.url
//     : selectedImage;
//       updatedVariants[index] = {
//         ...updatedVariants[index],
//         imageIndex: value,
//         images: imageUrl ? [imageUrl] : [],
//       };
//     }
//   } else {
//     // السعر أو المخزون
//     updatedVariants[index] = {
//       ...updatedVariants[index],
//       [field]:
//         field === "price" || field === "stock"
//           ? Number(value)
//           : value,
//     };
//   }

//   setData({ ...currentData, variants: updatedVariants });
// };

//     // 2. منطق اختيار الفئات (Checkbox)
//     const handleCategoryChange = (e) => {
//       const { value, checked } = e.target;
// const currentCategories = Array.isArray(data.category)
//   ? data.category
//   : [];      if (checked) {
//         setData({ ...data, category: [...currentCategories, value] });
//       } else {
//         setData({
//           ...data,
//           category: currentCategories.filter((c) => c !== value),
//         });
//       }
//     };

//     // 3. ترتيب الصور بالسحب والإفلات
//     const reorderProductImages = (startIndex, endIndex) => {
//       const images = Array.from(data.images);
//       const [removed] = images.splice(startIndex, 1);
//       images.splice(endIndex, 0, removed);
//       setData({ ...data, images: images });
//     };

//    const applyPriceToAllVariants = () => {
//   const isEditing = editingProduct !== null;
//   const currentData = isEditing ? editingProduct : newProduct;
//   const setData = isEditing ? setEditingProduct : setNewProduct;

//   // 🧠 اختار السعر الصح
//   const basePrice =
//     currentData.salePrice && currentData.salePrice > 0
//       ? Number(currentData.salePrice)
//       : Number(currentData.originalPrice);

//   if (!basePrice || basePrice <= 0) {
//     toast.error(
//       language === "ar"
//         ? "❌ لازم تدخل سعر صحيح الأول"
//         : "❌ Enter valid price first"
//     );
//     return;
//   }

//   const updatedVariants = currentData.variants.map((v) => ({
//     ...v,
//     price: basePrice,
//   }));

//   setData({ ...currentData, variants: updatedVariants });

//   toast.success(
//     language === "ar"
//       ? "✅ تم تطبيق السعر على كل المتغيرات"
//       : "✅ Price applied to all variants"
//   );
// };

//    const applyStockToAllVariants = (value) => {
//   // 1️⃣ التحقق من الرقم
//   const stockValue = Number(value);
//   if (isNaN(stockValue) || stockValue < 1) {
//     return toast.warning(
//       language === "ar"
//         ? "❌ يرجى إدخال رقم صحيح أكبر من صفر"
//         : "❌ Please enter a valid number greater than 0"
//     );
//   }

//   const isEditing = editingProduct !== null;
//   const currentData = isEditing ? editingProduct : newProduct;
//   const setData = isEditing ? setEditingProduct : setNewProduct;

//   // 2️⃣ تحديث كل التنوعات + targetStock
//   const updatedVariants = currentData.variants.map((v) => ({
//     ...v,
//     stock: stockValue,
//   }));

//   setData({
//     ...currentData,
//     variants: updatedVariants,
//     targetStock: stockValue, // الربط مع الباك إند
//   });

//   // 3️⃣ إشعار النجاح
//   toast.success(
//     language === "ar"
//       ? `✅ تم ضبط المخزون (${stockValue}) لجميع التنوعات`
//       : `✅ Stock set to (${stockValue}) for all variants`
//   );
// };

// return (
//   <div
//     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4"
//     onClick={() => setShowModal(false)}
//   >
//     <div
//       className="bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative border border-gray-100 dark:border-gray-800"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {/* زر الإغلاق */}
//       <button
//         onClick={() => setShowModal(false)}
//         className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//         </svg>
//       </button>

//       {/* العنوان بتصميم أهدأ */}
//       <h2
//         className={`text-xl sm:text-2xl font-black mb-8 flex items-center gap-3 ${
//           isEditing ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"
//         }`}
//       >
//         <span className={`p-2 rounded-lg ${isEditing ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-emerald-50 dark:bg-emerald-900/30"}`}>
//           {isEditing ? "✏️" : "➕"}
//         </span>
//         {isEditing
//           ? language === "ar"
//             ? "تعديل بيانات المنتج"
//             : "Edit Product Details"
//           : language === "ar"
//             ? "إضافة منتج جديد للمتجر"
//             : "Add New Store Product"}
//       </h2>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//         {/* الجانب الأيسر: البيانات الأساسية والصور */}
//         <div className="lg:col-span-7 space-y-6">
//           {/* المعلومات الأساسية */}
//           <div className="space-y-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
//             <input
//               type="text"
//               placeholder={language === "ar" ? "اسم المنتج" : "Product Name"}
//               value={data.name}
//               onChange={(e) => setData({ ...data, name: e.target.value })}
//               className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
//             />
//             <textarea
//               placeholder={
//                 language === "ar"
//                   ? "وصف المنتج بالتفصيل..."
//                   : "Detailed Description"
//               }
//               value={data.description}
//               onChange={(e) =>
//                 setData({ ...data, description: e.target.value })
//               }
//               className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 h-32 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
//             />
            
//             {/* قسم التوزيع السريع للمخزون - ألوان أهدأ */}
//             <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
//               <label className="block text-sm font-bold mb-3 text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
//                 <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
//                   Bulk Action
//                 </span>
//                 {language === "ar"
//                   ? "توزيع مخزون موحد على كل المتغيرات"
//                   : "Bulk Stock Distribution"}
//               </label>
//               <div className="flex gap-3">
//                 <input
//                   type="number"
//                   min="1"
//                   placeholder={language === "ar" ? "مثلاً: 150" : "Ex: 150"}
//                   className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
//                   value={data.targetStock || ""}
//                   onChange={(e) => {
//                     let value = Number(e.target.value);
//                     if (value < 1) value = 1;
//                     setData({ ...data, targetStock: value });
//                   }}
//                   onBlur={() => {
//                     if (!data.targetStock || data.targetStock < 1) {
//                       setData({ ...data, targetStock: 1 });
//                     }
//                   }}
//                 />
//                 {data.targetStock > 0 && (
//                   <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1 rounded-xl text-xs font-bold flex items-center animate-pulse border border-emerald-200 dark:border-emerald-800/50">
//                     {language === "ar" ? "نشط الآن" : "Active"}
//                   </div>
//                 )}
//               </div>
//               <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
//                 <span>💡</span>
//                 {language === "ar"
//                   ? "سيتم تجاهل الأرقام الفردية في الجدول وسيعتمد النظام القيمة الموحدة."
//                   : "Individual stock values will be overridden by this global value."}
//               </p>
//             </div>

//             {/* الفئات المرتبطة */}
//             <div className="relative space-y-3">
//               <div className="flex justify-between items-center">
//                 <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
//                   {language === "ar" ? "الفئات المرتبطة:" : "Linked Categories:"}
//                 </label>
//                 <button
//                   onClick={() => setShowCatModal(true)}
//                   className="text-[10px] bg-slate-800 dark:bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
//                 >
//                   + {language === "ar" ? "فئة جديدة" : "New Category"}
//                 </button>
//               </div>

//               <div className="relative">
//                 <div
//                   className="flex flex-wrap gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 min-h-[50px] cursor-text focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
//                   onClick={() => setShowDropdown(!showDropdown)}
//                 >
//                   {Array.isArray(data.category) &&
//                     data.category.map((catObj) => {
//                       const catId = catObj?._id || catObj;
//                       const foundCategory = allCategories.find((c) => c._id === catId || c.id === catId);
//                       const catName = foundCategory?.name || "Unknown";
//                       return (
//                         <span
//                           key={catId}
//                           className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-indigo-100 dark:border-indigo-800/50"
//                         >
//                           {catName}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setData({
//                                 ...data,
//                                 category: data.category.filter((c) => (c?._id || c) !== catId),
//                               });
//                             }}
//                             className="hover:text-red-500 transition-colors"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       );
//                     })}

//                   <input
//                     type="text"
//                     placeholder={data.category?.length > 0 ? "" : "ابحث عن فئة..."}
//                     className="flex-1 bg-transparent outline-none text-sm min-w-[120px] dark:text-white"
//                     value={searchTerm}
//                     onChange={(e) => {
//                       setSearchTerm(e.target.value);
//                       setShowDropdown(true);
//                     }}
//                   />
//                 </div>

//                 {showDropdown && (
//                   <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
//                     {allCategories
//                       .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
//                       .map((cat) => (
//                         <div
//                           key={cat.id || cat._id}
//                           onClick={() => {
//                             const currentCats = data.category || [];
//                             const catId = cat._id || cat.id;
//                             if (!currentCats.includes(catId)) {
//                               setData({ ...data, category: [...currentCats, catId] });
//                             }
//                             setSearchTerm("");
//                             setShowDropdown(false);
//                           }}
//                           className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer flex justify-between items-center transition-colors mb-1 last:mb-0"
//                         >
//                           <span className="text-sm dark:text-slate-200">{cat.name}</span>
//                           {data.category?.includes(cat._id || cat.id) && (
//                             <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
//                               ✓ تم الاختيار
//                             </span>
//                           )}
//                         </div>
//                       ))}
//                   </div>
//                 )}
//               </div>
//               {showDropdown && (
//                 <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
//               )}
//             </div>
//           </div>

//           {/* الأسعار بتصميم متوازن */}
//           <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
//                 السعر الأصلي
//               </label>
//               <input
//                 type="number"
//                 name="originalPrice"
//                 value={data.originalPrice}
//                 onChange={handlePriceChange}
//                 className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
//               />
//             </div>
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
//                 السعر بعد الخصم
//               </label>
//               <input
//                 type="number"
//                 name="salePrice"
                
//                 value={data.salePrice || ""}
//                 onChange={handlePriceChange}
//                 className="w-full p-3 border border-emerald-200 dark:border-emerald-900/30 rounded-xl dark:bg-gray-800 font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
//               />
//             </div>
//             <div>
//               <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
//                 الخصم %
//               </label>
//               <div className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-center font-black text-indigo-600 dark:text-indigo-400">
//                 {data.salePercentage || 0}%
//               </div>
//             </div>
//           </div>

//           {/* معرض الصور */}
//           <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10">
//             <h3 className="font-bold mb-5 flex items-center gap-2 text-slate-700 dark:text-slate-300">
//               <FaImage className="text-indigo-500" />
//               {language === "ar" ? "صور المنتج الاحترافية" : "Product Gallery"}
//             </h3>
//             <input
//               type="file"
//               multiple
//               onChange={handleImageChange}
//               className="w-full text-xs mb-6 file:bg-slate-800 file:hover:bg-indigo-600 file:text-white file:border-0 file:px-6 file:py-2.5 file:rounded-xl file:font-bold file:transition-all cursor-pointer"
//             />

//             <DragDropContext
//               onDragEnd={(result) =>
//                 result.destination &&
//                 reorderProductImages(result.source.index, result.destination.index)
//               }
//             >
//               <Droppable droppableId="gallery-list" direction="horizontal">
//                 {(provided) => (
//                   <div
//                     className="flex flex-wrap gap-4"
//                     {...provided.droppableProps}
//                     ref={provided.innerRef}
//                   >
//                     {data.images.map((img, idx) => {
//                       const imageToShow = img.isNew ? img.url : img.url || img;
//                       return (
//                         <Draggable key={idx} draggableId={`img-${idx}`} index={idx}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="relative w-24 h-24 group transition-transform hover:scale-105"
//                             >
//                               <img
//                                 src={imageToShow}
//                                 className="w-full h-full object-cover rounded-xl border-2 border-white dark:border-gray-800 shadow-md group-hover:border-indigo-500 transition-all"
//                                 alt="product"
//                               />
//                               <button
//                                 onClick={(e) => removeImageFromUI(e, idx, img.public_id)}
//                                 className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
//                               >
//                                 ×
//                               </button>
//                             </div>
//                           )}
//                         </Draggable>
//                       );
//                     })}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </DragDropContext>
//           </div>
//         </div>

//         {/* الجانب الأيمن: الخصائص والجدول التلقائي */}
//         <div className="lg:col-span-5 space-y-6">
//           <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
//             <h3 className="font-bold mb-5 text-slate-700 dark:text-slate-300 flex items-center gap-2">
//               <FaTools className="text-indigo-500" />
//               {language === "ar" ? "تخصيص الخيارات" : "Product Customization"}
//             </h3>

//             {data.options.map((option, optIdx) => (
//               <div
//                 key={optIdx}
//                 className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4 shadow-sm"
//               >
//                 <div className="flex gap-3 mb-3">
//                   <input
//                     type="text"
//                     placeholder="الخاصية (مثل: اللون)"
//                     value={option.name}
//                     onChange={(e) => {
//                       const newOpts = [...data.options];
//                       newOpts[optIdx].name = e.target.value;
//                       setData({ ...data, options: newOpts });
//                     }}
//                     className="flex-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-indigo-500 outline-none font-bold"
//                   />
//                   <button
//                     onClick={() =>
//                       setData({
//                         ...data,
//                         options: data.options.filter((_, i) => i !== optIdx),
//                       })
//                     }
//                     className="text-slate-400 hover:text-red-500 transition-colors"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                 </div>

//               <input
//   type="text"
//   enterKeyHint="done" // 1. دي هتخلي كيبورد الموبايل يظهر فيه زرار "تم" أو "Done"
//   placeholder="اضغط Enter للإضافة..."
//   onKeyDown={(e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const val = e.target.value.trim();
//       if (val && !option.values.includes(val)) {
//         const newOpts = [...data.options];
//         newOpts[optIdx].values.push(val);
//         setData({ ...data, options: newOpts });
//         e.target.value = "";
//       }
//     }
//   }}
//   // 2. الحل ده للموبايل: لو المستخدم كتب الكلمة وداس بره الـ input أو قفل الكيبورد، الكلمة تتضاف
//   onBlur={(e) => {
//     const val = e.target.value.trim();
//     if (val && !option.values.includes(val)) {
//       const newOpts = [...data.options];
//       newOpts[optIdx].values.push(val);
//       setData({ ...data, options: newOpts });
//       e.target.value = "";
//     }
//   }}
//   className="w-full p-2.5 text-xs border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-500"
// />
//                 <div className="flex flex-wrap gap-2 mt-3">
//                   {option.values.map((v, vIdx) => (
//                     <span
//                       key={vIdx}
//                       className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-2 border border-slate-200 dark:border-slate-600"
//                     >
//                       {v}
//                       <button
//                         onClick={() => {
//                           const newOpts = [...data.options];
//                           newOpts[optIdx].values.splice(vIdx, 1);
//                           setData({ ...data, options: newOpts });
//                         }}
//                         className="hover:text-red-500"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             ))}

//             <button
//               onClick={() =>
//                 setData({
//                   ...data,
//                   options: [...data.options, { name: "", values: [] }],
//                 })
//               }
//               className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
//             >
//               <FaPlus /> {language === "ar" ? "إضافة خاصية جديدة" : "Add New Option"}
//             </button>
//      <button
//   onClick={handleGenerateVariants}
//   className={`
//     /* المسافات والبادينج */
//     mt-6 mb-4 px-5 py-2.5 
    
//     /* الخط والنصوص */
//     text-sm font-bold tracking-wide
    
//     /* الألوان في الوضع الفاتح (Light Mode) */
//     bg-indigo-600 text-white hover:bg-indigo-700 
    
//     /* الألوان في الوضع المظلم (Dark Mode) */
//     dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-white
    
//     /* التأثيرات والحواف */
//     rounded-xl shadow-md hover:shadow-lg 
//     transition-all duration-200 active:scale-95
//     flex items-center justify-center gap-2
//   `}
// >
//   {/* أيقونة بسيطة تعطي لمحة احترافية */}
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//   </svg>
  
//   {/* دعم اللغات */}
//   {language === "ar" ? "توليد المتغيرات تلقائياً" : "Generate All Variants"}
// </button>
//           </div>

//           {/* جدول الاحتمالات المصمم باحترافية */}
//         {data.variants.length > 0 && (
//   <div className="space-y-4">
//     <div className="flex gap-2 justify-end">
//       <button
//         onClick={applyPriceToAllVariants}
//         className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-100 font-bold border border-indigo-100 dark:border-indigo-800/50"
//       >
//         تطبيق السعر
//       </button>

//       <button
//         type="button"
//         onClick={() => applyStockToAllVariants(data.targetStock)}
//         className="bg-slate-800 dark:bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-md transition-all"
//       >
//         تطبيق المخزون ({data.targetStock})
//       </button>
//     </div>

//     <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
//       <table className="w-full text-[11px] text-right">
//         <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold">
//           <tr>
//             <th className="p-3 text-right">النوع</th>
//             <th className="p-3 text-center">السعر</th>
//             <th className="p-3 text-center">المخزون</th>
//             <th className="p-3 text-center">الصورة</th>
//             <th className="p-3"></th>
//           </tr>
//         </thead>

//         <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//           {data.variants.map((v, idx) => (
//             <tr key={v._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">

//               {/* TYPE */}
//               <td className="p-3 font-bold text-slate-700 dark:text-indigo-300">
//                 {v.type || Object.values(v.options || {}).join(" / ") || "متغير"}
//               </td>

//               {/* PRICE */}
//               <td className="p-3">
//                 <input
//                   type="number"
//                   value={v.price}
//                   onChange={(e) =>
//                     handleVariantChange(idx, "price", Number(e.target.value))
//                   }
//                   className="w-16 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-gray-800 text-center focus:border-indigo-500 outline-none"
//                 />
//               </td>

//               {/* STOCK */}
//               <td className="p-3">
//                 <input
//                   type="number"
//                   value={v.stock}
//                   onChange={(e) =>
//                     handleVariantChange(idx, "stock", Number(e.target.value))
//                   }
//                   className="w-14 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-gray-800 text-center focus:border-indigo-500 outline-none"
//                 />
//               </td>

//               {/* IMAGES */}
//               <td className="p-3">
//                 <div className="flex items-center justify-center gap-2">

//                   {/* MAIN IMAGE */}
//                   <div className="relative w-10 h-10 shrink-0">
//                     {(() => {
//                       const img = v.images?.[0];

//                       const src =
//                         typeof img === "string"
//                           ? img
//                           : img?.url;

//                       return src ? (
//                         <img
//                           src={src}
//                           className="w-full h-full object-cover rounded-md border border-indigo-500 shadow-sm"
//                           alt="variant"
//                         />
//                       ) : (
//                         <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400">
//                           No Img
//                         </div>
//                       );
//                     })()}
//                   </div>

//                   {/* SELECT IMAGE FROM PRODUCT */}
//                   <div className="flex gap-1 overflow-x-auto max-w-[80px] pb-1 scrollbar-hide">
//                     {(data.images || []).map((img, i) => {
//                       const src = img?.url || img;

//                       return (
//                         <img
//                           key={i}
//                           src={src}
//                           onClick={() =>
//                             handleVariantChange(idx, "imageIndex", i)
//                           }
//                           className={`w-6 h-6 shrink-0 object-cover rounded cursor-pointer border-2 transition-all ${
//                             v.imageIndex === i
//                               ? "border-indigo-500 scale-110"
//                               : "border-transparent opacity-50 hover:opacity-100"
//                           }`}
//                           alt="variant-option"
//                         />
//                       );
//                     })}
//                   </div>
//                 </div>
//               </td>

//               {/* DELETE */}
//               <td className="p-3">
//                 <button
//                   onClick={() => {
//                     setData((prev) => ({
//                       ...prev,
//                       variants: prev.variants.filter((_, i) => i !== idx),
//                     }));
//                   }}
//                   className="text-slate-300 hover:text-red-500 transition-colors"
//                 >
//                   🗑
//                 </button>
//               </td>

//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// )}

//           {/* الخيارات الإضافية */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
//               <div className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   id="feat"
//                   checked={featured}
//                   onChange={(e) => setFeatured(e.target.checked)}
//                   className="sr-only peer"
//                 />
//                 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
//               </div>
//               <label htmlFor="feat" className="text-sm font-bold text-amber-900 dark:text-amber-500 cursor-pointer">
//                 🌟 تمييز المنتج في الصفحة الرئيسية
//               </label>
//             </div>

//             <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
//   <p className="text-xs font-black mb-3 text-slate-500 uppercase tracking-widest flex items-center gap-2">
//     <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
//     مخطط المقاسات (اختياري)
//   </p>
  
//   {/* 1. عرض الصورة الحالية إذا كانت موجودة في الداتا بيز */}
//   {data.sizeChart?.url && !data.sizeChartFile && (
//     <div className="mb-3 relative group">
//       <img 
//         src={data.sizeChart.url} 
//         alt="Size Chart" 
//         className="w-full h-32 object-contain rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
//       />
//       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
//         <span className="text-white text-[10px]">مخطط موجود حالياً</span>
//       </div>
//     </div>
//   )}

//   {/* 2. عرض معاينة للصورة الجديدة اللي المستخدم لسه مختارها */}
//   {data.sizeChartFile && (
//     <div className="mb-3">
//       <img 
//         src={URL.createObjectURL(data.sizeChartFile)} 
//         alt="New Size Chart" 
//         className="w-full h-32 object-contain rounded-lg border-2 border-indigo-500"
//       />
//       <p className="text-[10px] text-indigo-500 mt-1 text-center font-bold">معاينة الصورة المختارة</p>
//     </div>
//   )}

//   <input
//     type="file"
//     accept="image/*" // تأكد من قبول الصور فقط
//     onChange={(e) => setData({ ...data, sizeChartFile: e.target.files[0] })}
//     className="text-[10px] w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
//   />
// </div>
//           </div>
//         </div>
//       </div>

//       {/* أزرار الحفظ السفلى */}
//       <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
//         <button
//           onClick={handleSaveProduct}
//           className={`flex-1 py-4 rounded-2xl font-black text-white text-lg shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all ${
//             isEditing ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
//           }`}
//         >
//           {language === "ar" ? "💾 حفظ ونشر التعديلات" : "💾 Save & Publish Product"}
//         </button>
//         <button
//           onClick={() => setShowModal(false)}
//           className="px-12 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
//         >
//           {language === "ar" ? "إلغاء" : "Cancel"}
//         </button>
//       </div>
//     </div>
//   </div>
// );
//   };

//   const renderReviewsModal = () => (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm"
//       onClick={() => setShowReviewsModal(false)}
//     >
//       <div
//         className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative border border-gray-200 dark:border-gray-800"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={() => setShowReviewsModal(false)}
//           className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
//         >
//           &times;
//         </button>

//         <h2 className="text-2xl font-bold mb-6 pb-2 border-b dark:border-gray-800">
//           {language === "ar" ? "تقييمات المنتج" : "Product Reviews"}
//         </h2>

//         {selectedProductReviews && selectedProductReviews.length > 0 ? (
//           <div className="space-y-4">
//             {selectedProductReviews.map((review) => (
//               <div
//                 key={review._id}
//                 className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="flex flex-col">
//                     <span className="font-bold text-gray-800 dark:text-gray-200">
//                       {review.user?.name ||
//                         review.name ||
//                         (language === "ar" ? "مستخدم مجهول" : "Anonymous User")}
//                     </span>
//                     <span className="text-xs text-gray-500">
//                       {new Date(review.createdAt).toLocaleDateString(
//                         language === "ar" ? "ar-EG" : "en-US",
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex text-yellow-400 text-sm">
//                     {[...Array(5)].map((_, i) => (
//                       <span key={i}>{i < review.rating ? "★" : "☆"}</span>
//                     ))}
//                   </div>
//                 </div>
//                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
//                   {review.comment}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-10">
//             <FaCommentDots className="mx-auto text-4xl text-gray-300 mb-3" />
//             <p className="text-gray-500">
//               {language === "ar"
//                 ? "لا توجد تقييمات لهذا المنتج بعد."
//                 : "No reviews for this product yet."}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div
//       dir={language === "ar" ? "rtl" : "ltr"}
//       className="p-4 max-w-7xl mx-auto pt-20 md:pt-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300"
//     >
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b dark:border-gray-800 pb-6">
//         <div>
//           <h2 className="text-3xl font-extrabold flex items-center gap-3">
//             <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
//               🧥
//             </span>
//             {language === "ar" ? "إدارة المنتجات" : "Product Management"}
//           </h2>
//           <p className="text-gray-500 text-sm mt-1">
//             {language === "ar"
//               ? `لديك ${products.length} منتج حالياً`
//               : `You have ${products.length} products total`}
//           </p>
//         </div>

//         <button
//           onClick={openAddModal}
//           className="w-full md:w-auto flex items-center justify-center px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 active:scale-95 font-bold"
//         >
//           <FaPlus className={language === "ar" ? "ml-2" : "mr-2"} />
//           {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
//         </button>
//       </div>

//       {/* Desktop Table */}
//       <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
//         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
//           <thead className="bg-gray-50 dark:bg-gray-800/50">
//             <tr>
//               {[
//                 "Image",
//                 "Name",
//                 "Price",
//                 "Category",
//                 "Stock",
//                 "Rating",
//                 "Actions",
//               ].map((head, i) => (
//                 <th
//                   key={i}
//                   className="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
//                 >
//                   {language === "ar"
//                     ? [
//                         "الصورة",
//                         "الاسم",
//                         "السعر",
//                         "الفئة",
//                         "المخزون",
//                         "التقييم",
//                         "الإجراءات",
//                       ][i]
//                     : head}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           {/* Desktop Table - بعد التعديل */}
//           <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
//             {products.map((product) => (
//               <tr
//                 key={product._id}
//                 className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group"
//               >
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <img
//                     // ✅ تحسين الوصول للصورة: بنجرب كل الاحتمالات الممكنة
//                     src={
//                       product.images?.[0]?.url ||
//                       product.images?.[0] || // لو كانت مصفوفة نصوص
//                       product.variants?.[0]?.images?.[0]?.url ||
//                       product.variants?.[0]?.images?.[0] ||
//                       "https://via.placeholder.com/150"
//                     }
//                     alt={product.name}
//                     className="h-12 w-12 object-cover rounded-lg border dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105"
//                   />
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-gray-700 dark:text-gray-200">
//                   {product.name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm">
//                   {product.salePrice && product.salePrice > 0 ? (
//                     <div className="flex flex-col">
//                       <span className="text-red-500 line-through text-[10px] font-medium">
//                         {product.originalPrice}{" "}
//                         {language === "ar" ? "ج" : "EGP"}
//                       </span>
//                       <span className="font-bold text-green-600 dark:text-green-400">
//                         {product.salePrice} {language === "ar" ? "ج" : "EGP"}
//                       </span>
//                     </div>
//                   ) : (
//                     <span className="font-bold text-indigo-600 dark:text-indigo-400">
//                       {product.originalPrice || product.price}{" "}
//                       {language === "ar" ? "ج" : "EGP"}
//                     </span>
//                   )}
//                 </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//   <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-black uppercase">
//     {Array.isArray(product.category)
//       ? product.category.map(c => c.name).join(", ")
//       : product.category?.name || product.category}
//   </span>
// </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
//                   {/* ✅ تنبيه لوني لو المخزون قليل */}
//                   <span
//                     className={`px-2 py-1 rounded ${product.countInStock < 5 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
//                   >
//                     {product.countInStock}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm">
//                   <div className="flex items-center text-yellow-500 font-bold gap-1">
//                     <FaStar className="text-xs" />
//                     {product.rating ? product.rating.toFixed(1) : "0.0"}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-end text-sm">
//                   <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
//                     {/* الأزرار بتاعتك زي ما هي بس ضفت لها tooltip بسيط */}
//                     <button
//                       onClick={() => openReviewsModal(product.reviews || [])}
//                       className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-all"
//                       title="Reviews"
//                     >
//                       <FaCommentDots />
//                     </button>
//                     <button
//                       onClick={() => openEditModal(product)}
//                       className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
//                     >
//                       <FaEdit />
//                     </button>
//                     <button
//                       onClick={() => deleteProduct(product._id)}
//                       className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
//                     >
//                       <FaTrash />
//                     </button>
//                     <button
//   onClick={() => {
//     setSelectedImages(product.images || []);
//     setShowImageModal(true);
//   }}
//   className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all"
//   title="View Images"
// >
//   <FaEye />
// </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Mobile view and Modals */}
//       {renderProductCards && renderProductCards()}
//       {showModal && renderModalContent()}
//       {showReviewsModal && renderReviewsModal()}

// {/* Image Modal - Vestro Neon Luxury */}
// {showImageModal && (
//   <div
//     className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-300"
//     onClick={() => setShowImageModal(false)}
//   >
//     <div
//       className="bg-white dark:bg-black p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-5xl max-h-[90vh] overflow-hidden relative border border-gray-100 dark:border-[#1a1a1a] transform transition-all"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {/* Header */}
//       <div className="flex justify-between items-center mb-10 border-b dark:border-[#1a1a1a] pb-6">
//         <h2 className="text-3xl font-black text-black dark:text-white flex items-center gap-4">
//           <div className="p-3 bg-[#ccff00]/10 dark:bg-[#ccff00]/20 rounded-2xl">
//             <FaEye className="text-[#a8d600] dark:text-[#ccff00] drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]" />
//           </div>
//           {language === "ar" ? "معرض الصور الملكي" : "Royal Gallery"}
//         </h2>
//         <button
//           onClick={() => setShowImageModal(false)}
//           className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-xl"
//         >
//           &times;
//         </button>
//       </div>

//       {/* Grid Container */}
//       <div className="overflow-y-auto max-h-[65vh] pr-4 custom-scrollbar">
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
//           {selectedImages.length > 0 ? (
//             selectedImages.map((img, index) => (
//               <div
//                 key={index}
//                 className="group relative aspect-square overflow-hidden rounded-[2rem] border-2 border-transparent hover:border-[#ccff00] bg-gray-50 dark:bg-[#0a0a0a] transition-all duration-500 shadow-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.2)]"
//               >
//                 <img
//                   src={img.url}
//                   alt="Vestro Product"
//                   className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-24 bg-gray-50 dark:bg-[#0a0a0a] rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-[#1a1a1a]">
//               <p className="text-gray-400 dark:text-[#333] text-xl font-black uppercase tracking-widest">
//                 {language === "ar" ? "الفخامة تبدأ من هنا" : "Luxury starts here"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// )}

//     {/* Category Modal - Vestro Neon Luxury */}
// {showCatModal && (
//   <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in duration-300">
//     <div className="bg-white dark:bg-black border border-gray-100 dark:border-[#1a1a1a] w-full max-w-md rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden">
//       <div className="p-10">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-10">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 bg-[#ccff00] rounded-[1.2rem] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(204,255,0,0.4)]">
//               ✨
//             </div>
//             <div>
//               <h3 className="text-2xl font-[1000] text-black dark:text-white leading-none tracking-tight">
//                 {language === "ar" ? "فئة ملكية" : "Royal Category"}
//               </h3>
//               <p className="text-[10px] text-gray-400 dark:text-[#444] mt-2 font-black uppercase tracking-[0.3em]">Exclusive Inventory</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowCatModal(false)}
//             className="text-gray-300 dark:text-[#222] hover:text-red-500 transition-colors text-4xl font-light"
//           >
//             &times;
//           </button>
//         </div>

//         {/* Form Body */}
//         <div className="space-y-8">
//           <div className="relative group">
//             <label className="text-[11px] font-black text-gray-400 dark:text-[#666] mb-3 uppercase tracking-[0.25em] ml-2 block">
//               {language === "ar" ? "اسم التصنيف" : "Category Identity"}
//             </label>
//             <input
//               type="text"
//               autoFocus
//               className="w-full p-5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl outline-none focus:border-[#ccff00] focus:ring-4 focus:ring-[#ccff00]/5 transition-all dark:text-white font-bold text-lg"
//               placeholder="..."
//               value={newCategory.name}
//               onChange={(e) => {
//                 const name = e.target.value;
//                 const slug = name.toLowerCase().trim().replace(/[^\u0621-\u064A\w ]/g, "").replace(/ /g, "-");
//                 setNewCategory({ ...newCategory, name, slug });
//               }}
//             />
//           </div>

//           <div className="relative group">
//             <label className="text-[11px] font-black text-gray-400 dark:text-[#666] mb-3 uppercase tracking-[0.25em] ml-2 block">
//               الرابط الرقمي (Slug)
//             </label>
//             <div className="p-5 bg-black dark:bg-[#0a0a0a] rounded-2xl text-[#ccff00] text-sm font-mono border border-[#ccff00]/20 flex items-center gap-3 overflow-hidden">
//               <span className="opacity-30 select-none">VESTRO://</span>
//               <span className="truncate">{newCategory.slug || "..."}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col gap-4 mt-12">
//           <button
//             onClick={handleCreateCategory}
//             className="w-full bg-[#ccff00] hover:bg-[#d9ff33] text-black py-5 rounded-[1.5rem] font-[1000] text-lg shadow-[0_10px_30px_rgba(204,255,0,0.2)] transition-all active:scale-[0.97] hover:-translate-y-1 uppercase tracking-widest"
//           >
//             {language === "ar" ? "تأكيد الإضافة" : "Confirm Entry"}
//           </button>
//           <button
//             onClick={() => setShowCatModal(false)}
//             className="w-full py-4 bg-transparent text-gray-400 dark:text-[#333] rounded-2xl font-bold hover:text-black dark:hover:text-white transition-all"
//           >
//             {language === "ar" ? "تراجع" : "Go Back"}
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default Products;
// -------------------------------------------------------------------------------------------------


// ---------------


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import imageCompression from "browser-image-compression";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FaEdit,
  FaImage,
  FaTools,
  FaTrash,
  FaPlus,
  FaEye,
  FaCommentDots,
  FaStar,
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Products = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true); // القيمة الافتراضية نشط
  const { theme } = useTheme(); // أو أي اسم تستخدمه للـ Context
const isDark = theme === "dark";
  const [sortType, setSortType] = useState("manual"); // الترتيب اليدوي هو الافتراضي
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    targetStock: "", // 👈 أضف هذا الحقل
    category: [],
    brand: '', // أضف هذا
  tags: '',  // هنستقبله كنص وبعدين نحوله لمصفوفة
    images: [], // كل صور المنتج المرفوعة (رفع جماعي)
    options: [
      // الخصائص اللي التاجر بيحددها
      { name: "Color", values: [] },
      { name: "Size", values: [] },
    ],
    variants: [], // دي هتتولد تلقائياً (التباديل)
    customSections: [], // الأقسام اللي التاجر هيكريتها بنفسه
    sizeChartFile: null,
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedProductReviews, setSelectedProductReviews] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  // ننده الأقسام أول ما الصفحة تفتح
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories");
        setAllCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      const response = await axios.post("/categories", newCategory);
      if (response.status === 201 || response.status === 200) {
        // تحديث قائمة الفئات اللي معروضة في الـ UI فوراً
        setAllCategories([...allCategories, response.data]);
        setShowCatModal(false); // إغلاق المودال
        setNewCategory({ name: "", slug: "", isActive: true }); // تصفير البيانات
        toast.success("تم إضافة الفئة بنجاح! 🎉");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("فشل في إضافة الفئة");
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setFeatured(editingProduct.featured || false);
    }
  }, [editingProduct]);

 const fetchProducts = async (type = sortType) => {
  try {
    // بنبعت الـ sort كـ Query Parameter
    const res = await axios.get(`/products?sort=${type}`);
    setProducts(res.data);
  } catch (err) {
    console.error("Error fetching products:", err);
  }
};


// تحديث المنتجات لما نوع الترتيب يتغير
useEffect(() => {
  fetchProducts();
}, [sortType]);

// Export products 

const exportProductsToExcel = (products) => {
  const rows = [];

  products.forEach(p => {
    // لو مفيش Variants، بنعمل صف واحد أساسي
    if (!p.variants || p.variants.length === 0) {
      rows.push(createRow(p, null));
    } else {
      // لو فيه Variants، بنعمل صف لكل واحد
      p.variants.forEach(v => {
        rows.push(createRow(p, v));
      });
    }
  });

  function createRow(p, v) {
    return {
      "Name en": "", // أو p.name_en لو عندك
      "اسم المنتج بالعربي": p.name,
      "Description": p.description,
      "ID": p._id,
      "Category": p.category?.map(c => c.name).join(", ") || "",
      "Price": v ? v.price : (p.salePrice || p.originalPrice),
      "Original price": p.originalPrice,
      "Quantity": v ? v.stock : p.countInStock,
      "Active": p.isActive !== false ? "True" : "False",
      "Option 1": p.options?.[0]?.name || "Color",
      "Option 1 value": v?.options?.["Color"] || v?.options?.["اللون"] || "",
      "Option 2": p.options?.[1]?.name || "Size",
      "Option 2 value": v?.options?.["Size"] || v?.options?.["المقاس"] || "",
      "Option 3": "",
      "Option 3 value": "",
      "Image URL": (v?.images?.[0]?.url) || (p.images?.[0]?.url) || ""
    };
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
  XLSX.writeFile(workbook, "Vestro_Template_Standard.xlsx");
};


const handleImportExcel = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/products/bulk-import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      alert("تم رفع المنتجات بنجاح!");
      fetchProducts();
    }
  } catch (error) {
    console.error("خطأ في الاستيراد:", error);
    alert(
      "حدث خطأ أثناء الاستيراد: " +
        (error.response?.data?.message || error.message)
    );
  }

  e.target.value = null;
};

const handleToggleActive = async (productId, currentStatus) => {
  try {
    // إرسال الحالة المعكوسة للسيرفر
    const newStatus = !currentStatus;
    
    // تأكد من مسار الـ API عندك، أنا هنا استخدمت دالة الـ update اللي عملناها
    await axios.put(`/products/${productId}`, { 
      isActive: newStatus 
    });

    // تحديث الحالة في الـ State فوراً عشان الجدول يحس بالتغيير
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, isActive: newStatus } : p))
    );

    // اختيار اختياري: إظهار تنبيه نجاح
    // toast.success(newStatus ? "Product Activated" : "Product Hidden");
  } catch (err) {
    console.error("Error toggling product status:", err);
    alert("Failed to update status");
  }
};



const handleReorderSave = async (newOrderedProducts) => {
  try {
    const newOrderIds = newOrderedProducts.map(p => p._id);
    await axios.patch("/products/reorder", { newOrderIds });
    toast.success(language === "ar" ? "تم حفظ الترتيب الجديد" : "Order saved successfully");
  } catch (err) {
    toast.error("Failed to save order");
    fetchProducts(); // ارجع للترتيب القديم لو فشل
  }
};

const saveSortToDatabase = async (sortValue) => {
  try {
    // إرسال النوع المختار للباك إيند لتحديث الـ position لكل المنتجات
    const res = await axios.post('/products/update-sort', { 
      sortType: sortValue 
    });

    if (res.status === 200) {
      toast.success(language === "ar" ? "تم حفظ الترتيب الجديد بنجاح!" : "New order saved successfully");
      fetchProducts(); // إعادة جلب المنتجات بالترتيب الجديد
    }
  } catch (error) {
    console.error("خطأ في حفظ الترتيب:", error);
    toast.error(language === "ar" ? "فشل تحديث الترتيب في السيرفر" : "Failed to update order in the server");
  }
};


const onDragEndProducts = (result) => {
  if (!result.destination || sortType !== "manual") return;

  const items = Array.from(products);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  setProducts(items);
  handleReorderSave(items); // حفظ في الداتابيز فوراً
};

 const generateVariants = (options, oldVariants = []) => {
  const combinations = options.reduce((acc, option) => {
    if (!option.values?.length) return acc;
    if (acc.length === 0) return option.values.map((val) => ({ [option.name]: val }));

    const res = [];
    acc.forEach((item) => {
      option.values.forEach((val) => {
        res.push({ ...item, [option.name]: val });
      });
    });
    return res;
  }, []);

  return combinations.map((combo) => {
    const typeString = Object.entries(combo)
      .map(([k, v]) => `${k}:${v}`)
      .join("|");

    const existing = oldVariants.find((v) => v.type === typeString);

    return {
      type: typeString,
      options: combo, // 🔥 ضيف السطر ده عشان نحتفظ بالـ Object {Color: "Red", Size: "XL"}
      price: existing?.price ?? 0,
      stock: existing?.stock ?? 0,
      imageIndex: existing?.imageIndex ?? null,
      images: existing?.images ?? [],
    };
  });
};

 const handleGenerateVariants = () => {
  const currentData = editingProduct || newProduct;
  const setData = editingProduct ? setEditingProduct : setNewProduct;

  const newVariants = generateVariants(
    currentData.options,
    currentData.variants || []
  );

  setData((prev) => ({
    ...prev,
    variants: newVariants,
  }));
};

  const compressImages = async (files) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFiles = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressedFile = await imageCompression(files[i], options);
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
        compressedFiles.push(files[i]);
      }
    }
    return compressedFiles;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // تحديد الـ State النشط (إضافة ولا تعديل)
    const isEditing = editingProduct !== null;
    const currentData = isEditing ? editingProduct : newProduct;
    const setData = isEditing ? setEditingProduct : setNewProduct;

    const newImagesWithPreviews = [];

    files.forEach((file) => {
      // 1. توليد رابط مؤقت للعرض فقط (Preview)
      const previewUrl = URL.createObjectURL(file);

      newImagesWithPreviews.push({
        url: previewUrl, // عشان الـ <img src={url} /> تشتغل فوراً
        file: file, // ده الملف الحقيقي (Binary) اللي هيتبعت للباك-إيند
        isNew: true, // علامة لينا عشان نعرف إن دي صورة لسه مأترفتش
      });
    });

    // 2. تحديث الـ State بالمصفوفة الجديدة
    setData({
      ...currentData,
      images: [...(currentData.images || []), ...newImagesWithPreviews],
    });
  };

  // ✅ إضافة قسم جديد (Dynamic Sections) - طلبك الخاص بـ "شغل عالي"
  const addCustomSection = () => {
    setNewProduct((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        { sectionTitle: "", sectionDescription: "", sectionImages: [] },
      ],
    }));
  };

  const handleEditImageChange = async (e, variationIndex = null) => {
    if (!editingProduct) return;
    const files = e.target.files;
    if (files.length === 0) return;
    const compressed = await compressImages(files);
    if (variationIndex !== null) {
      const updatedVariations = [...editingProduct.variations];
      updatedVariations[variationIndex].newImages = compressed;
      setEditingProduct({ ...editingProduct, variations: updatedVariations });
    } else {
      setEditingProduct({ ...editingProduct, newImages: compressed });
    }
  };

  const removeImageFromUI = (e, index, public_id) => {
    if (e) e.stopPropagation();

    // تحديد الـ State النشط حالياً (تعديل ولا إضافة)
    const isEditing = editingProduct !== null;
    const currentData = isEditing ? editingProduct : newProduct;
    const setData = isEditing ? setEditingProduct : setNewProduct;

    // حماية: لو الداتا مش موجودة ميعملش حاجة
    if (!currentData || !currentData.images) return;

    const updatedImages = [...currentData.images];
    updatedImages.splice(index, 1);

    setData({
      ...currentData,
      images: updatedImages,
    });
  };

  const applyStockToAll = (value) => {
    const updatedVariants = newProduct.variants.map((v) => ({
      ...v,
      stock: Number(value),
    }));
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const deleteProduct = async (id) => {
    // 1. رسائل التأكيد (مظبوطة عندك بس ممكن تخليها في متغير عشان النضافة)
    const confirmMsg =
      language === "ar"
        ? "هل أنت متأكد أنك تريد حذف هذا المنتج؟"
        : "Are you sure you want to delete this product?";

    if (!window.confirm(confirmMsg)) return;

    // const toastId = toast.loading(language === "ar" ? "جاري الحذف..." : "Deleting...");

    try {
      const token = localStorage.getItem("token");

      // تأكد إن المسار بيبدأ بـ /api لو إنت مش ضابط الـ BaseURL في axios
      await axios.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        language === "ar"
          ? "🗑️ تم حذف المنتج بنجاح"
          : "🗑️ Product deleted successfully",
      );

      // تحديث القائمة فوراً
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);

      // 2. إظهار رسالة الخطأ اللي جاية من السيرفر لو موجودة
      const errorMsg =
        err.response?.data?.message ||
        (language === "ar"
          ? "❌ فشل حذف المنتج"
          : "❌ Failed to delete product");

      toast.error(errorMsg, { id: toastId });

      // 3. لو الـ Token انتهى (401) ممكن تعمل Logout أو توجهه لصفحة اللوجن
      if (err.response?.status === 401) {
        // logic: logout or redirect
      }
    }
  };

 

  const handleSaveProduct = async () => {
  try {
    const formData = new FormData();
    const currentProduct = editingProduct || newProduct;
    const isEdit = !!editingProduct;

    // --- 1️⃣ البيانات الأساسية ---
    formData.append("name", currentProduct.name);
    formData.append("description", currentProduct.description);
formData.append("isActive", isActive); // 👈 ضيف السطر ده
formData.append("brand", currentProduct.brand || ""); 

const tagsArray = typeof currentProduct.tags === 'string' 
  ? currentProduct.tags.split(',').map(t => t.trim()).filter(t => t !== "")
  : Array.isArray(currentProduct.tags) ? currentProduct.tags : [];

formData.append("tags", JSON.stringify(tagsArray));
    
    // إرسال الكاتيجوري كمصفوفة JSON (بما إنه بياخد كذا قيمة)
    const categories = Array.isArray(currentProduct.category) 
      ? currentProduct.category 
      : currentProduct.category ? [currentProduct.category] : [];
    formData.append("category", JSON.stringify(categories));

   // --- 💰 منطق الأسعار (الحل النهائي لمنع الـ NaN والـ 100%) ---
const originalPrice = Number(currentProduct.originalPrice) || 0;

// التأكد إن سعر الخصم "رقم" سليم أو خليه نص فاضي تماماً
let salePriceToSend = "";
if (currentProduct.salePrice !== "" && currentProduct.salePrice !== null) {
  const parsedSale = Number(currentProduct.salePrice);
  // لو هو رقم سليم وأصغر من الأصلي، نبعته.. غير كدة يروح فاضي
  if (!isNaN(parsedSale) && parsedSale > 0 && parsedSale < originalPrice) {
    salePriceToSend = parsedSale;
  }
}

formData.append("originalPrice", originalPrice);
formData.append("salePrice", salePriceToSend); // هيروح يا إما رقم صح يا إما "" (والباك إند هيتعامل معاها)
    formData.append("featured", featured);

    if (currentProduct.targetStock) {
      formData.append("targetStock", currentProduct.targetStock);
    }

 // داخل handleSaveProduct
const cleanedVariantsForServer = currentProduct.variants.map((v) => {
  return {
    type: v.type, // النص مثل (أحمر / XL)
    
    // 🔥 هذا السطر هو الأهم لحل مشكلة السلة والمخزون
    // نرسل كائن الخيارات { Color: "red", Size: "XL" }
    options: v.options || {}, 

    price: Number(v.price),
    stock: Number(v.stock),
    imageIndex: v.imageIndex !== null ? Number(v.imageIndex) : null,
  };
});

    formData.append("options", JSON.stringify(currentProduct.options || []));
    formData.append("variants", JSON.stringify(cleanedVariantsForServer));
    formData.append("customSections", JSON.stringify(currentProduct.customSections || []));

    // --- 3️⃣ إدارة الصور ---
    const existingImages = [];
    currentProduct.images.forEach((img) => {
      if (img.isNew && img.file) {
        formData.append("images", img.file);
      } else if (!img.isNew) {
        existingImages.push(img);
      }
    });

    formData.append("existingImages", JSON.stringify(existingImages));

    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    if (currentProduct.sizeChartFile) {
      formData.append("size_chart", currentProduct.sizeChartFile);
    }

    // --- 4️⃣ إرسال الطلب ---
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const apiPath = isEdit ? `/api/products/${editingProduct._id}` : "/api/products";

    await axios({
      method: isEdit ? "put" : "post",
      url: `${baseURL}${apiPath}`,
      data: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(language === "ar" ? "✅ تم الحفظ بنجاح" : "✅ Saved Successfully");
    setEditingProduct(null);
    setShowModal(false);
    fetchProducts();

  } catch (err) {
    console.error("--- ❌ Error Details ---", err.response?.data);
    const msg = err.response?.data?.message || "Error saving product";
    toast.error(msg);
  }
};

  const reorderImages = (variationIndex, startIndex, endIndex) => {
    if (!editingProduct) return;

    // 1. إنشاء نسخة من التنوعات لتجنب التعديل المباشر
    const updatedVariations = [...editingProduct.variations];

    // 2. نسخ مصفوفة الصور للتنوع المحدد
    const imagesToReorder = Array.from(
      updatedVariations[variationIndex].images,
    );

    // 3. تطبيق منطق السحب والإفلات
    const [removed] = imagesToReorder.splice(startIndex, 1); // إزالة العنصر من الموضع الأصلي
    imagesToReorder.splice(endIndex, 0, removed); // إضافته في الموضع الجديد

    // 4. تحديث الصور في التنوع
    updatedVariations[variationIndex].images = imagesToReorder;

    // 5. تحديث حالة التعديل (هذا مهم لتحديث واجهة المستخدم)
    setEditingProduct({ ...editingProduct, variations: updatedVariations });
  };

  const onDragEnd = (result, variationIndex) => {
    // التحقق من الإسقاط الصحيح
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // استدعاء دالة إعادة الترتيب
    reorderImages(variationIndex, startIndex, endIndex);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFeatured(false);
    setNewProduct({
      name: "",
      description: "",
category: [], // 🔥 لازم Array      originalPrice: "",
      salePrice: "",
      salePercentage: "",
      countInStock: "",
      targetStock: "", // 👈 أضف هذا الحقل
      images: [], // مصفوفة الصور الجماعية
      options: [
        { name: "Color", values: [] },
        { name: "Size", values: [] },
        { name: "Type", values: [] },
      ],
      variants: [], // هتتولد تلقائياً
      customSections: [], // الأقسام الديناميكية
      sizeChartFile: null,
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setImagesToDelete([]);
    setFeatured(product.featured || false);

    // 1️⃣ تجهيز الصور الأساسية (تحويلها لروابط فقط للمعاينة)
    const preparedImages = (product.images || []).map((img) => ({
      ...img,
      url: img.url || img, // نضمن إننا بناخد الرابط سواء كان Object أو String
      isNew: false, // علامة عشان نفرق بين القديم والجديد في الـ Save
    }));

   const preparedVariants = (product.variants || []).map((v) => {
  let imageIndex = "";

  if (v.images && v.images.length > 0) {
    const variantImageUrl = v.images[0].url;

    const index = product.images.findIndex(
      (img) => img.url === variantImageUrl
    );

    if (index !== -1) {
      imageIndex = String(index);
    }
  }

  return {
    ...v,
    images: (v.images || []).map((img) =>
      typeof img === "object" ? img.url : img
    ),
    imageIndex, // ✅ كده رجعناه صح
  };
});
   setEditingProduct({
  ...product,
  // 3️⃣ تحويل الفئات دايمًا لمصفوفة من الـ IDs
  category: Array.isArray(product.category)
    ? product.category.map((c) => (typeof c === "object" ? c._id : c))
    : product.category
    ? [typeof product.category === "object" ? product.category._id : product.category]
    : [],
    
  options: product.options || [],
  variants: preparedVariants, // النسخة المعدلة للمعاينة
  images: preparedImages,     // النسخة المعدلة للمعاينة
  customSections: (product.customSections || []).map((section) => ({
    ...section,
    image: section.image?.url || section.image || null,
  })),
  sizeChartFile: null,
});

    setShowModal(true);
  };


const handlePriceChange = (e) => {

  const { name, value } = e.target;

  

  // تحديد الـ State اللي هنشتغل عليه

  const data = editingProduct || newProduct;

  const setData = editingProduct ? setEditingProduct : setNewProduct;



  // 1. تحويل القيمة لرقم أو نص فاضي

  const updatedValue = value === "" ? "" : Number(value);

  

  // 2. إنشاء نسخة جديدة من البيانات وتحديث الحقل المطلوب

  const updatedData = {

    ...data,

    [name]: updatedValue,

  };



  // 3. حساب النسبة بناءً على القيم "الجديدة"

  const original = Number(updatedData.originalPrice) || 0;

  const sale = Number(updatedData.salePrice) || 0;



  if (sale > 0 && original > 0 && sale < original) {

    const percentage = ((original - sale) / original) * 100;

    updatedData.salePercentage = Math.round(percentage);

  } else {

    // تصفير النسبة تماماً لو الشروط مختلة

    updatedData.salePercentage = "";

  }



  // 4. تحديث الـ State بالبيانات الكاملة الجديدة

  setData(updatedData);

};

  const openReviewsModal = (reviews) => {
    setSelectedProductReviews(reviews);
    setShowReviewsModal(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderProductCards = () => (
  <div className="flex flex-col gap-4">
    {/* 1️⃣ الـ Dropdown الخاص بالترتيب بيتحط هنا فوق الكروت مباشرة */}
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <label className="text-sm font-bold">
        {language === "ar" ? "ترتيب المنتجات:" : "Sort Products:"}
      </label>
      <select
        value={sortType}
onChange={(e) => {
    const value = e.target.value;
    setSortType(value); // تغيير الحالة في الفرونت للرؤية الفورية
    saveSortToDatabase(value); // الحفظ الفعلي في الداتا بيز (كأنك ندهت باك إيند)
  }}        className="text-sm p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 outline-none"
      >
        <option value="manual">{language === "ar" ? "ترتيب يدوي (سحب)" : "Manual (Drag)"}</option>
        <option value="newest">{language === "ar" ? "الأحدث" : "Newest"}</option>
        <option value="oldest">{language === "ar" ? "الأقدم" : "Oldest"}</option>
      </select>
    </div>

    {/* 2️⃣ تغليف الكروت بمنطق السحب والإفلات */}
    <DragDropContext onDragEnd={onDragEndProducts}>
      <Droppable droppableId="products-mobile-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="md:hidden grid gap-4 grid-cols-1"
          >
            {products.map((product, index) => (
              <Draggable
                key={product._id}
                draggableId={product._id}
                index={index}
                isDragDisabled={sortType !== "manual"} // السحب يشتغل فقط في الوضع اليدوي
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    /* تغيير الشكل أثناء السحب لإعطاء إيحاء لليوزر */
                    className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border 
                      ${snapshot.isDragging ? "border-indigo-500 ring-2 ring-indigo-200 z-50" : "border-gray-100 dark:border-gray-700"} 
                      hover:shadow-lg transition-shadow relative`}
                  >
                    {/* علامة السحب (اختيارية كشكل جمالي) */}
                    {sortType === "manual" && (
                      <div className="absolute top-2 left-2 text-gray-300">
                        <FaTools className="rotate-45 text-xs" />
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={product.images?.[0]?.url || "https://via.placeholder.com/400x400?text=No+Image"}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md border dark:border-gray-600"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                          {language === "ar" ? "الاسم" : "Name"}:
                          <span className="font-normal ms-1">{product.name}</span>
                        </h3>
                        
                        <div className="flex items-center flex-wrap gap-1 mt-1">
                          <span className="text-sm text-gray-500">
                            {language === "ar" ? "السعر:" : "Price:"}
                          </span>
                          {product.salePrice ? (
                            <>
                              <span className="text-gray-400 line-through text-xs">
                                {product.originalPrice} {language === "ar" ? "جنيه" : "EGP"}
                              </span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {product.salePrice} {language === "ar" ? "جنيه" : "EGP"}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {product.originalPrice ?? product.price} {language === "ar" ? "جنيه" : "EGP"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* أزرار التحكم (تعديل، حذف، الخ) كما هي في كودك */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openReviewsModal(product.reviews || [])}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-500 transition-colors"
                      >
                        <FaCommentDots className="text-sm" />
                        {language === "ar" ? "التقييمات" : "Reviews"}
                      </button>

                      <button
                        onClick={() => {
                          const uniqueImages = Array.from(new Set([...(product.images || []), ...(product.variants?.flatMap((v) => v.images) || [])].map((img) => JSON.stringify(img)))).map((str) => JSON.parse(str));
                          setSelectedImages(uniqueImages);
                          setShowImageModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 transition-colors"
                      >
                        <FaEye className="text-sm" />
                        {language === "ar" ? "الصور" : "Images"}
                      </button>

                      <button
                        onClick={() => openEditModal(product)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                      >
                        <FaEdit className="text-sm" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </button>

                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </div>
);

  const renderModalContent = () => {
    const isEditing = editingProduct !== null;
    const data = isEditing ? editingProduct : newProduct;
    const setData = isEditing ? setEditingProduct : setNewProduct;

    const handleVariantChange = (index, field, value) => {
  const isEditing = editingProduct !== null;
  const currentData = isEditing ? editingProduct : newProduct;
  const setData = isEditing ? setEditingProduct : setNewProduct;

  const updatedVariants = [...currentData.variants];

  if (field === "imageIndex") {
    // 🧠 لو مسح الصورة
    if (value === null || value === "") {
      updatedVariants[index] = {
        ...updatedVariants[index],
        imageIndex: null,
        images: [],
      };
    } else {
      const selectedImage = currentData.images[value];
const imageUrl =
  typeof selectedImage === "object"
    ? selectedImage.url
    : selectedImage;
      updatedVariants[index] = {
        ...updatedVariants[index],
        imageIndex: value,
        images: imageUrl ? [imageUrl] : [],
      };
    }
  } else {
    // السعر أو المخزون
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]:
        field === "price" || field === "stock"
          ? Number(value)
          : value,
    };
  }

  setData({ ...currentData, variants: updatedVariants });
};

    // 2. منطق اختيار الفئات (Checkbox)
    const handleCategoryChange = (e) => {
      const { value, checked } = e.target;
const currentCategories = Array.isArray(data.category)
  ? data.category
  : [];      if (checked) {
        setData({ ...data, category: [...currentCategories, value] });
      } else {
        setData({
          ...data,
          category: currentCategories.filter((c) => c !== value),
        });
      }
    };

    // 3. ترتيب الصور بالسحب والإفلات
    const reorderProductImages = (startIndex, endIndex) => {
      const images = Array.from(data.images);
      const [removed] = images.splice(startIndex, 1);
      images.splice(endIndex, 0, removed);
      setData({ ...data, images: images });
    };

   const applyPriceToAllVariants = () => {
  const isEditing = editingProduct !== null;
  const currentData = isEditing ? editingProduct : newProduct;
  const setData = isEditing ? setEditingProduct : setNewProduct;

  // 🧠 اختار السعر الصح
  const basePrice =
    currentData.salePrice && currentData.salePrice > 0
      ? Number(currentData.salePrice)
      : Number(currentData.originalPrice);

  if (!basePrice || basePrice <= 0) {
    toast.error(
      language === "ar"
        ? "❌ لازم تدخل سعر صحيح الأول"
        : "❌ Enter valid price first"
    );
    return;
  }

  const updatedVariants = currentData.variants.map((v) => ({
    ...v,
    price: basePrice,
  }));

  setData({ ...currentData, variants: updatedVariants });

  toast.success(
    language === "ar"
      ? "✅ تم تطبيق السعر على كل المتغيرات"
      : "✅ Price applied to all variants"
  );
};

   const applyStockToAllVariants = (value) => {
  // 1️⃣ التحقق من الرقم
  const stockValue = Number(value);
  if (isNaN(stockValue) || stockValue < 1) {
    return toast.warning(
      language === "ar"
        ? "❌ يرجى إدخال رقم صحيح أكبر من صفر"
        : "❌ Please enter a valid number greater than 0"
    );
  }

  const isEditing = editingProduct !== null;
  const currentData = isEditing ? editingProduct : newProduct;
  const setData = isEditing ? setEditingProduct : setNewProduct;

  // 2️⃣ تحديث كل التنوعات + targetStock
  const updatedVariants = currentData.variants.map((v) => ({
    ...v,
    stock: stockValue,
  }));

  setData({
    ...currentData,
    variants: updatedVariants,
    targetStock: stockValue, // الربط مع الباك إند
  });

  // 3️⃣ إشعار النجاح
  toast.success(
    language === "ar"
      ? `✅ تم ضبط المخزون (${stockValue}) لجميع التنوعات`
      : `✅ Stock set to (${stockValue}) for all variants`
  );
};

return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4"
    onClick={() => setShowModal(false)}
  >
    <div
      className="bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative border border-gray-100 dark:border-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* زر الإغلاق */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* العنوان بتصميم أهدأ */}
      <h2
        className={`text-xl sm:text-2xl font-black mb-8 flex items-center gap-3 ${
          isEditing ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        <span className={`p-2 rounded-lg ${isEditing ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-emerald-50 dark:bg-emerald-900/30"}`}>
          {isEditing ? "✏️" : "➕"}
        </span>
        {isEditing
          ? language === "ar"
            ? "تعديل بيانات المنتج"
            : "Edit Product Details"
          : language === "ar"
            ? "إضافة منتج جديد للمتجر"
            : "Add New Store Product"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* الجانب الأيسر: البيانات الأساسية والصور */}
        <div className="lg:col-span-7 space-y-6">
          {/* المعلومات الأساسية */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <input
              type="text"
              placeholder={language === "ar" ? "اسم المنتج" : "Product Name"}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
            />
            <textarea
              placeholder={
                language === "ar"
                  ? "وصف المنتج بالتفصيل..."
                  : "Detailed Description"
              }
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 h-32 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
            />

        {/* Brand Input */}
<div className="space-y-2 mb-4">
<label className="text-[14px] font-black uppercase opacity-40">
  {language === "ar" ? "اسم العلامة التجارية" : "Brand Name"}
</label>  <input 
    type="text" 
placeholder={language === "ar" ? "أدخل اسم البراند..." : "Enter brand name..."}
    className={`w-full p-4 rounded-xl border font-bold outline-none ${isDark ? "bg-black border-zinc-800 text-white" : "bg-gray-100 border-gray-200 text-black"}`}
    // هنا بنقرأ من المتغير الصح حسب الحالة
    value={editingProduct ? editingProduct.brand : newProduct.brand}
    // وهنا بنحدث المتغير الصح حسب الحالة
    onChange={(e) => editingProduct 
      ? setEditingProduct({...editingProduct, brand: e.target.value})
      : setNewProduct({...newProduct, brand: e.target.value})
    }
  />
</div>

{/* Tags Input */}
<div className="space-y-2 mb-4">
<label className="text-[14px] font-black uppercase opacity-40">
  {language === "ar" ? "الكلمات الدلاليه (مفصولة بفاصلة)" : "Tags (Separated by comma)"}
</label>  
<input 
    type="text" 
placeholder={language === "ar" ? "مثال: تيشيرت، قطن، صيفي" : "e.g. t-shirt, cotton, summer"}    className={`w-full p-4 rounded-xl border font-bold outline-none ${isDark ? "bg-black border-zinc-800 text-white" : "bg-gray-100 border-gray-200 text-black"}`}
    // نفس الكلام للـ Tags
    value={editingProduct ? editingProduct.tags : newProduct.tags}
    onChange={(e) => editingProduct 
      ? setEditingProduct({...editingProduct, tags: e.target.value})
      : setNewProduct({...newProduct, tags: e.target.value})
    }
  />
</div>
            
            {/* قسم التوزيع السريع للمخزون - ألوان أهدأ */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Bulk Action
                </span>
                {language === "ar"
                  ? "توزيع مخزون موحد على كل المتغيرات"
                  : "Bulk Stock Distribution"}
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder={language === "ar" ? "مثلاً: 150" : "Ex: 150"}
                  className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                  value={data.targetStock || ""}
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (value < 1) value = 1;
                    setData({ ...data, targetStock: value });
                  }}
                  onBlur={() => {
                    if (!data.targetStock || data.targetStock < 1) {
                      setData({ ...data, targetStock: 1 });
                    }
                  }}
                />
                {data.targetStock > 0 && (
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1 rounded-xl text-xs font-bold flex items-center animate-pulse border border-emerald-200 dark:border-emerald-800/50">
                    {language === "ar" ? "نشط الآن" : "Active"}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
                <span>💡</span>
                {language === "ar"
                  ? "سيتم تجاهل الأرقام الفردية في الجدول وسيعتمد النظام القيمة الموحدة."
                  : "Individual stock values will be overridden by this global value."}
              </p>
            </div>

            {/* الفئات المرتبطة */}
            <div className="relative space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {language === "ar" ? "الفئات المرتبطة:" : "Linked Categories:"}
                </label>
                <button
                  onClick={() => setShowCatModal(true)}
                  className="text-[10px] bg-slate-800 dark:bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                >
                  + {language === "ar" ? "فئة جديدة" : "New Category"}
                </button>
              </div>

              <div className="relative">
                <div
                  className="flex flex-wrap gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 min-h-[50px] cursor-text focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {Array.isArray(data.category) &&
                    data.category.map((catObj) => {
                      const catId = catObj?._id || catObj;
                      const foundCategory = allCategories.find((c) => c._id === catId || c.id === catId);
                      const catName = foundCategory?.name || "Unknown";
                      return (
                        <span
                          key={catId}
                          className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-indigo-100 dark:border-indigo-800/50"
                        >
                          {catName}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setData({
                                ...data,
                                category: data.category.filter((c) => (c?._id || c) !== catId),
                              });
                            }}
                            className="hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}

                  <input
                    type="text"
                    placeholder={data.category?.length > 0 ? "" : "ابحث عن فئة..."}
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] dark:text-white"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                  />
                </div>

                {showDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
                    {allCategories
                      .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((cat) => (
                        <div
                          key={cat.id || cat._id}
                          onClick={() => {
                            const currentCats = data.category || [];
                            const catId = cat._id || cat.id;
                            if (!currentCats.includes(catId)) {
                              setData({ ...data, category: [...currentCats, catId] });
                            }
                            setSearchTerm("");
                            setShowDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer flex justify-between items-center transition-colors mb-1 last:mb-0"
                        >
                          <span className="text-sm dark:text-slate-200">{cat.name}</span>
                          {data.category?.includes(cat._id || cat.id) && (
                            <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              ✓ تم الاختيار
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {showDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
              )}
            </div>
          </div>

          {/* الأسعار بتصميم متوازن */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
                السعر الأصلي
              </label>
              <input
                type="number"
                name="originalPrice"
                value={data.originalPrice}
                onChange={handlePriceChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
                السعر بعد الخصم
              </label>
              <input
                type="number"
                name="salePrice"
                
                value={data.salePrice || ""}
                onChange={handlePriceChange}
                className="w-full p-3 border border-emerald-200 dark:border-emerald-900/30 rounded-xl dark:bg-gray-800 font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
                الخصم %
              </label>
              <div className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-center font-black text-indigo-600 dark:text-indigo-400">
                {data.salePercentage || 0}%
              </div>
            </div>
          </div>

          {/* معرض الصور */}
          <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10">
            <h3 className="font-bold mb-5 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <FaImage className="text-indigo-500" />
              {language === "ar" ? "صور المنتج الاحترافية" : "Product Gallery"}
            </h3>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full text-xs mb-6 file:bg-slate-800 file:hover:bg-indigo-600 file:text-white file:border-0 file:px-6 file:py-2.5 file:rounded-xl file:font-bold file:transition-all cursor-pointer"
            />

            <DragDropContext
              onDragEnd={(result) =>
                result.destination &&
                reorderProductImages(result.source.index, result.destination.index)
              }
            >
              <Droppable droppableId="gallery-list" direction="horizontal">
                {(provided) => (
                  <div
                    className="flex flex-wrap gap-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {data.images.map((img, idx) => {
                      const imageToShow = img.isNew ? img.url : img.url || img;
                      return (
                        <Draggable key={idx} draggableId={`img-${idx}`} index={idx}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative w-24 h-24 group transition-transform hover:scale-105"
                            >
                              <img
                                src={imageToShow}
                                className="w-full h-full object-cover rounded-xl border-2 border-white dark:border-gray-800 shadow-md group-hover:border-indigo-500 transition-all"
                                alt="product"
                              />
                              <button
                                onClick={(e) => removeImageFromUI(e, idx, img.public_id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                ×
                              </button>
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
        </div>

        {/* الجانب الأيمن: الخصائص والجدول التلقائي */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <h3 className="font-bold mb-5 text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FaTools className="text-indigo-500" />
              {language === "ar" ? "تخصيص الخيارات" : "Product Customization"}
            </h3>

            {data.options.map((option, optIdx) => (
              <div
                key={optIdx}
                className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4 shadow-sm"
              >
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="الخاصية (مثل: اللون)"
                    value={option.name}
                    onChange={(e) => {
                      const newOpts = [...data.options];
                      newOpts[optIdx].name = e.target.value;
                      setData({ ...data, options: newOpts });
                    }}
                    className="flex-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-indigo-500 outline-none font-bold"
                  />
                  <button
                    onClick={() =>
                      setData({
                        ...data,
                        options: data.options.filter((_, i) => i !== optIdx),
                      })
                    }
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

              <input
  type="text"
  enterKeyHint="done" // 1. دي هتخلي كيبورد الموبايل يظهر فيه زرار "تم" أو "Done"
  placeholder="اضغط Enter للإضافة..."
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val && !option.values.includes(val)) {
        const newOpts = [...data.options];
        newOpts[optIdx].values.push(val);
        setData({ ...data, options: newOpts });
        e.target.value = "";
      }
    }
  }}
  // 2. الحل ده للموبايل: لو المستخدم كتب الكلمة وداس بره الـ input أو قفل الكيبورد، الكلمة تتضاف
  onBlur={(e) => {
    const val = e.target.value.trim();
    if (val && !option.values.includes(val)) {
      const newOpts = [...data.options];
      newOpts[optIdx].values.push(val);
      setData({ ...data, options: newOpts });
      e.target.value = "";
    }
  }}
  className="w-full p-2.5 text-xs border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-indigo-500"
/>
                <div className="flex flex-wrap gap-2 mt-3">
                  {option.values.map((v, vIdx) => (
                    <span
                      key={vIdx}
                      className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-2 border border-slate-200 dark:border-slate-600"
                    >
                      {v}
                      <button
                        onClick={() => {
                          const newOpts = [...data.options];
                          newOpts[optIdx].values.splice(vIdx, 1);
                          setData({ ...data, options: newOpts });
                        }}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                setData({
                  ...data,
                  options: [...data.options, { name: "", values: [] }],
                })
              }
              className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
            >
              <FaPlus /> {language === "ar" ? "إضافة خاصية جديدة" : "Add New Option"}
            </button>
     <button
  onClick={handleGenerateVariants}
  className={`
    /* المسافات والبادينج */
    mt-6 mb-4 px-5 py-2.5 
    
    /* الخط والنصوص */
    text-sm font-bold tracking-wide
    
    /* الألوان في الوضع الفاتح (Light Mode) */
    bg-indigo-600 text-white hover:bg-indigo-700 
    
    /* الألوان في الوضع المظلم (Dark Mode) */
    dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-white
    
    /* التأثيرات والحواف */
    rounded-xl shadow-md hover:shadow-lg 
    transition-all duration-200 active:scale-95
    flex items-center justify-center gap-2
  `}
>
  {/* أيقونة بسيطة تعطي لمحة احترافية */}
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
  
  {/* دعم اللغات */}
  {language === "ar" ? "توليد المتغيرات تلقائياً" : "Generate All Variants"}
</button>
          </div>

          {/* جدول الاحتمالات المصمم باحترافية */}
        {data.variants.length > 0 && (
  <div className="space-y-4">
    <div className="flex gap-2 justify-end">
      <button
        onClick={applyPriceToAllVariants}
        className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-100 font-bold border border-indigo-100 dark:border-indigo-800/50"
      >
        تطبيق السعر
      </button>

      <button
        type="button"
        onClick={() => applyStockToAllVariants(data.targetStock)}
        className="bg-slate-800 dark:bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-md transition-all"
      >
        تطبيق المخزون ({data.targetStock})
      </button>
    </div>

    <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
     {/* 1. الحاوية الأساسية للسكرول الأفقي */}
<div className="w-full overflow-x-auto shadow-sm rounded-xl border border-slate-100 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
  
  {/* 2. تحديد min-width عشان نضمن إن البيانات متتحشرش في بعضها في الشاشات الصغيرة */}
  <table className="w-full text-[11px] text-right min-w-[600px]">
    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold">
      <tr>
        <th className="p-3 text-right">النوع</th>
        <th className="p-3 text-center">السعر</th>
        <th className="p-3 text-center">المخزون</th>
        <th className="p-3 text-center">الصورة</th>
        <th className="p-3 text-center">الإجراء</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
      {data.variants.map((v, idx) => (
        <tr key={v._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">

          {/* TYPE */}
          <td className="p-3 font-bold text-slate-700 dark:text-indigo-300">
            <div className="max-w-[120px] truncate" title={v.type || Object.values(v.options || {}).join(" / ")}>
               {v.type || Object.values(v.options || {}).join(" / ") || "متغير"}
            </div>
          </td>

          {/* PRICE */}
          <td className="p-3 text-center">
            <input
              type="number"
              value={v.price}
              onChange={(e) =>
                handleVariantChange(idx, "price", Number(e.target.value))
              }
              className="w-16 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-gray-800 text-center focus:border-indigo-500 outline-none"
            />
          </td>

          {/* STOCK */}
          <td className="p-3 text-center">
            <input
              type="number"
              value={v.stock}
              onChange={(e) =>
                handleVariantChange(idx, "stock", Number(e.target.value))
              }
              className="w-14 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-gray-800 text-center focus:border-indigo-500 outline-none"
            />
          </td>

          {/* IMAGES */}
          <td className="p-3">
            <div className="flex items-center justify-center gap-2">
              {/* MAIN IMAGE */}
              <div className="relative w-10 h-10 shrink-0">
                {(() => {
                  const img = v.images?.[0];
                  const src = typeof img === "string" ? img : img?.url;

                  return src ? (
                    <img
                      src={src}
                      className="w-full h-full object-cover rounded-md border border-indigo-500 shadow-sm"
                      alt="variant"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400">
                      No Img
                    </div>
                  );
                })()}
              </div>

              {/* SELECT IMAGE FROM PRODUCT */}
              <div className="flex gap-1 overflow-x-auto max-w-[100px] pb-1 scrollbar-hide">
                {(data.images || []).map((img, i) => {
                  const src = img?.url || img;
                  return (
                    <img
                      key={i}
                      src={src}
                      onClick={() => handleVariantChange(idx, "imageIndex", i)}
                      className={`w-7 h-7 shrink-0 object-cover rounded cursor-pointer border-2 transition-all ${
                        v.imageIndex === i
                          ? "border-indigo-500 scale-110 shadow-md"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                      alt="variant-option"
                    />
                  );
                })}
              </div>
            </div>
          </td>

          {/* DELETE */}
          <td className="p-3 text-center">
            <button
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  variants: prev.variants.filter((_, i) => i !== idx),
                }));
              }}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
            >
              🗑
            </button>
          </td>

        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  </div>
)}

          {/* الخيارات الإضافية */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="feat"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </div>
              <label htmlFor="feat" className="text-sm font-bold text-amber-900 dark:text-amber-500 cursor-pointer">
                🌟 تمييز المنتج في الصفحة الرئيسية
              </label>
            </div>

            <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
  <p className="text-xs font-black mb-3 text-slate-500 uppercase tracking-widest flex items-center gap-2">
    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
    مخطط المقاسات (اختياري)
  </p>
  
  {/* 1. عرض الصورة الحالية إذا كانت موجودة في الداتا بيز */}
  {data.sizeChart?.url && !data.sizeChartFile && (
    <div className="mb-3 relative group">
      <img 
        src={data.sizeChart.url} 
        alt="Size Chart" 
        className="w-full h-32 object-contain rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
        <span className="text-white text-[10px]">مخطط موجود حالياً</span>
      </div>
    </div>
  )}

  {/* 2. عرض معاينة للصورة الجديدة اللي المستخدم لسه مختارها */}
  {data.sizeChartFile && (
    <div className="mb-3">
      <img 
        src={URL.createObjectURL(data.sizeChartFile)} 
        alt="New Size Chart" 
        className="w-full h-32 object-contain rounded-lg border-2 border-indigo-500"
      />
      <p className="text-[10px] text-indigo-500 mt-1 text-center font-bold">معاينة الصورة المختارة</p>
    </div>
  )}

  <input
    type="file"
    accept="image/*" // تأكد من قبول الصور فقط
    onChange={(e) => setData({ ...data, sizeChartFile: e.target.files[0] })}
    className="text-[10px] w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
  />
</div>
          </div>
        </div>
      </div>

      {/* أزرار الحفظ السفلى */}
      <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSaveProduct}
          className={`flex-1 py-4 rounded-2xl font-black text-white text-lg shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all ${
            isEditing ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {language === "ar" ? "💾 حفظ ونشر التعديلات" : "💾 Save & Publish Product"}
        </button>
        <button
          onClick={() => setShowModal(false)}
          className="px-12 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          {language === "ar" ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </div>
  </div>
);
  };

  const renderReviewsModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm"
      onClick={() => setShowReviewsModal(false)}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowReviewsModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 pb-2 border-b dark:border-gray-800">
          {language === "ar" ? "تقييمات المنتج" : "Product Reviews"}
        </h2>

        {selectedProductReviews && selectedProductReviews.length > 0 ? (
          <div className="space-y-4">
            {selectedProductReviews.map((review) => (
              <div
                key={review._id}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {review.user?.name ||
                        review.name ||
                        (language === "ar" ? "مستخدم مجهول" : "Anonymous User")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                      )}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <FaCommentDots className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">
              {language === "ar"
                ? "لا توجد تقييمات لهذا المنتج بعد."
                : "No reviews for this product yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="p-4 max-w-7xl mx-auto pt-20 md:pt-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300"
    >
    {/* HEADER */}
  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-6">
    <h2 className="text-3xl font-extrabold">
      {language === "ar" ? "إدارة المنتجات" : "Product Management"}
    </h2>

    <button
      onClick={openAddModal}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
    >
      + {language === "ar" ? "إضافة منتج" : "Add Product"}
    </button>
  </div>

  {/* ================= DESKTOP ================= */}
  <div className="hidden md:block border rounded-xl overflow-hidden">
    <table className="min-w-full">
     <thead className="bg-gray-100 dark:bg-gray-800">
  <tr>
    {[
      language === "ar" ? "الصورة" : "Image",
      language === "ar" ? "الاسم" : "Name",
      language === "ar" ? "السعر" : "Price",
      language === "ar" ? "المخزون" : "Stock",
      language === "ar" ? "الحالة" : "Status",
      language === "ar" ? "الإجراءات" : "Actions",
    ].map((h, i) => (
      <th
        key={i}
        className={`p-3 text-xs font-bold ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        {h}
      </th>
    ))}
  </tr>
</thead>

      <tbody>
        {products.map((product)=>(
          <tr key={product._id} className="border-b">

            <td className="p-3">
              <img
                src={product.images?.[0]?.url || product.images?.[0]}
                className="w-12 h-12 rounded object-cover"
              />
            </td>

            <td className="p-3 font-bold">{product.name}</td>

          <td className="p-3 whitespace-nowrap text-sm">
  {product.salePrice && product.salePrice > 0 ? (
    <div className="flex flex-col leading-tight">
      
      {/* ORIGINAL PRICE */}
      <span className="text-red-400 line-through text-xs font-medium">
        {product.originalPrice || product.price}{" "}
        {language === "ar" ? "ج" : "EGP"}
      </span>

      {/* SALE PRICE */}
      <span className="text-green-600 dark:text-green-400 font-extrabold text-sm">
        {product.salePrice} {language === "ar" ? "ج" : "EGP"}
      </span>

      {/* LABEL */}
      <span className="text-[10px] text-gray-400 mt-1">
        {language === "ar" ? "بعد الخصم" : "Discounted"}
      </span>

    </div>
  ) : (
    <span className="font-bold text-indigo-600 dark:text-indigo-400">
      {product.originalPrice || product.price}{" "}
      {language === "ar" ? "ج" : "EGP"}
    </span>
  )}
</td>

            <td className="p-3">{product.countInStock}</td>

            {/* TOGGLE */}
            <td className="p-3">
              <button
                onClick={() => handleToggleActive(product._id, product.isActive)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                  product.isActive
                    ? "bg-[#86FE05] shadow-[0_0_10px_rgba(134,254,5,0.6)]"
                    : "bg-gray-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                    product.isActive ? "translate-x-7" : "translate-x-1"
                  }`}
                />
                <span className="absolute w-full text-[9px] font-bold text-center">
                  {product.isActive ? "ON" : "OFF"}
                </span>
              </button>
            </td>

           {/* ACTIONS VERTICAL */}
<td className="p-3">
  <div className="flex flex-col gap-2">

    <button
      onClick={() => openEditModal(product)}
      className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold"
    >
      ✏️ {language === "ar" ? "تعديل" : "Edit"}
    </button>

    <button
      onClick={() => deleteProduct(product._id)}
      className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
    >
      🗑️ {language === "ar" ? "حذف" : "Delete"}
    </button>

    <button
      onClick={() => openReviewsModal(product.reviews || [])}
      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold"
    >
      💬 {language === "ar" ? "التقييمات" : "Reviews"}
    </button>

    <button
      onClick={() => {
        setSelectedImages(product.images || []);
        setShowImageModal(true);
      }}
      className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold"
    >
      👁️ {language === "ar" ? "الصور" : "Images"}
    </button>

  </div>
</td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* ================= MOBILE ================= */}
  <div className="md:hidden space-y-4">
    {products.map((product)=>(
      <div key={product._id} className="border rounded-xl p-4 shadow">

        <div className="flex gap-3">
          <img
            src={product.images?.[0]?.url || product.images?.[0]}
            className="w-20 h-20 rounded object-cover"
          />

          <div className="flex-1">
            <h3 className="font-bold">{product.name}</h3>
           <td className="p-3 whitespace-nowrap text-sm">
  {product.salePrice && product.salePrice > 0 ? (
    <div className="flex flex-col leading-tight">
      
      {/* ORIGINAL PRICE */}
      <span className="text-red-400 line-through text-xs font-medium">
        {product.originalPrice || product.price}{" "}
        {language === "ar" ? "ج" : "EGP"}
      </span>

      {/* SALE PRICE */}
      <span className="text-green-600 dark:text-green-400 font-extrabold text-sm">
        {product.salePrice} {language === "ar" ? "ج" : "EGP"}
      </span>

      {/* LABEL */}
      <span className="text-[10px] text-gray-400 mt-1">
        {language === "ar" ? "بعد الخصم" : "Discounted"}
      </span>

    </div>
  ) : (
    <span className="font-bold text-indigo-600 dark:text-indigo-400">
      {product.originalPrice || product.price}{" "}
      {language === "ar" ? "ج" : "EGP"}
    </span>
  )}
</td>
            <p className="text-sm">Stock: {product.countInStock}</p>
          </div>
        </div>

       <div className="flex flex-col items-center justify-center gap-1.5">
  <button
    onClick={() => handleToggleActive(product._id, product.isActive)}
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-500 ease-in-out outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
      product.isActive
        ? "bg-gradient-to-r from-[#86FE05] to-[#6ed204] shadow-[0_0_15px_rgba(134,254,5,0.4)]"
        : "bg-gray-200 dark:bg-zinc-700 shadow-inner"
    }`}
  >
    {/* الدائرة المتحركة */}
    <span
      className={`absolute h-5 w-5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-500 cubic-bezier(0.68, -0.55, 0.265, 1.55) ${
        product.isActive 
          ? (language === "ar" ? "-translate-x-6" : "translate-x-6") 
          : (language === "ar" ? "-translate-x-1" : "translate-x-1")
      }`}
    >
      {/* نقطة صغيرة داخل الدائرة لزيادة التفاصيل */}
      <span className={`absolute inset-0 m-auto h-1.5 w-1.5 rounded-full transition-colors duration-500 ${product.isActive ? 'bg-[#86FE05]' : 'bg-gray-300'}`} />
    </span>

    {/* النصوص المخفية داخل التوجل (اختياري) */}
    <div className={`absolute w-full px-1.5 flex justify-between items-center text-[8px] font-black pointer-events-none select-none ${product.isActive ? 'text-green-900' : 'text-gray-400'}`}>
       <span className={product.isActive ? 'opacity-0' : 'opacity-100 ml-auto'}>OFF</span>
       <span className={product.isActive ? 'opacity-100' : 'opacity-0'}>ON</span>
    </div>
  </button>

  {/* نص توضيحي تحت التوجل يدعم اللغتين */}
  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 dark:text-gray-400">
    {product.isActive 
      ? (language === "ar" ? "نشط" : "Active") 
      : (language === "ar" ? "مخفي" : "Hidden")}
  </span>
</div>

        {/* ACTIONS MOBILE - IMPROVED */}
<div className="flex flex-col gap-3 mt-5">

  <button
    onClick={() => openEditModal(product)}
    className="flex items-center justify-center gap-2 w-full bg-blue-500/90 active:scale-[0.97] text-white py-3 rounded-xl font-bold shadow-sm transition-all"
  >
    ✏️ {language === "ar" ? "تعديل المنتج" : "Edit Product"}
  </button>

  <button
    onClick={() => deleteProduct(product._id)}
    className="flex items-center justify-center gap-2 w-full bg-red-500/90 active:scale-[0.97] text-white py-3 rounded-xl font-bold shadow-sm transition-all"
  >
    🗑️ {language === "ar" ? "حذف المنتج" : "Delete Product"}
  </button>

  <button
    onClick={() => openReviewsModal(product.reviews || [])}
    className="flex items-center justify-center gap-2 w-full bg-yellow-500/90 active:scale-[0.97] text-white py-3 rounded-xl font-bold shadow-sm transition-all"
  >
    💬 {language === "ar" ? "عرض التقييمات" : "View Reviews"}
  </button>

  <button
    onClick={() => {
      setSelectedImages(product.images || []);
      setShowImageModal(true);
    }}
    className="flex items-center justify-center gap-2 w-full bg-purple-500/90 active:scale-[0.97] text-white py-3 rounded-xl font-bold shadow-sm transition-all"
  >
    👁️ {language === "ar" ? "عرض الصور" : "View Images"}
  </button>

</div>

      </div>
    ))}
  </div>

      {/* Mobile view and Modals */}
      {showModal && renderModalContent()}
      {showReviewsModal && renderReviewsModal()}

{/* Image Modal - Vestro Neon Luxury */}
{showImageModal && (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-300"
    onClick={() => setShowImageModal(false)}
  >
    <div
      className="bg-white dark:bg-black p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-5xl max-h-[90vh] overflow-hidden relative border border-gray-100 dark:border-[#1a1a1a] transform transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b dark:border-[#1a1a1a] pb-6">
        <h2 className="text-3xl font-black text-black dark:text-white flex items-center gap-4">
          <div className="p-3 bg-[#ccff00]/10 dark:bg-[#ccff00]/20 rounded-2xl">
            <FaEye className="text-[#a8d600] dark:text-[#ccff00] drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]" />
          </div>
          {language === "ar" ? "معرض الصور الملكي" : "Royal Gallery"}
        </h2>
        <button
          onClick={() => setShowImageModal(false)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-xl"
        >
          &times;
        </button>
      </div>

      {/* Grid Container */}
      <div className="overflow-y-auto max-h-[65vh] pr-4 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {selectedImages.length > 0 ? (
            selectedImages.map((img, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-[2rem] border-2 border-transparent hover:border-[#ccff00] bg-gray-50 dark:bg-[#0a0a0a] transition-all duration-500 shadow-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.2)]"
              >
                <img
                  src={img.url}
                  alt="Vestro Product"
                  className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-gray-50 dark:bg-[#0a0a0a] rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-[#1a1a1a]">
              <p className="text-gray-400 dark:text-[#333] text-xl font-black uppercase tracking-widest">
                {language === "ar" ? "الفخامة تبدأ من هنا" : "Luxury starts here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

    {/* Category Modal - Vestro Neon Luxury */}
{showCatModal && (
  <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in duration-300">
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-[#1a1a1a] w-full max-w-md rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#ccff00] rounded-[1.2rem] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(204,255,0,0.4)]">
              ✨
            </div>
            <div>
              <h3 className="text-2xl font-[1000] text-black dark:text-white leading-none tracking-tight">
                {language === "ar" ? "فئة ملكية" : "Royal Category"}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-[#444] mt-2 font-black uppercase tracking-[0.3em]">Exclusive Inventory</p>
            </div>
          </div>
          <button
            onClick={() => setShowCatModal(false)}
            className="text-gray-300 dark:text-[#222] hover:text-red-500 transition-colors text-4xl font-light"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-8">
          <div className="relative group">
            <label className="text-[11px] font-black text-gray-400 dark:text-[#666] mb-3 uppercase tracking-[0.25em] ml-2 block">
              {language === "ar" ? "اسم التصنيف" : "Category Identity"}
            </label>
            <input
              type="text"
              autoFocus
              className="w-full p-5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl outline-none focus:border-[#ccff00] focus:ring-4 focus:ring-[#ccff00]/5 transition-all dark:text-white font-bold text-lg"
              placeholder="..."
              value={newCategory.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().trim().replace(/[^\u0621-\u064A\w ]/g, "").replace(/ /g, "-");
                setNewCategory({ ...newCategory, name, slug });
              }}
            />
          </div>

          <div className="relative group">
            <label className="text-[11px] font-black text-gray-400 dark:text-[#666] mb-3 uppercase tracking-[0.25em] ml-2 block">
              الرابط الرقمي (Slug)
            </label>
            <div className="p-5 bg-black dark:bg-[#0a0a0a] rounded-2xl text-[#ccff00] text-sm font-mono border border-[#ccff00]/20 flex items-center gap-3 overflow-hidden">
              <span className="opacity-30 select-none">VESTRO://</span>
              <span className="truncate">{newCategory.slug || "..."}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 mt-12">
          <button
            onClick={handleCreateCategory}
            className="w-full bg-[#ccff00] hover:bg-[#d9ff33] text-black py-5 rounded-[1.5rem] font-[1000] text-lg shadow-[0_10px_30px_rgba(204,255,0,0.2)] transition-all active:scale-[0.97] hover:-translate-y-1 uppercase tracking-widest"
          >
            {language === "ar" ? "تأكيد الإضافة" : "Confirm Entry"}
          </button>
          <button
            onClick={() => setShowCatModal(false)}
            className="w-full py-4 bg-transparent text-gray-400 dark:text-[#333] rounded-2xl font-bold hover:text-black dark:hover:text-white transition-all"
          >
            {language === "ar" ? "تراجع" : "Go Back"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Products;
