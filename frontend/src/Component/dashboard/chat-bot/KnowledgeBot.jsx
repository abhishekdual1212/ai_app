


import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

const KnowledgeBot = ({ selectedOutcome, onSubmitSuccess, queryId, onAllSubmitted }) => {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(" ");
  const [completed, setCompleted] = useState(false);

  const sessionId = localStorage.getItem("sessionId");
  const chatId = localStorage.getItem("Dchat_id");


  const currentQuestion = questions[currentStep];
  const currentAnswer = answers?.[currentStep];

  console.log(selectedOutcome)
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/outcome-knowledge/questions?keywordName=${encodeURIComponent(selectedOutcome)}`,
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedOutcome]);

  const handleTextChange = (e) => {
    setAnswers({ ...answers, [currentStep]: e.target.value });
  };

  const handleNext = async () => {
    const question = questions[currentStep];
    const answerValue = answers[currentStep];

    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/api/session/diy-outcome/quetion`,
        {
          chat_id: chatId,
          query_id: queryId,
          questionNumber: currentStep + 1,
          questionText: question?.text,
          answer: answerValue,
        },
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      // setSubmissionMessage("Your answer was successfully submitted.");
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => setSubmissionMessage(""), 2000);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true); // ✅ Show final message
      if (onAllSubmitted) onAllSubmitted(queryId);
      if (onSubmitSuccess) onSubmitSuccess(selectedOutcome);
    }
  };

  const isSelected =
    currentAnswer &&
    ((typeof currentAnswer === "string" && currentAnswer.trim().length > 0) ||
      currentAnswer instanceof File);

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
            Knowledge <span className="text-[#2F5EAC]">bot</span>
          </p>
          <p className="text-[#6A6A6A] mt-3 tracking-wider text-sm">
            Help us create your compliance report by answering a few questions
          </p>
        </div>
        <img src="/assets/imgs/Chatbot/lara.svg" alt="lara" className="w-20" />
      </div>

      {/* Main Content */}
      <div className="bg-[#FFFBD9] h-[40rem] rounded-2xl my-4 p-6 overflow-auto">
        {completed ? (
          // ✅ Confirmation Message UI
          <div className="flex flex-col items-center justify-center text-center h-full">
            <img
              src="/assets/imgs/Chatbot/green-check.png"
              alt="Checkmark"
              className="w-16 h-16 mb-6"
            />
            <h2 className="text-[#F4A300] text-xl font-semibold">
              Your answers are recorded
            </h2>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E5E5E5] rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-[#2F5EAC] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Question */}
            <p className="text-[#2F5EAC] font-semibold mb-10">
              Question {currentStep + 1}/{questions.length}
            </p>
            <p className="text-black text-lg font-semibold mb-8 tracking-wide">
              {currentQuestion?.text}
            </p>

            {/* Input */}
            <input
              type="text"
              placeholder="Type your answer..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
              value={currentAnswer || ""}
              onChange={handleTextChange}
            />

            {submissionMessage && (
              <p className="text-green-600 mt-4 text-center font-medium">
               Yor answer was successfully submitted.
              </p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleNext}
                disabled={!isSelected || isSubmitting}
                className={`px-8 py-2 text-white rounded-lg transition-all flex items-center justify-center min-w-[120px] ${
                  isSelected && !isSubmitting
                    ? "bg-[#2F5EAC] hover:bg-[#244b90]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin mr-2" size={16} />
                    Submitting...
                  </>
                ) : (
                  currentStep === questions.length - 1 ? "Submit" : "Save & Next"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBot;
