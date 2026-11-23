"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  UserCircleIcon,
  PhoneIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { generateWhatsAppLink } from "@/lib/whatsapp";

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15); // B5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore audio policy
  }
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const totalMsgCountRef = useRef<number>(0);

  // Quick admin canned responses
  const quickReplies = [
    "Hello! How can we assist you with your eyewear today?",
    "Your order is confirmed and currently being packed for dispatch.",
    "Yes, all our frames include a 1-year warranty against manufacturing defects.",
    "Custom power lenses are processed in our laboratory within 2 business days.",
  ];

  // Fetch conversations list & messages
  const fetchConversationsAndMessages = async (initial = false) => {
    try {
      // 1. Fetch conversations summary
      const convRes = await fetch("/api/chat?conversations=true");
      const convJson = await convRes.json();
      if (convJson.success && Array.isArray(convJson.data)) {
        setConversations(convJson.data);
        if (!selectedCustomerId && convJson.data.length > 0) {
          setSelectedCustomerId(convJson.data[0].customerId);
        }
      }

      // 2. If a customer is selected, fetch their messages
      const targetId = selectedCustomerId || (convJson.data?.[0]?.customerId ?? "");
      if (targetId) {
        const msgRes = await fetch(`/api/chat?customerId=${encodeURIComponent(targetId)}`);
        const msgJson = await msgRes.json();
        if (msgJson.success && Array.isArray(msgJson.data)) {
          // Play sound if a new message from customer arrived
          if (!initial && msgJson.data.length > totalMsgCountRef.current) {
            const lastMsg = msgJson.data[msgJson.data.length - 1];
            if (lastMsg.sender === "customer") {
              playChime();
            }
          }
          totalMsgCountRef.current = msgJson.data.length;
          setMessages(msgJson.data);
        }
      }
    } catch (e) {
      console.error("Live chat sync error:", e);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationsAndMessages(true);
  }, []);

  // Real-time polling every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversationsAndMessages(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedCustomerId]);

  // When changing selected customer, fetch their messages immediately & mark read
  useEffect(() => {
    if (!selectedCustomerId) return;
    setLoading(true);
    fetch(`/api/chat?customerId=${encodeURIComponent(selectedCustomerId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          totalMsgCountRef.current = json.data.length;
          setMessages(json.data);
        }
      })
      .finally(() => setLoading(false));

    // Mark messages as read
    fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: selectedCustomerId }),
    }).catch(() => null);
  }, [selectedCustomerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeCustomer = conversations.find((c) => c.customerId === selectedCustomerId);

  const handleSendReply = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedCustomerId) return;

    const trimmed = textToSend.trim();
    setReplyText("");
    setSending(true);

    const tempMsg = {
      sender: "admin",
      senderName: "Admin Support",
      customerId: selectedCustomerId,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    totalMsgCountRef.current += 1;

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "admin",
          senderName: "Admin Support",
          customerId: selectedCustomerId,
          customerPhone: activeCustomer?.customerPhone,
          message: trimmed,
        }),
      });
      // Refresh messages
      fetchConversationsAndMessages(false);
    } catch (err) {
      console.error("Failed to send admin reply", err);
    } finally {
      setSending(false);
    }
  };

  const whatsAppReplyUrl = activeCustomer?.customerPhone
    ? generateWhatsAppLink(
        activeCustomer.customerPhone,
        `Hello ${activeCustomer.senderName}, this is OpticCRM Support following up with you.`
      )
    : "#";

  const filteredConversations = conversations.filter(
    (c) =>
      (c.senderName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.customerPhone || "").includes(search) ||
      (c.lastMessage || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 min-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
              Live Customer Support Desk
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time bidirectional messaging between store customers and your admin team
          </p>
        </div>

        <button
          onClick={() => fetchConversationsAndMessages(false)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh Now
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 overflow-hidden min-h-[550px]">
        {/* Left Column: Conversations List */}
        <div className="border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No active conversations found
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.customerId === selectedCustomerId;
                return (
                  <button
                    key={c.customerId}
                    onClick={() => setSelectedCustomerId(c.customerId)}
                    className={`w-full text-left p-3.5 transition flex items-start gap-3 hover:bg-gray-50 ${
                      isSelected ? "bg-indigo-50/70 border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0 text-sm font-bold">
                      {(c.senderName || "C").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {c.senderName || "Customer"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {c.lastAt
                            ? new Date(c.lastAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                        {c.customerPhone}
                      </p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {c.lastMessage}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col bg-gray-50/30">
          {selectedCustomerId ? (
            <>
              {/* Chat Window Header */}
              <div className="p-3.5 px-6 border-b border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {activeCustomer?.senderName || "Customer"}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-100 text-gray-600">
                      {activeCustomer?.customerPhone}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Active Customer Chat ID: {selectedCustomerId}
                  </p>
                </div>

                {activeCustomer?.customerPhone && (
                  <a
                    href={whatsAppReplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    Open in WhatsApp
                  </a>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-gray-50/60">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-indigo-600" />
                    <p className="text-xs">Loading customer conversation...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400">
                    No messages in this conversation yet. Send a greeting to start!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} animate-in fade-in duration-150`}
                      >
                        <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                          {isAdmin ? "You (Admin)" : msg.senderName || "Customer"}
                        </span>
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                            isAdmin
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

              {/* Canned Quick Replies */}
              <div className="px-4 py-2 bg-gray-100/70 border-t border-gray-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
                <span className="text-[11px] font-semibold text-gray-500 uppercase flex-shrink-0">
                  Quick Reply:
                </span>
                {quickReplies.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendReply(r)}
                    className="px-2.5 py-1 bg-white border border-gray-300 rounded-full hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition whitespace-nowrap text-gray-700 text-xs"
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply(replyText);
                }}
                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeCustomer?.senderName || "customer"}...`}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 shadow-sm transition"
                >
                  {sending ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                  )}
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">No conversation selected</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Select a customer from the left sidebar to view their messages and reply in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
