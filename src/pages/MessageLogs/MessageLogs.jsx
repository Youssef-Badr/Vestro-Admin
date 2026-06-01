
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import axios from "../../api/axiosInstance";
// import { useLanguage } from "../../context/LanguageContext";
// import { io } from "socket.io-client";
// import { 
//   Search, CheckCheck, Check, User, Send, Headset, 
//   MessageCircle, ChevronLeft, MoreVertical, 
//   Clock, Trash2, ShoppingBag, Hash, Paperclip, Mic, Square
// } from "lucide-react";

// const SOCKET_URL = import.meta.env.VITE_API_URL;

// export default function MessageLogs() {
//   const { language } = useLanguage();
//   const isRTL = language === "ar";

//   const [logs, setLogs] = useState([]); 
//   const [activeChat, setActiveChat] = useState([]); 
//   const [replyTarget, setReplyTarget] = useState(null); 
//   const [replyText, setReplyText] = useState("");
//   const [sending, setSending] = useState(false);
//   const [search, setSearch] = useState("");
//   const [isRecording, setIsRecording] = useState(false); // حالة التسجيل الحالي
// const [mediaRecorder, setMediaRecorder] = useState(null); // كائن التسجيل
// // استبدل الـ state القديم selectedFile بدول:
// const [selectedFiles, setSelectedFiles] = useState([]); // مصفوفة للصور أو الميديا المتعددة
// const [audioBlob, setAudioBlob] = useState(null);       // لحفظ ملف الصوت أو الريكورد  // الـ localStorage هو المخزن الأساسي لعدد الرسائل غير المقروءة لايف
//   const [localUnreadPhones, setLocalUnreadPhones] = useState(() => {
//     try {
//       const saved = localStorage.getItem("vestro_unread_phones");
//       return saved ? JSON.parse(saved) : {};
//     } catch {
//       return {};
//     }
//   });

//   const socket = useRef(null);
//   const chatEndRef = useRef(null);
//   const activePhoneRef = useRef(null);
//   const textareaRef = useRef(null);

//   // تحديث الـ localStorage كلما تغيرت الحسبة المحلية
//   useEffect(() => {
//     localStorage.setItem("vestro_unread_phones", JSON.stringify(localUnreadPhones));
//   }, [localUnreadPhones]);

//   useEffect(() => {
//     activePhoneRef.current = replyTarget?.phone;
//   }, [replyTarget]);

//   const StatusIcon = ({ status, size = 16 }) => {
//     if (status === "read") return <CheckCheck size={size} className="text-blue-500" />;
//     if (status === "delivered") return <CheckCheck size={size} className="text-gray-400" />;
//     if (status === "sent") return <Check size={size} className="text-gray-400" />;
//     if (status === "failed") return <span className="text-red-500 text-[10px]">⚠️</span>;
//     return <Clock size={size - 2} className="text-gray-300" />;
//   };

//   // دالة القراءة: تصفر الـ localStorage والسيرفر فوراً
//   const markAsRead = useCallback((phone) => {
//     if (socket.current?.connected) {
//       socket.current.emit("mark_as_read", { phone });
//     }
    
//     setLocalUnreadPhones((prev) => {
//       const updated = { ...prev };
//       delete updated[phone];
//       return updated;
//     });

//     setLogs((prev) =>
//       prev.map((log) =>
//         log.phone === phone ? { ...log, unreadCount: 0 } : log
//       )
//     );
//   }, []);

//   const handleClearChat = async (phone) => {
//     if (!window.confirm(isRTL ? "هل أنت متأكد من رغبتك في إخفاء هذه المحادثة؟" : "Are you sure you want to hide this chat?")) return;
//     try {
//       const res = await axios.delete(`/messages/clear/${phone}`);
//       if (res.data.success) {
//         if (activePhoneRef.current === phone) {
//           setReplyTarget(null);
//           setActiveChat([]);
//         }
//         setLocalUnreadPhones((prev) => {
//           const updated = { ...prev };
//           delete updated[phone];
//           return updated;
//         });
//         setLogs((prev) => prev.filter((log) => log.phone !== phone));
//       }
//     } catch (err) {
//       console.error("Failed to clear chat:", err);
//     }
//   };

// // 2. الدالة المحدثة لعمل ريفريش كامل (للشات المفتوح والسايد بار معاً)
// const fetchChatMessages = async (phone) => {
//   if (!phone) return;
//   try {
//     // جلب رسائل الشات النشط وتحديث السايد بار في نفس الوقت بالتوازي لسرعة الأداء
//     const [chatRes] = await Promise.all([
//       axios.get(`/whatsapp/chat/${phone}`),
//       fetchLogs()
//     ]);

//     if (chatRes.data.success) {
//       setActiveChat(chatRes.data.messages || []);
//     }
//   } catch (err) {
//     console.error("Failed to force refresh chat and sidebar:", err);
//   }
// };
//   useEffect(() => {
//     socket.current = io(SOCKET_URL, {
//       transports: ["websocket"],
//       reconnection: true,
//     });

//     const currentSocket = socket.current;

//     currentSocket.on("message_status_updated", (update) => {

//       const updateIdStr = update.messageId ? String(update.messageId) : null;
//       const updateWamIdStr = update.whatsappMessageId ? String(update.whatsappMessageId) : null;


//       if (update.status === "read") {
//         setLocalUnreadPhones((prev) => {
//           const updated = { ...prev };
//           delete updated[update.phone];
//           return updated;
//         });
//         setLogs((prev) =>
//           prev.map((log) =>
//             log.phone === update.phone ? { ...log, unreadCount: 0 } : log
//           )
//         );
//       }

//       // === ⚠️ هنا مربط الفرس: تحديث الشات المفتوح ===
//       setActiveChat((prev) => {
        
//         if (!prev || prev.length === 0) {
//           return prev;
//         }
        
//         return prev.map(msg => {
//           const msgIdStr = msg._id ? String(msg._id) : null;
//           const msgWamIdStr = msg.whatsappMessageId ? String(msg.whatsappMessageId) : null;
          
//           const isMatch = (updateIdStr && msgIdStr === updateIdStr) || 
//                           (updateWamIdStr && msgWamIdStr === updateWamIdStr);

//           // كونسول مخصص للرسالة اللي السيرفر بيحاول يحدثها (هنطبع لو حصل تطابق أو لو ده كونسول تشخيصي)
//           if (isMatch) {
          
//           }

//           return isMatch ? { ...msg, status: update.status } : msg;
//         });
//       });

//       // === تحديث الـ Logs الجانبية ===
//       setLogs((prev) => {
//         if (!prev || prev.length === 0) return prev;
//         return prev.map(log => {
//           const logIdStr = log._id ? String(log._id) : null;
//           const logWamIdStr = log.whatsappMessageId ? String(log.whatsappMessageId) : null;
          
//           const isMatch = (updateIdStr && logIdStr === updateIdStr) || 
//                           (updateWamIdStr && logWamIdStr === updateWamIdStr);
                          
//           return isMatch || log.phone === update.phone ? { ...log, status: update.status } : log;
//         });
//       });
//     });

//     currentSocket.on("chat_cleared", (data) => {
//       if (activePhoneRef.current === data.phone) {
//         setReplyTarget(null);
//         setActiveChat([]);
//       }
//       setLocalUnreadPhones((prev) => {
//         const updated = { ...prev };
//         delete updated[data.phone];
//         return updated;
//       });
//       setLogs((prev) => prev.filter((log) => log.phone !== data.phone));
//     });

//     currentSocket.on("receive-message", (newMessage) => {
//       const isChatOpen = activePhoneRef.current === newMessage.phone;

//       if (isChatOpen) {
//         setActiveChat((prev) => {
//           if (newMessage.direction === "outbound") {
//             const hasTemp = prev.some(msg => msg._id?.toString().startsWith("temp_"));
//             if (hasTemp) {
//               let replaced = false;
//               return prev.map((msg) => {
//                 if (!replaced && msg._id?.toString().startsWith("temp_") && msg.text === newMessage.text) {
//                   replaced = true;
//                   return { ...newMessage, isRead: true };
//                 }
//                 return msg;
//               });
//             }
//           }

//           const newMsgIdStr = newMessage._id?.toString();
//           const newWamIdStr = newMessage.whatsappMessageId?.toString();
//           const isAlreadyExists = prev.some(msg => {
//             const msgIdStr = msg._id?.toString();
//             const msgWamIdStr = msg.whatsappMessageId?.toString();
//             return (newMsgIdStr && msgIdStr === newMsgIdStr) || (newWamIdStr && msgWamIdStr === newWamIdStr);
//           });

//           if (isAlreadyExists) return prev;
//           return [...prev, { ...newMessage, isRead: true }];
//         });
//       }

//       const isCustomerMsg = newMessage.direction === "inbound";

//       // 1. تحديث الـ localStorage أولاً كـ مرجع وحيد للزيادة لمنع الدبلرة
//       if (isCustomerMsg && !isChatOpen) {
//         setLocalUnreadPhones((prevPhones) => {
//           const currentLocalCount = prevPhones[newMessage.phone] || 0;
//           const updatedPhones = {
//             ...prevPhones,
//             [newMessage.phone]: currentLocalCount + 1
//           };
          
//           // 2. تحديث قائمة الـ logs بناءً على القيمة الدقيقة الجديدة مباشرةً من الحسبة
//           setLogs((prevLogs) => {
//             const existingLog = prevLogs.find(l => l.phone === newMessage.phone);
//             const filtered = prevLogs.filter(l => l.phone !== newMessage.phone);
            
//             const updatedLog = {
//               ...newMessage,
//               unreadCount: updatedPhones[newMessage.phone], // القيمة الدقيقة بدون تكرار أو جمع إضافي
//               customer: existingLog?.customer || newMessage.customer || { name: "Unknown Customer" }
//             };
//             return [updatedLog, ...filtered];
//           });

//           return updatedPhones;
//         });
//       } else {
//         // لو رسالة صادرة منك أو الشات مفتوح، بنرتب اللوج الجانبي طبيعي بدون لعب في العداد
//         setLogs((prevLogs) => {
//           const existingLog = prevLogs.find(l => l.phone === newMessage.phone);
//           const filtered = prevLogs.filter(l => l.phone !== newMessage.phone);
//           const updatedLog = {
//             ...newMessage,
//             unreadCount: isChatOpen ? 0 : (existingLog?.unreadCount || 0),
//             customer: existingLog?.customer || newMessage.customer || { name: "Unknown Customer" }
//           };
//           return [updatedLog, ...filtered];
//         });
//       }
//     });

//     return () => {
//       currentSocket.off("message_status_updated");
//       currentSocket.off("chat_cleared");
//       currentSocket.off("receive-message");
//       currentSocket.disconnect();
//     };
//   }, []); 

//   const scrollToBottom = useCallback((behavior = "smooth") => {
//     chatEndRef.current?.scrollIntoView({ behavior });
//   }, []);

//   useEffect(() => {
//     if (activeChat.length > 0) {
//       const timer = setTimeout(() => scrollToBottom("smooth"), 100);
//       return () => clearTimeout(timer);
//     }
//   }, [activeChat, scrollToBottom]);

  

//   const fetchLogs = async () => {
//     try {
//       const { data } = await axios.get("/messages", { params: { search } });
//       const fetchedMessages = data.messages || [];
      
//       setLogs(fetchedMessages.map(msg => {
//         const localCount = localUnreadPhones[msg.phone];
//         return {
//           ...msg,
//           // الـ Math.max هنا للحماية، طالما اللوجيك اتظبط فوق هتجيب القيمة الحقيقية مظبوطة 100%
//           unreadCount: localCount !== undefined ? Math.max(msg.unreadCount || 0, localCount) : (msg.unreadCount || 0)
//         };
//       }));
//     } catch (err) { 
//       console.error("Error fetching logs:", err); 
//     }
//   };

//   useEffect(() => {
//     const handler = setTimeout(fetchLogs, 400);
//     return () => clearTimeout(handler);
//   }, [search]); // شيلنا الـ localUnreadPhones من الـ dependencies لمنع الـ Infinite loops وإعادة استدعاء الـ API مع كل تحديث عداد

//   const openChat = async (msg) => {
//     setReplyTarget(msg);
//     setActiveChat([]); 
    
//     markAsRead(msg.phone);
//     if (textareaRef.current) textareaRef.current.style.height = "auto";

//     try {
//       const { data } = await axios.get(`/whatsapp/chat/${msg.phone}`);
//       if (data.success) {
//         setActiveChat(data.messages || []);
//       }
//     } catch (err) { 
//       console.error("Chat loading failed", err); 
//     }
//   };

//  const handleMediaSelect = (e) => {
//   const files = Array.from(e.target.files);
//   if (files.length === 0) return;

//   // الحد الأقصى 16 ميجا بايت لكل ملف
//   const maxSize = 16 * 1024 * 1024; 
//   const validFiles = [];

//   for (let file of files) {
//     if (file.size > maxSize) {
//       alert(isRTL ? `الملف ${file.name} حجمه كبير جداً. الحد الأقصى 16 ميجابايت.` : `File ${file.name} is too large. Max size is 16MB.`);
//       continue;
//     }
//     validFiles.push(file);
//   }

//   // لو بنرفع صور، بنسمح بتعدد الصور، لو ملف صوتي بناخده هو بس
//   const hasAudio = validFiles.some(f => f.type.startsWith('audio/'));
  
//   if (hasAudio) {
//     // لو ريكورد أو صوت، بناخد أول واحد وبنصفره من قائمة الصور
//     setAudioBlob(validFiles[0]);
//     setSelectedFiles([]);
//   } else {
//     // لو صور، بنضيفهم على المختارين حالياً (لو عايز تدمج أو تستبدل، هنا بنستبدل عشان الأمان)
//     setSelectedFiles(validFiles);
//     setAudioBlob(null);
//   }
// };

// const handleSendReply = async () => {
//   // التحقق: لو مفيش نص ومفيش أي ميديا، أو السيرفر بيحمل.. اخرج
//   const hasImages = selectedFiles.length > 0;
//   const hasAudio = !!audioBlob;
  
//   if ((!replyText.trim() && !hasImages && !hasAudio) || sending) return;
  
//   const content = replyText.trim();
//   const tempId = "temp_" + Date.now().toString(); 
  
//   setSending(true);
//   setReplyText("");
//   if (textareaRef.current) textareaRef.current.style.height = "auto";

//   // 1. التحديث الفوري على الشاشة (Optimistic UI)
//   let optimisticText = content;
//   let optimisticType = "text";
  
//   if (!optimisticText) {
//     if (hasImages) optimisticText = isRTL ? `📷 جاري إرسال ${selectedFiles.length} صور...` : `📷 Sending ${selectedFiles.length} images...`;
//     if (hasAudio) optimisticText = isRTL ? "🎵 جاري إرسال تسجيل صوتي..." : "🎵 Sending audio...";
//   }
  
//   if (hasImages) optimisticType = "image";
//   if (hasAudio) optimisticType = "audio";

//   const optimisticMessage = {
//     _id: tempId,
//     text: optimisticText,
//     direction: "outbound",
//     status: "pending",
//     createdAt: new Date().toISOString(),
//     type: optimisticType
//   };
//   setActiveChat((prev) => [...prev, optimisticMessage]);

//   try {
//     const formData = new FormData();
//     formData.append("phone", replyTarget.phone);
//     formData.append("message", content);
    
//     // 2. معالجة نوع الميديا المرفوعة وإضافتها للـ FormData
//     if (hasImages) {
//       formData.append("type", "image");
//       // الـ Loop السحري لاستقبال الحقل "file" كمصفوفة في الباك إند
//       selectedFiles.forEach((file) => {
//         formData.append("file", file); 
//       });
//     } else if (hasAudio) {
//       formData.append("type", "audio");
//       const audioFile = audioBlob instanceof File ? audioBlob : new File([audioBlob], "voice.mp3", { type: audioBlob.type || "audio/mp3" });
//       formData.append("file", audioFile);
//     } else {
//       formData.append("type", "text");
//     }

//     // 3. إرسال الطلب للباك إند
//     const res = await axios.post("/whatsapp/send", formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
    
//     if (res.data.success) {
//       const finalMessage = {
//         _id: res.data.data?._id || res.data.dbId || tempId,
//         whatsappMessageId: res.data.messageId || res.data.whatsappMessageId,
//         text: content || (hasImages ? `📷 Photo (${selectedFiles.length})` : hasAudio ? "🎵 Audio" : ""),
//         direction: "outbound",
//         status: "sent",
//         createdAt: new Date().toISOString(),
//         type: optimisticType,
//         mediaUrl: res.data.data?.mediaUrl || null,
//         mediaUrls: res.data.data?.mediaUrls || null // هنا بنخزن مصفوفة الروابط الكاملة اللي رجعت من السيرفر
//       };

//       setActiveChat((prev) => 
//         prev.map(msg => msg._id?.toString() === tempId ? finalMessage : msg)
//       );

//       setLogs((prev) => {
//         const filtered = prev.filter(l => l.phone !== replyTarget.phone);
//         const updatedLog = { 
//           ...replyTarget, 
//           text: finalMessage.text, 
//           status: 'sent', 
//           createdAt: finalMessage.createdAt, 
//           direction: 'outbound', 
//           whatsappMessageId: finalMessage.whatsappMessageId,
//           unreadCount: 0 
//         };
//         return [updatedLog, ...filtered];
//       });

//       // تصفير الميديا بعد النجاح
//       setSelectedFiles([]);
//       setAudioBlob(null);
//     }
//   } catch (err) { 
//     console.error("حدث خطأ أثناء الإرسال:", err);
//     setActiveChat((prev) => 
//       prev.map(msg => msg._id?.toString() === tempId ? { ...msg, status: "failed" } : msg)
//     );
//   } finally { 
//     setSending(false); 
//   }
// };

//   const handleTextareaChange = (e) => {
//     setReplyText(e.target.value);
//     e.target.style.height = "auto";
//     e.target.style.height = `${e.target.scrollHeight}px`;
//   };

// const startRecording = async () => {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
//     // نحدد الصيغة المدعومة في متصفح العميل تلقائياً
//     let options = {};
//     if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
//       options = { mimeType: 'audio/ogg;codecs=opus' };
//     } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
//       options = { mimeType: 'audio/webm;codecs=opus' };
//     }

//     const recorder = new MediaRecorder(stream, options);
//     const chunks = [];

//     recorder.ondataavailable = (e) => {
//       if (e.data.size > 0) chunks.push(e.data);
//     };

//     recorder.onstop = () => {
//       // ننشئ الـ Blob بنفس الـ mimeType السليم اللي سجلنا بيه منعاً لأي تلف
//       const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
//       setAudioBlob(blob);
//       // قفل المايك بعد الانتهاء عشان الخصوصية
//       stream.getTracks().forEach(track => track.stop());
//     };

//     recorder.start();
//     setMediaRecorder(recorder);
//     setIsRecording(true);
//     setSelectedFiles([]); // تصفير الصور لو هنسجل
//   } catch (err) {
//     console.error("تعذر الوصول للمايكروفون:", err);
//     alert(isRTL ? "برجاء السماح بالوصول للمايكروفون أولاً." : "Please allow microphone access.");
//   }
// };
// const stopRecording = () => {
//   if (mediaRecorder && isRecording) {
//     mediaRecorder.stop();
//     setIsRecording(false);
//   }
// };

// const renderMedia = (msg) => {
//   if (msg.type === "text" && !msg.mediaUrl) {
//     return <p className="text-[14.5px] leading-tight whitespace-pre-wrap break-words">{msg.text}</p>;
//   }

//   if (msg.type === "order") {
//     const items = msg.orderDetails?.product_items || [];
//     const totalCartPrice = items.reduce((sum, item) => sum + (item.item_price * item.quantity), 0);
//     const currencyStr = items[0]?.currency || (isRTL ? "ج.م" : "EGP");

//     return (
//       <div className="w-full min-w-[240px] max-w-[290px] sm:max-w-sm rounded-xl overflow-hidden bg-white/95 dark:bg-[#182229] border border-red-500/10 dark:border-red-500/20 shadow-md">
//         {/* Header الـ Card */}
//         <div className="bg-gradient-to-r from-red-800 to-red-600 px-3 py-2 flex items-center justify-between text-white shadow-sm">
//           <div className="flex items-center gap-2 min-w-0">
//             <ShoppingBag size={16} className="animate-pulse shrink-0" />
//             <span className="text-[11px] sm:text-[13px] font-black tracking-wide uppercase truncate">
//               {isRTL ? "طلب شراء جديد" : "NEW CATALOG ORDER"}
//             </span>
//           </div>
//           {msg.orderDetails?.catalog_id && (
//             <div className="flex items-center gap-0.5 text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-mono shrink-0" title="Catalog ID">
//               <Hash size={9} />
//               <span>{msg.orderDetails.catalog_id.slice(-6)}</span>
//             </div>
//           )}
//         </div>

//         {/* قائمة المنتجات داخل الـ Card */}
//         <div className="p-3 space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar">
//           {items.length > 0 ? (
//             items.map((item, index) => {
//               const productImg = item.primary_image || item.image_url || item.product_image || item.images?.[0]?.url;
//               const rawName = item.product_name || item.name || (isRTL ? "منتج غير معروف" : "Unknown Product");
//               const variantColor = item.color && item.color !== "N/A" ? item.color : null;
//               const variantSize = item.size && item.size !== "N/A" ? item.size : null;

//               return (
//                 <div key={index} className="flex items-start justify-between gap-2 text-xs border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
//                   <div className="min-w-0 flex-1 flex items-start gap-2">
//                     {productImg ? (
//                       <img 
//                         src={productImg} 
//                         alt={rawName} 
//                         loading="lazy"
//                         className="w-10 h-10 object-cover rounded-md border border-gray-100 dark:border-white/10 shrink-0 aspect-square"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-md flex items-center justify-center shrink-0 border border-red-100 dark:border-red-950/50 aspect-square">
//                         <ShoppingBag size={14} />
//                       </div>
//                     )}
                    
//                     <div className="min-w-0 flex-1">
//                       <p className="font-bold text-slate-900 dark:text-slate-100 text-[12.5px] leading-tight mb-0.5 break-words">
//                         {rawName}
//                       </p>
                      
//                       <p className="text-gray-400 dark:text-gray-500 text-[11px] tabular-nums">
//                         {isRTL ? "الكمية:" : "Qty:"} <span className="font-bold text-red-600 dark:text-red-400">{item.quantity}</span>
//                       </p>

//                       {(variantColor || variantSize) && (
//                         <div className="flex flex-wrap gap-1 mt-1 text-[10.5px] font-medium">
//                           {variantColor && (
//                             <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1 max-w-[120px] truncate">
//                               <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
//                               <span>{variantColor}</span>
//                             </span>
//                           )}
//                           {variantSize && (
//                             <span className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">
//                               {variantSize}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="text-end shrink-0 tabular-nums font-bold pt-0.5 text-slate-800 dark:text-slate-200">
//                     <span>{(item.item_price * item.quantity).toLocaleString()}</span>
//                     <span className="text-[9px] opacity-60 ms-0.5 font-normal">{currencyStr}</span>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <p className="text-xs text-gray-400 text-center py-2">{isRTL ? "لا توجد تفاصيل للمنتجات" : "No product items included"}</p>
//           )}
//         </div>

//         {/* نص رسالة العميل المرافقة إن وجدت */}
//         {msg.orderDetails?.text && (
//           <div className="mx-3 mb-3 p-2 bg-gray-50 dark:bg-black/20 border-s-2 border-red-500 rounded text-[12px] italic text-slate-600 dark:text-slate-300 break-words">
//             "{msg.orderDetails.text}"
//           </div>
//         )}

//         {/* الفوتر الكلي والـ Total */}
//         <div className="bg-gray-50 dark:bg-black/30 px-3 py-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold shadow-inner">
//           <span className="text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي المنتجات:" : "Total Price:"}</span>
//           <span className="text-[13px] font-black text-red-700 dark:text-red-400 tabular-nums">
//             {totalCartPrice.toLocaleString()} <span className="text-[9px] font-bold opacity-80">{currencyStr}</span>
//           </span>
//         </div>
//       </div>
//     );
//   }

//   // تحقق السلامة: لو مفيش رابط مفرد ولا مصفوفة روابط، يعتبر الملف غير صالح
//   if (!msg.mediaUrl && (!msg.mediaUrls || msg.mediaUrls.length === 0)) {
//     return <p className="text-[13px] leading-tight text-gray-400 italic">{isRTL ? "ملف وسائط غير صالح" : "Invalid media file"}</p>;
//   }

//   // دالة لتنظيف الروابط من أي بريفكس تالف
//   const cleanUrl = (url) => {
//     if (!url) return "";
//     return url.includes('http') ? url.substring(url.lastIndexOf('http')) : url;
//   };

//   // ==========================================
//   // معالجة نوع الصور (سواء مفردة أو متعددة)
//   // ==========================================
//   if (msg.type === "image") {
//     // لو الرسالة جاية بمصفوفة صور متعددة
//     if (msg.mediaUrls && msg.mediaUrls.length > 0) {
//       return (
//         <div className={`grid ${msg.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 p-1 max-w-[280px] sm:max-w-xs`}>
//           {msg.mediaUrls.map((rawUrl, index) => {
//             const finalUrl = cleanUrl(rawUrl);
//             return (
//               <img 
//                 key={index}
//                 src={finalUrl} 
//                 loading="lazy"
//                 className="rounded-lg max-h-40 w-full object-cover cursor-zoom-in aspect-square transition-transform active:scale-95" 
//                 alt={`attachment-${index}`} 
//                 onClick={() => window.open(finalUrl)}
//               />
//             );
//           })}
//         </div>
//       );
//     }

//     // الـ Fallback للصورة الفردية الطبيعية
//     const singleMediaUrl = cleanUrl(msg.mediaUrl);
//     return (
//       <img 
//         src={singleMediaUrl} 
//         loading="lazy"
//         className="rounded-md max-h-64 sm:max-h-80 w-full object-cover cursor-zoom-in aspect-auto" 
//         alt="media" 
//         onClick={() => window.open(singleMediaUrl)}
//       />
//     );
//   }
  
//   // =========================================================
//   // معالجة الصوت والريكوردات (تم تأمين تشغيلها في لوحة التحكم الأدمن)
//   // =========================================================
//   if (msg.type === "audio" || msg.type === "voice") {
//     let audioUrl = cleanUrl(msg.mediaUrl);
    
//     // الحيلة الذكية: لو الرابط تم تحويل امتداده لـ .ogg عشان Meta، بنرجعه لـ .webm في العرض 
//     // عشان نضمن إنه يشتغل في متصفح الأدمن (كروم وسفاري) بكفاءة كاملة ومن غير تعليق
//     if (audioUrl && audioUrl.endsWith('.ogg') && audioUrl.includes('cloudinary')) {
//       audioUrl = audioUrl.replace('.ogg', '.webm');
//     }

//     return (
//       <div className="pt-1 w-full min-w-[200px] max-w-full">
//         <audio src={audioUrl} controls preload="metadata" className="w-full h-8 custom-audio" />
//       </div>
//     );
//   }

//   return <div className="p-2 bg-black/5 dark:bg-white/5 rounded text-xs break-words">📎 Attachment: {msg.type}</div>;
// };

//  return (
//   <div className={`flex flex-col h-screen w-full bg-[#f0f2f5] dark:bg-[#0c0c0c] text-slate-900 dark:text-slate-100 overflow-hidden ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
//     <div className="flex flex-1 h-full w-full overflow-hidden relative">
      
//       {/* SIDEBAR */}
//       <div className={`w-full md:w-[360px] lg:w-[400px] flex flex-col bg-white dark:bg-[#111] border-e border-gray-200 dark:border-white/5 shrink-0 h-full ${replyTarget ? 'hidden md:flex' : 'flex'}`}>
//         <div className="p-3.5 space-y-3 shrink-0">
//           <div className="flex items-center justify-between">
//             <h1 className="text-lg font-black text-red-700 flex items-center gap-2">
//               <Headset size={22}/> VESTRO <span className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">LIVE</span>
//             </h1>
//           </div>
//           <div className="relative group">
//             <Search className={`${isRTL ? "right-3" : "left-3"} absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors`} size={16} />
//             <input 
//               type="text" 
//               placeholder={isRTL ? "بحث في المحادثات..." : "Search conversations..."}
//               className={`w-full bg-gray-100 dark:bg-white/5 rounded-xl py-2 ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} text-xs sm:text-sm outline-none border border-transparent focus:border-red-500/50 transition-all`}
//               value={search} onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto custom-scrollbar division-y division-gray-100 dark:division-white/5">
//           {logs.map((msg) => {
//             const isCurrentActive = replyTarget?.phone === msg.phone;
//             const hasUnread = msg.unreadCount > 0 && !isCurrentActive;
            
//             return (
//               <div 
//                 key={msg._id} 
//                 onClick={() => openChat(msg)}
//                 className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors 
//                   ${isCurrentActive ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
//                   ${hasUnread ? 'bg-green-50/30 dark:bg-green-500/[0.03]' : ''}`}
//               >
//                 <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative text-sm">
//                   {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name.charAt(0).toUpperCase() : <User size={20}/>}
//                   {hasUnread && (
//                     <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111]"></span>
//                   )}
//                 </div>
                
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-center mb-0.5 gap-1">
//                     <h3 className={`text-[13.5px] truncate ${hasUnread ? 'font-black text-black dark:text-white' : 'font-bold'}`}>
//                       {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name : msg.phone}
//                     </h3>
//                     <span className={`text-[9px] shrink-0 tabular-nums ${hasUnread ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
//                       {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
//                     </span>
//                   </div>
                  
//                   <div className="flex items-center justify-between gap-1.5">
//                     <div className="flex items-center gap-1 min-w-0 flex-1">
//                       {msg.direction === "outbound" && <StatusIcon status={msg.status} size={13} />}
//                       <p className={`text-xs truncate ${hasUnread ? 'text-black dark:text-slate-200 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
//                         {msg.text || '📷 Media'}
//                       </p>
//                     </div>
                    
//                     {hasUnread && (
//                       <span className="bg-green-500 text-white font-bold text-[9px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shrink-0 shadow-sm">
//                         {msg.unreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* CHAT WINDOW - ثابت ومستقر تماماً وبدون أي سكرول خارجي */}
//       <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-[#0c0c0c] relative ${!replyTarget ? 'hidden md:flex' : 'flex'}`}>
//         {replyTarget ? (
//           <>
//            {/* Header */}
// <div className="fixed  left-0 right-0 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-30 shadow-sm shrink-0 w-full select-none">
//   <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//     <button onClick={() => setReplyTarget(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors md:hidden">
//       <ChevronLeft size={22} className={isRTL ? "rotate-180" : ""} />
//     </button>
//     <div className="relative shrink-0">
//       <div className="w-9  sm:w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
//         {replyTarget.customer?.name?.charAt(0) || "V"}
//       </div>
//       <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#111] rounded-full"></div>
//     </div>
//     <div className="min-w-0">
//       <h2 className="text-xs sm:text-sm font-black dark:text-white leading-tight truncate">
//         {replyTarget.customer?.name || replyTarget.phone}
//       </h2>
//       <div className="flex items-center gap-1 mt-0.5">
//         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
//         <p className="text-[9px] text-green-500 font-bold tracking-wider">ONLINE</p>
//       </div>
//     </div>
//   </div>

//   <div className="flex items-center gap-1 sm:gap-2 shrink-0">
//     <div className="hidden lg:flex flex-col items-end px-3 border-e border-gray-200 dark:border-white/10">
//       <span className="text-[9px] font-bold text-gray-400">CUSTOMER PHONE</span>
//       <span className="text-[11px] font-mono">{replyTarget.phone}</span>
//     </div>

//     <button 
//       onClick={() => fetchChatMessages(replyTarget.phone)} 
//       title={isRTL ? "تحديث المحادثة" : "Refresh Chat"}
//       className="p-2 text-gray-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95 group"
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:rotate-180 transition-transform duration-500">
//         <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
//         <polyline points="21 3 21 8 16 8" />
//       </svg>
//     </button>
//     <button 
//       onClick={() => handleClearChat(replyTarget.phone)} 
//       title={isRTL ? "إخفاء المحادثة" : "Hide Chat"}
//       className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all"
//     >
//       <Trash2 size={18} />
//     </button>
//     <MoreVertical className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors" size={18} />
//   </div>
// </div>

//             {/* صندوق الرسائل - هو الوحيد اللي مسموحله يعمل سكرول داخلي */}
//             <div className="flex-1 overflow-y-auto p-4 mt-10 pb-12 sm:p-6 space-y-3 bg-[#e5ddd5] dark:bg-[#090909] relative custom-scrollbar">
//               <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none" 
//                    style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '300px' }} />
              
//               {activeChat.map((msg, idx) => {
//                 const isMe = msg.direction === "outbound";
//                 const isOrder = msg.type === "order";
//                 return (
//                   <div key={msg._id || idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
//                     <div className={`relative max-w-[88%] sm:max-w-[70%] shadow-sm rounded-xl break-words
//                       ${isOrder 
//                         ? "p-0.5 bg-transparent border-0 shadow-none" 
//                         : isMe 
//                           ? "px-2.5 pt-1.5 pb-1 bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-50 rounded-tr-none" 
//                           : "px-2.5 pt-1.5 pb-1 bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 rounded-tl-none"
//                       }`}
//                     >
//                       {renderMedia(msg)}
//                       <div className={`flex items-center justify-end gap-1 mt-0.5 select-none ${isOrder ? "px-1 text-slate-500 dark:text-slate-400" : ""}`}>
//                         <span className="text-[8.5px] font-medium opacity-60 uppercase">
//                           {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
//                         </span>
//                         {isMe && <StatusIcon status={msg.status} size={12} />}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={chatEndRef} />
//             </div>

// {/* سطر الإدخال والكتابة المطور بالكامل */}
// <div className="p-2 sm:p-3 bg-[#f0f2f5] dark:bg-[#111] flex items-center gap-2 border-t border-gray-200 dark:border-white/5 shrink-0 w-full relative">
  
//   {/* زر الـ Media المطور */}
//   <div className="flex items-center shrink-0">
//     <label className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors text-gray-500 block active:scale-95">
//       <Paperclip size={20} />
//       <input 
//         type="file"
//         className="hidden"
//         accept="image/*,audio/*"
//         multiple
//         onChange={handleMediaSelect}
//       />
//     </label>
//   </div>

//   {/* زر الريكورد (المايك) */}
//   <div className="flex items-center shrink-0">
//     {isRecording ? (
//       <button 
//         onClick={stopRecording}
//         className="p-2 bg-red-500 text-white rounded-full animate-pulse transition-colors active:scale-95 flex items-center justify-center"
//         title={isRTL ? "إيقاف التسجيل" : "Stop Recording"}
//       >
//         <Square size={18} fill="currentColor" />
//       </button>
//     ) : (
//       <button 
//         onClick={startRecording}
//         className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 rounded-full transition-colors active:scale-95 flex items-center justify-center"
//         title={isRTL ? "تسجيل صوتي" : "Record Voice Note"}
//       >
//         <Mic size={20} />
//       </button>
//     )}
//   </div>

//   {/* صندوق النص */}
//   <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden focus-within:ring-1 ring-red-500/30 transition-all">
    
//     {/* مؤشر جاري التسجيل الآن */}
//     {isRecording && (
//       <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-semibold animate-pulse border-b border-gray-200 dark:border-white/5">
//         <span className="w-2 h-2 rounded-full bg-red-600 block"></span>
//         <span>{isRTL ? "جاري تسجيل صوتك الآن..." : "Recording your voice..."}</span>
//       </div>
//     )}

//     {/* معاينة الصور المتعددة */}
//     {selectedFiles.length > 0 && (
//       <div className="px-3 py-2 bg-gray-100 dark:bg-[#1f2c34] flex flex-wrap gap-1.5 items-center justify-between border-b border-gray-200 dark:border-white/5 text-xs">
//         <div className="flex flex-wrap gap-1 max-w-[85%]">
//           {selectedFiles.map((f, i) => (
//             <span key={i} className="bg-white dark:bg-black/20 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md border border-gray-200 dark:border-white/5 font-mono max-w-[120px] truncate">
//               📷 {f.name}
//             </span>
//           ))}
//         </div>
//         <button onClick={() => setSelectedFiles([])} className="text-red-500 hover:text-red-700 font-bold px-1">✕</button>
//       </div>
//     )}

//     {/* معاينة الريكورد الصوتي بعد الانتهاء وقبل الإرسال */}
//     {audioBlob && !isRecording && (
//       <div className="px-3 py-1.5 bg-gray-100 dark:bg-[#1f2c34] flex items-center justify-between border-b border-gray-200 dark:border-white/5 text-xs">
//         <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
//           🎙️ {isRTL ? "تسجيل صوتي جاهز للإرسال" : "Voice Note Ready to Send"} 
//           <span className="text-gray-400 font-mono font-normal">({Math.round(audioBlob.size / 1024)} KB)</span>
//         </span>
//         <button onClick={() => setAudioBlob(null)} className="text-red-500 hover:text-red-700 font-bold px-1">✕</button>
//       </div>
//     )}
    
//     <textarea 
//       ref={textareaRef}
//       rows="1"
//       disabled={isRecording}
//       placeholder={
//         isRecording 
//           ? "" 
//           : selectedFiles.length > 0 
//             ? (isRTL ? "أضف تعليقاً على الصور..." : "Add a caption...") 
//             : audioBlob 
//               ? (isRTL ? "اضغط إرسال لتأكيد الريكورد..." : "Press send to confirm voice note...") 
//               : (isRTL ? "اكتب رسالة..." : "Type a message...")
//       }
//       className="w-full bg-transparent border-none outline-none py-2.5 px-3 text-[14px] sm:text-[15px] dark:text-white resize-none max-h-24 custom-scrollbar dynamic-textarea block disabled:opacity-50"
//       value={replyText}
//       onChange={handleTextareaChange}
//       onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
//     />
//   </div>

//   {/* زر الإرسال */}
//   <button 
//     disabled={sending || isRecording || (!replyText.trim() && selectedFiles.length === 0 && !audioBlob)}
//     onClick={handleSendReply}
//     className="w-10 h-10 sm:w-11 h-11 bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 disabled:opacity-40 disabled:grayscale transition-all shrink-0"
//   >
//     {sending ? (
//       <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
//     ) : (
//       <Send size={18} className={isRTL ? "rotate-180" : "ml-0.5"} />
//     )}
//   </button>
// </div>
//           </>
//         ) : (
//           /* واجهة الترحيب عند عدم فتح شات */
//           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0c0c0c] h-full">
//             <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-4 animate-bounce shadow-lg shadow-red-500/5">
//               <MessageCircle size={40} />
//             </div>
//             <h2 className="text-xl font-black mb-1 dark:text-white tracking-tight uppercase">
//               {isRTL ? "منصة فيسترو للمحادثات" : "VESTRO CHAT HUB"}
//             </h2>
//             <p className="text-gray-500 dark:text-gray-400 max-w-xs text-xs sm:text-sm leading-relaxed">
//               {isRTL ? "اختر محادثة من القائمة الجانبية لبدء الرد على العملاء بشكل مباشر" : "Select a conversation from the sidebar to start responding to customers in real-time."}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* ستايل مخصص */}
//     <style>{`
//       .font-arabic { font-family: 'Cairo', sans-serif; }
//       .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//       .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//       .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
//       .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
      
//       .custom-audio::-webkit-media-controls-panel { background-color: #f1f3f4; }
//       .dark .custom-audio { filter: invert(100%) hue-rotate(180deg) brightness(1.6) contrast(0.9); }
//       .custom-audio { border-radius: 30px; }
      
//       .dynamic-textarea { height: auto; min-height: 40px; }

//       @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
//       .animate-in { animation: fadeIn 0.2s ease-out; contain-visibility: auto; }
//     `}</style>
    
//   </div>
// );
// }


import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "../../api/axiosInstance";
import { useLanguage } from "../../context/LanguageContext";
import { io } from "socket.io-client";
import { 
  Search, CheckCheck, Check, User, Send, Headset, 
  MessageCircle, ChevronLeft, MoreVertical, 
  Clock, Trash2, ShoppingBag, Hash, Paperclip, Mic, Square,Tag
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
  const [isRecording, setIsRecording] = useState(false); // حالة التسجيل الحالي
  const [mediaRecorder, setMediaRecorder] = useState(null); // كائن التسجيل
  const [selectedFiles, setSelectedFiles] = useState([]); // مصفوفة للصور أو الميديا المتعددة
  const [audioBlob, setAudioBlob] = useState(null);       // لحفظ ملف الصوت أو الريكورد

  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
const [forwardMessageId, setForwardMessageId] = useState(null);
const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
const [forwardCustomersList, setForwardCustomersList] = useState([]);
const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  // حالات الرسائل المثبتة وقائمة الخيارات
const [pinnedMessages, setPinnedMessages] = useState([]);
const [activeMenuMessageId, setActiveMenuMessageId] = useState(null); // للـ Dropdown بتاع كل رسالة
const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
const [employees, setEmployees] = useState([]);
  // الخواص الجديدة للـ Typing Indicator والموظفين والـ Reactions
  const [isPeerTyping, setIsPeerTyping] = useState(false); // حالة الطرف الآخر بيكتب ولا لأ
  const typingTimeoutRef = useRef(null);

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

  // الدالة المحدثة لعمل ريفريش كامل (للشات المفتوح والسايد بار معاً)
  const fetchChatMessages = async (phone) => {
    if (!phone) return;
    try {
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

      // === تحديث الشات المفتوح ===
      setActiveChat((prev) => {
        if (!prev || prev.length === 0) return prev;
        return prev.map(msg => {
          const msgIdStr = msg._id ? String(msg._id) : null;
          const msgWamIdStr = msg.whatsappMessageId ? String(msg.whatsappMessageId) : null;
          const isMatch = (updateIdStr && msgIdStr === updateIdStr) || 
                          (updateWamIdStr && msgWamIdStr === updateWamIdStr);

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

    // الاستماع للـ Typing Indicator القادم من العميل
    currentSocket.on("user_typing_status", (data) => {
      if (activePhoneRef.current === data.phone) {
        setIsPeerTyping(data.isTyping);
      }
    });

    // المزامنة الحية عند تحويل الشات لموظف آخر (متوافق مع الـ assignChat controller)
    currentSocket.on("chat_assigned", (data) => {
      setLogs((prev) => 
        prev.map((log) => 
          log.phone === data.phone 
            ? { ...log, assignedTo: data.assignedTo, chatStatus: "Waiting" } 
            : log
        )
      );
      if (activePhoneRef.current === data.phone) {
        setReplyTarget((prev) => prev ? { ...prev, assignedTo: data.assignedTo, chatStatus: "Waiting" } : null);
      }
    });

    // المزامنة الحية للتاجات والـ Status والتثبيت (متوافق مع الـ updateCustomerMeta controller)
    currentSocket.on("customer_meta_updated", (data) => {
      setLogs((prev) => 
        prev.map((log) => 
          log.phone === data.phone 
            ? { ...log, ...data.customer } 
            : log
        )
      );
      if (activePhoneRef.current === data.phone) {
        setReplyTarget((prev) => prev ? { ...prev, ...data.customer } : null);
      }
    });

    // تنبيه صوتي للرسائل غير المقروءة في الشاتات الخلفية
    currentSocket.on("unread_alert", (data) => {
      if (activePhoneRef.current !== data.phone) {
        try {
          const audio = new Audio("/assets/sounds/notification.mp3");
          audio.play().catch(() => {});
        } catch (e) {}
      }
    });

    // استقبال وإظهار الريأكشن على الرسائل لايف
    currentSocket.on("new_reaction", (data) => {
      if (activePhoneRef.current === data.phone) {
        setActiveChat((prev) => 
          prev.map((msg) => 
            msg.whatsappMessageId === data.targetMessageId 
              ? { ...msg, reaction: data.emoji } 
              : msg
          )
        );
      }
    });

    currentSocket.on("receive-message", (newMessage) => {
      const isChatOpen = activePhoneRef.current === newMessage.phone;

      if (isChatOpen) {
        setIsPeerTyping(false); // إلغاء علامة الكتابة بمجرد استقبال الرسالة بالفعل
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

      if (isCustomerMsg && !isChatOpen) {
        setLocalUnreadPhones((prevPhones) => {
          const currentLocalCount = prevPhones[newMessage.phone] || 0;
          const updatedPhones = {
            ...prevPhones,
            [newMessage.phone]: currentLocalCount + 1
          };
          
          setLogs((prevLogs) => {
            const existingLog = prevLogs.find(l => l.phone === newMessage.phone);
            const filtered = prevLogs.filter(l => l.phone !== newMessage.phone);
            
            const updatedLog = {
              ...newMessage,
              unreadCount: updatedPhones[newMessage.phone], 
              customer: existingLog?.customer || newMessage.customer || { name: "Unknown Customer" }
            };
            return [updatedLog, ...filtered];
          });

          return updatedPhones;
        });
      } else {
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
      currentSocket.off("user_typing_status");
      currentSocket.off("chat_assigned");
      currentSocket.off("customer_meta_updated");
      currentSocket.off("unread_alert");
      currentSocket.off("new_reaction");
      currentSocket.off("receive-message");
      currentSocket.disconnect();
    };
  }, []); 

  useEffect(() => {
  if (!isForwardModalOpen) return;



  const delayDebounceFn = setTimeout(() => {
    setIsSearchingCustomers(true);
    axios.get(`/chat-actions/customers?search=${searchCustomerQuery}`)
      .then((res) => {
        if (res.data.success) {
          setForwardCustomersList(res.data.customers);
        }
      })
      .catch((err) => console.error("Error fetching customers:", err))
      .finally(() => setIsSearchingCustomers(false));
  }, 300); // Debounce عشان ما يضغطش على السيرفر مع كل حرف

  return () => clearTimeout(delayDebounceFn);
}, [searchCustomerQuery, isForwardModalOpen]);
useEffect(() => {
  // ⚠️ تأكد أن الـ الـ URL مطابق تماماً لراوت الباك إند بتاعك
  axios.get("/chat-actions/agents") 
    .then(res => {
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      }
    })
    .catch(err => console.error("Error fetching agents:", err));
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

  useEffect(() => {
  if (!activeChat || !activeChat.phone) return;

  // جلب الرسائل المثبتة للعميل الحالي
  axios.get(`/chat-actions/pinned/${activeChat.phone}`)
    .then((res) => {
      if (res.data.success) setPinnedMessages(res.data.pinned);
    })
    .catch((err) => console.error("Error fetching pinned messages:", err));
}, [activeChat]);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get("/messages", { params: { search } });
      const fetchedMessages = data.messages || [];
      
      setLogs(fetchedMessages.map(msg => {
        const localCount = localUnreadPhones[msg.phone];
        return {
          ...msg,
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
  }, [search]);

  const openChat = async (msg) => {
    setReplyTarget(msg);
    setActiveChat([]); 
    setIsPeerTyping(false);
    
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

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 16 * 1024 * 1024; 
    const validFiles = [];

    for (let file of files) {
      if (file.size > maxSize) {
        alert(isRTL ? `الملف ${file.name} حجمه كبير جداً. الحد الأقصى 16 ميجابايت.` : `File ${file.name} is too large. Max size is 16MB.`);
        continue;
      }
      validFiles.push(file);
    }

    const hasAudio = validFiles.some(f => f.type.startsWith('audio/'));
    
    if (hasAudio) {
      setAudioBlob(validFiles[0]);
      setSelectedFiles([]);
    } else {
      setSelectedFiles(validFiles);
      setAudioBlob(null);
    }
  };

  const handleSendReply = async () => {
    const hasImages = selectedFiles.length > 0;
    const hasAudio = !!audioBlob;
    
    if ((!replyText.trim() && !hasImages && !hasAudio) || sending) return;
    
    const content = replyText.trim();
    const tempId = "temp_" + Date.now().toString(); 
    
    setSending(true);
    setReplyText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    if (socket.current?.connected && replyTarget?.phone) {
      socket.current.emit("agent_typing_status", { phone: replyTarget.phone, isTyping: false });
    }

    let optimisticText = content;
    let optimisticType = "text";
    
    if (!optimisticText) {
      if (hasImages) optimisticText = isRTL ? `📷 جاري إرسال ${selectedFiles.length} صور...` : `📷 Sending ${selectedFiles.length} images...`;
      if (hasAudio) optimisticText = isRTL ? "🎵 جاري إرسال تسجيل صوتي..." : "🎵 Sending audio...";
    }
    
    if (hasImages) optimisticType = "image";
    if (hasAudio) optimisticType = "audio";

    const optimisticMessage = {
      _id: tempId,
      text: optimisticText,
      direction: "outbound",
      status: "pending",
      createdAt: new Date().toISOString(),
      type: optimisticType
    };
    setActiveChat((prev) => [...prev, optimisticMessage]);

    try {
      const formData = new FormData();
      formData.append("phone", replyTarget.phone);
      formData.append("message", content);
      
      if (hasImages) {
        formData.append("type", "image");
        selectedFiles.forEach((file) => {
          formData.append("file", file); 
        });
      } else if (hasAudio) {
        formData.append("type", "audio");
        const audioFile = audioBlob instanceof File ? audioBlob : new File([audioBlob], "voice.mp3", { type: audioBlob.type || "audio/mp3" });
        formData.append("file", audioFile);
      } else {
        formData.append("type", "text");
      }

      const res = await axios.post("/whatsapp/send", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        const finalMessage = {
          _id: res.data.data?._id || res.data.dbId || tempId,
          whatsappMessageId: res.data.messageId || res.data.whatsappMessageId,
          text: content || (hasImages ? `📷 Photo (${selectedFiles.length})` : hasAudio ? "🎵 Audio" : ""),
          direction: "outbound",
          status: "sent",
          createdAt: new Date().toISOString(),
          type: optimisticType,
          mediaUrl: res.data.data?.mediaUrl || null,
          mediaUrls: res.data.data?.mediaUrls || null
        };

        setActiveChat((prev) => 
          prev.map(msg => msg._id?.toString() === tempId ? finalMessage : msg)
        );

        setLogs((prev) => {
          const filtered = prev.filter(l => l.phone !== replyTarget.phone);
          const updatedLog = { 
            ...replyTarget, 
            text: finalMessage.text, 
            status: 'sent', 
            createdAt: finalMessage.createdAt, 
            direction: 'outbound', 
            whatsappMessageId: finalMessage.whatsappMessageId,
            unreadCount: 0 
          };
          return [updatedLog, ...filtered];
        });

        setSelectedFiles([]);
        setAudioBlob(null);
      }
    } catch (err) { 
      console.error("حدث خطأ أثناء الإرسال:", err);
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

    if (socket.current?.connected && replyTarget?.phone) {
      socket.current.emit("agent_typing_status", { phone: replyTarget.phone, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.current.emit("agent_typing_status", { phone: replyTarget.phone, isTyping: false });
      }, 2000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options = { mimeType: 'audio/ogg;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setSelectedFiles([]); 
    } catch (err) {
      console.error("تعذر الوصول للمايكروفون:", err);
      alert(isRTL ? "برجاء السماح بالوصول للمايكروفون أولاً." : "Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const renderMedia = (msg) => {
    if (msg.type === "text" && !msg.mediaUrl) {
      return (
        <div className="relative group">
          <p className="text-[14.5px] leading-tight whitespace-pre-wrap break-words">{msg.text}</p>
          {msg.reaction && (
            <div className={`absolute -bottom-3 ${msg.direction === 'outbound' ? 'left-2' : 'right-2'} bg-white dark:bg-[#222e35] text-sm px-1 rounded-full border border-gray-200 dark:border-white/10 shadow-sm select-none`}>
              {msg.reaction}
            </div>
          )}
        </div>
      );
    }

    if (msg.type === "reaction") {
      return (
        <div className="flex items-center gap-1.5 py-0.5 px-1 bg-black/5 dark:bg-white/5 rounded-md">
          <span className="text-base select-none">{msg.text}</span>
          <span className="text-[11px] text-gray-400 italic">
            {isRTL ? "تفاعل على رسالة" : "Reacted to a message"}
          </span>
        </div>
      );
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
                const rawName = item.product_name || item.name || (isRTL ? "منتج غير معروف" : "Unknown Product");
                const variantColor = item.color && item.color !== "N/A" ? item.color : null;
                const variantSize = item.size && item.size !== "N/A" ? item.size : null;

                return (
                  <div key={index} className="flex items-start justify-between gap-2 text-xs border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1 flex items-start gap-2">
                      {productImg ? (
                        <img 
                          src={productImg} 
                          alt={rawName} 
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
                          {rawName}
                        </p>
                        
                        <p className="text-gray-400 dark:text-gray-500 text-[11px] tabular-nums">
                          {isRTL ? "الكمية:" : "Qty:"} <span className="font-bold text-red-600 dark:text-red-400">{item.quantity}</span>
                        </p>

                        {(variantColor || variantSize) && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[10.5px] font-medium">
                            {variantColor && (
                              <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1 max-w-[120px] truncate">
                                <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                                <span>{variantColor}</span>
                              </span>
                            )}
                            {variantSize && (
                              <span className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">
                                {variantSize}
                              </span>
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

    if (!msg.mediaUrl && (!msg.mediaUrls || msg.mediaUrls.length === 0)) {
      return <p className="text-[13px] leading-tight text-gray-400 italic">{isRTL ? "ملف وسائط غير صالح" : "Invalid media file"}</p>;
    }

    const cleanUrl = (url) => {
      if (!url) return "";
      return url.includes('http') ? url.substring(url.lastIndexOf('http')) : url;
    };

    if (msg.type === "image") {
      if (msg.mediaUrls && msg.mediaUrls.length > 0) {
        return (
          <div className={`grid ${msg.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 p-1 max-w-[280px] sm:max-w-xs relative group`}>
            {msg.mediaUrls.map((rawUrl, index) => {
              const finalUrl = cleanUrl(rawUrl);
              return (
                <img 
                  key={index}
                  src={finalUrl} 
                  loading="lazy"
                  className="rounded-lg max-h-40 w-full object-cover cursor-zoom-in aspect-square transition-transform active:scale-95" 
                  alt={`attachment-${index}`} 
                  onClick={() => window.open(finalUrl)}
                />
              );
            })}
            {msg.reaction && (
              <div className={`absolute -bottom-3 ${msg.direction === 'outbound' ? 'left-2' : 'right-2'} bg-white dark:bg-[#222e35] text-sm px-1 rounded-full border border-gray-200 dark:border-white/10 shadow-sm select-none`}>
                {msg.reaction}
              </div>
            )}
          </div>
        );
      }

      const singleMediaUrl = cleanUrl(msg.mediaUrl);
      return (
        <div className="relative group">
          <img 
            src={singleMediaUrl} 
            loading="lazy"
            className="rounded-md max-h-64 sm:max-h-80 w-full object-cover cursor-zoom-in aspect-auto" 
            alt="media" 
            onClick={() => window.open(singleMediaUrl)}
          />
          {msg.reaction && (
            <div className={`absolute -bottom-3 ${msg.direction === 'outbound' ? 'left-2' : 'right-2'} bg-white dark:bg-[#222e35] text-sm px-1 rounded-full border border-gray-200 dark:border-white/10 shadow-sm select-none`}>
              {msg.reaction}
            </div>
          )}
        </div>
      );
    }
    
    if (msg.type === "audio" || msg.type === "voice") {
      let audioUrl = cleanUrl(msg.mediaUrl);
      if (audioUrl && audioUrl.endsWith('.ogg') && audioUrl.includes('cloudinary')) {
        audioUrl = audioUrl.replace('.ogg', '.webm');
      }

      return (
        <div className="pt-1 w-full min-w-[200px] max-w-full relative group">
          <audio src={audioUrl} controls preload="metadata" className="w-full h-8 custom-audio" />
          {msg.reaction && (
            <div className={`absolute -bottom-3 ${msg.direction === 'outbound' ? 'left-2' : 'right-2'} bg-white dark:bg-[#222e35] text-sm px-1 rounded-full border border-gray-200 dark:border-white/10 shadow-sm select-none`}>
              {msg.reaction}
            </div>
          )}
        </div>
      );
    }

    return <div className="p-2 bg-black/5 dark:bg-white/5 rounded text-xs break-words">📎 Attachment: {msg.type}</div>;
  };
 

  return (
  <div className={`flex flex-col h-screen w-full bg-[#f0f2f5] dark:bg-[#0c0c0c] text-slate-900 dark:text-slate-100 overflow-hidden ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
    <div className="flex flex-1 h-full w-full overflow-hidden relative">
      
      {/* SIDEBAR (قائمة المحادثات) */}
      <div className={`w-full md:w-[360px] lg:w-[400px] flex flex-col bg-white dark:bg-[#111] border-e border-gray-200 dark:border-white/5 shrink-0 h-full ${replyTarget ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3.5 space-y-3 shrink-0 bg-white dark:bg-[#111] z-10 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-red-700 flex items-center gap-2">
              <Headset size={22}/> VESTRO <span className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">LIVE</span>
            </h1>
          </div>
          <div className="relative group">
            <Search className={`${isRTL ? "right-3" : "left-3"} absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors`} size={16} />
            <input 
              type="text" 
              placeholder={isRTL ? "بحث في المحادثات أو الأرقام..." : "Search chats or numbers..."}
              className={`w-full bg-gray-100 dark:bg-white/5 rounded-xl py-2 ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} text-xs sm:text-sm outline-none border border-transparent focus:border-red-500/50 transition-all`}
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* قائمة المحادثات المدعمة بالتثبيت وحالة الشات */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-white/5">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">{isRTL ? "لا توجد محادثات متاحة" : "No conversations found"}</div>
          ) : (
            // ترتيب المحادثات: المتبت أولاً (isPinned) ثم بالأحدث زمانياً
            [...logs].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((msg) => {
              const isCurrentActive = replyTarget?.phone === msg.phone;
              const hasUnread = msg.unreadCount > 0 && !isCurrentActive;
              
              return (
                <div 
                  key={msg._id || msg.phone} 
                  onClick={() => openChat(msg)}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors relative
                    ${isCurrentActive ? 'bg-red-50/40 dark:bg-red-900/10' : ''}
                    ${hasUnread ? 'bg-green-50/20 dark:bg-green-500/[0.02]' : ''}`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative text-sm">
                    {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name.charAt(0).toUpperCase() : <User size={20}/>}
                    {hasUnread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1 gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className={`text-[13.5px] truncate ${hasUnread ? 'font-black text-black dark:text-white' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                          {msg.customer?.name && msg.customer.name !== "Unknown Customer" ? msg.customer.name : msg.phone}
                        </h3>
                        {msg.isPinned && (
                          <span className="text-[10px] text-red-600 shrink-0 transform rotate-45">📌</span>
                        )}
                      </div>
                      <span className={`text-[9.5px] shrink-0 tabular-nums ${hasUnread ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {msg.direction === "outbound" && <StatusIcon status={msg.status} size={13} />}
                        <p className={`text-xs truncate ${hasUnread ? 'text-black dark:text-slate-100 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                          {msg.text || (msg.type === 'image' ? (isRTL ? '📷 صورة' : '📷 Photo') : msg.type === 'audio' || msg.type === 'voice' ? (isRTL ? '🎙️ ريكورد' : '🎙️ Voice Note') : (isRTL ? '📎 وسائط' : '📎 Media'))}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* عرض حالة الشات مثل Waiting أو المسؤول عنه حالياً */}
                        {msg.chatStatus === "Waiting" && (
                          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-[9px] px-1.5 py-0.5 rounded">
                            {isRTL ? "انتظار" : "Waiting"}
                          </span>
                        )}
                        {msg.assignedTo?.name && (
                          <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] px-1 rounded truncate max-w-[60px]" title={`Assigned to ${msg.assignedTo.name}`}>
                            👤 {msg.assignedTo.name.split(' ')[0]}
                          </span>
                        )}
                        {hasUnread && (
                          <span className="bg-green-500 text-white font-bold text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-sm font-mono animate-pulse">
                            {msg.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* عرض التاجات المضافة للعميل لايف */}
                    {msg.tags && msg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden max-h-5">
                        {msg.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[9px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-1 py-0.2 rounded font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-[#0c0c0c] relative ${!replyTarget ? 'hidden md:flex' : 'flex'}`}>
        {replyTarget ? (
          <>
{/* ⚠️ التعديل هنا: تم تغيير الكود ليصبح sticky top-0 مع إضافة خلفية z-30 ليثبت مكانه تماماً */}
<div className="sticky top-0 w-full flex flex-col shrink-0 select-none z-30 bg-white dark:bg-[#111]">
  {/* 1️⃣ الهيدر الرئيسي للمحادثة */}
  <div className="h-14 fixed sm:h-16 flex items-center justify-between px-2 sm:px-4 bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 shadow-sm w-full gap-1">
    
    {/* الطرف الأيسر: بيانات وصورة العميل */}
    <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
      <button 
        onClick={() => setReplyTarget(null)} 
        className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors md:hidden text-gray-600 dark:text-gray-300 shrink-0"
      >
        <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
      </button>
      
      <div className="relative shrink-0">
        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner">
          {replyTarget.customer?.name?.trim()?.charAt(0)?.toUpperCase() || "V"}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#111] rounded-full"></div>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-xs sm:text-sm font-black dark:text-white leading-tight truncate flex items-center gap-1">
          <span className="truncate">{replyTarget.customer?.name || replyTarget.phone}</span>
          {activeChat.some(m => m.isPinned) && <span className="text-[10px] text-red-500 shrink-0">📌</span>}
        </h2>
        <div className="flex items-center gap-1 mt-0.5">
          {isPeerTyping ? (
            <p className="text-[9px] sm:text-[10px] text-green-500 font-bold animate-pulse tracking-wide uppercase">
              {isRTL ? "جاري الكتابة..." : "TYPING..."}
            </p>
          ) : (
            <div className="flex items-center gap-1 min-w-0 w-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></div>
              <p className="text-[8px] sm:text-[9px] text-green-500 font-bold tracking-wider uppercase shrink-0">
                {replyTarget.chatStatus || "ONLINE"}
              </p>
              {replyTarget.assignedTo?.name && (
                <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 truncate max-w-[70px] sm:max-w-[100px]">
                  • {isRTL ? "مسؤول:" : "Agent:"} {replyTarget.assignedTo.name.split(' ')[0]}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* الطرف الأيمن: أزرار التحكم والـ Actions العلوية */}
    <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
      
      {/* 🚀 زرار تحويل المحادثة الذكي (Forward / Assign Chat) */}
      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsAssignMenuOpen(!isAssignMenuOpen);
          }} 
          title={isRTL ? "تحويل الشات لموظف آخر" : "Forward / Assign Chat"}
          className={`p-1.5 sm:p-2 rounded-full transition-all active:scale-95 flex items-center justify-center z-50 relative
            ${isAssignMenuOpen 
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" 
              : "text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
            <path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
          </svg>
        </button>

        {/* طبقة شفافة لإغلاق القائمة فوراً عند الضغط في أي مكان خارجي */}
        {isAssignMenuOpen && (
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsAssignMenuOpen(false)}
          />
        )}

        {/* 📋 القائمة المنبثقة لاختيار الموظف فوراً بضغطة واحدة */}
        {isAssignMenuOpen && (
          <div className={`absolute top-11 bg-white dark:bg-[#2a3942] shadow-2xl border border-gray-100 dark:border-white/5 rounded-xl py-1.5 w-44 sm:w-48 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto custom-scrollbar
            ${isRTL ? "left-0 origin-top-left" : "right-0 origin-top-right"}`}
          >
            <div className={`px-3 py-1 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase border-b border-gray-50 dark:border-white/5 pb-1 mb-1
              ${isRTL ? "text-right" : "text-left"}`}>
              {isRTL ? "اختر موظف للتحويل" : "Assign to agent"}
            </div>

            {typeof employees !== 'undefined' && employees.length > 0 ? (
              employees.map((emp) => (
                <button
                  key={emp._id}
                  onClick={() => {
                    setIsAssignMenuOpen(false);
                    axios.patch(`/chat-actions/${replyTarget.phone}/assign`, { userId: emp._id })
                      .then(() => {
                        alert(isRTL ? `تم تحويل المحادثة إلى ${emp.name}` : `Chat assigned to ${emp.name}`);
                        fetchChatMessages(replyTarget.phone);
                      })
                      .catch(err => alert(isRTL ? "خطأ في التحويل" : "Error forwarding"));
                  }}
                  className={`w-full px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors
                    ${isRTL ? "flex-row-reverse text-right justify-start" : "text-left justify-start"}`}
                >
                  <span className="shrink-0 text-gray-400 text-[11px]">👤</span>
                  <span className="truncate font-medium flex-1">{emp.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[11px] text-gray-400 italic text-center">
                {isRTL ? "لا يوجد موظفين متاحين" : "No agents available"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🏷️ زر تغيير حالة الشات سريعا */}
      <button 
        onClick={() => {
          const status = window.prompt(isRTL ? "أدخل الحالة الجديدة (Waiting, Replied, Closed):" : "Enter status:");
          if(status) {
            axios.patch(`/chat-actions/${replyTarget.phone}/meta`, { chatStatus: status })
              .then(() => fetchChatMessages(replyTarget.phone));
          }
        }}
        title={isRTL ? "تحديث حالة الشات" : "Update Status"}
        className="p-1.5 sm:p-2 text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95"
      >
        <Tag size={18} />
      </button>

      {/* 🔄 زر تحديث الداتا (Sync) */}
      <button 
        onClick={() => fetchChatMessages(replyTarget.phone)} 
        title={isRTL ? "تحديث الداتا" : "Force Sync"}
        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] transform group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <polyline points="21 3 21 8 16 8" />
        </svg>
      </button>

      {/* 🗑️ زر إخفاء المحادثة */}
      <button 
        onClick={() => handleClearChat(replyTarget.phone)} 
        title={isRTL ? "إخفاء المحادثة" : "Hide Conversation"}
        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>

  {/* 2️⃣ شريط الرسائل المثبتة الفرعي (Sub-Header) */}
  {pinnedMessages && pinnedMessages.length > 0 && (
    <div className="w-full bg-slate-50/95 dark:bg-[#1a2329]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-3 sm:px-4 py-1.5 flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 animate-in slide-in-from-top duration-200">
      <span className="text-xs sm:text-sm shrink-0">📌</span>
      <div className={`flex-1 truncate font-medium ${isRTL ? "text-right" : "text-left"}`}>
        {pinnedMessages[pinnedMessages.length - 1].text || (isRTL ? "ملف مرفق مثبت" : "Pinned attachment")}
      </div>
      <button 
        onClick={() => {
          axios.patch(`/chat-actions/pin/${pinnedMessages[pinnedMessages.length - 1]._id}`)
            .then(() => setPinnedMessages([]))
            .catch((err) => console.error(err));
        }}
        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold px-1.5 py-0.5 transition-colors text-xs sm:text-sm shrink-0"
        title={isRTL ? "إلغاء التثبيت" : "Unpin"}
      >
        ✕
      </button>
    </div>
  )}
</div>

         {/* صندوق عرض الرسائل (Scroll Area) */}
<div className="flex-1 overflow-y-auto pt-16 pb-3 px-3 sm:px-6 space-y-3 bg-[#e5ddd5] dark:bg-[#090909] relative custom-scrollbar flex flex-col">
  <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.02] pointer-events-none" 
       style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '340px' }} />
  
  {/* رسالة تثبيت علوية داخل الشات إذا كانت هناك رسالة مثبتة (Pinned Message Header) */}
  {activeChat.some(m => m.isPinned) && (
    <div className="sticky top-2 z-20 mx-auto max-w-md w-full bg-white/95 dark:bg-[#1f2c34]/95 backdrop-blur shadow-sm rounded-lg p-2.5 flex items-center justify-between text-xs border border-gray-200 dark:border-white/5 animate-in">
      
      <div 
        onClick={async () => {
          const pinnedMsg = activeChat.find(m => m.isPinned);
          if (!pinnedMsg?._id) return;

          // 1️⃣ محاولة البحث عن الرسالة في الشاشة الحالية
          let element = document.getElementById(`msg-${pinnedMsg._id}`);
          
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-amber-100', 'dark:bg-amber-950/40', 'transition-all', 'duration-300');
            setTimeout(() => element.classList.remove('bg-amber-100', 'dark:bg-amber-950/40'), 1500);
          } else {
            // 2️⃣ لو مش موجودة (قديمة ومحصلهاش لود)
            console.log("⏳ الرسالة قديمة وغير مرندرة، جاري سحب كامل المحادثة...");
            if (typeof fetchChatMessages === "function") {
              await fetchChatMessages(replyTarget.phone);
              setTimeout(() => {
                const reFetchedElement = document.getElementById(`msg-${pinnedMsg._id}`);
                if (reFetchedElement) {
                  reFetchedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  reFetchedElement.classList.add('bg-amber-100', 'dark:bg-amber-950/40', 'transition-all', 'duration-300');
                  setTimeout(() => reFetchedElement.classList.remove('bg-amber-100', 'dark:bg-amber-950/40'), 1500);
                } else {
                  alert(isRTL ? "الرسالة قديمة جداً، يرجى عمل سكرول لأعلى لتحميلها." : "Message is too old, please scroll up to load it.");
                }
              }, 300);
            }
          }
        }}
        className="flex items-center gap-2 truncate flex-1 cursor-pointer active:opacity-70 group"
        title={isRTL ? "اضغط للذهاب إلى الرسالة" : "Click to view message"}
      >
        <span className="text-red-600 font-bold shrink-0 group-hover:underline">
          📌 {isRTL ? "مثبتة:" : "Pinned:"}
        </span>
        <p className="text-gray-600 dark:text-gray-300 truncate font-medium group-hover:text-blue-500 transition-colors">
          {activeChat.find(m => m.isPinned)?.text || (isRTL ? "رسالة ميديا مثبتة" : "Pinned Media")}
        </p>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 pl-2">
        {activeChat.find(m => m.isPinned)?.pinnedBy?.name && (
          <span className="text-[10px] text-gray-400 italic">
            by {activeChat.find(m => m.isPinned).pinnedBy.name.split(' ')[0]}
          </span>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            const pinnedMsg = activeChat.find(m => m.isPinned);
            if (pinnedMsg?._id) {
              axios.patch(`/chat-actions/pin/${pinnedMsg._id}`)
                .then((response) => {
                  if (response.data.success) {
                    setActiveChat(prev => prev.map(msg => msg._id === pinnedMsg._id ? { ...msg, isPinned: false } : msg));
                  }
                })
                .catch(err => console.error(err));
            }
          }}
          title={isRTL ? "إلغاء التثبيت" : "Unpin Message"}
          className="w-5 h-5 bg-gray-100 dark:bg-white/10 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors text-gray-400 z-30"
        >
          ✕
        </button>
      </div>
    </div>
  )}

  <div className="flex-1" />

  {activeChat.map((msg, idx) => {
    const isMe = msg.direction === "outbound";
    const isOrder = msg.type === "order";
    
    return (
      <div 
        key={msg._id || idx} 
        id={`msg-${msg._id}`}
        // تم إضافة relative و تباعد جانبي (px-7) لترك مساحة ثابتة ومريحة لزر الـ 3 نقط على الموبايل
        className={`flex w-full ${isMe ? "justify-end pl-7" : "justify-start pr-7"} animate-in fade-in slide-in-from-bottom-1 duration-150 group relative mb-1`}
      >
        {/* خلفية نقرة سريعة لقفل القائمة في أي حتة فاضية */}
        {activeMenuMessageId === msg._id && (
          <div 
            className="fixed inset-0 z-30 cursor-default" 
            onClick={() => setActiveMenuMessageId(null)}
          />
        )}

        <div className={`relative max-w-[88%] sm:max-w-[72%] shadow-sm rounded-xl transition-all duration-200
          ${isOrder 
            ? "p-0 bg-transparent border-0 shadow-none" 
            : isMe 
              ? "px-3 pt-1.5 pb-1 bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-50 rounded-tr-none select-all" 
              : "px-3 pt-1.5 pb-1 bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 rounded-tl-none select-all"
          }`}
        >
          {/* عرض محتوى الميديا أو الكتالوج أو النصوص */}
          {renderMedia(msg)}
          
          {/* الوقت وحالة الإرسال */}
          <div className={`flex items-center justify-end gap-1 mt-0.5 select-none ${isOrder ? "px-1 text-slate-500 dark:text-slate-400" : ""}`}>
            {msg.isPinned && <span className="text-[9px] text-gray-400">📌</span>}
            {msg.isForwarded && <span className="text-[9px] text-blue-500 italic">↩️ {isRTL ? "منقولة" : "Forwarded"}</span>}
            <span className="text-[8.5px] font-medium opacity-55 uppercase tracking-tighter tabular-nums">
              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
            {isMe && <StatusIcon status={msg.status} size={12} />}
          </div>

          {/* ⚙️ زر الـ 3 نقط (ظاهر دايماً للموبايل والكمبيوتر) */}
          {!isOrder && msg._id && !msg._id.startsWith("temp_") && (
            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center z-40
              ${isMe ? '-left-7' : '-right-7'}`}
            >
              {/* زرار الـ 3 نقط الرئيسي - بدون opacity عشان يفضل ظاهر علطول على الموبايل */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuMessageId(activeMenuMessageId === msg._id ? null : msg._id);
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-sm font-bold active:scale-90"
                title={isRTL ? "خيارات الرسالة" : "Message Options"}
              >
                ⋮
              </button>

              {/* الـ Dropdown Menu المنبثق الفخم */}
              {activeMenuMessageId === msg._id && (
                <div className={`absolute top-5 bg-white dark:bg-[#2a3942] shadow-2xl border border-gray-100 dark:border-white/5 rounded-xl py-1 w-32 z-50 animate-in fade-in zoom-in-95 duration-100
                  ${isMe ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
                >
                  {/* 📌 خيار التثبيت */}
                  <button
                    onClick={() => {
                      axios.patch(`/chat-actions/pin/${msg._id}`)
                        .then((response) => {
                          setActiveMenuMessageId(null);
                          if (response.data.success) {
                            setActiveChat(prev => prev.map(m => m._id === msg._id ? { ...m, isPinned: !m.isPinned } : m));
                          }
                        })
                        .catch(err => console.error(err));
                    }}
                    className={`w-full px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors
                      ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <span className="text-xs">📌</span>
                    <span className="flex-1 font-medium">{msg.isPinned ? (isRTL ? "إلغاء التثبيت" : "Unpin") : (isRTL ? "تثبيت الرسالة" : "Pin")}</span>
                  </button>

                  {/* ↩️ خيار التوجيه */}
                  <button
                    onClick={() => {
                      setForwardMessageId(msg._id);
                      setIsForwardModalOpen(true);
                      setSearchCustomerQuery("");
                      setActiveMenuMessageId(null);
                    }}
                    className={`w-full px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-2 border-t border-gray-50 dark:border-white/5 transition-colors
                      ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <span className="text-xs transform scale-x-[-1]">↩️</span>
                    <span className="flex-1 font-medium">{isRTL ? "توجيه الرسالة" : "Forward"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  })}
  <div ref={chatEndRef} />
</div>

        {/* ⚠️ التعديل هنا: تم جعل الحاوية sticky bottom-0 وزيادة الـ z-index لمنع الرسائل من العبور فوقه */}
<div className="fixed bottom-0 w-full p-2 sm:p-3 bg-[#f0f2f5] dark:bg-[#111] flex items-center gap-1.5 border-t border-gray-200 dark:border-white/5 shrink-0  z-30 pb-safe">
  
  {/* زر الـ Media المطور وملحقات الملفات */}
  <div className="flex items-center shrink-0">
    <label className="p-2.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors text-gray-500 block active:scale-95">
      <Paperclip size={20} />
      <input 
        type="file"
        className="hidden"
        accept="image/*,audio/*"
        multiple
        onChange={handleMediaSelect}
      />
    </label>
  </div>

  {/* زر الريكورد (المايك لرسائل الصوت لايف) */}
  <div className="flex items-center shrink-0">
    {isRecording ? (
      <button 
        onClick={stopRecording}
        className="p-2.5 bg-red-500 text-white rounded-full animate-pulse transition-colors active:scale-95 flex items-center justify-center shadow-md shadow-red-500/20"
        title={isRTL ? "إيقاف وحفظ" : "Stop Recording"}
      >
        <Square size={16} fill="currentColor" />
      </button>
    ) : (
      <button 
        onClick={startRecording}
        className="p-2.5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 rounded-full transition-colors active:scale-95 flex items-center justify-center"
        title={isRTL ? "تسجيل ريكورد" : "Record Voice Note"}
      >
        <Mic size={20} />
      </button>
    )}
  </div>

  {/* صندوق النص ومؤشرات المعاينة الحية للميديا والريكوردات قبل إرسالها */}
  <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden focus-within:ring-1 ring-red-500/40 transition-all flex flex-col min-w-0">
    
    {/* مؤشر جاري تسجيل الصوت حالياً */}
    {isRecording && (
      <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-semibold animate-pulse border-b border-gray-100 dark:border-white/5">
        <span className="w-2 h-2 rounded-full bg-red-600 block animate-ping"></span>
        <span>{isRTL ? "جاري تسجيل الريكورد..." : "Recording live audio..."}</span>
      </div>
    )}

    {/* قائمة بأسماء الصور المرفوعة قبل التأكيد */}
    {selectedFiles.length > 0 && (
      <div className="px-3 py-2 bg-gray-50 dark:bg-[#1f2c34] flex items-center justify-between border-b border-gray-200 dark:border-white/5 text-[11px]">
        <div className="flex flex-wrap gap-1 max-w-[85%] overflow-hidden truncate">
          {selectedFiles.map((f, i) => (
            <span key={i} className="bg-white dark:bg-black/20 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/5 font-mono max-w-[110px] truncate shrink-0">
              📷 {f.name}
            </span>
          ))}
        </div>
        <button onClick={() => setSelectedFiles([])} className="text-red-500 hover:text-red-700 font-bold px-1 text-xs">✕</button>
      </div>
    )}

    {/* معاينة الريكورد وحجمه قبل الإرسال لمنع الضرب */}
    {audioBlob && !isRecording && (
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#1f2c34] flex items-center justify-between border-b border-gray-200 dark:border-white/5 text-[11px]">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
          🎙️ {isRTL ? "مذكرة صوتية جاهزة" : "Voice Note Selected"} 
          <span className="text-gray-400 dark:text-gray-500 font-mono font-normal">({Math.round(audioBlob.size / 1024)} KB)</span>
        </span>
        <button onClick={() => setAudioBlob(null)} className="text-red-500 hover:text-red-700 font-bold px-1 text-xs">✕</button>
      </div>
    )}
    
    {/* حقل الكتابة المرن والتلقائي التمدد من سطر إلى 4 أسطر */}
    <textarea 
      ref={textareaRef}
      rows="1"
      disabled={isRecording}
      placeholder={
        isRecording 
          ? "" 
          : selectedFiles.length > 0 
            ? (isRTL ? "أضف تعليقاً على الصور هنا..." : "Add a caption...") 
            : audioBlob 
              ? (isRTL ? "اضغط إرسال لتأكيد الريكورد..." : "Press send to confirm voice note...") 
              : (isRTL ? "اكتب رسالة الدعم الفني..." : "Type a message...")
      }
      className="w-full bg-transparent border-none outline-none py-2.5 px-3 text-[14px] sm:text-[15px] dark:text-white resize-none max-h-24 custom-scrollbar dynamic-textarea block disabled:opacity-50"
      value={replyText}
      onChange={handleTextareaChange}
      onKeyDown={(e) => { 
        if(e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) { 
          e.preventDefault(); 
          handleSendReply(); 
        }
      }}
    />
  </div>

  {/* زر الإرسال الدائري المستوحى بالكامل من واتساب */}
  <button 
    disabled={sending || isRecording || (!replyText.trim() && selectedFiles.length === 0 && !audioBlob)}
    onClick={handleSendReply}
    className="w-10 h-10 sm:w-11  bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 disabled:opacity-40 disabled:grayscale transition-all shrink-0"
  >
    {sending ? (
      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
    ) : (
      <Send size={18} className={isRTL ? "rotate-180" : "ml-0.5"} />
    )}
  </button>
</div>
          </>
        ) : (
          /* واجهة الترحيب المركزية المصممة بأسلوب الفخامة البسيطة Luxury Minimalism */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0c0c0c] h-full relative">
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] pointer-events-none" 
                 style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundSize: '340px' }} />
            
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/10 rounded-full flex items-center justify-center text-red-600 mb-5 animate-pulse shadow-lg shadow-red-500/5 z-10">
              <MessageCircle size={38} />
            </div>
            <h2 className="text-xl font-black mb-1.5 dark:text-white tracking-tight uppercase z-10">
              {isRTL ? "منصة فيسترو للمحادثات الحية" : "VESTRO LIVE HUB"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-xs sm:text-sm leading-relaxed z-10">
              {isRTL ? "اختر عميلاً من القائمة الجانبية لإدارة الطلبات والرد على الرسائل وتثبيتها لايف وبشكل فوري." : "Select a customer from the sidebar to respond to chats, review catalog items, and tag conversations."}
            </p>
          </div>
        )}
         {/* 🔲 مودال توجيه الرسالة الذكي */}
{isForwardModalOpen && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-[#1f2c34] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col max-h-[80vh]">
      
      {/* الهيدر */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-[#2a3942]">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {isRTL ? "↩️ توجيه الرسالة إلى عميل" : "↩️ Forward Message to Customer"}
        </h3>
        <button 
          onClick={() => setIsForwardModalOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-sm"
        >
          ✕
        </button>
      </div>

      {/* بار البحث (Search Bar) */}
      <div className="p-3 bg-white dark:bg-[#1f2c34]">
        <div className="relative">
          <input
            type="text"
            placeholder={isRTL ? "ابحث باسم العميل أو رقم الهاتف..." : "Search by name or phone..."}
            value={searchCustomerQuery}
            onChange={(e) => setSearchCustomerQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-xs bg-gray-100 dark:bg-[#2a3942] border border-transparent rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 transition-all"
          />
          <span className="absolute left-3 top-2.5 opacity-40 text-xs">🔍</span>
        </div>
      </div>

      {/* لستة العملاء الناتجة */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-gray-50/50 dark:bg-[#1f2c34]">
        {isSearchingCustomers ? (
          <div className="text-center py-6 text-xs text-gray-400 italic">
            {isRTL ? "جاري البحث..." : "Searching..."}
          </div>
        ) : forwardCustomersList.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            {isRTL ? "لم يتم العثور على عملاء" : "No customers found"}
          </div>
        ) : (
          forwardCustomersList.map((customer) => (
            <div
              key={customer._id}
              onClick={() => {
                // تنفيذ التوجيه الفوري عند الضغط على العميل
                axios.post('/chat-actions/forward', {
                  messageId: forwardMessageId,
                  targetPhone: customer.phone
                })
                .then((res) => {
                  if (res.data.success) {
                    setIsForwardModalOpen(false);
                    alert(isRTL ? `تم توجيه الرسالة بنجاح إلى ${customer.name || customer.phone}` : "Message forwarded successfully!");
                  }
                })
                .catch((err) => {
                  console.error(err);
                  alert(isRTL ? "حدث خطأ أثناء التوجيه" : "Error forwarding message");
                });
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-gray-100 dark:border-white/5 hover:border-blue-500 dark:hover:border-blue-500/50 cursor-pointer transition-all active:scale-[0.99] group"
            >
              <div className="flex flex-col gap-0.5 truncate pr-2">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                  {customer.name || (isRTL ? "عميل بدون اسم" : "Unnamed Customer")}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  {customer.phone}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                {customer.chatStatus || "New"}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* الفوتر */}
      <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#2a3942] text-right">
        <button
          onClick={() => setIsForwardModalOpen(false)}
          className="px-4 py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
        >
          {isRTL ? "إلغاء" : "Cancel"}
        </button>
      </div>

    </div>
  </div>
)}
      </div>

      
    </div>

    {/* الستايلات والـ Custom Overrides الخاصة بواتساب وتناسق الخطوط */}
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
      
      .font-arabic { font-family: 'Cairo', sans-serif !important; }
      
      /* التحكم الدقيق بالسكرول بار ليكون ناعماً كالموبايل */
      .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
      
      /* تعديل شكل مشغل الريكورد ليتطابق مع الـ Dark mode والـ WhatsApp Design */
      .custom-audio::-webkit-media-controls-panel { background-color: #f1f3f4; }
      .dark .custom-audio { filter: invert(100%) hue-rotate(180deg) brightness(1.4) contrast(0.95); }
      .custom-audio { border-radius: 30px; }
      
      .dynamic-textarea { height: auto; min-height: 40px; }
      
      /* دعم شاشات الهواتف بمسافات الأمان السفلية (Safe Areas للهواتف الحديثة) */
      .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem); }

      @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .animate-in { animation: fadeIn 0.18s ease-out; contain-visibility: auto; }
    `}</style>
    
  </div>
);
}