// src/Component/dashboard/chat-bot/ChatBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { FiPhone } from "react-icons/fi";
import { Calendar, ExternalLink, Loader } from 'lucide-react';

import Payment from "./../Payment"
import { useLocation } from 'react-router-dom';
import IntentKnowledge from '../IntentKnowledge.jsx';
import Intent from '../Intent';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth"; // ✅
 
// 🔧 Helpers for API (kept lightweight & non-breaking)
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:3000";
const API_HEADERS = { "x-api-key": import.meta.env?.VITE_API_KEY || "1234567890abcdef" };

// ✅ FE ↔︎ BE alias maps
const QUERY_ALIAS = new Map([
  ["Privacy & Data Protection", "Privacy"],
  ["General Corporate – Contracts & Drafting", "Contract"],
]);
const DISPLAY_ALIAS = new Map([
  ["Privacy & Data Protection", "Privacy"],
  ["General Corporate – Contracts & Drafting", "Contract"],
]);
const toBackend = (q) => QUERY_ALIAS.get((q||"").trim()) || (q||"").trim();
const toDisplay = (q) => DISPLAY_ALIAS.get((q||"").trim()) || (q||"").trim();

const ChatBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const processedOption = useRef(null);
  const searchParams = new URLSearchParams(location.search);
  const selectedOption = searchParams.get("option");
  const deepLinkChatId = searchParams.get("Order_Id"); // ✅ new: deep link support
  const sessionId = localStorage.getItem("sessionId");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      content: [
        "Hi! 👋 I'm Lara, your legal assistant.",
        "I can help you with services, call scheduling, documents, or budget planning.",
        "What would you like to do?",
      ],
      options: ["Explore Legal Services", "Schedule Free Advisory Call"],
    },
  ]);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [isIntentCompleted, setIsIntentCompleted] = useState(false);
  const [completedServices, setCompletedServices] = useState(new Set());

  // track current chat/query when deep-linked
  const [intentChatId, setIntentChatId] = useState(null);
  const [intentQueryId, setIntentQueryId] = useState(null);

  // ✅ Stable user avatar (Firebase photoURL or cached)
  const [userAvatar, setUserAvatar] = useState(
    localStorage.getItem("userPhotoURL") || ""
  );
  useEffect(() => {
    try {
      const auth = getAuth();
      if (auth?.currentUser?.photoURL) {
        setUserAvatar(auth.currentUser.photoURL);
        localStorage.setItem("userPhotoURL", auth.currentUser.photoURL);
      }
      const unsub = onAuthStateChanged(auth, (u) => {
        const url = u?.photoURL || "";
        if (url) {
          setUserAvatar(url);
          localStorage.setItem("userPhotoURL", url);
        }
      });
      const onStorage = () => {
        const u = localStorage.getItem("userPhotoURL") || "";
        if (u && u !== userAvatar) setUserAvatar(u);
      };
      window.addEventListener("storage", onStorage);
      return () => {
        unsub && unsub();
        window.removeEventListener("storage", onStorage);
      };
    } catch {
      // noop
    }
  }, []); // once

  // helper: ensure there's a query_id for the given chat (mirrors StaticChat logic)
  const ensureIntentQueryId = async (chatId) => {
    try {
      if (!chatId) return null;
      if (intentQueryId) return intentQueryId;

      // try to read existing
      const resp = await fetch(`${API_BASE}/api/session/intent/${chatId}`, { headers: API_HEADERS });
      if (resp.ok) {
        const data = await resp.json();
        const existingQueryId = data?.data?.query_id;
        if (existingQueryId) {
          setIntentQueryId(existingQueryId);
          localStorage.setItem("I_query_id", existingQueryId);
          localStorage.setItem("query_id", existingQueryId);
          return existingQueryId;
        }
      }

      // create if missing
      const persist = await fetch(`${API_BASE}/api/session/${chatId}/save-current-intent`, {
        method: "POST",
        headers: { ...API_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (persist.ok) {
        const pdata = await persist.json();
        const qid = pdata?.query_id;
        if (qid) {
          setIntentQueryId(qid);
          localStorage.setItem("I_query_id", qid);
          localStorage.setItem("query_id", qid);
          return qid;
        }
      }
      return null;
    } catch (e) {
      console.error("ensureIntentQueryId error:", e);
      return null;
    }
  };

  // 🔹 NEW: ensure a Direct Order document exists (idempotent)
  const ensureDirectOrder = async (chatId) => {
    try {
      const auth = getAuth();
      const u = auth?.currentUser;
      if (!chatId || !u?.uid) return;

      await fetch(`${API_BASE}/api/direct-orders/ensure`, {
        method: "POST",
        headers: { ...API_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          uid: u.uid,
          customerEmail: u.email || "",
          customerName: u.displayName || u.email || "—",
          status: "pending",
        }),
      });
    } catch (e) {
      console.warn("direct order ensure failed:", e?.message || e);
    }
  };

  // ✅ Deep-link preload (exact parity with StaticChat behavior)
  useEffect(() => {
    const preload = async () => {
      if (!deepLinkChatId) return;

      const cid = deepLinkChatId;
      setIntentChatId(cid);
      localStorage.setItem("Ichat_id", cid);
      localStorage.setItem("chatId", cid);
      localStorage.setItem("Dchat_id", cid); // 🔹 keep Dchat_id in sync for direct flows

      // 🔹 also make sure a Direct Order exists if this is a direct chat deeplink
      await ensureDirectOrder(cid);

      try {
        const resp = await fetch(`${API_BASE}/api/session/intent/${cid}`, { headers: API_HEADERS });
        if (resp.ok) {
          const data = await resp.json();
          const intent = data?.data;
          if (intent) {
            const label = intent.intent_label || intent.service || "";
            if (label) {
              setSelectedQuery(label);
              setShowPayment(true); // show pricing card on the left
            }
            const qid = intent?.query_id || null;
            if (qid) {
              setIntentQueryId(qid);
              localStorage.setItem("I_query_id", qid);
              localStorage.setItem("query_id", qid);
            } else {
              await ensureIntentQueryId(cid);
            }
            const progress = intent?.progress || [];
            const isCompleted = Array.isArray(progress) && progress.some(p => p.label === 'Form Filled' && p.status);
            setIsIntentCompleted(isCompleted);

            // If already submitted, open right panel and show "Check Status"
            if (isCompleted && label) {
              setSelectedOutcome(label);
            }
          } else {
            setShowPayment(false);
            setSelectedQuery("");
            setIsIntentCompleted(false);
          }
        } else {
          setShowPayment(false);
          setSelectedQuery("");
          setIsIntentCompleted(false);
        }
      } catch (e) {
        console.error("Error preloading intent by chat_id:", e);
        setShowPayment(false);
        setSelectedQuery("");
        setIsIntentCompleted(false);
      }
    };

    preload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkChatId]);

  // Fetch all chats to determine which services are already completed
  useEffect(() => {
    const fetchCompletedServices = async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) return;
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/${sessionId}/all-chats`, { headers: API_HEADERS });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const completed = new Set();
          data.data.flat().forEach(chat => {
            if (chat?.chatType === 'Intent' && chat?.status === 'completed' && chat?.intent_label) {
              completed.add(toDisplay(chat.intent_label));
            }
          });
          setCompletedServices(completed);
        }
      } catch (error) {
        console.error("Error fetching completed services:", error);
      }
    };
    fetchCompletedServices();
  }, []);

  const handleBotResponse = async (userQuery) => {
    if (!userQuery) return;

    setMessages((prev) => [...prev, { sender: "user", content: [toDisplay(userQuery)] }]);
    setMessages((prev) => [...prev, { sender: "bot", typing: true }]);

    try {
      const chatId = localStorage.getItem("chatId");
      const sentQuery = toBackend(userQuery);

      // ✅ origin=Direct is important for server tagging
      const response = await fetch(
        `${API_BASE}/api/search-routing?query=${encodeURIComponent(sentQuery)}&session_id=${sessionId}${
          chatId ? `&chat_id=${chatId}` : ""
        }&origin=Direct`,
        {
          headers: API_HEADERS,
        }
      );

      const data = await response.json();

      // Save chat_id in localStorage
      if (data.chat_id) {
        localStorage.setItem("chatId", data.chat_id);
        localStorage.setItem("Ichat_id", data.chat_id);
        localStorage.setItem("Dchat_id", data.chat_id); // 🔹 ensure this is set for Direct Orders
        setIntentChatId(data.chat_id);

        // 🔹 ENSURE a Direct Order record exists, so it appears in your dashboard summary
        ensureDirectOrder(data.chat_id);
      }

      setMessages((prev) => prev.slice(0, -1)); // remove "Typing..."

      const serviceOptionsRaw = Array.isArray(data.services) ? data.services.map((s) => s.name) : [];
      const intentOptionsRaw  = Array.isArray(data.intents)  ? data.intents.map((i) => i.name)  : [];
      const nextOptions = [...serviceOptionsRaw, ...intentOptionsRaw].map(toDisplay);

      if (nextOptions.length === 0) {
        setShowPayment(true);
        setSelectedQuery(toDisplay(userQuery));
        const cid = data.chat_id || localStorage.getItem("Ichat_id") || localStorage.getItem("chatId");
        if (cid) await ensureIntentQueryId(cid);

        const selectedLabel = toDisplay(data.value || userQuery);

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            content: [`You selected: ${selectedLabel}`],
          },
        ]);
      } else {
        setShowPayment(false);
        setSelectedQuery("");
        setSelectedOutcome("");
        const selectedLabel = data.value ? toDisplay(data.value) : null;

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            content: selectedLabel ? [`You selected: ${selectedLabel}`] : [],
            options: nextOptions,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => prev.slice(0, -1));
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          content: ["Oops! Something went wrong."],
        },
      ]);
      setShowPayment(false);
      setSelectedQuery("");
    }
  };

  useEffect(() => {
    if (selectedOption && selectedOption !== processedOption.current) {
      processedOption.current = selectedOption;
      handleBotResponse(selectedOption);
    }
  }, [selectedOption]);

  const handleOptionClick = (option) => {
    handleBotResponse(option);
  };

  const handlePaymentStart = async (query) => {
    setSelectedOutcome(query);
    const cid = localStorage.getItem("Ichat_id") || localStorage.getItem("chatId") || intentChatId;
    setIntentChatId(cid || null);
    if (cid) {
      const qid = await ensureIntentQueryId(cid);
      if (qid) setIntentQueryId(qid);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 pb-10">
      {/* Left Panel */}
      <div className="w-full lg:w-[60%]">
        <div className="p-4 px-8 rounded-t-2xl bg-[#2F5EAC] flex justify-between items-center text-white">
          <div className="cursor-pointer">
            <RxHamburgerMenu />
          </div>
          <div className="text-xl">You are now chatting with LARA!</div>
          <div className="cursor-pointer">
            <FiPhone />
          </div>
        </div>

        <div className="bg-[#E6ECF6] rounded-b-2xl border border-[#ACC1E7] p-8 h-[45rem] overflow-y-scroll">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 mt-6 ${msg.sender === "user" ? "justify-end items-end" : ""}`}
            >
              {msg.sender === "bot" && (
                <img src="/assets/imgs/Chatbot/lara.svg" alt="lara" className="h-15 w-15 rounded-full" />
              )}
              <div className={`space-y-6 ${msg.sender === "user" ? "text-[#2F5EAC]" : ""}`}>
                {msg.content?.map((line, i) => (
                  msg.typing ? (
                    <div key={i} className="bg-white/50 rounded-tr-3xl rounded-b-3xl p-6 px-8 w-fit flex items-center">
                      <Loader size={20} className="animate-spin text-slate-500" />
                      <span className="ml-3 text-slate-600">Typing...</span>
                    </div>
                  ) : (
                    <p
                      key={i}
                      className={`${
                        msg.sender === "user"
                          ? "bg-[#F0FEE0] rounded-bl-3xl rounded-t-3xl text-[#2F5EAC]"
                          : "bg-white/50 rounded-tr-3xl rounded-b-3xl"
                      } p-6 px-8 w-fit`}
                    >
                      {line}
                    </p>
                  )
                ))}

                {msg.typing && (
                  <div className="bg-white/50 rounded-tr-3xl rounded-b-3xl p-6 px-8 w-fit flex items-center">
                    <Loader size={20} className="animate-spin text-slate-500" />
                    <span className="ml-3 text-slate-600">Typing...</span>
                  </div>
                )}

                {msg.options && (
                  <div className="bg-white/50 rounded-tr-3xl rounded-b-3xl p-7 px-10 pb-10 w-fit">
                    <p className="font-medium text-gray-700 mb-3">Choose an option to get started</p>
                    <div className="text-[#2F5EAC] border border-[#2F5EAC40] shadow mt-2 rounded-2xl">
                      {msg.options.map((option, i) => (
                        <div key={i} className={`flex justify-between items-center py-4 px-5 pr-8 border-b border-[#2F5EAC40]/40 ${ i === msg.options.length - 1 ? "border-b-0" : ""}`}>
                          <p
                            onClick={() => {
                              if (!completedServices.has(option)) {
                                handleOptionClick(option);
                              }
                            }}
                            className={`flex-grow ${
                              !completedServices.has(option)
                                ? 'hover:text-blue-800 cursor-pointer'
                                : 'text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {option}
                          </p>
                          {completedServices.has(option) && (
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.sender === "user" && (
                <img
                  src={userAvatar || "https://i.pravatar.cc/40?u=placeholder"}
                  alt="user"
                  className="h-10 w-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          ))}

          {showPayment && (
            <Payment
              query={selectedQuery}
              selectedOutcome={selectedOutcome}
              onStartClick={handlePaymentStart}
              isIntentCompleted={isIntentCompleted}
            />
          )}

          {isIntentCompleted && !showPayment && (
            <div className="mt-8 p-6 bg-white/70 rounded-xl space-y-4 w-fit shadow-lg">
              <p className="text-gray-800 font-medium">You’ve completed the compliance questions.</p>
              <button
                onClick={() => navigate("/dashboard/orde")}
                className="bg-[#2F5EAC] hover:bg-[#244b90] text-white py-2 px-6 rounded-lg text-sm font-semibold"
              >
                Check Status
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[40%]">
        {selectedOutcome ? (
          <IntentKnowledge
            selectedOutcome={selectedOutcome}
            onSubmitSuccess={() => {
              setIsIntentCompleted(true);
              setShowPayment(true);
              if (selectedOutcome) {
                setCompletedServices(prev => new Set(prev).add(selectedOutcome));
              }
            }}
          />
        ) : (
          <Intent />
        )}
      </div>
    </div>
  );
};

export default ChatBoard;
