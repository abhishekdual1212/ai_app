

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import axios from "axios";
import { Loader } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

const DiyStatus = ({ query, onProgressUpdate }) => {
  const location = useLocation();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionId = localStorage.getItem("sessionId");
  const chatId = localStorage.getItem("Dchat_id");

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchAllOutcomes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/session/all-diy-outcomes/${chatId}`, {
          headers: { "x-api-key": API_KEY },
        });
        const outcomesData = res.data.data || [];
        setOutcomes(outcomesData);

        if (onProgressUpdate && outcomesData.length > 0) {
          let totalPercentage = 0;
          outcomesData.forEach(outcome => {
            const progressSteps = outcome.progress || [];
            const completedSteps = progressSteps.filter(step => step.status === true || step.status === 'completed').length;
            const totalSteps = progressSteps.length;
            if (totalSteps > 0) {
              totalPercentage += (completedSteps / totalSteps) * 100;
            }
          });
          onProgressUpdate(Math.round(totalPercentage / outcomesData.length));
        }
      } catch (error) {
        console.error("Failed to fetch outcomes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOutcomes();
  }, [query, chatId, onProgressUpdate]);

  return (
    <div className="bg-[#F8F8F8] w-full rounded-lg p-4 md:p-8">
      {loading && (
        <div className="w-full flex justify-center items-center p-10">
          <Loader className="animate-spin text-blue-600" size={40} />
          <span className="ml-4 text-lg">Loading Status...</span>
        </div>
      )}
      <div className="w-full max-w-lg mx-auto my-10">
        {!loading && outcomes.length === 0 && (
          <p className="text-center text-gray-500">No outcomes found for this service.</p>
        )}
        {!loading && outcomes.length > 0 &&
          outcomes.map((outcome, index) => (
            <div
              key={outcome._id}
              className={`w-full rounded-xl px-4 py-3 mx-auto my-6 cursor-pointer transition-shadow duration-300 ${
                expandedIndex === index
                  ? "border-[2px] border-[#388E3C] bg-[#EAF2FF] shadow-md"
                  : "border border-[#CCCCCC] bg-white"
              }`}
              onClick={() => handleToggle(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      expandedIndex === index
                        ? "bg-[#388E3C] border-[#388E3C]"
                        : "border-[#388E3C]"
                    } flex items-center justify-center`}
                  >
                    {expandedIndex === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-[#4B4B4B] font-[poppins] font-light text-[18px]">
                    {outcome.OutcomeLabel || "No Label"}
                  </span>
                </div>

                <div className="flex items-center gap-8">
                  {expandedIndex === index ? (
                    <CiCircleChevUp className="text-[#388E3C] w-8 h-8" />
                  ) : (
                    <CiCircleChevDown className="text-[#388E3C] w-8 h-8" />
                  )}
                  <button className="bg-[#FA9000] text-white text-sm px-8 py-2 rounded-full font-semibold">
                    Status
                  </button>
                </div>
              </div>

              {expandedIndex === index && (
                <div className="mt-6 px-4" onClick={(e) => e.stopPropagation()}>
                  <hr className="border border-[#D9D9D9]" />
                  <div className="mt-4 font-[poppins] text-sm text-[#4B4B4B]">
                    <h3 className="mb-3 font-semibold text-black text-[16px]">
                      Progress
                    </h3>

                    {/* New stepper-style progress UI */}
                    <div className="relative ml-4 border-l-2 border-[#D9D9D9]">
                      {(outcome.progress || []).map((step, idx) => {
                        const isCompleted = step.status === true || step.status === "completed";

                        return (
                          <div
                            key={step._id || idx}
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
          ))}
      </div>
    </div>
  );
};

export default DiyStatus;
