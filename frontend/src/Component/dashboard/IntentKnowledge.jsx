import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TrademarkIndiaForm from "./forms/TrademarkIndiaForm";
import { Loader } from "lucide-react";
 
const API_BASE = "http://localhost:3000";
const API_HEADERS = { "x-api-key": "1234567890abcdef" };
 
const IntentKnowledge = ({ selectedOutcome, onSubmitSuccess }) => {
  if (selectedOutcome === "File in India (Trademark)") {
    return (
      <TrademarkIndiaForm
        onSubmit={(answers) => {
          console.log("Trademark India answers:", answers);
          if (onSubmitSuccess) onSubmitSuccess();
        }}
      />
    );
  }
 
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: { text, file, fileUrl? } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
 
  const fileInputRef = useRef(null);
 
  const currentQuestion = questions[currentStep];
  const currentAnswer = answers?.[currentStep] || {};
 
  const queryId =
    localStorage.getItem("intentQueryId") ||
    localStorage.getItem("I_query_id") ||
    localStorage.getItem("query_id") ||
    "";
 
  const chatId =
    localStorage.getItem("chatId") ||
    localStorage.getItem("Ichat_id") ||
    "";
 
  // --- Helpers --------------------------------------------------------------
 
  const fetchIntentQuestions = async (intentName) => {
    try {
      const res = await axios.get(`${API_BASE}/api/intent/questions`, {
        headers: API_HEADERS,
        params: { intentName },
      });
      return res?.data?.questions || [];
    } catch (e1) {
      try {
        const res = await axios.get(`${API_BASE}/api/intents/questions`, {
          headers: API_HEADERS,
          params: { intentName },
        });
        return res?.data?.questions || [];
      } catch (e2) {
        console.error("Failed fetching intent questions:", e1, e2);
        return [];
      }
    }
  };
 
  const fetchExistingIntentAnswers = async (cId) => {
    if (!cId) return [];
    try {
      const res = await axios.get(`${API_BASE}/api/session/intent/${cId}`, {
        headers: API_HEADERS,
      });
      return res?.data?.data?.questions || [];
    } catch {
      return [];
    }
  };
 
  const mapExistingToStateByIndex = (qs, existing) => {
    const byQn = existing.reduce((acc, q) => {
      if (typeof q.questionNumber === "number") acc[q.questionNumber] = q;
      return acc;
    }, {});
    const mapped = {};
    qs.forEach((q, idx) => {
      const qn = typeof q.questionNumber === "number" ? q.questionNumber : idx + 1;
      const ex = byQn[qn];
      if (ex) {
        mapped[idx] = {
          text: ex.answer ?? "",
          file: null,
          fileUrl: ex.fileUrl || null,
        };
      }
    });
    return mapped;
  };
 
  const saveCurrentStepToServer = async () => {
    const q = currentQuestion;
    if (!q) return true;
    if (!chatId || !queryId) {
      alert("Missing chat context. Please refresh and try again.");
      return false;
    }
 
    try {
      setSubmitting(true);
 
      const idx = currentStep;
      const ans = answers[idx] || {};
 
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("query_id", queryId);
 
      const qNumber =
        typeof q.questionNumber === "number" ? q.questionNumber : idx + 1;
 
      formData.append("questionNumber", qNumber);
      formData.append("questionText", q?.question || "");
 
      if (typeof ans.text === "string" && ans.text.trim()) {
        formData.append("answer", ans.text.trim());
      } else if (typeof ans.text === "boolean") {
        formData.append("answer", ans.text ? "Yes" : "No");
      } else {
        formData.append("answer", "");
      }
 
      if (ans?.file instanceof File) {
        formData.append("file", ans.file);
      }
 
      await axios.post(`${API_BASE}/api/session/intent-question`, formData, {
        headers: {
          ...API_HEADERS,
        },
      });
 
      return true;
    } catch (err) {
      console.error("Failed to save current answer:", err);
      alert("Failed to save the answer. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };
 
  // --- Effects --------------------------------------------------------------
 
  useEffect(() => {
    let mounted = true;
 
    const load = async () => {
      setLoading(true);
 
      const qs = await fetchIntentQuestions(selectedOutcome);
      const existing = await fetchExistingIntentAnswers(chatId);
 
      if (!mounted) return;
 
      setQuestions(qs || []);
      const preset = mapExistingToStateByIndex(qs || [], existing || []);
      setAnswers(preset);
 
      const alreadyComplete =
        qs?.length > 0 &&
        qs.every((q, idx) => {
          const a = preset[idx];
          return a && (String(a.text || "").trim().length > 0 || a.fileUrl);
        });
 
      setIsSubmitted(alreadyComplete);
      setLoading(false);
    };
 
    load();
    return () => {
      mounted = false;
    };
  }, [selectedOutcome, chatId]);
 
  useEffect(() => {
    if (fileInputRef.current) {
      if (!currentAnswer?.file) {
        fileInputRef.current.value = "";
      }
    }
  }, [currentStep, currentAnswer?.file]);
 
  // --- Handlers -------------------------------------------------------------
 
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
 
  const handleTextChange = (e) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        text: e.target.value,
      },
    }));
  };
 
  const handleFileChange = (e) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        file: e.target.files[0],
      },
    }));
  };
 
  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      const ok = await saveCurrentStepToServer();
      if (!ok) return;
      setCurrentStep(currentStep + 1);
    } else {
      await submitAnswers();
    }
  };
 
  const submitAnswers = async () => {
    setSubmitting(true);
 
    try {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers[i] || {};
 
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("query_id", queryId);
 
        const qn =
          typeof question?.questionNumber === "number" ? question.questionNumber : i + 1;
 
        formData.append("questionNumber", qn);
        formData.append("questionText", question?.question || "");
 
        if (typeof answer?.text === "string" && answer.text.trim()) {
          formData.append("answer", answer.text.trim());
        } else if (typeof answer?.text === "boolean") {
          formData.append("answer", answer.text ? "Yes" : "No");
        } else {
          formData.append("answer", "");
        }
 
        if (answer?.file instanceof File) {
          formData.append("file", answer.file);
        }
 
        await axios.post(`${API_BASE}/api/session/intent-question`, formData, {
          headers: {
            ...API_HEADERS,
          },
        });
      }
 
      // success state (page stays)
      setIsSubmitted(true);
      setCurrentStep(0);
      setAnswers({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
 
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("There was an error submitting the answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
 
  const isSelected =
    (typeof currentAnswer?.text === "string" && currentAnswer.text.trim().length > 0) ||
    typeof currentAnswer?.text === "boolean" ||
    currentAnswer?.file instanceof File;
 
  const progressPercent =
    questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
 
  if (loading) {
    return (
      <div className="bg-[#FFF3FF96] border border-[#FFDAFA] rounded-2xl w-[28rem] h-[50rem] flex flex-col items-center justify-center p-4">
        <Loader className="animate-spin text-[#2F5EAC]" size={48} />
        <p className="mt-4 text-lg text-slate-700">Loading Questions...</p>
      </div>
    );
  }
 
  return (
    <div className="bg-[#FFF3FF96] border border-[#FFDAFA] rounded-2xl w-[28rem] overflow-y-scroll p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#FFCC55] text-3xl font-semibold">
            Compliance <span className="text-[#2F5EAC]">bot</span>
          </p>
          <p className="text-[#6A6A6A] mt-3 tracking-wider text-sm">
            Help us create your compliance report by answering a few questions
          </p>
        </div>
        <img src="/assets/imgs/Chatbot/lara.svg" alt="lara" className="w-40" />
      </div>
 
      {/* Question Box */}
      <div className="bg-[#FFFBD9] h-[40rem] rounded-2xl my-4 p-6 overflow-auto">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 text-green-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#2F5EAC] mb-4">
              Successfully Submitted!
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Your answers have been recorded successfully.
            </p>
            <p className="text-sm text-gray-500">
              Thank you for completing the compliance questionnaire.
            </p>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#E5E5E5] rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-[#2F5EAC] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
 
            <p className="text-[#2F5EAC] font-semibold mb-10">
              Question {currentStep + 1}/{questions.length}
            </p>
            <p className="text-black text-lg font-semibold mb-8 tracking-wide">
              {currentQuestion?.question}
            </p>
 
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Type your answer..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
                value={
                  typeof currentAnswer?.text === "boolean"
                    ? currentAnswer.text
                      ? "Yes"
                      : "No"
                    : currentAnswer?.text || ""
                }
                onChange={handleTextChange}
              />
 
              <input
                ref={fileInputRef}
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2F5EAC] file:text-white hover:file:bg-[#244b90]"
                onChange={handleFileChange}
              />
 
              {currentAnswer?.file && (
                <p className="text-sm text-green-600">
                  File selected: {currentAnswer.file.name}
                </p>
              )}
 
              {!currentAnswer?.file && currentAnswer?.fileUrl && (
                <p className="text-xs text-[#2F5EAC] underline">
                  A file was previously uploaded for this question.
                </p>
              )}
            </div>
 
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0 || submitting}
                className={`px-8 py-2 rounded-lg transition-all ${
                  currentStep === 0 || submitting
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-[#f1f1f1] text-[#2F5EAC] hover:bg-gray-200"
                }`}
              >
                Previous
              </button>
 
              <button
                onClick={handleNext}
                disabled={!isSelected || submitting}
                className={`px-8 py-2 text-white rounded-lg transition-all ${
                  isSelected && !submitting
                    ? "bg-[#2F5EAC] hover:bg-[#244b90]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : currentStep === questions.length - 1
                  ? "Submit"
                  : "Save & Next"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
 
export default IntentKnowledge;
 