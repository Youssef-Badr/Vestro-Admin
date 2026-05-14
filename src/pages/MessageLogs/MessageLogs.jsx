// import React, { useEffect, useState, useRef } from "react";
// import axios from "../../api/axiosInstance";
// import { useLanguage } from "../../context/LanguageContext";
// import { 
//   Search, Reply, MessageCircle, CheckCheck, Check, 
//   Clock, AlertCircle, X, Info, User, Send
// } from "lucide-react";

// export default function MessageLogs() {
//   const { language } = useLanguage();
//   const isRTL = language === "ar";

//   const [logs, setLogs] = useState([]); // للجدول الخارجي
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [activeChat, setActiveChat] = useState([]); // رسائل الشات المفتوح حالياً
//   const [replyTarget, setReplyTarget] = useState(null); 
//   const [replyText, setReplyText] = useState("");
//   const [sending, setSending] = useState(false);
//   const [selectedHistory, setSelectedHistory] = useState(null);

//   const chatEndRef = useRef(null);

//   // سكرول تلقائي لآخر رسالة عند تحديث الشات
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [activeChat]);

//   // دالة جلب السجلات للجدول
//   const fetchLogs = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get("/messages", { params: { search } });
//       setLogs(data.messages);
//     } catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   useEffect(() => {
//     const handler = setTimeout(fetchLogs, 500);
//     return () => clearTimeout(handler);
//   }, [search]);

//   // --- تحديث تلقائي للشات المفتوح (Auto-Sync) ---
//   useEffect(() => {
//     let interval;
//     if (replyTarget) {
//       // تحديث الشات كل 3 ثواني طالما المودال مفتوح
//       interval = setInterval(async () => {
//         try {
//           const { data } = await axios.get(`/whatsapp/chat/${replyTarget.phone}`);
//           if (data.success) {
//             // تحديث فقط في حالة وجود رسائل جديدة لتجنب إعادة الرندر بدون داعي
//             setActiveChat(prev => {
//               if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
//                 return data.messages;
//               }
//               return prev;
//             });
//           }
//         } catch (err) {
//           console.error("Auto-sync failed", err);
//         }
//       }, 2000); 
//     }
//     return () => clearInterval(interval); // تنظيف التايمر عند إغلاق الشات
//   }, [replyTarget]);

//   // فتح الشات وجلب التاريخ
//   const openChat = async (msg) => {
//     setReplyTarget(msg);
//     setActiveChat([]); 
//     try {
//       const { data } = await axios.get(`/whatsapp/chat/${msg.phone}`);
//       if (data.success) {
//         setActiveChat(data.messages);
//       }
//     } catch (err) { console.error("Error fetching chat history"); }
//   };

//   const handleSendReply = async () => {
//     if (!replyText.trim()) return;
//     const tempMsg = replyText;
//     setSending(true);

//     try {
//       const res = await axios.post("/whatsapp/send", { 
//         phone: replyTarget.phone, 
//         message: tempMsg, 
//         type: "text" 
//       });

//       if (res.data.success) {
//         const newMsg = {
//           _id: res.data.dbId,
//           phone: replyTarget.phone,
//           text: tempMsg,
//           direction: "outbound",
//           status: "sent",
//           createdAt: new Date().toISOString(),
//         };
//         setActiveChat(prev => [...prev, newMsg]);
//         setReplyText("");
//         fetchLogs(); 
//       }
//     } catch (err) {
//       alert("Error sending message");
//     } finally {
//       setSending(false);
//     }
//   };

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "read": return { color: "text-green-500", icon: <CheckCheck size={14} />, label: isRTL ? "مقروء" : "READ", bg: "bg-green-500/10" };
//       case "delivered": return { color: "text-blue-500", icon: <Check size={14} />, label: isRTL ? "مستلم" : "DELIVERED", bg: "bg-blue-500/10" };
//       case "failed": return { color: "text-red-700", icon: <AlertCircle size={14} />, label: isRTL ? "فشل" : "FAILED", bg: "bg-red-700/10" };
//       default: return { color: "text-slate-400", icon: <Clock size={14} />, label: isRTL ? "مرسل" : "SENT", bg: "bg-slate-500/10" };
//     }
//   };

//   return (
//     <div className={`min-h-screen pt-24 pb-10 px-4 bg-white dark:bg-black transition-colors duration-300 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//           <div>
//             <h1 className="text-4xl font-black uppercase    tracking-tighter text-red-700">رسائل واتساب التسويقية</h1>
//             <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-bold">Official Business API Control</p>
//           </div>
//           <div className="relative">
//             <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 opacity-30`} size={18} />
//             <input
//               type="text"
//               placeholder={isRTL ? "بحث برقم الهاتف..." : "Search leads..."}
//               className={`w-full md:w-80 ${isRTL ? "pr-12 pl-6" : "pl-12 pr-6"} py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-red-700 transition-all`}
//               value={search} onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-700/5">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-start border-collapse">
//               <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase text-[10px] font-black tracking-widest">
//                 <tr>
//                   <th className="px-8 py-6">{isRTL ? "العميل" : "Customer"}</th>
//                   <th className="px-8 py-6">{isRTL ? "التفاعل" : "Activity"}</th>
//                   <th className="px-8 py-6">{isRTL ? "الحالة" : "Status"}</th>
//                   <th className="px-8 py-6 text-center">{isRTL ? "رد" : "Reply"}</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 dark:divide-white/5">
//                 {loading ? (
//                   <tr><td colSpan="4" className="p-20 text-center text-red-700 font-bold uppercase animate-pulse   ">Syncing VESTRO Data...</td></tr>
//                 ) : logs.map((msg) => {
//                   const s = getStatusStyle(msg.status);
//                   return (
//                     <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
//                       <td className="px-8 py-6">
//                         <div className="flex items-center gap-4">
//                           <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-xs">
//                              {msg.direction === 'inbound' ? <MessageCircle size={16}/> : <User size={16}/>}
//                           </div>
//                           <div>
//                             <div className="font-black text-base uppercase   ">{msg.customer?.name || "Guest"}</div>
//                             <div className="text-[10px] opacity-40 font-bold tracking-widest">+{msg.phone}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-8 py-6 opacity-70 font-medium max-w-xs truncate   ">
//                          {msg.text || msg.templateName}
//                       </td>
//                       <td className="px-8 py-6">
//                         <button onClick={() => setSelectedHistory(msg)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black ${s.color} ${s.bg}`}>
//                           {s.icon} <span className="text-[10px] tracking-widest">{s.label}</span>
//                         </button>
//                       </td>
//                       <td className="px-8 py-6 text-center">
//                         <button onClick={() => openChat(msg)} className="w-10 h-10 inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-red-700 hover:text-white transition-all">
//                           <Reply size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* --- CHAT MODAL --- */}
//       {replyTarget && (
//         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
//           <div className="bg-white dark:bg-[#0b0b0b] w-full max-w-2xl h-[85vh] rounded-[3rem] flex flex-col border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
            
//             {/* Chat Header */}
//             <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-lg shadow-lg">
//                   {replyTarget.customer?.name?.charAt(0) || "U"}
//                 </div>
//                 <div>
//                   <h3 className="font-black text-lg uppercase    text-red-700 leading-none">{replyTarget.customer?.name || "Guest"}</h3>
//                   <p className="text-[10px] font-bold opacity-40 mt-1 tracking-widest">+{replyTarget.phone}</p>
//                 </div>
//               </div>
//               <button onClick={() => setReplyTarget(null)} className="p-3 hover:bg-red-700/10 rounded-full text-red-700 transition-colors"><X size={24} /></button>
//             </div>

//             {/* Chat Messages Body */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f0f2f5] dark:bg-black/40 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075c.png')]">
//               {activeChat.map((msg, idx) => {
//                 const isMe = msg.direction === "outbound";
//                 return (
//                   <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}>
//                     <div className={`relative max-w-[80%] px-4 py-2 shadow-md ${
//                       isMe ? "bg-red-700 text-white rounded-l-2xl rounded-tr-2xl" : "bg-white dark:bg-zinc-800 text-black dark:text-white rounded-r-2xl rounded-tl-2xl"
//                     }`}>
//                       <p className="text-sm font-medium whitespace-pre-wrap">{msg.text || `Template: ${msg.templateName}`}</p>
//                       <div className={`text-[9px] mt-1 flex items-center gap-1 opacity-60 ${isMe ? "justify-end" : "justify-start"}`}>
//                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         {isMe && (msg.status === "read" ? <CheckCheck size={12}/> : <Check size={12}/>)}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Chat Input */}
//             <div className="p-6 bg-white dark:bg-black border-t border-white/5">
//               <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 p-2 rounded-[2rem] border border-transparent focus-within:border-red-700 transition-all">
//                 <textarea 
//                   rows="1"
//                   placeholder={isRTL ? "اكتب ردك لـ VESTRO..." : "Type your reply..."}
//                   className="flex-1 bg-transparent border-none outline-none py-3 px-4 resize-none text-sm font-medium"
//                   value={replyText}
//                   onChange={(e) => setReplyText(e.target.value)}
//                   onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
//                 />
//                 <button 
//                   disabled={sending || !replyText.trim()}
//                   onClick={handleSendReply}
//                   className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-lg"
//                 >
//                   {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={20} />}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//      {/* --- QUICK STATUS MODAL (المعدل) --- */}
// {selectedHistory && (
//   <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//     <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 relative border border-white/10 shadow-2xl">
//       <button 
//         onClick={() => setSelectedHistory(null)} 
//         className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
//       >
//         <X size={24}/>
//       </button>

//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-2 h-8 bg-red-700 rounded-full" />
//         <h2 className="text-xl font-black    uppercase text-red-700 tracking-tighter">
//           {isRTL ? "آخر تحديث للرسالة" : "Latest Message Update"}
//         </h2>
//       </div>

//       <div className="space-y-6">
//         {/* تفاصيل الرسالة */}
//         <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
//           <div className="flex justify-between items-start mb-4">
//             <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-red-700 text-white rounded-full">
//               {selectedHistory.direction === "inbound" 
//                 ? (isRTL ? "من العميل" : "FROM CUSTOMER") 
//                 : (isRTL ? "من فيسترو" : "FROM VESTRO")}
//             </span>
//             <span className="text-[10px] opacity-40 font-bold">
//               {new Date(selectedHistory.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
//             </span>
//           </div>
          
//           <p className="text-sm font-medium    opacity-90 leading-relaxed">
//             "{selectedHistory.text || selectedHistory.templateName}"
//           </p>
//         </div>

//         {/* الحالة النهائية */}
//         <div className="flex items-center justify-between px-2">
//           <div className="flex items-center gap-3">
//             <div className={`p-3 rounded-2xl ${getStatusStyle(selectedHistory.status).bg}`}>
//               {getStatusStyle(selectedHistory.status).icon}
//             </div>
//             <div>
//               <div className="text-[10px] opacity-40 font-black uppercase tracking-widest">Status</div>
//               <div className={`text-sm font-black uppercase    ${getStatusStyle(selectedHistory.status).color}`}>
//                 {getStatusStyle(selectedHistory.status).label}
//               </div>
//             </div>
//           </div>

//           {/* أيقونة توضيحية للنجاح */}
//           {selectedHistory.status === 'read' && (
//             <div className="text-[10px] text-green-500 font-bold flex items-center gap-1 animate-bounce">
//                {isRTL ? "تمت القراءة بنجاح" : "Successfully Read"}
//             </div>
//           )}
//         </div>
//       </div>

//       <button 
//         onClick={() => {
//           openChat(selectedHistory);
//           setSelectedHistory(null);
//         }}
//         className="w-full mt-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase    text-xs hover:bg-red-700 hover:text-white transition-all tracking-[0.2em]"
//       >
//         {isRTL ? "فتح المحادثة كاملة" : "Open Full Conversation"}
//       </button>
//     </div>
//   </div>
// )}
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { 
  Search, Reply, MessageCircle, CheckCheck, Check, 
  Clock, AlertCircle, X, User, Send, Mic, Headset
} from "lucide-react";

export default function MessageLogs() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeChat, setActiveChat] = useState([]); 
  const [replyTarget, setReplyTarget] = useState(null); 
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const chatEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeChat.length > 0) scrollToBottom();
  }, [activeChat]);

 const fetchLogs = async () => {
  try {
    setLoading(true);
    console.log("🔍 [VESTRO LOGS] Fetching logs for search:", search); // تتبع البحث
    const { data } = await axios.get("/messages", { params: { search } });
    console.log("✅ [VESTRO LOGS] Logs received:", data.messages.length, "messages found");
    setLogs(data.messages);
  } catch (err) { 
    console.error("❌ [VESTRO LOGS] Error fetching logs:", err.response?.data || err.message); 
  } finally { setLoading(false); }
};

  useEffect(() => {
    const handler = setTimeout(fetchLogs, 500);
    return () => clearTimeout(handler);
  }, [search]);

 
const openChat = async (msg) => {
  console.log("📂 [VESTRO LOGS] Opening chat for phone:", msg.phone);
  setReplyTarget(msg);
  setActiveChat([]); 
  
  try {
    const { data } = await axios.get(`/whatsapp/chat/${msg.phone}`);
    if (data.success) {
      console.log("📩 [VESTRO LOGS] Chat history loaded:", data.messages.length, "messages");
      
      // ابحث عن أول رسالة تحتوي على ميديا للتأكد من المسمى الصحيح للحقل
      const mediaMsg = data.messages.find(m => m.mediaUrl || m.url || m.fileUrl);
      if (mediaMsg) {
        console.log("👁️‍🗨️ [VESTRO LOGS] Media found in chat:", mediaMsg.mediaUrl || mediaMsg.url);
      } else {
        console.log("ℹ️ [VESTRO LOGS] No media found in this chat history.");
      }

      setActiveChat(data.messages);
    } 
    // ... باقي الكود
  } catch (err) { /* ... */ }
};

useEffect(() => {
  let interval;
  if (replyTarget) {
    console.log("⏱️ [VESTRO LOGS] Auto-sync started for:", replyTarget.phone);
    interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/whatsapp/chat/${replyTarget.phone}`);
        if (data.success) {
          if (activeChat.length !== data.messages.length) {
            console.log("🔄 [VESTRO LOGS] New messages detected! Updating UI...");
            setActiveChat(data.messages);
          }
        }
      } catch (err) { console.error("❌ [VESTRO LOGS] Auto-sync failed", err.message); }
    }, 3000); 
  }
  return () => {
    if (interval) console.log("🛑 [VESTRO LOGS] Auto-sync stopped");
    clearInterval(interval);
  };
}, [replyTarget, activeChat.length]); // أضفت activeChat.length هنا لضمان دقة المقارنة

const handleSendReply = async () => {
  if (!replyText.trim() || sending) return;
  
  const tempMsgContent = replyText;
  setSending(true);

  try {
    const res = await axios.post("/whatsapp/send", { 
      phone: replyTarget.phone, 
      message: tempMsgContent, 
      type: "text" 
    });
    
    if (res.data.success) {
      console.log("🎯 [VESTRO LOGS] Message sent successfully. DB ID:", res.data.dbId);
      
      // التعديل هنا: تحديث حالة الـ activeChat فوراً بالرسالة الجديدة
      const newMessage = {
        _id: res.data.dbId || Date.now().toString(), // استخدم ID الـ DB أو ID مؤقت
        text: tempMsgContent,
        direction: "outbound",
        status: "sent",
        createdAt: new Date().toISOString(),
        type: "text"
      };

      setActiveChat((prev) => [...prev, newMessage]); // إضافة الرسالة للقائمة فوراً
      setReplyText(""); // مسح صندوق الكتابة
      
      // التمرير لأسفل المحادثة
      setTimeout(scrollToBottom, 100);
    }
  } catch (err) { 
    console.error("❌ [VESTRO LOGS] Send failed:", err.response?.data || err.message);
    alert(isRTL ? "فشل إرسال الرسالة" : "Error sending message"); 
  } finally { 
    setSending(false); 
  }
};

  const getStatusStyle = (status) => {
    switch (status) {
      case "read": return { color: "text-sky-500", icon: <CheckCheck size={14} />, label: isRTL ? "مقروء" : "READ", bg: "bg-sky-500/10" };
      case "delivered": return { color: "text-green-500", icon: <Check size={14} />, label: isRTL ? "مستلم" : "DELIVERED", bg: "bg-green-500/10" };
      case "failed": return { color: "text-red-600", icon: <AlertCircle size={14} />, label: isRTL ? "فشل" : "FAILED", bg: "bg-red-600/10" };
      default: return { color: "text-slate-400", icon: <Clock size={14} />, label: isRTL ? "مرسل" : "SENT", bg: "bg-slate-400/10" };
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-10 px-4 bg-white dark:bg-[#050505] transition-colors duration-300 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase    tracking-tighter text-red-700 flex items-center gap-3">
              <Headset className="w-10 h-10" /> VESTRO LOGS
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-bold ml-1">Live Communication Core</p>
          </div>
          <div className="relative group">
            <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-red-700 group-focus-within:opacity-100 transition-all`} size={18} />
            <input
              type="text"
              placeholder={isRTL ? "بحث برقم الهاتف..." : "Search leads..."}
              className={`w-full md:w-80 ${isRTL ? "pr-12 pl-6" : "pl-12 pr-6"} py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-red-700/50 focus:border-red-700 transition-all shadow-sm`}
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[9px] font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th className="px-8 py-5 text-start">{isRTL ? "العميل" : "Customer"}</th>
                  <th className="px-8 py-5 text-start">{isRTL ? "التفاعل الأخير" : "Activity"}</th>
                  <th className="px-8 py-5 text-start">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="px-8 py-5 text-center">{isRTL ? "إجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-red-700 border-t-transparent animate-spin rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-red-700   ">Syncing VESTRO Hub...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.map((msg) => {
                  const s = getStatusStyle(msg.status);
                  return (
                    <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg transition-transform group-hover:scale-110 ${msg.direction === 'inbound' ? 'bg-black dark:bg-zinc-800' : 'bg-red-700'}`}>
                             {msg.direction === 'inbound' ? <MessageCircle size={18}/> : <User size={18}/>}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase    tracking-tight">{msg.customer?.name || "New Client"}</div>
                            <div className="text-[11px] opacity-40 font-bold tabular-nums">+{msg.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="max-w-[200px] lg:max-w-xs">
                           <p className="text-xs font-medium truncate opacity-70    leading-relaxed">
      {msg.type === 'audio' ? (
        <span className="flex items-center gap-1.5 text-red-700"><Mic size="{14}"/> {isRTL ? "رسالة صوتية" : "Voice Note"}</span>
      ) : msg.type === 'image' ? (
        <span className="flex items-center gap-1.5 text-blue-500"><MessageCircle size="{14}"/> {isRTL ? "صورة" : "Photo"}</span>
      ) : (msg.text || msg.templateName)}
    </p>
                            <span className="text-[9px] opacity-30 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <button onClick={() => setSelectedHistory(msg)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black transition-all hover:brightness-110 ${s.color} ${s.bg}`}>
                          {s.icon} <span className="text-[9px] tracking-wider uppercase">{s.label}</span>
                        </button>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button onClick={() => openChat(msg)} className="w-10 h-10 inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-xl hover:bg-red-700 hover:text-white transition-all shadow-sm">
                          <Reply size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CHAT MODAL (Optimized) --- */}
      {replyTarget && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0b0b0b] w-full max-w-2xl h-[85vh] rounded-[2.5rem] flex flex-col border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-black">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-700 flex items-center justify-center text-white font-black text-xl shadow-red-700/20 shadow-xl">
                  {replyTarget.customer?.name?.charAt(0) || "V"}
                </div>
                <div>
                  <h3 className="font-black text-base uppercase    text-red-700 tracking-tight">{replyTarget.customer?.name || "Guest Lead"}</h3>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <p className="text-[10px] font-bold opacity-40 tracking-widest">+{replyTarget.phone}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setReplyTarget(null)} className="w-10 h-10 flex items-center justify-center hover:bg-red-700/10 rounded-full text-red-700 transition-all group">
                <X size={24} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

         {/* Chat Body */}
<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-[#080808] custom-scrollbar">
  {activeChat.map((msg, idx) => {
    const isMe = msg.direction === "outbound";
    const isAudio = msg.type === "audio";
    const isImage = msg.type === "image";
    
    // تأكد أن الرابط يبدأ بـ /api أو المسار اللي أنت عامله في الـ Proxy
    const mediaFullUrl = `http://localhost:5000${msg.mediaUrl}`;

    return (
      <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} w-full animate-in slide-in-from-bottom-2 duration-300`}>
        <div className={`relative max-w-[80%] px-4 py-3 shadow-sm ${
          isMe ? "bg-red-700 text-white rounded-2xl rounded-tr-none" : "bg-white dark:bg-zinc-800 text-black dark:text-white rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5"
        }`}>
          
          {/* 1. عرض الرسالة الصوتية */}
          {isAudio ? (
            <div className="flex flex-col gap-2 min-w-[240px] py-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-white/20 text-white" : "bg-red-700 text-white"}`}>
                  <Mic size={18} />
                </div>
                <audio
                  src={mediaFullUrl}
                  controls
                  className="w-full h-8 custom-audio-player" // يمكنك إضافة CSS لتصغير حجمه
                  preload="metadata"
                />
              </div>
            </div>
          ) 
          
          /* 2. عرض الصور */
          : isImage ? (
            <div className="flex flex-col gap-2">
              <img 
                src={mediaFullUrl} 
                alt="Whatsapp Media" 
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(mediaFullUrl, '_blank')}
              />
              {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
            </div>
          )
          
          /* 3. عرض النص العادي */
          : (
            <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
          )}
          
          {/* الطابع الزمني وحالة القراءة */}
          <div className={`text-[8px] mt-1.5 flex items-center gap-1 font-black uppercase opacity-60 ${isMe ? "justify-end" : "justify-start"}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isMe && (msg.status === "read" ? <CheckCheck size={10} className="text-sky-300"/> : <Check size={10}/>)}
          </div>
        </div>
      </div>
    );
  })}
  <div ref={chatEndRef} />
</div>

            {/* Input */}
            <div className="p-5 bg-white dark:bg-black border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-transparent focus-within:border-red-700/30 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all">
                <textarea 
                  rows="1"
                  placeholder={isRTL ? "أجب على العميل..." : "Type a secure reply..."}
                  className="flex-1 bg-transparent border-none outline-none py-3 px-4 resize-none text-sm font-medium placeholder:opacity-30"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                />
                <button 
                  disabled={sending || !replyText.trim()}
                  onClick={handleSendReply}
                  className="w-12 h-12 bg-red-700 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-lg shadow-red-700/20"
                >
                  {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STATUS MODAL (Minimal) --- */}
      {selectedHistory && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] p-8 relative border border-white/5 shadow-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-700" />
             <button onClick={() => setSelectedHistory(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-700 transition-colors"><X size={20}/></button>

             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">{isRTL ? "تفاصيل الحالة" : "Transaction Details"}</h2>

             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${getStatusStyle(selectedHistory.status).bg}`}>
                      {React.cloneElement(getStatusStyle(selectedHistory.status).icon, { size: 24, className: getStatusStyle(selectedHistory.status).color })}
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase opacity-40">Current Status</div>
                      <div className={`text-xl font-black    uppercase ${getStatusStyle(selectedHistory.status).color}`}>{getStatusStyle(selectedHistory.status).label}</div>
                   </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                   <p className="text-xs font-bold opacity-50 mb-2 uppercase tracking-tighter">{isRTL ? "محتوى الرسالة" : "Content Preview"}</p>
                   <p className="text-sm font-medium   ">"{selectedHistory.text || "Media Object"}"</p>
                </div>
                
                <button 
                  onClick={() => { openChat(selectedHistory); setSelectedHistory(null); }}
                  className="w-full py-4 bg-red-700 text-white rounded-xl font-black uppercase    text-[10px] hover:bg-black transition-all tracking-[0.2em] shadow-lg shadow-red-700/20"
                >
                  {isRTL ? "الدخول للمحادثة" : "Go to Conversation"}
                </button>
             </div>
          </div>
        </div> 
      )}
    </div>
  ); 
}