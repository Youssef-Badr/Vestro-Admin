import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { io } from "socket.io-client";
import { 
  Search, CheckCheck, Check, User, Send, Headset, 
  MessageCircle, ChevronLeft, MoreVertical, Paperclip
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL ;

export default function MessageLogs() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [logs, setLogs] = useState([]); 
  const [activeChat, setActiveChat] = useState([]); 
  const [replyTarget, setReplyTarget] = useState(null); 
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const socket = useRef(null);
  const chatEndRef = useRef(null);
  
 // 1. المرجع لمراقبة الشات الحالي
  const activePhoneRef = useRef(null);
  useEffect(() => {
    activePhoneRef.current = replyTarget?.phone;
  }, [replyTarget]);

  // 2. إعداد السوكيت
  useEffect(() => {
   socket.current = io(SOCKET_URL, {

    

  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.current.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED");
});

socket.current.on("disconnect", (reason) => {
  console.log("🔴 SOCKET DISCONNECTED:", reason);
});

socket.current.on("connect_error", (err) => {
  console.log("❌ SOCKET ERROR:", err.message);
});
    socket.current.on("receive-message", (newMessage) => {
      console.log("New Message Received:", newMessage);

      // ✅ التحديث اللحظي للقائمة الجانبية (Logs)
      setLogs((currentLogs) => {
        // حذف النسخة القديمة من العميل لو موجودة
        const otherLogs = currentLogs.filter(l => l.phone !== newMessage.phone);
        // وضع الرسالة الجديدة في أول القائمة
        return [newMessage, ...otherLogs];
      });

      // ✅ التحديث اللحظي للشات المفتوح (بدون خروج ودخول)
      if (activePhoneRef.current === newMessage.phone) {
        setActiveChat((currentActive) => {
          // التأكد من عدم تكرار الرسالة (بناءً على ID)
          const isDuplicate = currentActive.some(m => m._id === newMessage._id);
          if (isDuplicate) return currentActive;
          return [...currentActive, newMessage];
        });
      }
    });

    return () => { if (socket.current) socket.current.disconnect(); };
  }, []); // المصفوفة فارغة لضمان ثبات الاتصال
  const scrollToBottom = (behavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (activeChat.length > 0) {
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  }, [activeChat]);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get("/messages", { params: { search } });
      setLogs(data.messages);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const handler = setTimeout(fetchLogs, 500);
    return () => clearTimeout(handler);
  }, [search]);

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
    const content = replyText;
    setSending(true);
    try {
      const res = await axios.post("/whatsapp/send", { 
        phone: replyTarget.phone, message: content, type: "text" 
      });
      if (res.data.success) {
        const newMessage = {
          _id: Date.now().toString(),
          text: content,
          direction: "outbound",
          status: "sent",
          createdAt: new Date().toISOString(),
          type: "text"
        };
        setActiveChat((prev) => [...prev, newMessage]);
        setReplyText("");
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  // ✅ وظيفة عرض الميديا (تم تعديل الأوديو ليظهر فوراً)
  const renderMedia = (msg) => {
    let mediaUrl = msg.mediaUrl;
    if (mediaUrl?.includes('http')) mediaUrl = mediaUrl.substring(mediaUrl.lastIndexOf('http'));

    if (msg.type === "text" || !mediaUrl) {
      return <p className="text-[14.5px] leading-relaxed break-words">{msg.text}</p>;
    }

    if (msg.type === "image") {
      return <img src={mediaUrl} className="rounded-lg max-h-72 object-cover cursor-pointer" alt="img" onClick={() => window.open(mediaUrl)}/>;
    }

    if (msg.type === "audio" || msg.type === "voice") {
      return (
        <div className="pt-2 pb-1 min-w-[240px]"> 
          <audio 
            src={mediaUrl} 
            controls 
            preload="metadata" // يخلي المتصفح يجهز الملف فوراً
            className="w-full h-10 custom-audio" 
          />
        </div>
      );
    }
    return <p className="text-xs    opacity-50">Media: {msg.type}</p>;
  };

  return (
    <div className={`flex flex-col h-screen bg-[#f0f2f5] dark:bg-[#0c0c0c] ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-1 overflow-hidden pt-16 md:pt-20">
        
        {/* SIDEBAR */}
        <div className={`w-full md:w-[400px] flex flex-col bg-white dark:bg-[#111] border-e border-gray-200 dark:border-white/5 ${replyTarget ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 space-y-4">
            <h1 className="text-2xl font-black text-red-700    flex items-center gap-2">
                <Headset />   VESTRO WhatsApp 
            </h1>
            <div className="relative">
              <Search className={`${isRTL ? "right-3" : "left-3"} absolute top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input 
                type="text" 
                placeholder={isRTL ? "بحث..." : "Search..."}
                className={`w-full bg-gray-100 dark:bg-white/5 rounded-xl py-2 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} text-sm outline-none`}
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {logs.map((msg) => (
              <div 
                key={msg._id} 
                onClick={() => openChat(msg)}
                className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.03] ${replyTarget?.phone === msg.phone ? 'bg-gray-100 dark:bg-white/5' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-red-700 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                    {msg.customer?.name?.charAt(0) || <User size={20}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-bold truncate dark:text-gray-200">{msg.customer?.name || msg.phone}</h3>
                    <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate   ">{msg.text || (msg.type !== 'text' && 'Media Message')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`flex-1 flex flex-col relative ${!replyTarget ? 'hidden md:flex' : 'flex'}`}>
          {replyTarget ? (
            <>
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-4 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/5 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setReplyTarget(null)} className="md:hidden p-1 rounded-full"><ChevronLeft size={24} className={isRTL ? "rotate-180" : ""} /></button>
                  <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold">{replyTarget.customer?.name?.charAt(0) || "V"}</div>
                  <div>
                    <h2 className="text-sm font-black dark:text-white uppercase">{replyTarget.customer?.name || replyTarget.phone}</h2>
                    <p className="text-[10px] text-green-500 font-bold animate-pulse">LIVE CONNECTED</p>
                  </div>
                </div>
                <MoreVertical className="opacity-40" size={20} />
              </div>

              {/* Messages Body */}
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-[#e5ddd5] dark:bg-[#0b0b0b] relative"
                style={{ 
                    backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                    backgroundBlendMode: 'overlay', backgroundSize: '400px'
                }}
              >
                {activeChat.map((msg, idx) => {
                  const isMe = msg.direction === "outbound";
                  return (
                    <div key={msg._id || idx} className={`flex w-full mb-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`relative max-w-[85%] md:max-w-[70%] px-3 py-2 shadow-sm rounded-lg ${isMe ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none"}`}>
                        {renderMedia(msg)}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (msg.status === "read" ? <CheckCheck size={14} className="text-blue-400"/> : <Check size={14} className="text-gray-400"/>)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#f0f2f5] dark:bg-[#111] flex items-end gap-2 z-10">
                <Paperclip className="mb-3 text-gray-500 cursor-pointer" size={22} />
                <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
                    <textarea 
                        rows="1"
                        placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                        className="w-full bg-transparent border-none outline-none py-3 px-4 text-[15px] dark:text-white resize-none"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                    />
                </div>
                <button 
                  disabled={sending || !replyText.trim()}
                  onClick={handleSendReply}
                  className="mb-1 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50"
                >
                  {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={20} className={isRTL ? "rotate-180" : ""} />}
                </button>
              </div>
            </>
          ) : (
            <div key={replyTarget?.phone || 'empty'} className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#111] opacity-40">
              <MessageCircle size={64} />
              <h2 className="text-xl font-black mt-4 uppercase">{isRTL ? "اختر محادثة" : "Select a conversation"}</h2>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-arabic { font-family: 'Cairo', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        /* استايل مشغل الصوت */
        .custom-audio::-webkit-media-controls-enclosure { background-color: transparent; }
        .dark .custom-audio { filter: invert(100%) hue-rotate(180deg) brightness(1.5); }
      `}} />
    </div>
  ); 
}