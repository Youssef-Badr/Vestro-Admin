import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { io } from "socket.io-client";
import { 
  Search, CheckCheck, Check, User, Send, Headset, 
  MessageCircle, ChevronLeft, MoreVertical, Paperclip, 
  Clock, Trash2, ShoppingBag, Hash
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL;

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
  const activePhoneRef = useRef(null);

  // تحديث المرجع للهاتف النشط لمتابعة السوكيت فوراً وبدون رندر إضافي
  useEffect(() => {
    activePhoneRef.current = replyTarget?.phone;
  }, [replyTarget]);

  // دالة لعرض أيقونة الحالة (للرسائل الصادرة)
  const StatusIcon = ({ status, size = 16 }) => {
    if (status === "read") return <CheckCheck size={size} className="text-blue-500" />;
    if (status === "delivered") return <CheckCheck size={size} className="text-gray-400" />;
    if (status === "sent") return <Check size={size} className="text-gray-400" />;
    if (status === "failed") return <span className="text-red-500 text-[10px]">⚠️</span>;
    return <Clock size={size - 2} className="text-gray-300" />;
  };

  // دالة إرسال إشارة القراءة
  const markAsRead = useCallback((phone) => {
    if (socket.current?.connected) {
      socket.current.emit("mark_as_read", { phone });
    }
    setLogs((prev) =>
      prev.map((log) =>
        log.phone === phone ? { ...log, unreadCount: 0 } : log
      )
    );
  }, []);

  // دالة مسح أو إخفاء المحادثة (Soft Delete)
  const handleClearChat = async (phone) => {
    if (!window.confirm(isRTL ? "هل أنت متأكد من رغبتك في إخفاء هذه المحادثة؟" : "Are you sure you want to hide this chat?")) return;
    try {
      const res = await axios.delete(`/messages/clear/${phone}`);
      if (res.data.success) {
        if (activePhoneRef.current === phone) {
          setReplyTarget(null);
          setActiveChat([]);
        }
        setLogs((prev) => prev.filter((log) => log.phone !== phone));
      }
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  // إعداد وإدارة السوكيت بشكل آمن ومقاوم للتكرار والتسريب
  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    const currentSocket = socket.current;

    // 1. تحديث حالة الرسائل المقروءة والمستلمة لايف
    currentSocket.on("message_status_updated", (update) => {
      console.log("💡 Received status update from socket:", update);
      
      const updateIdStr = update.messageId?.toString();
      const updateWamIdStr = update.whatsappMessageId?.toString();

      setActiveChat((prev) => prev.map(msg => {
        const msgIdStr = msg._id?.toString();
        const msgWamIdStr = msg.whatsappMessageId?.toString();

        const isMatch = (updateIdStr && msgIdStr === updateIdStr) || 
                        (updateWamIdStr && msgWamIdStr === updateWamIdStr);
        return isMatch ? { ...msg, status: update.status } : msg;
      }));

      setLogs((prev) => prev.map(log => {
        const logIdStr = log._id?.toString();
        const logWamIdStr = log.whatsappMessageId?.toString();

        const isMatch = (updateIdStr && logIdStr === updateIdStr) || 
                        (updateWamIdStr && logWamIdStr === updateWamIdStr);
        return isMatch || log.phone === update.phone ? { ...log, status: update.status } : log;
      }));
    });

    // 2. الاستماع لحدث مسح الشات لايف لو تم مسحه من جهاز آخر
    currentSocket.on("chat_cleared", (data) => {
      console.log(`📡 Socket received "chat_cleared" for phone: ${data.phone}`);
      if (activePhoneRef.current === data.phone) {
        setReplyTarget(null);
        setActiveChat([]);
      }
      setLogs((prev) => prev.filter((log) => log.phone !== data.phone));
    });

    // 3. استقبال رسالة جديدة من عميل أو تحديث من السيرفر
    currentSocket.on("receive-message", (newMessage) => {
      const isChatOpen = activePhoneRef.current === newMessage.phone;

      if (isChatOpen && currentSocket.connected) {
        currentSocket.emit("mark_as_read", { phone: newMessage.phone });
      }

      if (isChatOpen) {
        setActiveChat((prev) => {
          if (newMessage.direction === "outbound") {
            const hasTemp = prev.some(msg => msg._id?.toString().startsWith("temp_"));
            if (hasTemp) {
              let replaced = false;
              return prev.map((msg) => {
                if (!replaced && msg._id?.toString().startsWith("temp_") && msg.text === newMessage.text) {
                  replaced = true;
                  return { ...newMessage, isRead: true };
                }
                return msg;
              });
            }
          }

          const newMsgIdStr = newMessage._id?.toString();
          const newWamIdStr = newMessage.whatsappMessageId?.toString();

          const isAlreadyExists = prev.some(msg => {
            const msgIdStr = msg._id?.toString();
            const msgWamIdStr = msg.whatsappMessageId?.toString();
            return (newMsgIdStr && msgIdStr === newMsgIdStr) || (newWamIdStr && msgWamIdStr === newWamIdStr);
          });

          if (isAlreadyExists) return prev;
          return [...prev, { ...newMessage, isRead: true }];
        });
      }

      // تحديث القائمة الجانبية وترتيبها
      setLogs((prev) => {
        const existingLog = prev.find(l => l.phone === newMessage.phone);
        const currentUnread = existingLog?.unreadCount || 0;
        const newUnreadCount = isChatOpen ? 0 : currentUnread + 1;

        const filtered = prev.filter(l => l.phone !== newMessage.phone);
        const updatedLog = {
          ...newMessage,
          unreadCount: newUnreadCount,
          customer: existingLog?.customer || newMessage.customer || { name: "Unknown Customer" }
        };
        return [updatedLog, ...filtered];
      });
    });
return () => {
      currentSocket.off("message_status_updated");
      currentSocket.off("chat_cleared");
      currentSocket.off("receive-message");
      
      // لا تفصل السوكيت بعنف إلا لو كان متصلاً بالفعل لتجنب أخطاء الفريم ورك في الـ Console
      if (currentSocket.connected) {
        currentSocket.disconnect();
      }
    };
  }, []); 

  const scrollToBottom = useCallback((behavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (activeChat.length > 0) {
      const timer = setTimeout(() => scrollToBottom("smooth"), 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat, scrollToBottom]);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get("/messages", { params: { search } });
      setLogs(data.messages || []);
    } catch (err) { 
      console.error("Error fetching logs:", err); 
    }
  };

  useEffect(() => {
    const handler = setTimeout(fetchLogs, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // فتح المحادثة
  const openChat = async (msg) => {
    setReplyTarget(msg);
    setActiveChat([]); 
    markAsRead(msg.phone);

    try {
      const { data } = await axios.get(`/whatsapp/chat/${msg.phone}`);
      if (data.success) {
        setActiveChat(data.messages || []);
      }
    } catch (err) { 
      console.error("Chat loading failed", err); 
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    const content = replyText;
    const tempId = "temp_" + Date.now().toString(); 
    
    setSending(true);
    setReplyText("");

    const optimisticMessage = {
      _id: tempId,
      text: content,
      direction: "outbound",
      status: "pending",
      createdAt: new Date().toISOString(),
      type: "text"
    };
    setActiveChat((prev) => [...prev, optimisticMessage]);

    try {
      const res = await axios.post("/whatsapp/send", { 
        phone: replyTarget.phone, message: content, type: "text" 
      });
      
      if (res.data.success) {
        const finalMessage = {
          _id: res.data.messageId || tempId,
          whatsappMessageId: res.data.whatsappMessageId,
          text: content,
          direction: "outbound",
          status: "sent",
          createdAt: new Date().toISOString(),
          type: "text"
        };

        setActiveChat((prev) => 
          prev.map(msg => msg._id?.toString() === tempId ? finalMessage : msg)
        );

        setLogs((prev) => {
          const filtered = prev.filter(l => l.phone !== replyTarget.phone);
          const updatedLog = { 
            ...replyTarget, 
            text: content, 
            status: 'sent', 
            createdAt: finalMessage.createdAt, 
            direction: 'outbound', 
            whatsappMessageId: res.data.whatsappMessageId,
            unreadCount: 0 
          };
          return [updatedLog, ...filtered];
        });
      }
    } catch (err) { 
      console.error(err);
      setActiveChat((prev) => 
        prev.map(msg => msg._id?.toString() === tempId ? { ...msg, status: "failed" } : msg)
      );
    } finally { 
      setSending(false); 
    }
  };

  const renderMedia = (msg) => {
    if (msg.type === "text" && !msg.mediaUrl) {
      return <p className="text-[14.5px] leading-tight whitespace-pre-wrap">{msg.text}</p>;
    }

    // 📥 معالجة وعرض كارت الأوردر القادم من الكاتالوج بشكل فاخر احترافي
    if (msg.type === "order") {
      const items = msg.orderDetails?.product_items || [];
      const totalCartPrice = items.reduce((sum, item) => sum + (item.item_price * item.quantity), 0);
      const currencyStr = items[0]?.currency || (isRTL ? "ج.م" : "EGP");

      return (
        <div className="w-full min-w-[260px] max-w-sm rounded-xl overflow-hidden bg-white/95 dark:bg-[#182229] border border-red-500/10 dark:border-red-500/20 shadow-md">
          {/* Header الكارت */}
          <div className="bg-gradient-to-r from-red-800 to-red-600 px-3.5 py-2.5 flex items-center justify-between text-white shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="animate-pulse" />
              <span className="text-[13px] font-black tracking-wide uppercase">
                {isRTL ? "طلب شراء جديد" : "NEW CATALOG ORDER"}
              </span>
            </div>
            {msg.orderDetails?.catalog_id && (
              <div className="flex items-center gap-0.5 text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono" title="Catalog ID">
                <Hash size={10} />
                <span>{msg.orderDetails.catalog_id.slice(-6)}</span>
              </div>
            )}
          </div>

          {/* قائمة المنتجات المطلوبة */}
          <div className="p-3.5 space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 text-xs border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate" title={item.product_retailer_id}>
                      {item.product_retailer_id}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5 tabular-nums">
                      {isRTL ? "الكمية:" : "Qty:"} <span className="font-bold text-red-600 dark:text-red-400">{item.quantity}</span>
                    </p>
                  </div>
                  <div className="text-end shrink-0 tabular-nums">
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      {(item.item_price * item.quantity).toLocaleString()}
                    </span>
                    <span className="text-[10px] opacity-60 ms-1">{currencyStr}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">{isRTL ? "لا توجد تفاصيل للمنتجات" : "No product items included"}</p>
            )}
          </div>

          {/* لو العميل كاتب كومنت مع الأوردر */}
          {msg.orderDetails?.text && (
            <div className="mx-3.5 mb-3.5 p-2 bg-gray-50 dark:bg-black/20 border-s-2 border-red-500 rounded text-[12.5px] italic text-slate-600 dark:text-slate-300">
              "{msg.orderDetails.text}"
            </div>
          )}

          {/* الإجمالي السفلي للكارت */}
          <div className="bg-gray-50 dark:bg-black/30 px-3.5 py-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold shadow-inner">
            <span className="text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي قيمة المنتجات:" : "Total Price:"}</span>
            <span className="text-[14px] font-black text-red-700 dark:text-red-400 tabular-nums">
              {totalCartPrice.toLocaleString()} <span className="text-[10px] font-bold opacity-80">{currencyStr}</span>
            </span>
          </div>
        </div>
      );
    }

    // حماية إضافية لو الـ mediaUrl مش موجود نهائياً لأي سبب لكي لا يحدث كراش
    if (!msg.mediaUrl) {
      return <p className="text-[14.5px] leading-tight text-gray-400 italic">{isRTL ? "ملف وسائط غير صالح" : "Invalid media file"}</p>;
    }

    const mediaUrl = msg.mediaUrl.includes('http') ? msg.mediaUrl.substring(msg.mediaUrl.lastIndexOf('http')) : msg.mediaUrl;

    if (msg.type === "image") {
      return <img src={mediaUrl} className="rounded-md max-h-80 w-full object-cover cursor-zoom-in" alt="media" onClick={() => window.open(mediaUrl)}/>;
    }
    if (msg.type === "audio" || msg.type === "voice") {
      return (
        <div className="pt-1 min-w-[220px]">
          <audio src={mediaUrl} controls preload="metadata" className="w-full h-8 custom-audio" />
        </div>
      );
    }
    return <div className="p-2 bg-black/5 rounded text-xs">📎 Attachment: {msg.type}</div>;
  };

  return (
    <div className={`flex flex-col h-screen bg-[#f0f2f5] dark:bg-[#0c0c0c] text-slate-900 dark:text-slate-100 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-1 overflow-hidden pt-16 md:pt-20">
        
        {/* SIDEBAR */}
        <div className={`w-full md:w-[380px] flex flex-col bg-white dark:bg-[#111] border-e border-gray-200 dark:border-white/5 ${replyTarget ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-red-700 flex items-center gap-2">
                <Headset size={24}/> VESTRO <span className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">LIVE</span>
              </h1>
            </div>
            <div className="relative group">
              <Search className={`${isRTL ? "right-3" : "left-3"} absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors`} size={18} />
              <input 
                type="text" 
                placeholder={isRTL ? "بحث في المحادثات..." : "Search conversations..."}
                className={`w-full bg-gray-100 dark:bg-white/5 rounded-xl py-2.5 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} text-sm outline-none border border-transparent focus:border-red-500/50 transition-all`}
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {logs.map((msg) => {
              const hasUnread = msg.unreadCount > 0;
              return (
                <div 
                  key={msg._id} 
                  onClick={() => openChat(msg)}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors 
                    ${replyTarget?.phone === msg.phone ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                    ${hasUnread ? 'bg-green-50/30 dark:bg-green-500/[0.03]' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md relative">
                    {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name.charAt(0).toUpperCase() : <User size={22}/>}
                    {hasUnread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`text-[14px] truncate ${hasUnread ? 'font-black text-black dark:text-white' : 'font-bold'}`}>
                        {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name : msg.phone}
                      </h3>
                      <span className={`text-[10px] tabular-nums ${hasUnread ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {msg.direction === "outbound" && <StatusIcon status={msg.status} size={14} />}
                        <p className={`text-xs truncate ${hasUnread ? 'text-black dark:text-slate-200 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                          {msg.text || '📷 Media'}
                        </p>
                      </div>
                      
                      {hasUnread && (
                        <span className="bg-green-500 text-white font-bold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                          {msg.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`flex-1 flex flex-col relative bg-[#f0f2f5] dark:bg-[#0c0c0c] ${!replyTarget ? 'hidden md:flex' : 'flex'}`}>
          {replyTarget ? (
            <>
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-4 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setReplyTarget(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft size={24} className={isRTL ? "rotate-180" : ""} />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold shadow-inner">
                      {replyTarget.customer?.name?.charAt(0) || "V"}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111] rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-sm font-black dark:text-white leading-tight">
                      {replyTarget.customer?.name || replyTarget.phone}
                    </h2>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] text-green-500 font-bold tracking-wider">ONLINE</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden sm:flex flex-col items-end px-3 border-e border-gray-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-gray-400">CUSTOMER PHONE</span>
                      <span className="text-[11px] font-mono">{replyTarget.phone}</span>
                   </div>
                   <button 
                     onClick={() => handleClearChat(replyTarget.phone)} 
                     title={isRTL ? "إخفاء المحادثة" : "Hide Chat"}
                     className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all"
                   >
                     <Trash2 size={20} />
                   </button>
                   <MoreVertical className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors" size={20} />
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 bg-[#e5ddd5] dark:bg-[#090909] relative custom-scrollbar">
                <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '350px' }} />
                
                {activeChat.map((msg, idx) => {
                  const isMe = msg.direction === "outbound";
                  const isOrder = msg.type === "order";
                  return (
                    <div key={msg._id || idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                      <div className={`relative max-w-[85%] md:max-w-[70%] shadow-sm rounded-xl 
                        ${isOrder 
                          ? "p-1 bg-transparent border-0 shadow-none" 
                          : isMe 
                            ? "px-3 pt-2 pb-1.5 bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-50 rounded-tr-none" 
                            : "px-3 pt-2 pb-1.5 bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 rounded-tl-none"
                        }`}
                      >
                        {renderMedia(msg)}
                        <div className={`flex items-center justify-end gap-1.5 mt-1 select-none ${isOrder ? "px-1 text-slate-500 dark:text-slate-400" : ""}`}>
                          <span className="text-[9px] font-medium opacity-60 uppercase">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                          {isMe && <StatusIcon status={msg.status} size={13} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#f0f2f5] dark:bg-[#111] flex items-end gap-2.5 z-20 border-t border-gray-200 dark:border-white/5">
                <div className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors text-gray-500">
                  <Paperclip size={22} />
                </div>
                <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden focus-within:ring-1 ring-red-500/30 transition-all">
                    <textarea 
                        rows="1"
                        placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                        className="w-full bg-transparent border-none outline-none py-3.5 px-4 text-[15px] dark:text-white resize-none max-h-32 custom-scrollbar"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                    />
                </div>
                <button 
                  disabled={sending || !replyText.trim()}
                  onClick={handleSendReply}
                  className="mb-0.5 w-12 h-12 bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-40 disabled:grayscale transition-all shrink-0"
                >
                  {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={20} className={isRTL ? "rotate-180" : "ml-0.5"} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-[#0c0c0c]">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-6 animate-bounce shadow-xl shadow-red-500/10">
                <MessageCircle size={48} />
              </div>
              <h2 className="text-2xl font-black mb-2 dark:text-white tracking-tight uppercase">
                {isRTL ? "منصة فيسترو للمحادثات" : "VESTRO CHAT HUB"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm leading-relaxed">
                {isRTL ? "اختر محادثة من القائمة الجانبية لبدء الرد على العملاء بشكل مباشر" : "Select a conversation from the sidebar to start responding to customers in real-time."}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .font-arabic { font-family: 'Cairo', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
        
        .custom-audio::-webkit-media-controls-panel { background-color: #f1f3f4; }
        .dark .custom-audio { filter: invert(100%) hue-rotate(180deg) brightness(1.8) contrast(0.9); }
        .custom-audio { border-radius: 30px; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  ); 
}