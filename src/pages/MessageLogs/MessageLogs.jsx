
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

  // الـ localStorage هو المخزن الأساسي لعدد الرسائل غير المقروءة لايف
  const [localUnreadPhones, setLocalUnreadPhones] = useState(() => {
    try {
      const saved = localStorage.getItem("vestro_unread_phones");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const socket = useRef(null);
  const chatEndRef = useRef(null);
  const activePhoneRef = useRef(null);
  const textareaRef = useRef(null);

  // تحديث الـ localStorage كلما تغيرت الحسبة المحلية
  useEffect(() => {
    localStorage.setItem("vestro_unread_phones", JSON.stringify(localUnreadPhones));
  }, [localUnreadPhones]);

  useEffect(() => {
    activePhoneRef.current = replyTarget?.phone;
  }, [replyTarget]);

  const StatusIcon = ({ status, size = 16 }) => {
    if (status === "read") return <CheckCheck size={size} className="text-blue-500" />;
    if (status === "delivered") return <CheckCheck size={size} className="text-gray-400" />;
    if (status === "sent") return <Check size={size} className="text-gray-400" />;
    if (status === "failed") return <span className="text-red-500 text-[10px]">⚠️</span>;
    return <Clock size={size - 2} className="text-gray-300" />;
  };

  // دالة القراءة: تصفر الـ localStorage والسيرفر فوراً
  const markAsRead = useCallback((phone) => {
    if (socket.current?.connected) {
      socket.current.emit("mark_as_read", { phone });
    }
    
    setLocalUnreadPhones((prev) => {
      const updated = { ...prev };
      delete updated[phone];
      return updated;
    });

    setLogs((prev) =>
      prev.map((log) =>
        log.phone === phone ? { ...log, unreadCount: 0 } : log
      )
    );
  }, []);

  const handleClearChat = async (phone) => {
    if (!window.confirm(isRTL ? "هل أنت متأكد من رغبتك في إخفاء هذه المحادثة؟" : "Are you sure you want to hide this chat?")) return;
    try {
      const res = await axios.delete(`/messages/clear/${phone}`);
      if (res.data.success) {
        if (activePhoneRef.current === phone) {
          setReplyTarget(null);
          setActiveChat([]);
        }
        setLocalUnreadPhones((prev) => {
          const updated = { ...prev };
          delete updated[phone];
          return updated;
        });
        setLogs((prev) => prev.filter((log) => log.phone !== phone));
      }
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

// 2. الدالة المحدثة لعمل ريفريش كامل (للشات المفتوح والسايد بار معاً)
const fetchChatMessages = async (phone) => {
  if (!phone) return;
  try {
    // جلب رسائل الشات النشط وتحديث السايد بار في نفس الوقت بالتوازي لسرعة الأداء
    const [chatRes] = await Promise.all([
      axios.get(`/whatsapp/chat/${phone}`),
      fetchLogs()
    ]);

    if (chatRes.data.success) {
      setActiveChat(chatRes.data.messages || []);
    }
  } catch (err) {
    console.error("Failed to force refresh chat and sidebar:", err);
  }
};
  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    const currentSocket = socket.current;

    currentSocket.on("message_status_updated", (update) => {

      const updateIdStr = update.messageId ? String(update.messageId) : null;
      const updateWamIdStr = update.whatsappMessageId ? String(update.whatsappMessageId) : null;


      if (update.status === "read") {
        setLocalUnreadPhones((prev) => {
          const updated = { ...prev };
          delete updated[update.phone];
          return updated;
        });
        setLogs((prev) =>
          prev.map((log) =>
            log.phone === update.phone ? { ...log, unreadCount: 0 } : log
          )
        );
      }

      // === ⚠️ هنا مربط الفرس: تحديث الشات المفتوح ===
      setActiveChat((prev) => {
        
        if (!prev || prev.length === 0) {
          return prev;
        }
        
        return prev.map(msg => {
          const msgIdStr = msg._id ? String(msg._id) : null;
          const msgWamIdStr = msg.whatsappMessageId ? String(msg.whatsappMessageId) : null;
          
          const isMatch = (updateIdStr && msgIdStr === updateIdStr) || 
                          (updateWamIdStr && msgWamIdStr === updateWamIdStr);

          // كونسول مخصص للرسالة اللي السيرفر بيحاول يحدثها (هنطبع لو حصل تطابق أو لو ده كونسول تشخيصي)
          if (isMatch) {
          
          }

          return isMatch ? { ...msg, status: update.status } : msg;
        });
      });

      // === تحديث الـ Logs الجانبية ===
      setLogs((prev) => {
        if (!prev || prev.length === 0) return prev;
        return prev.map(log => {
          const logIdStr = log._id ? String(log._id) : null;
          const logWamIdStr = log.whatsappMessageId ? String(log.whatsappMessageId) : null;
          
          const isMatch = (updateIdStr && logIdStr === updateIdStr) || 
                          (updateWamIdStr && logWamIdStr === updateWamIdStr);
                          
          return isMatch || log.phone === update.phone ? { ...log, status: update.status } : log;
        });
      });
    });

    currentSocket.on("chat_cleared", (data) => {
      if (activePhoneRef.current === data.phone) {
        setReplyTarget(null);
        setActiveChat([]);
      }
      setLocalUnreadPhones((prev) => {
        const updated = { ...prev };
        delete updated[data.phone];
        return updated;
      });
      setLogs((prev) => prev.filter((log) => log.phone !== data.phone));
    });

    currentSocket.on("receive-message", (newMessage) => {
      const isChatOpen = activePhoneRef.current === newMessage.phone;

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

      const isCustomerMsg = newMessage.direction === "inbound";

      // 1. تحديث الـ localStorage أولاً كـ مرجع وحيد للزيادة لمنع الدبلرة
      if (isCustomerMsg && !isChatOpen) {
        setLocalUnreadPhones((prevPhones) => {
          const currentLocalCount = prevPhones[newMessage.phone] || 0;
          const updatedPhones = {
            ...prevPhones,
            [newMessage.phone]: currentLocalCount + 1
          };
          
          // 2. تحديث قائمة الـ logs بناءً على القيمة الدقيقة الجديدة مباشرةً من الحسبة
          setLogs((prevLogs) => {
            const existingLog = prevLogs.find(l => l.phone === newMessage.phone);
            const filtered = prevLogs.filter(l => l.phone !== newMessage.phone);
            
            const updatedLog = {
              ...newMessage,
              unreadCount: updatedPhones[newMessage.phone], // القيمة الدقيقة بدون تكرار أو جمع إضافي
              customer: existingLog?.customer || newMessage.customer || { name: "Unknown Customer" }
            };
            return [updatedLog, ...filtered];
          });

          return updatedPhones;
        });
      } else {
        // لو رسالة صادرة منك أو الشات مفتوح، بنرتب اللوج الجانبي طبيعي بدون لعب في العداد
        setLogs((prevLogs) => {
          const existingLog = prevLogs.find(l => l.phone === newMessage.phone);
          const filtered = prevLogs.filter(l => l.phone !== newMessage.phone);
          const updatedLog = {
            ...newMessage,
            unreadCount: isChatOpen ? 0 : (existingLog?.unreadCount || 0),
            customer: existingLog?.customer || newMessage.customer || { name: "Unknown Customer" }
          };
          return [updatedLog, ...filtered];
        });
      }
    });

    return () => {
      currentSocket.off("message_status_updated");
      currentSocket.off("chat_cleared");
      currentSocket.off("receive-message");
      currentSocket.disconnect();
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
      const fetchedMessages = data.messages || [];
      
      setLogs(fetchedMessages.map(msg => {
        const localCount = localUnreadPhones[msg.phone];
        return {
          ...msg,
          // الـ Math.max هنا للحماية، طالما اللوجيك اتظبط فوق هتجيب القيمة الحقيقية مظبوطة 100%
          unreadCount: localCount !== undefined ? Math.max(msg.unreadCount || 0, localCount) : (msg.unreadCount || 0)
        };
      }));
    } catch (err) { 
      console.error("Error fetching logs:", err); 
    }
  };

  useEffect(() => {
    const handler = setTimeout(fetchLogs, 400);
    return () => clearTimeout(handler);
  }, [search]); // شيلنا الـ localUnreadPhones من الـ dependencies لمنع الـ Infinite loops وإعادة استدعاء الـ API مع كل تحديث عداد

  const openChat = async (msg) => {
    setReplyTarget(msg);
    setActiveChat([]); 
    
    markAsRead(msg.phone);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

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
    if (textareaRef.current) textareaRef.current.style.height = "auto";

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

  const handleTextareaChange = (e) => {
    setReplyText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

 const renderMedia = (msg) => {
  if (msg.type === "text" && !msg.mediaUrl) {
    return <p className="text-[14.5px] leading-tight whitespace-pre-wrap break-words">{msg.text}</p>;
  }

  if (msg.type === "order") {
    const items = msg.orderDetails?.product_items || [];
    const totalCartPrice = items.reduce((sum, item) => sum + (item.item_price * item.quantity), 0);
    const currencyStr = items[0]?.currency || (isRTL ? "ج.م" : "EGP");

    return (
      <div className="w-full min-w-[240px] max-w-[290px] sm:max-w-sm rounded-xl overflow-hidden bg-white/95 dark:bg-[#182229] border border-red-500/10 dark:border-red-500/20 shadow-md">
        <div className="bg-gradient-to-r from-red-800 to-red-600 px-3 py-2 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag size={16} className="animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-[13px] font-black tracking-wide uppercase truncate">
              {isRTL ? "طلب شراء جديد" : "NEW CATALOG ORDER"}
            </span>
          </div>
          {msg.orderDetails?.catalog_id && (
            <div className="flex items-center gap-0.5 text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-mono shrink-0" title="Catalog ID">
              <Hash size={9} />
              <span>{msg.orderDetails.catalog_id.slice(-6)}</span>
            </div>
          )}
        </div>

        <div className="p-3 space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar">
          {items.length > 0 ? (
            items.map((item, index) => {
              const productImg = item.primary_image || item.image_url || item.product_image || item.images?.[0]?.url;
              const productName = item.product_name || item.name || (isRTL ? "منتج غير معروف" : "Unknown Product");
              const variantColor = item.color || item.variant_info?.color;
              const variantSize = item.size || item.variant_info?.size;

              return (
                <div key={index} className="flex items-start justify-between gap-2 text-xs border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1 flex items-start gap-2">
                    {productImg ? (
                      <img 
                        src={productImg} 
                        alt={productName} 
                        loading="lazy"
                        className="w-10 h-10 object-cover rounded-md border border-gray-100 dark:border-white/10 shrink-0 aspect-square"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-md flex items-center justify-center shrink-0 border border-red-100 dark:border-red-950/50 aspect-square">
                        <ShoppingBag size={14} />
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-[12.5px] leading-tight mb-0.5 break-words">
                        {productName}
                      </p>
                      
                      <p className="text-gray-400 dark:text-gray-500 text-[11px] tabular-nums">
                        {isRTL ? "الكمية:" : "Qty:"} <span className="font-bold text-red-600 dark:text-red-400">{item.quantity}</span>
                      </p>

                      {(variantColor || variantSize) && (
                        <div className="flex flex-col gap-0.5 mt-0.5 text-[10.5px] text-gray-500 dark:text-gray-400 font-medium">
                          {variantColor && (
                            <p className="truncate">
                              {isRTL ? "اللون:" : "Color:"} <span className="text-slate-700 dark:text-slate-300 font-bold">{variantColor}</span>
                            </p>
                          )}
                          {variantSize && (
                            <p className="truncate">
                              {isRTL ? "المقاس:" : "Size:"} <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">{variantSize}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-end shrink-0 tabular-nums font-bold pt-0.5 text-slate-800 dark:text-slate-200">
                    <span>{(item.item_price * item.quantity).toLocaleString()}</span>
                    <span className="text-[9px] opacity-60 ms-0.5 font-normal">{currencyStr}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">{isRTL ? "لا توجد تفاصيل للمنتجات" : "No product items included"}</p>
          )}
        </div>

        {msg.orderDetails?.text && (
          <div className="mx-3 mb-3 p-2 bg-gray-50 dark:bg-black/20 border-s-2 border-red-500 rounded text-[12px] italic text-slate-600 dark:text-slate-300 break-words">
            "{msg.orderDetails.text}"
          </div>
        )}

        <div className="bg-gray-50 dark:bg-black/30 px-3 py-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold shadow-inner">
          <span className="text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي المنتجات:" : "Total Price:"}</span>
          <span className="text-[13px] font-black text-red-700 dark:text-red-400 tabular-nums">
            {totalCartPrice.toLocaleString()} <span className="text-[9px] font-bold opacity-80">{currencyStr}</span>
          </span>
        </div>
      </div>
    );
  }

  if (!msg.mediaUrl) {
    return <p className="text-[13px] leading-tight text-gray-400 italic">{isRTL ? "ملف وسائط غير صالح" : "Invalid media file"}</p>;
  }

  const mediaUrl = msg.mediaUrl.includes('http') ? msg.mediaUrl.substring(msg.mediaUrl.lastIndexOf('http')) : msg.mediaUrl;

  if (msg.type === "image") {
    return (
      <img 
        src={mediaUrl} 
        loading="lazy"
        className="rounded-md max-h-64 sm:max-h-80 w-full object-cover cursor-zoom-in aspect-auto" 
        alt="media" 
        onClick={() => window.open(mediaUrl)}
      />
    );
  }
  
  if (msg.type === "audio" || msg.type === "voice") {
    return (
      <div className="pt-1 w-full min-w-[200px] max-w-full">
        <audio src={mediaUrl} controls preload="metadata" className="w-full h-8 custom-audio" />
      </div>
    );
  }
  return <div className="p-2 bg-black/5 dark:bg-white/5 rounded text-xs break-words">📎 Attachment: {msg.type}</div>;
};

 return (
  <div className={`flex flex-col h-screen w-full bg-[#f0f2f5] dark:bg-[#0c0c0c] text-slate-900 dark:text-slate-100 overflow-hidden ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
    <div className="flex flex-1 h-full w-full overflow-hidden relative">
      
      {/* SIDEBAR */}
      <div className={`w-full md:w-[360px] lg:w-[400px] flex flex-col bg-white dark:bg-[#111] border-e border-gray-200 dark:border-white/5 shrink-0 h-full ${replyTarget ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3.5 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-red-700 flex items-center gap-2">
              <Headset size={22}/> VESTRO <span className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">LIVE</span>
            </h1>
          </div>
          <div className="relative group">
            <Search className={`${isRTL ? "right-3" : "left-3"} absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors`} size={16} />
            <input 
              type="text" 
              placeholder={isRTL ? "بحث في المحادثات..." : "Search conversations..."}
              className={`w-full bg-gray-100 dark:bg-white/5 rounded-xl py-2 ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} text-xs sm:text-sm outline-none border border-transparent focus:border-red-500/50 transition-all`}
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar division-y division-gray-100 dark:division-white/5">
          {logs.map((msg) => {
            const isCurrentActive = replyTarget?.phone === msg.phone;
            const hasUnread = msg.unreadCount > 0 && !isCurrentActive;
            
            return (
              <div 
                key={msg._id} 
                onClick={() => openChat(msg)}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors 
                  ${isCurrentActive ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                  ${hasUnread ? 'bg-green-50/30 dark:bg-green-500/[0.03]' : ''}`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative text-sm">
                  {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name.charAt(0).toUpperCase() : <User size={20}/>}
                  {hasUnread && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5 gap-1">
                    <h3 className={`text-[13.5px] truncate ${hasUnread ? 'font-black text-black dark:text-white' : 'font-bold'}`}>
                      {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name : msg.phone}
                    </h3>
                    <span className={`text-[9px] shrink-0 tabular-nums ${hasUnread ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {msg.direction === "outbound" && <StatusIcon status={msg.status} size={13} />}
                      <p className={`text-xs truncate ${hasUnread ? 'text-black dark:text-slate-200 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                        {msg.text || '📷 Media'}
                      </p>
                    </div>
                    
                    {hasUnread && (
                      <span className="bg-green-500 text-white font-bold text-[9px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shrink-0 shadow-sm">
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

      {/* CHAT WINDOW - ثابت ومستقر تماماً وبدون أي سكرول خارجي */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-[#0c0c0c] relative ${!replyTarget ? 'hidden md:flex' : 'flex'}`}>
        {replyTarget ? (
          <>
           {/* Header الشات ثابت مستحيل يتحرك مسمار في مكانه */}
<div className="fixed  left-0 right-0 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-30 shadow-sm shrink-0 w-full select-none">
  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
    <button onClick={() => setReplyTarget(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors md:hidden">
      <ChevronLeft size={22} className={isRTL ? "rotate-180" : ""} />
    </button>
    <div className="relative shrink-0">
      <div className="w-9  sm:w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
        {replyTarget.customer?.name?.charAt(0) || "V"}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#111] rounded-full"></div>
    </div>
    <div className="min-w-0">
      <h2 className="text-xs sm:text-sm font-black dark:text-white leading-tight truncate">
        {replyTarget.customer?.name || replyTarget.phone}
      </h2>
      <div className="flex items-center gap-1 mt-0.5">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <p className="text-[9px] text-green-500 font-bold tracking-wider">ONLINE</p>
      </div>
    </div>
  </div>

  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
    <div className="hidden lg:flex flex-col items-end px-3 border-e border-gray-200 dark:border-white/10">
      <span className="text-[9px] font-bold text-gray-400">CUSTOMER PHONE</span>
      <span className="text-[11px] font-mono">{replyTarget.phone}</span>
    </div>

    <button 
      onClick={() => fetchChatMessages(replyTarget.phone)} 
      title={isRTL ? "تحديث المحادثة" : "Refresh Chat"}
      className="p-2 text-gray-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:rotate-180 transition-transform duration-500">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <polyline points="21 3 21 8 16 8" />
      </svg>
    </button>
    <button 
      onClick={() => handleClearChat(replyTarget.phone)} 
      title={isRTL ? "إخفاء المحادثة" : "Hide Chat"}
      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all"
    >
      <Trash2 size={18} />
    </button>
    <MoreVertical className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors" size={18} />
  </div>
</div>

            {/* صندوق الرسائل - هو الوحيد اللي مسموحله يعمل سكرول داخلي */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 bg-[#e5ddd5] dark:bg-[#090909] relative custom-scrollbar">
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none" 
                   style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '300px' }} />
              
              {activeChat.map((msg, idx) => {
                const isMe = msg.direction === "outbound";
                const isOrder = msg.type === "order";
                return (
                  <div key={msg._id || idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                    <div className={`relative max-w-[88%] sm:max-w-[70%] shadow-sm rounded-xl break-words
                      ${isOrder 
                        ? "p-0.5 bg-transparent border-0 shadow-none" 
                        : isMe 
                          ? "px-2.5 pt-1.5 pb-1 bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-50 rounded-tr-none" 
                          : "px-2.5 pt-1.5 pb-1 bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 rounded-tl-none"
                      }`}
                    >
                      {renderMedia(msg)}
                      <div className={`flex items-center justify-end gap-1 mt-0.5 select-none ${isOrder ? "px-1 text-slate-500 dark:text-slate-400" : ""}`}>
                        <span className="text-[8.5px] font-medium opacity-60 uppercase">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                        {isMe && <StatusIcon status={msg.status} size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* سطر الإدخال والكتابة ثابت دايماً أسفل الشاشة (shrink-0 + sticky) */}
            <div className="fixed bottom-0 p-2 sm:p-3 bg-[#f0f2f5] dark:bg-[#111] flex items-center gap-2 z-30 border-t border-gray-200 dark:border-white/5 shrink-0 w-full">
              <div className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors text-gray-500 shrink-0">
                <Paperclip size={20} />
              </div>
              <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden focus-within:ring-1 ring-red-500/30 transition-all">
                <textarea 
                  ref={textareaRef}
                  rows="1"
                  placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                  className="w-full bg-transparent border-none outline-none py-2.5 px-3 text-[14px] sm:text-[15px] dark:text-white resize-none max-h-24 custom-scrollbar dynamic-textarea block"
                  value={replyText}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                />
              </div>
              <button 
                disabled={sending || !replyText.trim()}
                onClick={handleSendReply}
                className="w-10 h-10 sm:w-11 h-11 bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 disabled:opacity-40 disabled:grayscale transition-all shrink-0"
              >
                {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={18} className={isRTL ? "rotate-180" : "ml-0.5"} />}
              </button>
            </div>
          </>
        ) : (
          /* واجهة الترحيب عند عدم فتح شات */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0c0c0c] h-full">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-4 animate-bounce shadow-lg shadow-red-500/5">
              <MessageCircle size={40} />
            </div>
            <h2 className="text-xl font-black mb-1 dark:text-white tracking-tight uppercase">
              {isRTL ? "منصة فيسترو للمحادثات" : "VESTRO CHAT HUB"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs text-xs sm:text-sm leading-relaxed">
              {isRTL ? "اختر محادثة من القائمة الجانبية لبدء الرد على العملاء بشكل مباشر" : "Select a conversation from the sidebar to start responding to customers in real-time."}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* ستايل مخصص */}
    <style>{`
      .font-arabic { font-family: 'Cairo', sans-serif; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
      
      .custom-audio::-webkit-media-controls-panel { background-color: #f1f3f4; }
      .dark .custom-audio { filter: invert(100%) hue-rotate(180deg) brightness(1.6) contrast(0.9); }
      .custom-audio { border-radius: 30px; }
      
      .dynamic-textarea { height: auto; min-height: 40px; }

      @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      .animate-in { animation: fadeIn 0.2s ease-out; contain-visibility: auto; }
    `}</style>
    
  </div>
);
}