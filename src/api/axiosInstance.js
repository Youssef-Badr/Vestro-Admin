// src/api/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// request interceptor: اقرأ التوكن وقت كل طلب
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor: لو رجع 401 - اعمل logout وابلّغ التطبيق
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn(
        "Axios interceptor: 401 -> clearing token and notifying app"
      );
      localStorage.removeItem("token");
      // حدث التخزين ليتم التقاطه في الـ AuthContext (tabs مختلفة)...
      window.dispatchEvent(new Event("storage"));
      // حدث خاص للـ same-tab listeners لو احتجنا
      window.dispatchEvent(new Event("logout"));
      // لو تحب: إعادة توجيه لمكان تسجيل الدخول تلقائياً
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
