import { useState, useEffect } from "react";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { FaLightbulb } from "react-icons/fa";
import { Loader } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";
const API_HEADERS = { "x-api-key": "1234567890abcdef" };

const DropdownCard = ({ title, description, price, onStart }) => {
  const [expanded, setExpanded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartClick = async () => {
    setIsStarting(true);
    if (onStart) {
      // Pass the service title to identify the service being started.
      await onStart(title);
    }
    // No need to set isStarting back to false as we will navigate away.
  };

  return (
    <div className="w-full my-4 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
      <button
        className="flex items-center justify-between w-full p-5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-x-4">
          <FaLightbulb className="text-amber-500 flex-shrink-0 w-5 h-5" />
          <span className="text-slate-700 font-medium text-sm">{title}</span>
        </div>
        {expanded ? (
          <CiCircleChevUp className="text-slate-500 w-6 h-6 flex-shrink-0" />
        ) : (
          <CiCircleChevDown className="text-slate-500 w-6 h-6 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <hr className="border-slate-200" />
          {description && (
            <div className="mt-4 p-4 bg-slate-50 rounded-md">
              <p className="font-[poppins] text-sm text-slate-600">
                {description}
              </p>
            </div>
          )}
          {price && (
            <div className="mt-4 space-y-2 font-[poppins] text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Professional Fees</span>
                {/* <span>₹{price.professional_fees}</span> */}
                <span>₹4000–₹12000</span>
              </div>
              <div className="flex justify-between">
                <span>Government Fees</span>
                {/* <span>₹{price.government_fees}</span> */}
                <span>As Applicable</span>
              </div>
              <hr className="border-slate-200 !my-3" />
              {/* <div className="flex justify-between font-bold text-[#2F5EAC]">
                <span>Total</span>
                <span>₹{price.total_amount}</span>
              </div> */}
            </div>
          )}
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

const parseBestPractices = (practiceString) => {
  if (!practiceString || typeof practiceString !== "string") return [];
  return practiceString
    .split("), (")
    .map((part) => part.replace(/[()]/g, "").trim())
    .filter((part) => part)
    .map((part) => {
      const [id, ...textParts] = part.split(",");
      return { id: id.trim(), text: textParts.join(",").trim() };
    });
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

  const fromKeyed = safeJSONParse(
    localStorage.getItem(`startup_answers_${chatId}`)
  );
  if (Array.isArray(fromKeyed) && fromKeyed.length) return fromKeyed;

  const fromLast = safeJSONParse(localStorage.getItem("startup_last_answers"));
  if (fromLast?.chatId === chatId && Array.isArray(fromLast.answers)) {
    return fromLast.answers;
  }

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

export default function BestPractices() {
  const location = useLocation();
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      const chatId = getChatId(location);
      if (chatId) {
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
        setSummaryData([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          "https://compliance-checker-967613878221.us-central1.run.app/api/v1/compliance/summary/best_practices",
          {
            user_type: "startup",
            answers,
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data
            .flatMap((item) =>
              parseBestPractices(item.best_practice).map(
                (practice, index) => ({
                  title: practice.text,
                  description: null,
                  price: {
                    professional_fees: 5000 + index * 1000,
                    government_fees: 1500 + index * 500,
                    total_amount: 6500 + index * 1500,
                  },
                })
              )
            )
            .filter(
              (practice) => practice.title && practice.title.trim() !== ""
            );
          setSummaryData(formattedData);
          setError(null);
        } else {
          setSummaryData([]);
          const errorMsg = "Failed to load summary data. Please try again later.";
          setError(errorMsg);
        }
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setSummaryData([]);
        const errorMsg = "Failed to load summary data. Please try again later.";
        setError(errorMsg);
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
        Best Practices
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
