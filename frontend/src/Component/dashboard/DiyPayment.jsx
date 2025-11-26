 import { useState, useEffect } from "react";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import bro from "../../../public/assets/bro.png";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

const DiyPayment = ({ onStartClick, submittedOutcomes, setSubmittedOutcomes }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [flattenedOutcomes, setFlattenedOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [queryIdMap, setQueryIdMap] = useState({});
  const [serverSubmitted, setServerSubmitted] = useState({}); // ✅ NEW
  const navigate = useNavigate();
 
  const sessionId = localStorage.getItem("sessionId");
  const chatId = localStorage.getItem("Dchat_id");
 
  const handleToggle = async (index, outcomeName) => {
    const isExpanding = expandedIndex !== index;
    setExpandedIndex(isExpanding ? index : null);
 
    if (isExpanding && !prices[outcomeName]) {
      setPriceLoading(outcomeName);
      try {
        const res = await axios.get(`${API_BASE}/api/outcome-knowledge/price`, {
          headers: { "x-api-key": API_KEY },
          params: { keywordName: outcomeName },
        });
        setPrices((prev) => ({ ...prev, [outcomeName]: res.data.price || null }));
      } catch (err) {
        console.error("Error fetching price for", outcomeName, err);
        setPrices((prev) => ({ ...prev, [outcomeName]: null }));
      } finally {
        setPriceLoading(null);
      }
    }
  };
 
  const saveSelectedOutcome = async (outcomeLabel) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/session/save-outcome`,
        { chat_id: chatId, outcomeLabel },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
 
      const queryId = res?.data?.data?.generated_outcome?.query_id;
 
      if (queryId) {
        setQueryIdMap((prev) => ({ ...prev, [outcomeLabel]: queryId }));
        return queryId;
      } else {
        console.warn("Query ID not found in response");
        return null;
      }
    } catch (err) {
      console.error("Error saving selected outcome:", err);
      return null;
    }
  };
 
  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        // 1) Existing: selected outcomes used to render the left list
        const res = await axios.get(
          `${API_BASE}/api/session/diy-outcomes/${chatId}`,
          { headers: { "x-api-key": API_KEY } }
        );
 
        if (res.data.success) {
          const questions = res.data.data;
          const flattened = questions.flatMap((q) =>
            q.outcomes.map((outcome, idx) => ({
              questionNumber: q.questionNumber,
              outcome,
              id: `${q.questionNumber}-${idx}`,
            }))
          );
          setFlattenedOutcomes(flattened);
        }
 
        // 2) ✅ NEW: hydrate completion + query ids from generated_outcomes
        const resAll = await axios.get(
          `${API_BASE}/api/session/all-diy-outcomes/${chatId}`,
          { headers: { "x-api-key": API_KEY } }
        );
        if (resAll.data?.success && Array.isArray(resAll.data.data)) {
          const completion = {};
          const qmap = {};
          resAll.data.data.forEach((o) => {
            if (o?.OutcomeLabel) {
              completion[o.OutcomeLabel] = !!o.isCompleted;
              if (o.query_id) qmap[o.OutcomeLabel] = o.query_id;
            }
          });
          setServerSubmitted(completion);
          setQueryIdMap((prev) => ({ ...qmap, ...prev }));
        }
      } catch (err) {
        console.error("Error fetching outcomes:", err);
        setFlattenedOutcomes([]);
      } finally {
        setLoading(false);
      }
    };
 
    fetchOutcomes();
  }, [chatId]);
 
  return (
    <div className="flex pb-10">
      <div className="w-[50rem] bg-[#2F5EAC] rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div className="px-16 pb-10">
            <h1 className="text-white font-[Roboto Serif] font-medium text-3xl">
              Your Compliance Documents
            </h1>
            <p className="text-white font-light text-sm mt-2">
              Based on your inputs, here are the generated <br />
              compliance documents and recommendations.
            </p>
          </div>
          <div className="w-[10rem]">
            <img src={bro} alt="bro" className="w-full object-contain" />
          </div>
        </div>
 
        <div className="bg-white rounded-xl pb-20">
          <div className="text-center pt-10">
            <h1 className="text-[#000000] font-medium font-[poppins] text-xl pb-2.5">
              Compliance Starting!
            </h1>
            <p className="text-[#787878] font-[poppins] font-light text-sm">
              Expand to see the pricing!
            </p>
          </div>
 
          {!loading &&
            flattenedOutcomes.map((item, index) => {
              const isExpanded = expandedIndex === index;
              const isSelected = selectedOutcome === item.outcome;
              const price = prices[item.outcome];
              const isPriceLoading = priceLoading === item.outcome;
 
              // ✅ merged completion state: persisted OR in-memory
              const isCompleted =
                (submittedOutcomes && submittedOutcomes[item.outcome]) ||
                serverSubmitted[item.outcome] ||
                false;
 
              return (
                <div
                  key={item.id}
                  className={`w-[35rem] rounded-xl px-6 py-4 mx-auto my-6 ${
                    isExpanded || isSelected
                      ? "border-[2px] border-[#388E3C] bg-[#EAF2FF]"
                      : "border border-[#CCCCCC] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left section: Bullet + Title */}
                    <div className="flex items-center gap-x-4 flex-1">
                      <div
                        className={`w-4 h-4 rounded-full border flex-shrink-0 ${
                          isExpanded || isSelected
                            ? "bg-[#388E3C] border-[#388E3C]"
                            : "border-[#388E3C]"
                        } flex items-center justify-center`}
                      >
                        {(isExpanded || isSelected) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-[#4B4B4B] font-[poppins] font-medium text-[16px] flex-1">
                        {item.outcome}
                      </span>
                    </div>
 
                    {/* Right section: Arrow + Action Button */}
                    <div className="flex items-center gap-x-8">
                      {/* Arrow Button */}
                      <button
                        className="flex items-center justify-center w-8 h-8 flex-shrink-0"
                        onClick={() => handleToggle(index, item.outcome)}
                      >
                        {isExpanded ? (
                          <CiCircleChevUp className="text-[#388E3C] w-6 h-6" />
                        ) : (
                          <CiCircleChevDown className="text-[#388E3C] w-6 h-6" />
                        )}
                      </button>
 
                    </div>
                  </div>
 
                  {/* Pricing Section */}
                  {isExpanded && (
                    <div
                      className="mt-6 bg-white px-4 pb-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <hr className="border border-[#D9D9D9]" />
                      <div className="mt-4 space-y-2 font-[poppins] text-sm text-[#4B4B4B]">
                        {isPriceLoading ? (
                          <div className="mt-4 text-[#2F5EAC] text-sm">Fetching price...</div>
                        ) : price ? (
                          <>
                            <div className="flex justify-between mt-4">
                              <span>Professional Fees</span>
                              <span>₹{price.professional_fees}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Government Fees</span>
                              <span>₹{price.government_fees}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-[#2F5EAC]">
                              <span>Total</span>
                              <span>₹{price.total_amount}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-red-500 mt-4">Pricing not available.</div>
                        )}
                      </div>
                      <div className="flex justify-end mt-6">
                        <button
                          disabled={selectedOutcome === item.outcome && !isCompleted}
                          className={`${
                            isCompleted
                              ? "bg-[#388E3C] hover:bg-[#2E7D32]"
                              : selectedOutcome === item.outcome
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#FA9000] hover:bg-[#E8850E]"
                          } text-white px-6 py-2 rounded-full text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (isCompleted) {
                              navigate(`/dashboard/orde`);
                            } else if (selectedOutcome !== item.outcome) {
                              setSelectedOutcome(item.outcome);
                              const queryId = await saveSelectedOutcome(item.outcome);
                              if (queryId) {
                                onStartClick(item.outcome, queryId);
                              }
                            }
                          }}
                        >
                          {isCompleted
                            ? "Check Status"
                            : selectedOutcome === item.outcome
                            ? "In Progress..."
                            : "Start"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
 
export default DiyPayment;