// import { Routes, Route, Navigate } from "react-router-dom";
// import { Suspense, lazy } from "react";
// import { useAuth } from "./context/auth";
// import Sidebar from "./partials/Sidebar";
// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
// import { LanguageProvider, useLanguage } from "./context/LanguageContext";
// import ThemeProvider from "./context/ThemeContext";

// // Lazy imports
// const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
// const Products = lazy(() => import("./pages/Products/products"));
// const Orders = lazy(() => import("./pages/Orders/Orders"));
// const Customers = lazy(() => import("./pages/Customers/Customers"));
// const Payments = lazy(() => import("./pages/Payments/Payments"));
// const Cities = lazy(() => import("./pages/Cities/Cities"));
// const Discounts = lazy(() => import("./pages/Discounts/Discounts"));
// const Settings = lazy(() => import("./pages/Settings/Settings"));
// const Login = lazy(() => import("./pages/Login/Login"));
// const Logout = lazy(() => import("./pages/Logout/Logout"));
// const Announcements = lazy(() => import("./pages/Announcements/Announcements"));
// const AbandonedOrders = lazy(
//   () => import("./pages/AbandonedOrders/AbandonedOrders"),
// ); // تأكد من اسم الفولدر والملف صح
// function App() {
//   const { isAuthenticated } = useAuth();
//   const { language } = useLanguage();

//   return (
//     <LanguageProvider>
//       <ThemeProvider>
//         {!isAuthenticated ? (
//           <Suspense fallback={<div>Loading...</div>}>
//             <Routes>
//               <Route path="/Login" element={<Login />} />
//               <Route path="*" element={<Navigate to="/Login" />} />
//             </Routes>
//           </Suspense>
//         ) : (
//           <div
//             className="flex min-h-screen bg-gray-100"
//             dir={language === "ar" ? "rtl" : "ltr"}
//             key={language}
//           >
//             <Sidebar />
//             <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
//               <Suspense fallback={<div>Loading...</div>}>
//                 <Routes>
//                   <Route
//                     path="/"
//                     element={
//                       <ProtectedRoute>
//                         <Dashboard />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/products"
//                     element={
//                       <ProtectedRoute>
//                         <Products />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/orders"
//                     element={
//                       <ProtectedRoute>
//                         <Orders />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/customers"
//                     element={
//                       <ProtectedRoute>
//                         <Customers />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/payments"
//                     element={
//                       <ProtectedRoute>
//                         <Payments />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/cities"
//                     element={
//                       <ProtectedRoute>
//                         <Cities />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/discounts"
//                     element={
//                       <ProtectedRoute>
//                         <Discounts />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/settings"
//                     element={
//                       <ProtectedRoute>
//                         <Settings />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route
//                     path="/announcements"
//                     element={
//                       <ProtectedRoute>
//                         <Announcements />
//                       </ProtectedRoute>
//                     }
//                   />

//                   <Route
//                     path="/abandoned"
//                     element={
//                       <ProtectedRoute>
//                         <AbandonedOrders />
//                       </ProtectedRoute>
//                     }
//                   />

//                   <Route
//                     path="/logout"
//                     element={
//                       <ProtectedRoute>
//                         <Logout />
//                       </ProtectedRoute>
//                     }
//                   />
//                   <Route path="*" element={<Navigate to="/" />} />
//                 </Routes>
//               </Suspense>
//             </main>
//           </div>
//         )}
//       </ThemeProvider>
//     </LanguageProvider>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "./context/auth";
import Sidebar from "./partials/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import ThemeProvider from "./context/ThemeContext";

// Lazy imports
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Products = lazy(() => import("./pages/Products/products"));
const Orders = lazy(() => import("./pages/Orders/Orders"));
const Customers = lazy(() => import("./pages/Customers/Customers"));
const Payments = lazy(() => import("./pages/Payments/Payments"));
const Cities = lazy(() => import("./pages/Cities/Cities"));
const Discounts = lazy(() => import("./pages/Discounts/Discounts"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Login = lazy(() => import("./pages/Login/Login"));
const Logout = lazy(() => import("./pages/Logout/Logout"));
const HomeSettings = lazy(() => import("./pages/HomeSettings/HomeSettings"));
const Announcements = lazy(() => import("./pages/Announcements/Announcements"));
const AuditLogs = lazy(() => import("./pages/AuditLogsPage/AuditLogsPage")); // ✅ إضافة سجل العمليات
const AdminBundles = lazy(() => import("./pages/AdminBundles/AdminBundles")); // ✅ إضافة باندلات الإدارة
const AdminCategories = lazy(() => import("./pages/AdminCategories/AdminCategories")); // ✅ إضافة إدارة التصنيفات
const UserManagement = lazy(
  () => import("./pages/UserManagement/UserManagement"),
);
const AbandonedOrders = lazy(
  () => import("./pages/AbandonedOrders/AbandonedOrders"),
);

function App() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  return (
    <LanguageProvider>
      <ThemeProvider>
        {!isAuthenticated ? (
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/Login" element={<Login />} />
              <Route path="*" element={<Navigate to="/Login" />} />
            </Routes>
          </Suspense>
        ) : (
          <div
            className="flex min-h-screen bg-gray-100"
            dir={language === "ar" ? "rtl" : "ltr"}
            key={language}
          >
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <Products />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute>
                        <Customers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payments"
                    element={
                      <ProtectedRoute>
                        <Payments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cities"
                    element={
                      <ProtectedRoute>
                        <Cities />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <AdminCategories />
                      </ProtectedRoute>
                    }
                  />  
                  <Route
                    path="/discounts"
                    element={
                      <ProtectedRoute>
                        <Discounts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/announcements"
                    element={
                      <ProtectedRoute>
                        <Announcements />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/abandoned"
                    element={
                      <ProtectedRoute>
                        <AbandonedOrders />
                      </ProtectedRoute>
                    }
                  />

                  {/* ✅ Route سجل العمليات الجديد */}
                  <Route
                    path="/audit-logs"
                    element={
                      <ProtectedRoute>
                        <AuditLogs />
                      </ProtectedRoute>
                    }
                  />

                  {/* ✅ Route إدارة المستخدمين الجديد */}
                  <Route
                    path="/bundles"
                    element={
                      <ProtectedRoute>
                        <AdminBundles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user-management"
                    element={
                      <ProtectedRoute>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/home-settings"
                    element={
                      <ProtectedRoute>
                        <HomeSettings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/logout"
                    element={
                      <ProtectedRoute>
                        <Logout />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        )}
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
