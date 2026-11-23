"use client";

import { useState, useEffect, useRef } from "react";
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { getSavedCustomerInfo, saveCustomerInfo } from "@/lib/customerCart";
import { getAdminWhatsAppNumber, generateWhatsAppLink } from "@/lib/whatsapp";

interface ChatMessage {
  _id?: string;
  sender: "customer" | "admin";
  senderName: string;
  message: string;
  customerId: string;
  createdAt?: string;
}

// Gentle audio notification chime using Web Audio API
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore audio errors on un-interacted browsers
  }
}

export default function CustomerChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Customer identity
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [identityConfirmed, setIdentityConfirmed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const latestMsgCountRef = useRef<number>(0);

  // Quick preset questions
  const quickQuestions = [
    "Are these spectacle frames available in store?",
    "Can you make prescription power lenses for high cylinder?",
    "How long will delivery take to my address?",
    "What is your return & warranty policy?",
  ];

  useEffect(() => {
    const saved = getSavedCustomerInfo();
    if (saved?.phone) {
      setCustomerName(saved.name || "Customer");
      setCustomerPhone(saved.phone);
      setCustomerId(saved.phone);
      setIdentityConfirmed(true);
      fetchChat(saved.phone, true);
    } else {
      setLoading(false);
    }
  }, []);

  // Live real-time polling effect (every 2.5 seconds)
  useEffect(() => {
    if (!identityConfirmed || !customerId) return;

    const interval = setInterval(() => {
      fetchChat(customerId, false);
    }, 2500);

    return () => clearInterval(interval);
  }, [identityConfirmed, customerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async (cId: string, initial = false) => {
    try {
      const res = await fetch(`/api/chat?customerId=${encodeURIComponent(cId)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const newMsgs: ChatMessage[] = json.data;

        // Play chime if new admin message arrived
        if (!initial && newMsgs.length > latestMsgCountRef.current) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.sender === "admin") {
            playChime();
          }
        }

        latestMsgCountRef.current = newMsgs.length;
        setMessages(newMsgs);
        setIsLive(true);
      }
    } catch (e) {
      console.error("Chat polling error", e);
      setIsLive(false);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || !customerName.trim()) return;

    saveCustomerInfo({ name: customerName, phone: customerPhone });
    setCustomerId(customerPhone);
    setIdentityConfirmed(true);
    setLoading(true);
    fetchChat(customerPhone, true);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !customerId) return;

    const trimmed = textToSend.trim();
    setInputText("");
    setSending(true);

    const tempMsg: ChatMessage = {
      sender: "customer",
      senderName: customerName || "Customer",
      message: trimmed,
      customerId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    latestMsgCountRef.current += 1;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "customer",
          senderName: customerName || "Customer",
          customerId,
          customerPhone,
          message: trimmed,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Sync messages immediately
        fetchChat(customerId, false);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const adminWhatsApp = getAdminWhatsAppNumber();
  const directWhatsAppUrl = generateWhatsAppLink(
    adminWhatsApp,
    `Hello OpticCRM team, I am ${customerName} (${customerPhone}). I need assistance regarding optical products & orders.`
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <BuildingStorefrontIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">OpticCRM Support Desk</h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Connected
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Direct chat with our optometrists and customer service team
            </p>
          </div>
        </div>

        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <PhoneIcon className="w-3.5 h-3.5" />
          Chat on WhatsApp
        </a>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {!identityConfirmed ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Start Live Support Chat</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Please enter your name and phone number to start instant live messaging.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Connect to Live Support
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-gray-50/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                  <ArrowPathIcon className="w-6 h-6 animate-spin text-indigo-600" />
                  <p className="text-xs">Loading message history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Welcome to OpticCRM Live Support!
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Ask us anything about frame sizing, power lens options, eye testing, or delivery status. We reply within minutes.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === "customer";
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in duration-200`}
                    >
                      <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                        {isMe ? "You" : msg.senderName || "Admin Support"}
                      </span>
                      <div
                        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-xs"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick question suggestions */}
            <div className="px-4 py-2 bg-gray-100/70 border-t border-gray-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <span className="text-[11px] font-semibold text-gray-500 uppercase flex-shrink-0">
                Quick:
              </span>
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-full hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition whitespace-nowrap text-gray-700 text-xs"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to admin support..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 shadow-sm transition"
              >
                {sending ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                )}
                <span>Send</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
