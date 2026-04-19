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
        setError(language === "ar" ? "فشل التوثيق" : "Authentication Failed");
        return;
      }
      login(res.data.token);
      toast.success(language === "ar" ? "مرحباً أيها المدير" : "Welcome, Admin");
      navigate("/");
    } catch (err) {
      setError(language === "ar" ? "بيانات الوصول غير صحيحة" : "Invalid Admin Credentials");
      toast.error(error);
    }
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="flex items-center justify-center min-h-screen bg-[#0f172a] transition-all duration-500 shadow-inner"
    >
      {/* تأثير ضوئي خلفي هادئ للأدمن */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]"></div>

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-10 mx-4 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Admin Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
            VESTRO <span className="text-indigo-500">ADMIN</span>
          </h2>
          <div className="h-1 w-12 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
              placeholder={language === "ar" ? "بريد المسؤول" : "Admin Email"}
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
              placeholder={language === "ar" ? "كلمة المرور" : "Password"}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-10 py-4 bg-indigo-600 text-white rounded-xl font-bold tracking-wide hover:bg-indigo-500 active:scale-[0.97] transition-all shadow-lg shadow-indigo-600/20"
        >
          {language === "ar" ? "تأكيد الهوية" : "AUTHENTICATE"}
        </button>

        <p className="mt-8 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
          Protected Environment &copy; 2026
        </p>
      </form>
    </div>
  );
};

export default Login;