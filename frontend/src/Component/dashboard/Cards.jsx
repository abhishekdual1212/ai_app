import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RoleSelectorPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleSelect = async (role) => {
    try {
      if (role === "lawyer") {
        navigate("/dashboard/question/1");
      } else if (role === "startup") {
        // Use the chat created by handleStartDIYChat
        const existingChatId = localStorage.getItem("Dchat_id");

        // Mirror to Schat_id for startup screens that may look for it
        if (existingChatId) {
          localStorage.setItem("Schat_id", existingChatId);

          // Maintain a local list of startup chat IDs to distinguish Startup vs Lawyer in Summary
          try {
            const raw = localStorage.getItem("startupChatIds");
            const arr = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(arr) ? arr : [];
            if (!list.includes(existingChatId)) {
              list.push(existingChatId);
              localStorage.setItem("startupChatIds", JSON.stringify(list));
            }
          } catch {
            // no-op
          }

          // Best-effort: tag this chat as Startup on the server (non-breaking)
          try {
            await axios.post(
              "http://localhost:3000/api/session/mark-diy-flow",
              { chat_id: existingChatId, flow: "Startup" },
              { headers: { "x-api-key": "1234567890abcdef" } }
            );
          } catch (e) {
            console.error("Optional: failed to tag Startup flow on server", e);
          }
        }

        // Navigate to Startup flow
        navigate("/dashboard/startup");
      }
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#FEFFF2] rounded-2xl shadow-lg w-[822px] max-w-[90%] p-8 text-center relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold mb-8">
          Select which describes you best
        </h2>

        <div className="flex justify-center gap-8 mb-10">
          <div
            onClick={() => handleSelect("startup")}
            className="cursor-pointer border rounded-xl p-6 w-48 h-48 flex flex-col items-center justify-center shadow-sm hover:border-blue-600 hover:bg-blue-50 transition"
          >
            <span className="text-4xl mb-4">🚀</span>
            <p className="text-lg font-medium">Startup</p>
          </div>

          <div
            onClick={() => handleSelect("lawyer")}
            className="cursor-pointer border rounded-xl p-6 w-48 h-48 flex flex-col items-center justify-center shadow-sm hover:border-blue-600 hover:bg-blue-50 transition"
          >
            <span className="text-4xl mb-4">📄</span>
            <p className="text-lg font-medium">Lawyer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Cards = () => {
  const navigate = useNavigate();
  const storedSessionId = localStorage.getItem("sessionId");
  const isLoggedIn = !!storedSessionId;
  const [showPopup, setShowPopup] = useState(false);

  const handleStartDIYChat = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/session/diy-chats",
        { sessionId: storedSessionId },
        { headers: { "x-api-key": "1234567890abcdef" } }
      );

      const chat_id = response.data.chat.chat_id;
      localStorage.setItem("Dchat_id", chat_id);

      // Instead of direct navigate → open popup
      setShowPopup(true);
    } catch (error) {
      console.error("Error creating DIY chat session:", error);
    }
  };

  const handleStartStaticChat = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/dashboard/static");
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Card - Chat With Us */}
        <div className="w-full md:w-1/2">
          <h3 className="text-gray-800 font-medium mb-4 pl-3">Chat With Us</h3>
          <div className="bg-[#FFFBD9] rounded-xl p-6 h-full">
            <h2 className="font-serif text-xl font-semibold mb-3 my-6">
              Start Chatting with Our Legal Assistant
            </h2>
            <p className="text-[#787878] text-sm my-6">
              Get instant legal advice and guidance from our AI-
              <br />
              powered assistant. Get instant legal advice and
              <br />
              guidance from our AI-powered assistant.
            </p>
            <button
              onClick={handleStartStaticChat}
              className="bg-blue-700 text-white rounded-md px-6 py-2 font-medium text-sm w-[12rem]"
            >
              Start Chatting
            </button>
          </div>
        </div>

        {/* Right Card - DIY */}
        <div className="w-full md:w-1/2">
          <h3 className="text-gray-800 font-medium mb-4 pl-3">DIY</h3>
          <div className="bg-[#FFF2FF] rounded-xl p-6 h-full">
            <h2 className="font-serif text-xl font-semibold mb-3 my-6">
              Build & Manage Effortlessly
            </h2>
            <p className="text-[#787878] text-sm mb-6">
              Empower yourself with our intuitive DIY tools! Whether
              <br /> you're a beginner or an expert, customize your website,
              <br /> manage content, and optimize features—all without
              <br /> coding.
            </p>
            <button
              onClick={handleStartDIYChat}
              className="bg-blue-700 text-white rounded-md px-6 py-2 font-medium text-sm w-[12rem]"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>

      {/* Show Popup */}
      {showPopup && <RoleSelectorPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default Cards;
