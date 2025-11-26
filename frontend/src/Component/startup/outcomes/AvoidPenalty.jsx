import { useState, useEffect } from "react";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import axios from "axios";

import { toast } from "react-toastify";
const API_BASE = "http://localhost:3000";
const API_HEADERS = { "x-api-key": "1234567890abcdef" };

const DropdownCard = ({ title, description, price, onStart }) => {
  const [expanded, setExpanded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartClick = async () => {
    setIsStarting(true);
    if (onStart) {
      // Pass the service description to identify the service being started.
      await onStart(description);
    }
    // No need to set isStarting back to false as we will navigate away.
  };

  return (
    <div
      className={`w-full rounded-xl px-6 py-4 my-4 ${
        expanded || isStarting
          ? "border-[2px] border-[#388E3C] bg-[#EAF2FF]"
          : "border border-[#CCCCCC] bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4 flex-1">
          <div
            className={`w-4 h-4 rounded-full border flex-shrink-0 ${
              expanded || isStarting
                ? "bg-[#388E3C] border-[#388E3C]"
                : "border-[#388E3C]"
            } flex items-center justify-center`}
          >
            {(expanded || isStarting) && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>

          <span className="text-[#4B4B4B] font-[poppins] font-medium text-sm flex-1">
            {description}
          </span>
        </div>

        <div className="flex items-center gap-x-8">
          <button
            className="flex items-center justify-center w-8 h-8 flex-shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <CiCircleChevUp className="text-[#388E3C] w-6 h-6" />
            ) : (
              <CiCircleChevDown className="text-[#388E3C] w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 bg-white px-4 pb-4">
          <hr className="border border-[#D9D9D9]" />
          <div className="mt-4 space-y-2 font-[poppins] text-sm text-[#4B4B4B]">
            <div className="flex justify-between mt-4">
              <span>Professional Fees</span>
              {/* <span>₹{price.professional_fees}</span> */}
              <span>₹4000-₹12000</span>
            </div>
            <div className="flex justify-between">
              <span>Government Fees</span>
              {/* <span>₹{price.government_fees}</span> */}
              <span>As Applicable</span>
            </div>
            {/* <div className="flex justify-between font-semibold text-[#2F5EAC]">
              <span>Total</span>
              <span>₹{price.total_amount}</span>
            </div> */}
          </div>
          <div className="flex justify-end mt-6">
            <button
              className="bg-[#FA9000] hover:bg-[#E8850E] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
              onClick={handleStartClick}
            >
              Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const safeJSONParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getChatId = (location) => {
  try {
    const sp = new URLSearchParams(location.search);
    const qs = sp.get("chat_id");
    if (qs) return qs;
  } catch {}
  return (
    location?.state?.chatId ||
    localStorage.getItem("Schat_id") ||
    localStorage.getItem("startup_chat_id") ||
    localStorage.getItem("startupChatId") ||
    localStorage.getItem("Dchat_id") ||
    localStorage.getItem("chatId") ||
    null
  );
};

const loadAnswers = async (chatId, stateAnswers) => {
  // 1) answers from state (current flow)
  if (Array.isArray(stateAnswers) && stateAnswers.length) {
    try {
      localStorage.setItem(
        `startup_answers_${chatId}`,
        JSON.stringify(stateAnswers)
      );
      localStorage.setItem(
        "startup_last_answers",
        JSON.stringify({ chatId, answers: stateAnswers, ts: Date.now() })
      );
    } catch {}
    return stateAnswers;
  }

  // 2) answers from localStorage (reopen from orders)
  const fromKeyed = safeJSONParse(
    localStorage.getItem(`startup_answers_${chatId}`)
  );
  if (Array.isArray(fromKeyed) && fromKeyed.length) return fromKeyed;

  const fromLast = safeJSONParse(localStorage.getItem("startup_last_answers"));
  if (fromLast?.chatId === chatId && Array.isArray(fromLast.answers)) {
    return fromLast.answers;
  }

  // 3) optional backend fetch (won’t break if endpoint missing)
  try {
    const resp = await fetch(
      `${API_BASE}/api/session/startup/answers/${chatId}`,
      { headers: API_HEADERS }
    );
    if (resp.ok) {
      const data = await resp.json();
      const answers =
        data?.answers || data?.data || data?.result || data?.items || null;
      if (Array.isArray(answers) && answers.length) {
        try {
          localStorage.setItem(
            `startup_answers_${chatId}`,
            JSON.stringify(answers)
          );
          localStorage.setItem(
            "startup_last_answers",
            JSON.stringify({ chatId, answers, ts: Date.now() })
          );
        } catch {}
        return answers;
      }
    }
  } catch {}

  return null;
};

export default function AvoidPenalty() {
  const location = useLocation();
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      const chatId = getChatId(location);
      if (chatId) {
        // normalize for other widgets/cards that rely on these keys
        localStorage.setItem("Schat_id", chatId);
        localStorage.setItem("startup_chat_id", chatId);
        localStorage.setItem("startupChatId", chatId);
        localStorage.setItem("Dchat_id", chatId);
        localStorage.setItem("chatId", chatId);
      }

      const stateAnswers = location.state?.answers;
      const answers = await loadAnswers(chatId, stateAnswers);

      if (!Array.isArray(answers) || answers.length === 0) {
        const errorMsg = "No answers provided to generate the report.";
        setError(errorMsg);
        toast.error(errorMsg);
        setSummaryData([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          "https://compliance-checker-967613878221.us-central1.run.app/api/v1/compliance/summary/penalties",
          {
            user_type: "startup",
            answers,
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          setDescription(
            (response.data.output_type || "How to Avoid Penalties")
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
          );

          const formattedData = response.data.data
            .map((item, index) => ({
              title: item.question,
              description: item.advice,
              price: {
                professional_fees: 4000 + index * 500, // Mock data
                government_fees: 1000 + index * 200, // Mock data
                total_amount: 5000 + index * 700, // Mock data
              },
            }))
            .filter(
              (item) => item.description && item.description.trim() !== ""
            );

          setSummaryData(formattedData);
          setError(null);
        } else {
          setSummaryData([]);
          const errorMsg = "Failed to load summary data. Please try again later.";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setSummaryData([]);
        const errorMsg = "Failed to load summary data. Please try again later.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [location]);

  const handleStartService = async (serviceName) => {
    try {
      // This simulates creating a new chat for the selected service.
      const mockChatId = `chat_startup_${Date.now()}`;
      console.log(`Starting service '${serviceName}' with mock chat ID: ${mockChatId}`);

      // Set the 'Schat_id' in localStorage. This is crucial for StartupOrderIntent.
      localStorage.setItem("Schat_id", mockChatId);
      localStorage.setItem("chatId", mockChatId); // For compatibility

      // Navigate to the new startup-specific intent progress page.
      navigate('/dashboard/startup/order-intent');
    } catch (error) {
      console.error("Error starting service:", error);
      const errorMsg = "Could not start the selected service. Please try again.";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-10">
        <Loader className="animate-spin text-blue-600" size={40} />
        <span className="ml-4 text-lg">Loading...</span>
      </div>
    );
  }
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="w-full sm:max-w-[720px] mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
        {description}
      </h2>
      {summaryData.map((item, idx) => (
        <DropdownCard
          key={idx}
          title={item.title}
          description={item.description}
          price={item.price}
          onStart={handleStartService}
        />
      ))}
    </div>
  );
}
