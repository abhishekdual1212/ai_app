import { useState } from "react";
import DiyBot from "./DiyBot";
import DiyPayment from "./DiyPayment";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;
 
const Diy = () => {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [queryId, setQueryId] = useState(null);
  const [submittedOutcomes, setSubmittedOutcomes] = useState({});
 
  const handleStartClick = (outcome, id) => {
    setSelectedOutcome(outcome);
    setQueryId(id);
  };
 
  // ✅ This function will be called when all questions are submitted
  const handleAllSubmitted = async (completedQueryId) => {
    // ✅ Persist completion server-side so state survives page changes/refresh
    try {
      const chatId = localStorage.getItem("Dchat_id");
      if (chatId && completedQueryId) {
        await axios.post(
          `${API_BASE}/api/session/diy-outcome/submit`,
          { chat_id: chatId, query_id: completedQueryId },
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (e) {
      console.error("DIY submit persist error:", e);
    }
 
    // Keep existing local UI behavior
    const outcome = selectedOutcome;
    if (outcome) {
      setSubmittedOutcomes(prev => ({
        ...prev,
        [outcome]: true
      }));
    }
    
    // Reset the selected outcome to go back to main view
    setSelectedOutcome(null);
    setQueryId(null);
  };
 
  return (
    <div className="flex w-full px-10 gap-9 py-6">
      <div className="w-[60%]">
        <DiyPayment
          onStartClick={handleStartClick}
          submittedOutcomes={submittedOutcomes}
          setSubmittedOutcomes={setSubmittedOutcomes}
        />
      </div>
      <div className="w-[40%]">
        <DiyBot
          selectedOutcome={selectedOutcome}
          queryId={queryId}
          onAllSubmitted={handleAllSubmitted}
        />
      </div>
    </div>
  );
};
 
export default Diy;