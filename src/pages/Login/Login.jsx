/* eslint-disable no-unused-vars */
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
        setError(language === "ar" ? "فشل تسجيل الدخول" : "Login failed");
        return;
      }
      login(res.data.token);
      toast.success(language === "ar" ? "✅ مرحباً بك في فيسترو" : "✅ Welcome to Vestro");
      navigate("/");
    } catch (err) {
      setError(language === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid Credentials");
      toast.error(error);
    }
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      // خلفية متغيرة حسب المود (لايت/دارك)
      className="flex items-center justify-center min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0b0f1a]"
    >
      {/* الديكور الخلفي (الدوائر الملونة) - تظهر في الدارك مود لتعطي فخامة */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl dark:bg-violet-600/20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl dark:bg-indigo-600/20"></div>
      </div>

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-10 mx-4 transition-all duration-300 bg-white shadow-xl dark:bg-slate-900/40 dark:backdrop-blur-xl dark:border dark:border-white/10 rounded-3xl"
      >
        {/* Logo / Brand Name */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
            VESTRO<span className="text-indigo-600 dark:text-violet-400">.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {language === "ar" ? "سجل دخولك لتجربة تسوق فريدة" : "Sign in for a premium experience"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-center animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
              {language === "ar" ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl dark:bg-white/5 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
              {language === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl dark:bg-white/5 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-violet-500 transform transition active:scale-[0.98] shadow-lg shadow-indigo-500/20"
        >
          {language === "ar" ? "دخول" : "Login"}
        </button>

        <div className="mt-8 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm">
                {language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}
            </span>
            <button className="ml-2 text-indigo-600 dark:text-violet-400 font-bold hover:underline text-sm">
                {language === "ar" ? "أنشئ حسابك الآن" : "Create one"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Login;