import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../context/auth";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";

const Login = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });

      if (!res.data.token) {
        console.warn("❌ No token received from backend");
        setError(
          language === "ar"
            ? "فشل تسجيل الدخول: لم يتم استلام رمز التوثيق من الخادم"
            : "Login failed: No token received from server"
        );
        return;
      }

      login(res.data.token);

      toast.success(
        language === "ar"
          ? "✅ تم تسجيل الدخول بنجاح"
          : "✅ Logged in successfully"
      );
      navigate("/");
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
      setError(
        language === "ar"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "Email Address or Password is incorrect"
      );
      toast.error(
        language === "ar"
          ? "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "❌ Email or password is incorrect"
      );
    }
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      // تغيير الخلفية إلى تدرج ليلي عصري
      className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-slate-900 via-purple-900 to-slate-900"
      style={{ textAlign: language === "ar" ? "right" : "left" }}
    >
      <form
        onSubmit={handleLogin}
        // تغيير شكل الكارت ليصبح شبه شفاف (Glassmorphism) أو داكن أنيق
        className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">
          {language === "ar" ? "Vestro Store" : "Vestro Store"}
        </h2>

        {error && (
          <p className="bg-red-500/20 text-red-200 p-2 rounded-lg mb-4 text-center text-sm font-medium border border-red-500/50">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder={
            language === "ar" ? "البريد الإلكتروني" : "Email Address"
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // تغيير ألوان الحقول لتناسب الثيم الداكن
          className="w-full mb-4 p-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder={language === "ar" ? "كلمة المرور" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          // تغيير لون الزر إلى بنفسجي متدرج بلمسة تفاعلية
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition duration-300 font-bold shadow-lg shadow-purple-900/50"
        >
          {language === "ar" ? "تسجيل الدخول" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;