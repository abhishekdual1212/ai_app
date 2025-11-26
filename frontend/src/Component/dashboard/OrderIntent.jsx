import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import axios from "axios";
import { Loader } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

const OrderIntent = ({ query }) => {
  const location = useLocation();
  const [intent, setIntent] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const chatid = localStorage.getItem("chatId");

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/session/intent/${chatid}`,
          {
            headers: { "x-api-key": API_KEY },
          }
        );
        setIntent(res.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch intent:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [query, chatid]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-[#F8F8F8] w-[48rem] mx-10 my-10 flex justify-center">
      <div className="w-[30rem] my-10">
        {loading ? (
          <div className="w-full flex justify-center items-center p-10">
            <Loader className="animate-spin text-blue-600" size={40} />
            <span className="ml-4 text-lg">Loading Intent...</span>
          </div>
        ) : intent ? (
          <div
            className={`w-full rounded-xl px-4 py-3 mx-auto my-6 cursor-pointer transition-shadow duration-300 ${
              expanded
                ? "border-[2px] border-[#388E3C] bg-[#EAF2FF] shadow-md"
                : "border border-[#CCCCCC] bg-white"
            }`}
            onClick={handleToggle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    expanded ? "bg-[#388E3C] border-[#388E3C]" : "border-[#388E3C]"
                  } flex items-center justify-center`}
                >
                  {expanded && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-[#4B4B4B] font-[poppins] font-light text-[18px]">
                  {intent.intent_label || "No Label"}
                </span>
              </div>

              <div className="flex items-center gap-8">
                {expanded ? (
                  <CiCircleChevUp className="text-[#388E3C] w-8 h-8" />
                ) : (
                  <CiCircleChevDown className="text-[#388E3C] w-8 h-8" />
                )}
                <button className="bg-[#FA9000] text-white text-sm px-8 py-2 rounded-full font-semibold">
                  Status
                </button>
              </div>
            </div>

            {expanded && (
              <div className="mt-6 px-4" onClick={(e) => e.stopPropagation()}>
                <hr className="border border-[#D9D9D9]" />
                <div className="mt-4 font-[poppins] text-sm text-[#4B4B4B]">
                  <h3 className="mb-3 font-semibold text-black text-[16px]">
                    Progress
                  </h3>

                  {/* Vertical Stepper Progress UI */}
                  <div className="relative ml-4 border-l-2 border-[#D9D9D9]">
                    {(intent.progress || []).map((step, idx) => {
                      // Per request, all steps are shown as complete by default.
                      const isCompleted = true;

                      return (
                        <div
                          key={idx}
                          className="relative pl-6 mb-6 last:mb-0"
                        >
                          {/* Dot */}
                          <span
                            className={`absolute left-[-10px] top-[4px] w-4 h-4 rounded-full border-2 ${
                              isCompleted
                                ? "bg-[#388E3C] border-[#388E3C]"
                                : "bg-white border-[#D9D9D9]"
                            }`}
                          />
                          {/* Step label */}
                          <p
                            className={`text-sm ${
                              isCompleted
                                ? "text-[#388E3C] font-medium"
                                : "text-[#A0A0A0]"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">No intent found.</p>
        )}
      </div>
    </div>
  );
};

export default OrderIntent;
