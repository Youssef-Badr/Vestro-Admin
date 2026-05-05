/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";

const Inventory = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 المنتج المفتوح للتعديل
  const [activeProduct, setActiveProduct] = useState(null);

  // 👇 نسخة مؤقتة للتعديل قبل الحفظ
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await axios.get("/products/stock");

      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 👇 فتح المنتج للتعديل
  const openEdit = (product) => {
    setActiveProduct(product);

    // نحفظ نسخة عشان نعدل عليها
    const clone = JSON.parse(JSON.stringify(product));
    setEditData(clone);
  };

  // 👇 تغيير stock محلي
  const handleStockChange = (variantId, value) => {
    setEditData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v._id === variantId
          ? { ...v, stock: Number(value) }
          : v
      ),
    }));
  };

  // 👇 حفظ التعديلات مرة واحدة
  const saveStock = async () => {
    try {
      const updates = editData.variants.map((v) => ({
        productId: editData._id,
        variantId: v._id,
        stock: v.stock,
      }));

      await Promise.all(
        updates.map((u) =>
          axios.put("/products/stock/update", u)
        )
      );

      // تحديث UI
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editData._id ? editData : p
        )
      );

      setActiveProduct(null);
      setEditData({});

      toast.success(isArabic ? "تم التحديث" : "Updated");
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? "فشل التحديث" : "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        {isArabic ? "جاري تحميل المخزن..." : "Loading Inventory..."}
      </div>
    );
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen p-6 bg-white dark:bg-black text-black dark:text-white"
    >
      <h1 className="text-3xl font-black mb-6">
        📦 {isArabic ? "المخزن" : "Inventory"}
      </h1>

     <div className="grid md:grid-cols-2 gap-4">
  {products.map((product) => {
    const totalStock = product.variants?.reduce(
      (sum, v) => sum + (v.stock || 0),
      0
    );

// const image =
//   product.images?.[0]?.url?.startsWith("http")
//     ? product.images[0].url
//     : "https://via.placeholder.com/100";

    return (
      <div
        key={product._id}
        className="flex items-center justify-between p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-[#111]"
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
      
 <img
  src={product.image || "/placeholder.png"}
  alt={product.name}
  className="w-16 h-16 rounded-xl object-cover border flex-shrink-0"
/>
          <div>
            <h2 className="font-bold">{product.name}</h2>
            <p className="text-sm text-gray-500">
              {isArabic ? "المخزون:" : "Stock:"} {totalStock}
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => openEdit(product)}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          {isArabic ? "تعديل" : "Edit"}
        </button>
      </div>
    );
  })}
</div>

      {/* MODAL */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] w-full max-w-2xl rounded-2xl p-5">
            
            <h2 className="text-xl font-bold mb-4">
              {activeProduct.name}
            </h2>

            {/* VARIANTS */}
            <div className="space-y-3 max-h-[400px] overflow-auto">
              {editData.variants.map((variant) => (
                <div
                  key={variant._id}
                  className="flex items-center justify-between border dark:border-gray-800 p-3 rounded-lg"
                >
                  {/* OPTIONS */}
                  <div className="text-sm">
                    {Object.entries(variant.options).map(
                      ([k, v]) => (
                        <span key={k} className="mr-2">
                          <b>{k}:</b> {v}
                        </span>
                      )
                    )}
                  </div>

              <div className="flex items-center gap-2">
  
  {/* MINUS */}
  <button
    onClick={() =>
      handleStockChange(
        variant._id,
        Math.max(0, variant.stock - 1)
      )
    }
    className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500 text-white text-xl font-bold"
  >
    −
  </button>

  {/* INPUT */}
  <input
    type="number"
    value={variant.stock}
    onChange={(e) =>
      handleStockChange(
        variant._id,
        e.target.value
      )
    }
    className="w-16 text-center px-2 py-1 border rounded"
  />

  {/* PLUS */}
  <button
    onClick={() =>
      handleStockChange(
        variant._id,
        Number(variant.stock) + 1
      )
    }
    className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 text-white text-xl font-bold"
  >
    +
  </button>

</div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>

              <button
                onClick={saveStock}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {isArabic ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;