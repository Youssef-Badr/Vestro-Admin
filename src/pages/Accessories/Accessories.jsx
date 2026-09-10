import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";

const Accessories = () => {
  const { language, isRTL } = useLanguage();

  // ==========================================
  // STATE
  // ==========================================

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [expandedCategories, setExpandedCategories] = useState({});

  // Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);

  const [itemForm, setItemForm] = useState({
    category: "",
    name: "",
    quantity: 0,
    location: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  // ==========================================
  // TRANSLATIONS
  // ==========================================

  const t = {
    title: language === "ar" ? "مخزن الإكسسوارات" : "Accessories Inventory",

    subtitle:
      language === "ar"
        ? "إدارة وتصنيف جميع مستلزمات المخزون"
        : "Manage and organize all inventory accessories",

    categories:
      language === "ar" ? "التصنيفات" : "Categories",

    items:
      language === "ar" ? "الأصناف" : "Items",

    totalQuantity:
      language === "ar" ? "إجمالي الكمية" : "Total Quantity",

    addCategory:
      language === "ar" ? "إضافة تصنيف" : "Add Category",

    editCategory:
      language === "ar" ? "تعديل التصنيف" : "Edit Category",

    categoryName:
      language === "ar" ? "اسم التصنيف" : "Category Name",

    categoryNamePlaceholder:
      language === "ar"
        ? "مثال: سوست"
        : "Example: Zippers",

    save:
      language === "ar" ? "حفظ" : "Save",

    cancel:
      language === "ar" ? "إلغاء" : "Cancel",

    addItem:
      language === "ar" ? "إضافة صنف" : "Add Item",

    editItem:
      language === "ar" ? "تعديل الصنف" : "Edit Item",

    itemName:
      language === "ar" ? "اسم الصنف" : "Item Name",

    itemNamePlaceholder:
      language === "ar"
        ? "مثال: سوست نحاس"
        : "Example: Copper Zippers",

    quantity:
      language === "ar" ? "الكمية" : "Quantity",

    location:
      language === "ar" ? "الموقع" : "Location",

    locationPlaceholder:
      language === "ar"
        ? "مثال: A-03"
        : "Example: A-03",

    image:
      language === "ar" ? "صورة الصنف" : "Item Image",

    chooseImage:
      language === "ar" ? "اختر صورة" : "Choose Image",

    currentImage:
      language === "ar" ? "الصورة الحالية" : "Current Image",

    noImage:
      language === "ar" ? "لا توجد صورة" : "No Image",

    delete:
      language === "ar" ? "حذف" : "Delete",

    edit:
      language === "ar" ? "تعديل" : "Edit",

    empty:
      language === "ar"
        ? "لا توجد بيانات حتى الآن"
        : "No data available",

    noItems:
      language === "ar"
        ? "لا توجد أصناف داخل هذا التصنيف"
        : "No items in this category",

    confirmDeleteCategory:
      language === "ar"
        ? "هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع الأصناف الموجودة بداخله."
        : "Are you sure you want to delete this category? All items inside it will also be deleted.",

    confirmDeleteItem:
      language === "ar"
        ? "هل أنت متأكد من حذف هذا الصنف؟"
        : "Are you sure you want to delete this item?",

    categoryRequired:
      language === "ar"
        ? "اسم التصنيف مطلوب"
        : "Category name is required",

    itemRequired:
      language === "ar"
        ? "اسم الصنف مطلوب"
        : "Item name is required",

    locationRequired:
      language === "ar"
        ? "الموقع مطلوب"
        : "Location is required",

    imageOptional:
      language === "ar"
        ? "اختياري"
        : "Optional",

    pieces:
      language === "ar" ? "قطعة" : "pcs",
  };

  // ==========================================
  // FETCH ACCESSORIES
  // ==========================================

  const fetchAccessories = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/accessories");

      setCategories(response.data || []);
    } catch (error) {
      console.error("Fetch accessories error:", error);

      toast.error(
        language === "ar"
          ? "فشل تحميل المخزون"
          : "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalItems = useMemo(() => {
    return categories.reduce(
      (total, category) => total + (category.items?.length || 0),
      0
    );
  }, [categories]);

  const totalQuantity = useMemo(() => {
    return categories.reduce((total, category) => {
      return (
        total +
        (category.items || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      );
    }, 0);
  }, [categories]);

  // ==========================================
  // CATEGORY ACCORDION
  // ==========================================

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // ==========================================
  // CATEGORY MODAL
  // ==========================================

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowCategoryModal(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name || "");
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    if (categoryLoading) return;

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error(t.categoryRequired);
      return;
    }

    try {
      setCategoryLoading(true);

      if (editingCategory) {
        await axiosInstance.put(
          `/accessories/categories/${editingCategory._id}`,
          {
            name: categoryName.trim(),
          }
        );

        toast.success(
          language === "ar"
            ? "تم تعديل التصنيف بنجاح"
            : "Category updated successfully"
        );
      } else {
        await axiosInstance.post(
          "/accessories/categories",
          {
            name: categoryName.trim(),
          }
        );

        toast.success(
          language === "ar"
            ? "تم إضافة التصنيف بنجاح"
            : "Category created successfully"
        );
      }

      closeCategoryModal();
      await fetchAccessories();
    } catch (error) {
      console.error("Category save error:", error);

      toast.error(
        error?.response?.data?.message ||
          (language === "ar"
            ? "حدث خطأ أثناء حفظ التصنيف"
            : "Failed to save category")
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      t.confirmDeleteCategory
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(
        `/accessories/categories/${categoryId}`
      );

      toast.success(
        language === "ar"
          ? "تم حذف التصنيف بنجاح"
          : "Category deleted successfully"
      );

      await fetchAccessories();
    } catch (error) {
      console.error("Delete category error:", error);

      toast.error(
        error?.response?.data?.message ||
          (language === "ar"
            ? "فشل حذف التصنيف"
            : "Failed to delete category")
      );
    }
  };

  // ==========================================
  // ITEM MODAL
  // ==========================================

  const openAddItem = (categoryId = "") => {
    setEditingItem(null);

    setItemForm({
      category: categoryId,
      name: "",
      quantity: 0,
      location: "",
      image: null,
    });

    setImagePreview("");

    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);

    setItemForm({
      category: item.category?._id || item.category || "",
      name: item.name || "",
      quantity: Number(item.quantity || 0),
      location: item.location || "",
      image: null,
    });

    setImagePreview(item.image || "");

    setShowItemModal(true);
  };

  const closeItemModal = () => {
    if (itemLoading) return;

    setShowItemModal(false);
    setEditingItem(null);

    setItemForm({
      category: "",
      name: "",
      quantity: 0,
      location: "",
      image: null,
    });

    setImagePreview("");
  };

  // ==========================================
  // ITEM INPUT
  // ==========================================

  const handleItemChange = (e) => {
    const { name, value } = e.target;

    setItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setItemForm((prev) => ({
      ...prev,
      image: file,
    }));

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ==========================================
  // ITEM SUBMIT
  // ==========================================

  const handleItemSubmit = async (e) => {
    e.preventDefault();

    if (!itemForm.category) {
      toast.error(
        language === "ar"
          ? "من فضلك اختر التصنيف"
          : "Please select a category"
      );
      return;
    }

    if (!itemForm.name.trim()) {
      toast.error(t.itemRequired);
      return;
    }

    if (!itemForm.location.trim()) {
      toast.error(t.locationRequired);
      return;
    }

    const quantity = Number(itemForm.quantity);

    if (Number.isNaN(quantity) || quantity < 0) {
      toast.error(
        language === "ar"
          ? "الكمية يجب أن تكون رقمًا صحيحًا"
          : "Quantity must be a valid number"
      );
      return;
    }

    try {
      setItemLoading(true);

      const formData = new FormData();

      formData.append(
        "category",
        itemForm.category
      );

      formData.append(
        "name",
        itemForm.name.trim()
      );

      formData.append(
        "quantity",
        quantity
      );

      formData.append(
        "location",
        itemForm.location.trim()
      );

      // IMPORTANT:
      // Backend expects upload.single("image")
      if (itemForm.image) {
        formData.append(
          "image",
          itemForm.image
        );
      }

      if (editingItem) {
        await axiosInstance.put(
          `/accessories/items/${editingItem._id}`,
          formData
        );

        toast.success(
          language === "ar"
            ? "تم تعديل الصنف بنجاح"
            : "Item updated successfully"
        );
      } else {
        await axiosInstance.post(
          "/accessories/items",
          formData
        );

        toast.success(
          language === "ar"
            ? "تم إضافة الصنف بنجاح"
            : "Item created successfully"
        );
      }

      closeItemModal();

      await fetchAccessories();
    } catch (error) {
      console.error("Item save error:", error);

      toast.error(
        error?.response?.data?.message ||
          (language === "ar"
            ? "حدث خطأ أثناء حفظ الصنف"
            : "Failed to save item")
      );
    } finally {
      setItemLoading(false);
    }
  };

  // ==========================================
  // DELETE ITEM
  // ==========================================

  const handleDeleteItem = async (itemId) => {
    const confirmed = window.confirm(
      t.confirmDeleteItem
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(
        `/accessories/items/${itemId}`
      );

      toast.success(
        language === "ar"
          ? "تم حذف الصنف بنجاح"
          : "Item deleted successfully"
      );

      await fetchAccessories();
    } catch (error) {
      console.error("Delete item error:", error);

      toast.error(
        error?.response?.data?.message ||
          (language === "ar"
            ? "فشل حذف الصنف"
            : "Failed to delete item")
      );
    }
  };

  // ==========================================
  // QUICK QUANTITY UPDATE
  // ==========================================

  const updateQuantity = async (item, amount) => {
    const newQuantity = Math.max(
      0,
      Number(item.quantity || 0) + amount
    );

    try {
      await axiosInstance.patch(
        `/accessories/items/${item._id}/quantity`,
        {
          quantity: newQuantity,
        }
      );

      setCategories((prevCategories) =>
        prevCategories.map((category) => ({
          ...category,
          items: (category.items || []).map(
            (currentItem) =>
              currentItem._id === item._id
                ? {
                    ...currentItem,
                    quantity: newQuantity,
                  }
                : currentItem
          ),
        }))
      );
    } catch (error) {
      console.error(
        "Update quantity error:",
        error
      );

      toast.error(
        language === "ar"
          ? "فشل تحديث الكمية"
          : "Failed to update quantity"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6"
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === "ar"
                ? "جاري تحميل المخزون..."
                : "Loading inventory..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={openAddCategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span className="text-lg leading-none">
              +
            </span>

            {t.addCategory}
          </button>
        </div>

        {/* ======================================
            STATS
        ====================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Categories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.categories}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {categories.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                📦
              </div>

            </div>
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.items}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalItems}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                🧰
              </div>

            </div>
          </div>

          {/* Quantity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.totalQuantity}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalQuantity.toLocaleString()}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                🔢
              </div>

            </div>
          </div>
        </div>

        {/* ======================================
            EMPTY
        ====================================== */}

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

            <div className="mb-4 text-5xl">
              📦
            </div>

            <h3 className="text-lg font-semibold">
              {t.empty}
            </h3>

            <button
              type="button"
              onClick={openAddCategory}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              {t.addCategory}
            </button>

          </div>
        ) : (
          <div className="space-y-4">

            {categories.map((category) => {

              const isExpanded =
                !!expandedCategories[
                  category._id
                ];

              const categoryItems =
                category.items || [];

              const categoryQuantity =
                categoryItems.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                );

              return (
                <div
                  key={category._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >

                  {/* =================================
                      CATEGORY HEADER
                  ================================= */}

                  <div className="flex flex-col gap-4 p-4 sm:p-5">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div className="flex min-w-0 items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            toggleCategory(
                              category._id
                            )
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <span
                            className={`transition-transform ${
                              isExpanded
                                ? "rotate-90"
                                : ""
                            }`}
                          >
                            ›
                          </span>
                        </button>

                        <div className="min-w-0">

                          <h2 className="truncate text-lg font-bold">
                            {category.name}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

                            <span>
                              {categoryItems.length}{" "}
                              {t.items}
                            </span>

                            <span>•</span>

                            <span>
                              {categoryQuantity.toLocaleString()}{" "}
                              {t.pieces}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="flex flex-wrap items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openAddItem(
                              category._id
                            )
                          }
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          + {t.addItem}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditCategory(
                              category
                            )
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {t.edit}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCategory(
                              category._id
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                        >
                          {t.delete}
                        </button>

                      </div>

                    </div>
                  </div>

                  {/* =================================
                      ITEMS
                  ================================= */}

                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800">

                      {categoryItems.length === 0 ? (

                        <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                          {t.noItems}
                        </div>

                      ) : (

                        <div className="divide-y divide-slate-200 dark:divide-slate-800">

                          {categoryItems.map(
                            (item) => (

                              <div
                                key={item._id}
                                className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              >

                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                                  {/* Image */}
                                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">

                                    {item.image ? (
                                      <img
                                        src={
                                          item.image
                                        }
                                        alt={
                                          item.name
                                        }
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-2xl">
                                        🧰
                                      </div>
                                    )}

                                  </div>

                                  {/* Item Info */}
                                  <div className="min-w-0 flex-1">

                                    <h3 className="truncate text-base font-semibold">
                                      {item.name}
                                    </h3>

                                    <div className="mt-2 flex flex-wrap gap-2">

                                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        📍{" "}
                                        {item.location ||
                                          "-"}
                                      </span>

                                    </div>

                                  </div>

                                  {/* Quantity */}
                                  <div className="flex items-center gap-3">

                                    <div className="text-start lg:text-center">

                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t.quantity}
                                      </p>

                                      <p className="mt-1 text-xl font-bold">
                                        {Number(
                                          item.quantity ||
                                            0
                                        ).toLocaleString()}
                                      </p>

                                    </div>

                                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateQuantity(
                                            item,
                                            -1
                                          )
                                        }
                                        disabled={
                                          Number(
                                            item.quantity ||
                                              0
                                          ) <= 0
                                        }
                                        className="h-9 w-9 text-lg font-bold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                                      >
                                        −
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateQuantity(
                                            item,
                                            1
                                          )
                                        }
                                        className="h-9 w-9 border-s border-slate-200 text-lg font-bold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                                      >
                                        +
                                      </button>

                                    </div>

                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditItem(
                                          item
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                      {t.edit}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteItem(
                                          item._id
                                        )
                                      }
                                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                                    >
                                      {t.delete}
                                    </button>

                                  </div>

                                </div>

                              </div>

                            )
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* ========================================
          CATEGORY MODAL
      ======================================== */}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">

            <div className="mb-5">

              <h2 className="text-xl font-bold">
                {editingCategory
                  ? t.editCategory
                  : t.addCategory}
              </h2>

            </div>

            <form
              onSubmit={handleCategorySubmit}
              className="space-y-4"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  {t.categoryName}
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(
                      e.target.value
                    )
                  }
                  placeholder={
                    t.categoryNamePlaceholder
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-slate-400"
                  autoFocus
                />

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={categoryLoading}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {categoryLoading
                    ? "..."
                    : t.save}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================
          ITEM MODAL
      ======================================== */}

      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">

          <div className="flex min-h-full items-center justify-center">

            <div className="my-8 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">

              <div className="mb-5">

                <h2 className="text-xl font-bold">
                  {editingItem
                    ? t.editItem
                    : t.addItem}
                </h2>

              </div>

              <form
                onSubmit={handleItemSubmit}
                className="space-y-4"
              >

                {/* Category */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    {t.categories}
                  </label>

                  <select
                    name="category"
                    value={itemForm.category}
                    onChange={handleItemChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-slate-400"
                  >
                    <option value="">
                      {language === "ar"
                        ? "اختر التصنيف"
                        : "Select Category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* Item Name */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    {t.itemName}
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={itemForm.name}
                    onChange={handleItemChange}
                    placeholder={
                      t.itemNamePlaceholder
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-slate-400"
                  />

                </div>

                {/* Quantity + Location */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      {t.quantity}
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      value={itemForm.quantity}
                      onChange={handleItemChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-slate-400"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      {t.location}
                    </label>

                    <input
                      type="text"
                      name="location"
                      value={itemForm.location}
                      onChange={handleItemChange}
                      placeholder={
                        t.locationPlaceholder
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-slate-400"
                    />

                  </div>

                </div>

                {/* Image */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-medium">
                      {t.image}
                    </label>

                    <span className="text-xs text-slate-400">
                      {t.imageOptional}
                    </span>

                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">

                    {imagePreview ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-xl">

                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />

                      </div>
                    ) : (
                      <>
                        <div className="mb-2 text-3xl">
                          🖼️
                        </div>

                        <span className="text-sm font-medium">
                          {t.chooseImage}
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                  </label>

                  {editingItem &&
                    !itemForm.image &&
                    editingItem.image && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {t.currentImage}
                      </p>
                    )}

                </div>

                {/* Buttons */}

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    onClick={closeItemModal}
                    disabled={itemLoading}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {t.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={itemLoading}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900"
                  >
                    {itemLoading
                      ? "..."
                      : t.save}
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accessories;