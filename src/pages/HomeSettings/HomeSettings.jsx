// import { useState, useEffect } from "react";
// import api from "../../api/axiosInstance";
// import { toast } from "react-toastify";

// export default function HomeSettings() {
//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null); // لمعاينة الصورة الجديدة قبل الرفع
//   const [selectedFile, setSelectedFile] = useState(null); // لتخزين الملف المختار

//   const [formData, setFormData] = useState({
//     titleAr: "",
//     titleEn: "",
//     subtitleAr: "",
//     subtitleEn: "",
//     isActive: true,
//     image: { url: "", public_id: "" }
//   });

//   // 1. جلب البيانات عند التحميل
//   useEffect(() => {
//     const fetchSettings = async () => {
//       try {
//         const res = await api.get("/settings/hero");
//         setFormData(res.data);
//         if (res.data.image?.url) {
//           setImagePreview(res.data.image.url);
//         }
//       } catch (err) {
//         toast.error("فشل في جلب البيانات");
//       }
//     };
//     fetchSettings();
//   }, []);

//   // دالة تحسين وضغط الصورة قبل حفظها في الـ State
//   const optimizeImage = (file) => {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = (event) => {
//         const img = new Image();
//         img.src = event.target.result;
//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           const MAX_WIDTH = 1920; // أقصى عرض للبانر علشان الجودة
//           let width = img.width;
//           let height = img.height;

//           if (width > MAX_WIDTH) {
//             height = Math.round((height * MAX_WIDTH) / width);
//             width = MAX_WIDTH;
//           }

//           canvas.width = width;
//           canvas.height = height;

//           const ctx = canvas.getContext("2d");
//           ctx.drawImage(img, 0, 0, width, height);

//           // تصدير الصورة بصيغة webp خفيفة وبجودة 80%
//           canvas.toBlob(
//             (blob) => {
//               const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
//                 type: "image/webp",
//                 lastModified: Date.now(),
//               });
//               resolve(optimizedFile);
//             },
//             "image/webp",
//             0.8
//           );
//         };
//       };
//     });
//   };

//   // 2. اختيار صورة جديدة مع تشغيل الـ Optimizer
//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setLoading(true);
//       try {
//         const optimized = await optimizeImage(file);
//         setSelectedFile(optimized);
//         setImagePreview(URL.createObjectURL(optimized)); // عرض المعاينة للصورة المضغوطة
//       } catch (error) {
//         toast.error("حدث خطأ أثناء معالجة الصورة");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // 3. حذف الصورة (من الواجهة)
//   const handleRemoveImage = () => {
//     setSelectedFile(null);
//     setImagePreview(null);
//     setFormData({ ...formData, image: { url: "", public_id: "" } });
//   };
//   const getOptimizedImage = (url, width = 1200) => {
//   if (!url) return null;

//   // لو local preview سيبه زي ما هو
//   if (url.startsWith("blob:")) return url;

//   return url.replace(
//     "/upload/",
//     `/upload/w_${width},c_fill,f_auto,q_auto/`
//   );
// };imagePreview

//   // 4. حفظ التعديلات (إرسال FormData للباك-اند)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const data = new FormData();
      
//       // لو الخانة فاضية بنبعت مسافة " " علشان الباك اند ميعتمدش على القديم ويرضى يسيّف
//       data.append("titleAr", formData.titleAr.trim() === "" ? " " : formData.titleAr);
//       data.append("titleEn", formData.titleEn.trim() === "" ? " " : formData.titleEn);
//       data.append("subtitleAr", formData.subtitleAr.trim() === "" ? " " : formData.subtitleAr);
//       data.append("subtitleEn", formData.subtitleEn.trim() === "" ? " " : formData.subtitleEn);
//       data.append("isActive", formData.isActive);

//       if (!imagePreview && !selectedFile) {
//         data.append("removeImage", "true");
//       }

//       if (selectedFile) {
//         data.append("image", selectedFile);
//       }

//       const res = await api.put("/settings/hero/update", data, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success("تم التحديث بنجاح!");
//       setFormData(res.data.settings);
//       setSelectedFile(null);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "حدث خطأ أثناء التحديث");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-white dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-300 mt-14">
//       <div className="max-w-4xl mx-auto">
//         {/* هيدر متناسق مع دارك ولايت لايت: بوردر أسود / دارك: بوردر أحمر */}
//         <h1 className="text-4xl font-black mb-10 uppercase   border-l-8 border-black dark:border-red-700 pl-4">
//           Home Page <span className="text-red-700 dark:text-white">Settings</span>
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-50 dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          
//           {/* Status Switch */}
//           <div className="flex items-center justify-between p-6 bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
//             <div>
//               <h3 className="font-bold text-lg">حالة قسم الهيرو (Hero Section)</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400">إظهار أو إخفاء البانر العلوي من الموقع تماماً</p>
//             </div>
//             <button
//               type="button"
//               onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
//               className={`w-16 h-8 rounded-full transition-all relative ${formData.isActive ? "bg-red-700" : "bg-zinc-300 dark:bg-zinc-700"}`}
//             >
//               <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.isActive ? "left-9" : "left-1"}`} />
//             </button>
//           </div>

//           {/* Text Fields Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Arabic Content */}
//             <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
//               <span className="text-[10px] font-black uppercase  text-red-700 dark:text-zinc-400">Arabic Version</span>
//               <div>
//                 <label className="block text-xs font-bold mb-2 uppercase">العنوان الرئيسي</label>
//                 <input
//                   type="text"
//                   className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
//                   value={formData.titleAr}
//                   onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold mb-2 uppercase">العنوان الفرعي</label>
//                 <textarea
//                   rows="3"
//                   className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
//                   value={formData.subtitleAr}
//                   onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })}
//                 />
//               </div>
//             </div>

//             {/* English Content */}
//             <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
//               <span className="text-[10px] font-black uppercase  text-red-700 dark:text-zinc-400">English Version</span>
//               <div>
//                 <label className="block text-xs font-bold mb-2 uppercase">Main Title</label>
//                 <input
//                   type="text"
//                   className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
//                   value={formData.titleEn}
//                   onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold mb-2 uppercase">Subtitle</label>
//                 <textarea
//                   rows="3"
//                   className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
//                   value={formData.subtitleEn}
//                   onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Image Upload Area */}
//           <div className="space-y-4">
//             <label className="block text-sm font-bold uppercase ">Banner Background Image</label>
//             <div className="relative group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 transition-all hover:border-red-700 dark:hover:border-zinc-500 bg-white dark:bg-black">
//               {imagePreview ? (
//                 <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
//                  <img
//   src={getOptimizedImage(imagePreview, 1200)}
//   className="w-full h-full object-cover"
//   alt="Hero Preview"
// />
//                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={handleRemoveImage}
//                       className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full transform transition-transform hover:scale-105"
//                     >
//                       Delete Image
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
//                   <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
//                     <svg className="w-8 h-8 text-red-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
//                     </svg>
//                   </div>
//                   <span className="font-bold text-gray-500 dark:text-zinc-400 uppercase text-xs ">Click to upload banner</span>
//                   <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
//                 </label>
//               )}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             disabled={loading}
//             type="submit"
//             className={`w-full py-5 rounded-2xl font-black uppercase  transition-all shadow-lg ${
//               loading 
//                 ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed" 
//                 : "bg-red-700 text-white hover:bg-red-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 active:scale-[0.98]"
//             }`}
//           >
//             {loading ? "Processing..." : "Save Configuration"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// ---------------------------------------------

import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

export default function HomeSettings() {
  const [loading, setLoading] = useState(false);

  // كل الـMedia في قائمة واحدة
  // existing = موجودة بالفعل في Backend
  // new = ملف جديد لم يتم رفعه بعد
  const [mediaList, setMediaList] = useState([]);

  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    isActive: true,
  });

  // =========================================================
  // 1. جلب البيانات
  // =========================================================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings/hero");

        const settings = res.data;

        setFormData({
          titleAr: settings.titleAr || "",
          titleEn: settings.titleEn || "",
          subtitleAr: settings.subtitleAr || "",
          subtitleEn: settings.subtitleEn || "",
          isActive:
            typeof settings.isActive === "boolean"
              ? settings.isActive
              : true,
        });

        const existingMedia = Array.isArray(settings.media)
          ? [...settings.media]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((media) => ({
                source: "existing",
                id: media._id,
                type: media.type,
                url: media.url,
                public_id: media.public_id,
                resource_type:
                  media.resource_type || media.type,
              }))
          : [];

        setMediaList(existingMedia);
      } catch (err) {
        console.error(err);
        toast.error("فشل في جلب البيانات");
      }
    };

    fetchSettings();
  }, []);

  // =========================================================
  // 2. Image Optimization
  // =========================================================

  const optimizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");

            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1080;

            let width = img.width;
            let height = img.height;

            // الحفاظ على Aspect Ratio
            if (width > MAX_WIDTH) {
              height = Math.round(
                (height * MAX_WIDTH) / width
              );

              width = MAX_WIDTH;
            }

            if (height > MAX_HEIGHT) {
              width = Math.round(
                (width * MAX_HEIGHT) / height
              );

              height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(
                new Error("Canvas context unavailable")
              );
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            ctx.drawImage(
              img,
              0,
              0,
              width,
              height
            );

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(
                    new Error(
                      "Failed to optimize image"
                    )
                  );
                  return;
                }

                const fileName =
                  file.name.replace(
                    /\.[^/.]+$/,
                    ""
                  ) + ".webp";

                const optimizedFile = new File(
                  [blob],
                  fileName,
                  {
                    type: "image/webp",
                    lastModified: Date.now(),
                  }
                );

                resolve(optimizedFile);
              },
              "image/webp",
              0.8
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(
            new Error("Failed to load image")
          );
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        reject(
          new Error("Failed to read image")
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // =========================================================
  // 3. اختيار Images / Videos
  // =========================================================

  const handleFileChange = async (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    setLoading(true);

    try {
      const newMedia = [];

      for (const file of files) {
        // ===================================================
        // IMAGE
        // ===================================================

        if (file.type.startsWith("image/")) {
          const optimized =
            await optimizeImage(file);

          const preview =
            URL.createObjectURL(optimized);

          newMedia.push({
            source: "new",
            type: "image",
            file: optimized,
            preview,
          });
        }

        // ===================================================
        // VIDEO
        // ===================================================

        else if (
          file.type.startsWith("video/")
        ) {
          const preview =
            URL.createObjectURL(file);

          newMedia.push({
            source: "new",
            type: "video",
            file,
            preview,
          });
        }

        // ===================================================
        // UNSUPPORTED
        // ===================================================

        else {
          toast.warning(
            `الملف ${file.name} غير مدعوم وسيتم تجاهله`
          );
        }
      }

      if (newMedia.length > 0) {
        setMediaList((prev) => [
          ...prev,
          ...newMedia,
        ]);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "حدث خطأ أثناء معالجة الملفات"
      );
    } finally {
      setLoading(false);

      // السماح باختيار نفس الملف مرة أخرى
      e.target.value = "";
    }
  };

  // =========================================================
  // 4. حذف Media
  // =========================================================

  const handleRemoveMedia = (index) => {
    setMediaList((prev) => {
      const media = prev[index];

      // لو New Media
      if (
        media?.source === "new" &&
        media.preview?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          media.preview
        );
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  // =========================================================
  // 5. تحريك Media
  // =========================================================

  const moveMedia = (index, direction) => {
    setMediaList((prev) => {
      const media = [...prev];

      const newIndex =
        index + direction;

      if (
        newIndex < 0 ||
        newIndex >= media.length
      ) {
        return prev;
      }

      [
        media[index],
        media[newIndex],
      ] = [
        media[newIndex],
        media[index],
      ];

      return media;
    });
  };

  // =========================================================
  // 6. Optimized Cloudinary Image
  // =========================================================

  const getOptimizedImage = (
    url,
    width = 1200
  ) => {
    if (!url) return null;

    // Local preview
    if (url.startsWith("blob:")) {
      return url;
    }

    return url.replace(
      "/upload/",
      `/upload/w_${width},c_fill,f_auto,q_auto/`
    );
  };

  // =========================================================
  // 7. حفظ التعديلات
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const data = new FormData();

      // ===================================================
      // Text
      // ===================================================

      data.append(
        "titleAr",
        formData.titleAr.trim() === ""
          ? " "
          : formData.titleAr
      );

      data.append(
        "titleEn",
        formData.titleEn.trim() === ""
          ? " "
          : formData.titleEn
      );

      data.append(
        "subtitleAr",
        formData.subtitleAr.trim() === ""
          ? " "
          : formData.subtitleAr
      );

      data.append(
        "subtitleEn",
        formData.subtitleEn.trim() === ""
          ? " "
          : formData.subtitleEn
      );

      data.append(
        "isActive",
        String(formData.isActive)
      );

      // ===================================================
      // Existing Media
      //
      // نبعت فقط الـMedia الموجودة بالفعل
      // ===================================================

      const existingMedia =
        mediaList
          .filter(
            (media) =>
              media.source === "existing"
          )
          .map((media) => ({
            _id: media.id,
            type: media.type,
            url: media.url,
            public_id: media.public_id,
            resource_type:
              media.resource_type ||
              media.type,
          }));

      data.append(
        "existingMedia",
        JSON.stringify(existingMedia)
      );

      // ===================================================
      // Media Order
      //
      // أهم جزء في النظام
      //
      // مثال:
      //
      // Existing Image
      // New Video
      // Existing Video
      // New Image
      //
      // ===================================================

      const mediaOrder =
        mediaList.map(
          (media, index) => {
            if (
              media.source ===
              "existing"
            ) {
              return {
                source: "existing",
                id: media.id,
                order: index,
              };
            }

            return {
              source: "new",
              index:
                mediaList
                  .slice(0, index)
                  .filter(
                    (item) =>
                      item.source ===
                      "new"
                  ).length,
              order: index,
            };
          }
        );

      data.append(
        "mediaOrder",
        JSON.stringify(mediaOrder)
      );

      // ===================================================
      // New Media Files
      //
      // كل الملفات بنفس field name
      // ===================================================

      mediaList
        .filter(
          (media) =>
            media.source === "new"
        )
        .forEach((media) => {
          data.append(
            "media",
            media.file
          );
        });

      // ===================================================
      // API
      // ===================================================

      const res = await api.put(
        "/settings/hero/update",
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        "تم التحديث بنجاح!"
      );

      // ===================================================
      // Response
      // ===================================================

      const updatedSettings =
        res.data.settings;

      setFormData({
        titleAr:
          updatedSettings.titleAr ||
          "",
        titleEn:
          updatedSettings.titleEn ||
          "",
        subtitleAr:
          updatedSettings.subtitleAr ||
          "",
        subtitleEn:
          updatedSettings.subtitleEn ||
          "",
        isActive:
          typeof updatedSettings.isActive ===
          "boolean"
            ? updatedSettings.isActive
            : true,
      });

      const updatedMedia =
        Array.isArray(
          updatedSettings.media
        )
          ? [
              ...updatedSettings.media,
            ]
              .sort(
                (a, b) =>
                  (a.order ?? 0) -
                  (b.order ?? 0)
              )
              .map((media) => ({
                source:
                  "existing",
                id: media._id,
                type: media.type,
                url: media.url,
                public_id:
                  media.public_id,
                resource_type:
                  media.resource_type ||
                  media.type,
              }))
          : [];

      // تنظيف Blob URLs
      mediaList.forEach(
        (media) => {
          if (
            media.source === "new" &&
            media.preview?.startsWith(
              "blob:"
            )
          ) {
            URL.revokeObjectURL(
              media.preview
            );
          }
        }
      );

      setMediaList(updatedMedia);
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "حدث خطأ أثناء التحديث"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 8. Cleanup
  // =========================================================

  useEffect(() => {
    return () => {
      mediaList.forEach(
        (media) => {
          if (
            media.source === "new" &&
            media.preview?.startsWith(
              "blob:"
            )
          ) {
            URL.revokeObjectURL(
              media.preview
            );
          }
        }
      );
    };
  }, [mediaList]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-6 bg-white dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-300 mt-14">

      <div className="max-w-4xl mx-auto">

        {/* ===================================================
            Header
        =================================================== */}

        <h1 className="text-4xl font-black mb-10 uppercase border-l-8 border-black dark:border-red-700 pl-4">
          Home Page{" "}
          <span className="text-red-700 dark:text-white">
            Settings
          </span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-zinc-50 dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
        >

          {/* =================================================
              Status
          ================================================= */}

          <div className="flex items-center justify-between p-6 bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">

            <div>
              <h3 className="font-bold text-lg">
                حالة قسم الهيرو (Hero Section)
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                إظهار أو إخفاء البانر العلوي من الموقع تماماً
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isActive:
                    !prev.isActive,
                }))
              }
              className={`w-16 h-8 rounded-full transition-all relative ${
                formData.isActive
                  ? "bg-red-700"
                  : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  formData.isActive
                    ? "left-9"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* =================================================
              Text Fields
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Arabic */}

            <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">

              <span className="text-[10px] font-black uppercase text-red-700 dark:text-zinc-400">
                Arabic Version
              </span>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase">
                  العنوان الرئيسي
                </label>

                <input
                  type="text"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
                  value={formData.titleAr}
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        titleAr:
                          e.target.value,
                      })
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase">
                  العنوان الفرعي
                </label>

                <textarea
                  rows="3"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
                  value={
                    formData.subtitleAr
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        subtitleAr:
                          e.target.value,
                      })
                    )
                  }
                />
              </div>
            </div>

            {/* English */}

            <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">

              <span className="text-[10px] font-black uppercase text-red-700 dark:text-zinc-400">
                English Version
              </span>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase">
                  Main Title
                </label>

                <input
                  type="text"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
                  value={
                    formData.titleEn
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        titleEn:
                          e.target.value,
                      })
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase">
                  Subtitle
                </label>

                <textarea
                  rows="3"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 ring-red-700/20 focus:border-red-700 dark:focus:border-white transition-all"
                  value={
                    formData.subtitleEn
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        subtitleEn:
                          e.target.value,
                      })
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* =================================================
              MEDIA
          ================================================= */}

          <div className="space-y-4">

            <label className="block text-sm font-bold uppercase">
              Banner Images & Videos
            </label>

            {/* =================================================
                Unified Media List
            ================================================= */}

            {mediaList.length > 0 && (
              <div className="space-y-5">

                {mediaList.map(
                  (media, index) => (
                    <div
                      key={
                        media.source ===
                        "existing"
                          ? media.id
                          : media.preview
                      }
                      className={`relative group border rounded-3xl p-4 bg-white dark:bg-black shadow-xl ${
                        media.source ===
                        "new"
                          ? "border-2 border-dashed border-red-700/40"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >

                      {/* Number */}

                      <div
                        className={`absolute top-6 left-6 z-20 text-white px-3 py-1 rounded-full text-xs font-bold ${
                          media.source ===
                          "new"
                            ? "bg-red-700"
                            : "bg-black/70"
                        }`}
                      >
                        {media.source ===
                        "new"
                          ? `New ${index + 1}`
                          : index + 1}
                      </div>

                      {/* Preview */}

                      <div className="relative aspect-video rounded-2xl overflow-hidden">

                        {media.type ===
                        "image" ? (
                          <img
                            src={
                              media.source ===
                              "new"
                                ? media.preview
                                : getOptimizedImage(
                                    media.url,
                                    1200
                                  )
                            }
                            className="w-full h-full object-cover"
                            alt="Hero Preview"
                          />
                        ) : (
                          <video
                            src={
                              media.source ===
                              "new"
                                ? media.preview
                                : media.url
                            }
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                        )}

                        {/* Controls */}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">

                          {/* Up */}

                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveMedia(
                                index,
                                -1
                              )
                            }
                            className="bg-white text-black font-bold py-2 px-4 rounded-full disabled:opacity-30"
                          >
                            ↑
                          </button>

                          {/* Down */}

                          <button
                            type="button"
                            disabled={
                              index ===
                              mediaList.length -
                                1
                            }
                            onClick={() =>
                              moveMedia(
                                index,
                                1
                              )
                            }
                            className="bg-white text-black font-bold py-2 px-4 rounded-full disabled:opacity-30"
                          >
                            ↓
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMedia(
                                index
                              )
                            }
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full"
                          >
                            Delete
                          </button>

                        </div>
                      </div>

                      {/* Type */}

                      <div className="mt-3 flex items-center justify-between">

                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                          {media.type ===
                          "image"
                            ? "Image"
                            : "Video"}
                        </div>

                        <div
                          className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            media.source ===
                            "new"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {media.source ===
                          "new"
                            ? "Not uploaded yet"
                            : "Uploaded"}
                        </div>

                      </div>
                    </div>
                  )
                )}

              </div>
            )}

            {/* =================================================
                Upload
            ================================================= */}

            <div className="relative group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 transition-all hover:border-red-700 dark:hover:border-zinc-500 bg-white dark:bg-black">

              <label className="flex flex-col items-center justify-center h-64 cursor-pointer">

                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">

                  <svg
                    className="w-8 h-8 text-red-700 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>

                </div>

                <span className="font-bold text-gray-500 dark:text-zinc-400 uppercase text-xs">
                  Click to upload images or videos
                </span>

                <span className="text-[10px] text-gray-400 mt-2">
                  Multiple files supported
                </span>

                <span className="text-[10px] text-gray-400 mt-1">
                  Maximum 20 files / 100 MB per file
                </span>

                <input
                  type="file"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  multiple
                />

              </label>
            </div>
          </div>

          {/* =================================================
              Submit
          ================================================= */}

          <button
            disabled={loading}
            type="submit"
            className={`w-full py-5 rounded-2xl font-black uppercase transition-all shadow-lg ${
              loading
                ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-red-700 text-white hover:bg-red-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 active:scale-[0.98]"
            }`}
          >
            {loading
              ? "Processing..."
              : "Save Configuration"}
          </button>

        </form>
      </div>
    </div>
  );
}