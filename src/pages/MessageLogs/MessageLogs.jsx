
import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { 
  Search, Reply, MessageCircle, CheckCheck, Check, 
  Clock, AlertCircle, X, User, Send, Mic, Headset, Image as ImageIcon, Video, Play
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

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeChat.length > 0) scrollToBottom();
  }, [activeChat]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/messages", { params: { search } });
      setLogs(data.messages);
    } catch (err) { 
      console.error("Error fetching logs:", err); 
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = setTimeout(fetchLogs, 500);
    return () => clearTimeout(handler);
  }, [search]);
// التحديث التلقائي للشات المفتوح واللوجز
useEffect(() => {
  const interval = setInterval(() => {
    // تحديث اللوجز الخارجية
    fetchLogs();
    
    // لو فيه شات مفتوح، حدث الرسايل اللي جواه
    if (replyTarget) {
      updateActiveChat(replyTarget.phone);
    }
  }, 2000); // كل 5 ثواني (تقدر تخليها 3000 لو السيرفر سريع)

  return () => clearInterval(interval);
}, [replyTarget, search]);

// دالة مخصصة لتحديث الشات النشط فقط بدون مسح الشاشة
const updateActiveChat = async (phone) => {
  try {
    const { data } = await axios.get(`/whatsapp/chat/${phone}`);
    if (data.success) {
      // بنقارن الطول عشان ما نحدثش الـ State لو مفيش جديد (عشان الأداء)
      setActiveChat(data.messages);
    }
  } catch (err) {
    console.error("Auto-sync failed", err);
  }
};
  const openChat = async (msg) => {
    setReplyTarget(msg);
    setActiveChat([]); 
    try {
      const { data } = await axios.get(`/whatsapp/chat/${msg.phone}`);
      if (data.success) setActiveChat(data.messages);
    } catch (err) { console.error("Chat loading failed", err); }
  };

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
        const newMessage = {
          _id: res.data.dbId || Date.now().toString(),
          text: tempMsgContent,
          direction: "outbound",
          status: "sent",
          createdAt: new Date().toISOString(),
          type: "text"
        };
        setActiveChat((prev) => [...prev, newMessage]);
        setReplyText("");
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) { alert(isRTL ? "فشل الإرسال" : "Send failed"); }
    finally { setSending(false); }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "read": return { color: "text-sky-500", icon: <CheckCheck size={14} />, label: isRTL ? "مقروء" : "READ", bg: "bg-sky-500/10" };
      case "delivered": return { color: "text-green-500", icon: <Check size={14} />, label: isRTL ? "مستلم" : "DELIVERED", bg: "bg-green-500/10" };
      case "failed": return { color: "text-red-600", icon: <AlertCircle size={14} />, label: isRTL ? "فشل" : "FAILED", bg: "bg-red-600/10" };
      default: return { color: "text-slate-400", icon: <Clock size={14} />, label: isRTL ? "مرسل" : "SENT", bg: "bg-slate-400/10" };
    }
  };

  const renderMedia = (msg, isMe) => {
    // بفضل Cloudinary، الـ mediaUrl هو الرابط النهائي المباشر
    const mediaUrl = msg.mediaUrl;
if (!mediaUrl) return <p className="text-sm italic opacity-50">Media missing</p>;

    if (msg.type === "audio") {
      return (
        <div className="flex flex-col gap-2 min-w-[220px] md:min-w-[280px] p-1">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-white/20 text-white" : "bg-red-700 text-white"}`}>
              <Mic size={18}/>
            </div>
            {/* نستخدم التاج الأصلي مباشرة ونمرر الرابط الصافي */}
            <audio 
              key={mediaUrl} // مفتاح فريد عشان المتصفح ميعلقش على ريكورد قديم
              src={mediaUrl} 
              controls 
              className="w-full h-8 accent-red-700" 
              preload="metadata"
            />
          </div>
        </div>
      );
    }

   if (msg.type === "image") {
      return (
        <div className="group relative">
          <img 
            src={mediaUrl} 
            alt="Vestro Chat Media" 
            className="rounded-xl max-h-72 w-full object-cover cursor-zoom-in border border-black/5 dark:border-white/5 shadow-sm" 
            onClick={() => window.open(mediaUrl, '_blank')}
            // لو الصورة فشلت في التحميل بسبب الرابط المكسور، جرب تفتح الرابط الصافي
            onError={(e) => {
                if(mediaUrl.includes('http')) {
                    e.target.src = mediaUrl.split('http')[1] ? 'http' + mediaUrl.split('http')[1] : mediaUrl;
                }
            }}
          />
          {msg.text && msg.text !== "📷 Photo Received" && (
            <p className="text-sm mt-2 opacity-90">{msg.text}</p>
          )}
        </div>
      );
    }
    if (msg.type === "video") {
      return (
        <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-sm border border-white/10 shadow-lg">
          <video src={mediaUrl} className="w-full h-full" controls preload="metadata" />
        </div>
      );
    }

    return <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>;
  };

  return (
    <div className={`min-h-screen pt-16 md:pt-24 pb-10 px-4 bg-white dark:bg-[#050505] transition-all ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-red-700 flex items-center gap-3 italic">
              <Headset className="w-8 h-8 md:w-10 md:h-10" /> VESTRO STORE LOGS
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold ml-1">Secure Communication Hub</p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-red-700 transition-colors`} size={18} />
            <input
              type="text"
              placeholder={isRTL ? "بحث برقم الهاتف..." : "Search phone numbers..."}
              className="w-full pr-12 pl-12 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-red-700/30 transition-all shadow-sm"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* LOGS TABLE CONTAINER */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start hidden md:table">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th className="px-8 py-6 text-start">{isRTL ? "العميل" : "Customer"}</th>
                  <th className="px-8 py-6 text-start">{isRTL ? "آخر تفاعل" : "Last Activity"}</th>
                  <th className="px-8 py-6 text-start">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="px-8 py-6 text-center">{isRTL ? "فتح الشات" : "Open Chat"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading ? (
                   <tr><td colSpan="4" className="py-32 text-center">
                     <div className="flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-red-700 border-t-transparent animate-spin rounded-full"/>
                       <span className="text-[10px] font-black uppercase tracking-widest text-red-700 italic">Syncing VESTRO Hub...</span>
                     </div>
                   </td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center opacity-40 uppercase font-bold text-xs tracking-widest">No logs found</td></tr>
                ) : logs.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer" onClick={() => openChat(msg)}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg transition-transform group-hover:scale-105 ${msg.direction === 'inbound' ? 'bg-zinc-800' : 'bg-red-700'}`}>
                          {msg.customer?.name?.charAt(0) || <User size={18}/>}
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight">{msg.customer?.name || "New Lead"}</div>
                          <div className="text-[10px] opacity-40 font-bold tabular-nums">+{msg.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="max-w-[220px] truncate opacity-70 italic text-xs font-medium">
                        {msg.type === 'audio' ? 'Voice Message 🎤' : msg.type === 'image' ? 'Sent an Image 📸' : msg.text}
                      </div>
                      <span className="text-[9px] opacity-30 block mt-1">{new Date(msg.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[9px] tracking-widest uppercase ${getStatusStyle(msg.status).bg} ${getStatusStyle(msg.status).color}`}>
                        {getStatusStyle(msg.status).icon} {getStatusStyle(msg.status).label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button className="w-10 h-10 inline-flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl group-hover:bg-red-700 group-hover:text-white transition-all shadow-sm">
                        <Reply size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile View Card List */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
              {logs.map(msg => (
                <div key={msg._id} className="p-5 flex items-center justify-between active:bg-gray-50 dark:active:bg-white/5 transition-colors" onClick={() => openChat(msg)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-700/20">{msg.customer?.name?.charAt(0)}</div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{msg.customer?.name || "Client"}</h4>
                      <p className="text-[10px] opacity-40 font-bold">+{msg.phone}</p>
                      <p className="text-[10px] mt-1 italic opacity-60 truncate max-w-[150px]">{msg.type === 'text' ? msg.text : msg.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[8px] opacity-30 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <Reply size={16} className="text-red-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- CHAT MODAL --- */}
      {replyTarget && (
        <div className="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0b0b0b] w-full md:max-w-2xl h-[92vh] md:h-[85vh] rounded-t-[2.5rem] md:rounded-[3rem] flex flex-col overflow-hidden border border-white/5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-black">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-700 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-red-700/20">
                  {replyTarget.customer?.name?.charAt(0) || "V"}
                </div>
                <div>
                  <h3 className="font-black text-base uppercase text-red-700 tracking-tight italic">VESTRO SUPPORT</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold opacity-40 tracking-widest">+{replyTarget.phone}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setReplyTarget(null)} className="w-11 h-11 flex items-center justify-center hover:bg-red-700/10 rounded-full text-red-700 transition-all">
                <X size={24}/>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-gray-50/50 dark:bg-[#080808] custom-scrollbar">
              {activeChat.map((msg, idx) => {
                const isMe = msg.direction === "outbound";
                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`relative max-w-[85%] md:max-w-[80%] p-4 rounded-[1.5rem] shadow-sm transition-all hover:shadow-md ${
                      isMe ? "bg-red-700 text-white rounded-tr-none" : "bg-white dark:bg-zinc-800 text-black dark:text-white rounded-tl-none border border-black/5 dark:border-white/5"
                    }`}>
                      {renderMedia(msg, isMe)}
                      <div className={`text-[8px] mt-2 flex items-center gap-1 opacity-60 font-black uppercase ${isMe ? "justify-end" : "justify-start"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (msg.status === "read" ? <CheckCheck size={10} className="text-sky-300"/> : <Check size={10}/>)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-5 md:p-8 bg-white dark:bg-black border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-zinc-900 p-2 rounded-[1.8rem] border border-transparent focus-within:border-red-700/40 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all shadow-inner">
                <textarea 
                  rows="1"
                  placeholder={isRTL ? "أجب على عميل فيسترو..." : "Reply to VESTRO client..."}
                  className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm font-medium placeholder:opacity-30 resize-none"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                />
                <button 
                  disabled={sending || !replyText.trim()}
                  onClick={handleSendReply}
                  className="w-12 h-12 bg-red-700 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-lg shadow-red-700/30"
                >
                  {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
}