import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import { Trash2, Key, ShieldCheck, UserPlus, X, Edit3 } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // 🟢 1. State لتخزين الصلاحيات القادمة من السيرفر
  const [allPermissions, setAllPermissions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    permissions: {}, // بتبدأ فاضية وهتتملي ديناميكياً
  });

  // 🟢 2. دالة جلب البيانات الموحدة
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // جلب اليوزرز وقائمة الصلاحيات في نفس الوقت لسرعة الأداء
      const [usersRes, permsRes] = await Promise.all([
        axios.get("/admin/users"),
        axios.get("/auth/permissions-list") // السطر اللي جربناه واشتغل
      ]);

      setUsers(usersRes.data);
      setAllPermissions(permsRes.data);

      // تجهيز الـ Default Permissions بناءً على اللي رجع من الموديل
      const defaultPerms = {};
      permsRes.data.forEach(p => defaultPerms[p] = false);
      
      setFormData(prev => ({ ...prev, permissions: defaultPerms }));
      setLoading(false);
    } catch (err) {
      toast.error("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePermissionChange = (perm) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [perm]: !formData.permissions[perm],
      },
    });
  };

  const handleEditClick = (user) => {
    setIsEditMode(true);
    setEditingUserId(user._id);
    
    // تأكد إن الصلاحيات اللي مش موجودة عند اليوزر تاخد false كقيمة افتراضية
    const userPerms = {};
    allPermissions.forEach(p => {
      userPerms[p] = user.permissions ? !!user.permissions[p] : false;
    });

    setFormData({
      name: user.name,
      email: user.email,
      password: "", 
      role: user.role,
      permissions: userPerms,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`/admin/users/${editingUserId}/permissions`, {
          role: formData.role,
          permissions: formData.permissions,
        });
        toast.success(language === "ar" ? "تم تحديث الصلاحيات" : "Permissions updated");
      } else {
        await axios.post("/admin/users", formData);
        toast.success(language === "ar" ? "تم إضافة المستخدم" : "User added");
      }
      closeModal();
      fetchData(); // إعادة جلب البيانات لتحديث الجدول
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingUserId(null);
    
    // إعادة تصفير الفورم للصلاحيات الافتراضية
    const resetPerms = {};
    allPermissions.forEach(p => resetPerms[p] = false);
    
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      permissions: resetPerms,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

    const openResetModal = (id) => {
  setSelectedUserId(id);
  setNewPassword("");
  setShowResetModal(true);
};

const submitResetPassword = async (e) => {
  e.preventDefault();
  if (newPassword.length < 6) {
    return toast.error(language === "ar" ? "الباسوورد ضعيف جداً" : "Password too short");
  }
  try {
    await axios.put(`/admin/users/${selectedUserId}/reset-password`, { newPassword });
    toast.success(language === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password reset successfully");
    setShowResetModal(false);
  } catch (err) {
    toast.error("Reset failed");
  }
};

//   return (
//     <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg min-h-screen transition-colors duration-300">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8 mt-16">
//         <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
//           <ShieldCheck className="text-blue-500" />
//           {language === "ar" ? "إدارة المستخدمين" : "User Management"}
//         </h2>
//         <button
//           onClick={() => {
//             setIsEditMode(false);
//             setShowModal(true);
//           }}
//           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
//         >
//           <UserPlus size={20} />
//           {language === "ar" ? "إضافة مستخدم" : "Add New User"}
//         </button>
//       </div>

//       {/* Users Table */}
//       <div className="overflow-x-auto border dark:border-gray-700 rounded-xl">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
//               <th className="p-4">{language === "ar" ? "المستخدم" : "User"}</th>
//               <th className="p-4">{language === "ar" ? "الدور" : "Role"}</th>
//               <th className="p-4">{language === "ar" ? "الصلاحيات" : "Permissions"}</th>
//               <th className="p-4 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y dark:divide-gray-700 text-gray-700 dark:text-gray-200">
//             {loading ? (
//               <tr>
//                 <td colSpan="4" className="p-10 text-center animate-pulse">Loading users...</td>
//               </tr>
//             ) : (
//               users.map((user) => (
//                 <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
//                   <td className="p-4">
//                     <div className="font-bold">{user.name}</div>
//                     <div className="text-xs text-gray-500">{user.email}</div>
//                   </td>
//                   <td className="p-4">
//                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
//                       user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30" : "bg-gray-100 text-gray-700 dark:bg-gray-600"
//                     }`}>
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex flex-wrap gap-1 max-w-xs">
//                       {user.permissions?.fullAccess ? (
//                         <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Full Access</span>
//                       ) : (
//                         // 🟢 عرض الصلاحيات الموجودة في الموديل فقط والتي يمتلكها المستخدم
//                         allPermissions.filter(p => user.permissions?.[p]).map(key => (
//                           <span key={key} className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border dark:border-blue-800 capitalize">
//                             {key.replace(/([A-Z])/g, ' $1').replace("manage", "").trim()}
//                           </span>
//                         ))
//                       )}
//                     </div>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex justify-center gap-3">
//                       <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit3 size={18} /></button>
//                       <button onClick={() => openResetModal(user._id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"><Key size={18} /></button>
//                       <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal - Add/Edit */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
//               <h3 className="text-xl font-bold dark:text-white">
//                 {isEditMode ? (language === "ar" ? `تعديل صلاحيات: ${formData.name}` : `Edit Permissions: ${formData.name}`) : (language === "ar" ? "إضافة مستخدم جديد" : "Add New User")}
//               </h3>
//               <button onClick={closeModal} className="text-gray-500 hover:text-red-500"><X /></button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
//               {!isEditMode && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <input type="text" placeholder={language === "ar" ? "الاسم" : "Name"} required className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
//                   <input type="email" placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"} required className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
//                   <input type="password" placeholder={language === "ar" ? "كلمة المرور" : "Password"} required className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
//                 </div>
//               )}

//               <div className="mb-6">
//                 <label className="block text-sm font-bold mb-2 dark:text-white">{language === "ar" ? "الدور الوظيفي" : "Role"}</label>
//                 <select className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
//                   <option value="user">User</option>
//                   <option value="manager">Manager</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>

//               <h4 className="font-bold mb-3 dark:text-white border-b pb-2">{language === "ar" ? "الصلاحيات" : "Permissions"}</h4>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
//                 {/* 🟢 نستخدم allPermissions القادمة ديناميكياً من الموديل */}
//                 {allPermissions.map((perm) => (
//                   <label key={perm} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition ${formData.role === 'admin' ? 'bg-gray-100 opacity-50' : 'bg-gray-50 dark:bg-gray-800 hover:bg-blue-50'}`}>
//                     <input 
//                       type="checkbox" 
//                       checked={formData.role === 'admin' ? true : (formData.permissions[perm] || false)} 
//                       onChange={() => handlePermissionChange(perm)}
//                       className="w-4 h-4 rounded text-blue-600"
//                       disabled={formData.role === 'admin'} 
//                     />
//                     <span className="text-[11px] dark:text-gray-300 capitalize">{perm.replace(/([A-Z])/g, ' $1')}</span>
//                   </label>
//                 ))}
//               </div>

//               <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
//                 {isEditMode ? (language === "ar" ? "تحديث الصلاحيات" : "Update Permissions") : (language === "ar" ? "إنشاء المستخدم" : "Create User")}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//     {/* 🔑 Modal - Reset Password */}
// {showResetModal && (
//   <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
//     <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
//       <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
//         <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
//           <Key className="text-yellow-500" size={20} />
//           {language === "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}
//         </h3>
//         <button onClick={() => setShowResetModal(false)} className="text-gray-500 hover:text-red-500"><X /></button>
//       </div>
      
//       <form onSubmit={submitResetPassword} className="p-6">
//         <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
//           {language === "ar" ? "أدخل كلمة المرور الجديدة للمستخدم:" : "Enter the new password for this user:"}
//         </p>
//         <input 
//           type="password" 
//           placeholder="••••••••" 
//           required
//           autoFocus
//           className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-yellow-500 mb-6"
//           value={newPassword} 
//           onChange={(e) => setNewPassword(e.target.value)}
//         />
        
//         <div className="flex gap-3">
//           <button 
//             type="button"
//             onClick={() => setShowResetModal(false)}
//             className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-2.5 rounded-lg font-bold hover:bg-gray-200 transition"
//           >
//             {language === "ar" ? "إلغاء" : "Cancel"}
//           </button>
//           <button 
//             type="submit"
//             className="flex-1 bg-yellow-500 text-white py-2.5 rounded-lg font-bold hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/20"
//           >
//             {language === "ar" ? "تأكيد التغيير" : "Confirm Reset"}
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}
//     </div>
//   );
return (
  <div className="w-full min-h-screen p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300 overflow-x-hidden">
    
    {/* Header */}
    <div className="flex flex-col  lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 mt-14 md:mt-16">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-blue-500 shrink-0" size={28} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white truncate">
          {language === "ar" ? "إدارة المستخدمين" : "User Management"}
        </h2>
      </div>
      
      <button
        onClick={() => {
          setIsEditMode(false);
          setShowModal(true);
        }}
        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
      >
        <UserPlus size={20} />
        <span className="whitespace-nowrap">{language === "ar" ? "إضافة مستخدم" : "Add New User"}</span>
      </button>
    </div>

    {/* 🟢 Mobile View: Cards (تظهر فقط في الشاشات الصغيرة) */}
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {loading ? (
        <div className="p-10 text-center animate-pulse dark:text-white">Loading...</div>
      ) : (
        users.map((user) => (
          <div key={user._id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-gray-800 dark:text-white">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40"
              }`}>
                {user.role}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {user.permissions?.fullAccess ? (
                <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Full Access</span>
              ) : (
                allPermissions.filter(p => user.permissions?.[p]).map(key => (
                  <span key={key} className="text-[8px] bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border dark:border-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace("manage", "").trim()}
                  </span>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t dark:border-gray-600">
              <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Edit3 size={18} /></button>
              <button onClick={() => openResetModal(user._id)} className="p-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg"><Key size={18} /></button>
              <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg"><Trash2 size={18} /></button>
            </div>
          </div>
        ))
      )}
    </div>

    {/* 🟢 Desktop View: Table (تظهر فقط في الشاشات المتوسطة والكبيرة) */}
    <div className="hidden md:block relative border dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <th className="p-4">{language === "ar" ? "المستخدم" : "User"}</th>
              <th className="p-4">{language === "ar" ? "الدور" : "Role"}</th>
              <th className="p-4">{language === "ar" ? "الصلاحيات" : "Permissions"}</th>
              <th className="p-4 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700 text-gray-700 dark:text-gray-200">
            {!loading && users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="p-4">
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30" : "bg-gray-100 text-gray-700 dark:bg-gray-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {user.permissions?.fullAccess ? (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Full Access</span>
                    ) : (
                      allPermissions.filter(p => user.permissions?.[p]).map(key => (
                        <span key={key} className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border dark:border-blue-800 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace("manage", "").trim()}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit3 size={18} /></button>
                    <button onClick={() => openResetModal(user._id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"><Key size={18} /></button>
                    <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal - Add/Edit User */}
    {showModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
          <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-bold dark:text-white truncate pr-4">
              {isEditMode ? (language === "ar" ? `تعديل: ${formData.name}` : `Edit: ${formData.name}`) : (language === "ar" ? "إضافة مستخدم" : "Add User")}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
            {!isEditMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <input type="text" placeholder={language === "ar" ? "الاسم" : "Name"} required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input type="email" placeholder={language === "ar" ? "البريد" : "Email"} required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <input type="password" placeholder={language === "ar" ? "كلمة المرور" : "Password"} required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-bold mb-2 dark:text-white opacity-50 uppercase">{language === "ar" ? "الدور" : "Role"}</label>
              <select className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <h4 className="font-bold mb-4 dark:text-white border-b dark:border-gray-800 pb-2 text-xs uppercase">{language === "ar" ? "الصلاحيات" : "Permissions"}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
              {allPermissions.map((perm) => (
                <label key={perm} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${formData.role === 'admin' ? 'bg-gray-100 opacity-50' : 'bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.role === 'admin' ? true : (formData.permissions[perm] || false)} 
                    onChange={() => handlePermissionChange(perm)}
                    className="w-4 h-4 rounded text-blue-600"
                    disabled={formData.role === 'admin'} 
                  />
                  <span className="text-[10px] dark:text-gray-300 capitalize truncate">{perm.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl active:scale-95">
              {isEditMode ? (language === "ar" ? "تحديث" : "Update") : (language === "ar" ? "إنشاء" : "Create")}
            </button>
          </form>
        </div>
      </div>
    )}

    {/* Reset Password Modal */}
    {showResetModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
          <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-yellow-500/10">
            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Key className="text-yellow-500" size={20} />
              {language === "ar" ? "كلمة المرور" : "Password"}
            </h3>
            <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-red-500"><X /></button>
          </div>
          <form onSubmit={submitResetPassword} className="p-6">
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full p-4 rounded-2xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-yellow-500 mb-6"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-3 rounded-xl font-bold">{language === "ar" ? "إلغاء" : "Cancel"}</button>
              <button type="submit" className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 shadow-lg">{language === "ar" ? "تأكيد" : "Confirm"}</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default UserManagement;