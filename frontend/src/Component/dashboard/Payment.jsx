// Component/dashboard/Payment.jsx
import { useState, useEffect } from "react";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";
 
const Payment = ({ query, onStartClick, selectedOutcome, isIntentCompleted }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intentQueryId, setIntentQueryId] = useState(null);
  const chatId = localStorage.getItem("chatId") || localStorage.getItem("Ichat_id");
 
  const navigate = useNavigate();
 
  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
 
  // Proceed → create/ensure query_id, then notify parent (which opens right panel)
  const handleStartIntent = async () => {
    try {
      if (!chatId) return onStartClick(query); // safe fallback
      const res = await axios.post(
        `${API_BASE}/api/session/${chatId}/save-current-intent`,
        { query },
        { headers: { "x-api-key": API_KEY } }
      );
      const queryId = res.data?.query_id;
      if (queryId) {
        setIntentQueryId(queryId);
        localStorage.setItem("intentQueryId", queryId);
        localStorage.setItem("I_query_id", queryId);
        localStorage.setItem("query_id", queryId);
      }
      onStartClick(query);
    } catch (error) {
      console.error("Error saving intent:", error);
      onStartClick(query);
    }
  };
 
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const encoded = encodeURIComponent(query || "");
        const res = await axios.get(`${API_BASE}/api/intents/${encoded}/price`, {
          headers: { "x-api-key": API_KEY },
        });
 
        const priceObj = res.data.price;
        if (priceObj) {
          setPlanData([
            {
              govtFee: priceObj.government_fees,
              price: priceObj.professional_fees,
              total: priceObj.total_amount,
            },
          ]);
        } else {
          setPlanData([]);
        }
      } catch (error) {
        console.error("API fetch failed:", error);
        setPlanData([]);
      } finally {
        setLoading(false);
      }
    };
 
    if (query) fetchPlan();
  }, [query]);
 
  return (
    <div className="my-10 px-10 py-14">
      {!loading &&
        planData.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const isSelected = selectedOutcome === query;
 
          return (
            <div
              key={index}
              className={`w-full rounded-xl px-4 py-3 mx-auto my-6 cursor-pointer transition-shadow duration-300 ${
                isExpanded
                  ? "border-[2px] border-[#388E3C] bg-[#EAF2FF] shadow-md"
                  : "border border-[#CCCCCC] bg-white"
              }`}
              onClick={() => handleToggle(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      isExpanded
                        ? "bg-[#388E3C] border-[#388E3C]"
                        : "border-[#388E3C]"
                    } flex items-center justify-center`}
                  >
                    {isExpanded && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-[#4B4B4B] font-[poppins] font-light text-[18px]">
                    {query}
                  </span>
                </div>
 
                <div className="flex items-center gap-8">
                  {isExpanded ? (
                    <CiCircleChevUp className="text-[#388E3C] w-8 h-8" />
                  ) : (
                    <CiCircleChevDown className="text-[#388E3C] w-8 h-8" />
                  )}
                </div>
              </div>
 
              {isExpanded && (
                <div
                  className="mt-6 bg-white px-4 pb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <hr className="border border-[#D9D9D9]" />
                  <div className="mt-4 space-y-2 font-[poppins] text-sm text-[#4B4B4B]">
                    <div className="flex justify-between">
                      <span>Government fees</span>
                      <span>₹{item.govtFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional</span>
                      <span>₹{item.price}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 text-[#000]">
                      <span>Total Amount</span>
                      <span>₹{item.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected && isIntentCompleted) {
                          navigate(`/dashboard/orderIntent`);
                        } else if (!isSelected) {
                          handleStartIntent();
                        }
                      }}
                      className={`text-sm px-8 py-2 rounded-full font-semibold transition-all duration-200 ${
                        isSelected && !isIntentCompleted
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : isIntentCompleted && isSelected
                          ? "bg-[#388E3C] text-white hover:bg-[#2f6e2c]"
                          : "bg-[#FA9000] text-white hover:bg-[#e38c00]"
                      }`}
                      disabled={isSelected && !isIntentCompleted}
                    >
                      {isIntentCompleted && isSelected
                        ? "Check Status"
                        : isSelected
                        ? "Selected"
                        : "Proceed"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
 
export default Payment;
