

import { useState, useEffect } from "react";
import axios from "axios";
import knowledge from "../../../public/assets/knowledge.png";
import KnowledgeBot from "./chat-bot/KnowledgeBot";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

const DiyBot = ({ selectedOutcome, queryId, onAllSubmitted }) => {
  const [allOutcomes, setAllOutcomes] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [explanations, setExplanations] = useState({});
  const [showError, setShowError] = useState(false);

  const sessionId = localStorage.getItem("sessionId");
  const chatId = localStorage.getItem("Dchat_id");

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/session/diy-outcomes/${chatId}`,
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        if (res.data.success && Array.isArray(res.data.data)) {
          const all = res.data.data.flatMap((q) => q.outcomes || []);
          const unique = [...new Set(all)].filter(Boolean); // Filter out any potential falsy values
          setAllOutcomes(unique);
        } else {
          console.error("Error fetching outcomes: Data is not in expected format", res.data);
        }
      } catch (error) {
        console.error("Error fetching outcomes:", error);
      }
    };

    fetchOutcomes();
  }, [chatId]);

const handleSelect = (keyword) => {
  if (selectedKeywords.includes(keyword)) {
    // ✅ Deselect if already selected
    setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
    setShowError(false);
  } else {
    if (selectedKeywords.length >= 2) {
      // ✅ Replace the first one with the new keyword (ensure different selections)
      const [, second] = selectedKeywords; // keep the 2nd, drop the 1st
      setSelectedKeywords([second, keyword]);
      setShowError(false);
    } else {
      // ✅ Add normally
      setSelectedKeywords([...selectedKeywords, keyword]);
      setShowError(false);
    }
  }
};



  const fetchDefinitions = async () => {
    try {
      const joined = selectedKeywords.map((k) => encodeURIComponent(k)).join(",");
    
      const res = await axios.get(
        `${API_BASE}/api/outcome-knowledge/by-keywordName?names=${joined}`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      if (res.data && typeof res.data === "object") {
        setExplanations(res.data);
      }
    } catch (err) {
      console.error("Error fetching definitions:", err);
    }
  };

  // ✅ Show chatbot if outcome is selected
  if (selectedOutcome) {
    return (
      <KnowledgeBot
        selectedOutcome={selectedOutcome}
        queryId={queryId}
        onAllSubmitted={onAllSubmitted}
      />
    );
  }

  return (
    <div className="bg-[#FFF8FF] border border-[#FFCACA] h-[76rem] p-6 rounded-xl font-[poppins] mb-7">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col mb-4">
          <h1 className="font-[Roboto Serif] font-medium text-3xl my-2">
            <span className="text-[#FFCC55]">Knowledge</span>{" "}
            <span className="text-[#2F5EAC]">bot</span>
          </h1>
          <p className="font-light text-sm leading-5 text-[#4B4B4B]">
            Help us create your compliance report by <br />
            answering a few questions
          </p>
        </div>
        <img src={knowledge} className="w-[7rem]" alt="knowledge" />
      </div>

      {/* Keyword list */}
      <div className="flex mt-4 items-start gap-4">
        <div className="pt-2">
          <img src={knowledge} className="w-16" alt="knowledge" />
        </div>
        <div className="flex flex-col space-y-6 max-h-[26rem] overflow-y-auto pr-3 w-full">
          {allOutcomes.map((keyword, index) => {
            const isSelected = selectedKeywords.includes(keyword);

            return (
              <div key={index} className="w-full">
                <div
                  onClick={() => handleSelect(keyword)}
                  className="bg-[#EDF4FF] w-[20rem] px-6 py-4 rounded-xl flex items-center gap-2 border-0 cursor-pointer transition hover:bg-[#E3F2FD]"
                >
                  <div className="w-4 h-4 rounded-full border border-[#2F5EAC] flex items-center justify-center">
                    {isSelected && !showError && (
                      <div className="w-2 h-2 rounded-full bg-[#2F5EAC]" />
                    )}
                  </div>
                  <p className="text-sm text-[#2F5EAC] font-[poppins] font-medium">
                    {keyword}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showError && (
        <p className="text-red-600 text-xs mt-4 text-center font-medium">
          You can select only 2 keywords at a time, Please deselect one before choosing another.
        </p>
      )}

      <p className="text-[#2F5EAC] text-[14px] mt-16 flex justify-center text-center">
        Select any of the above two keywords to know <br />
        the difference between them.
      </p>

      <div className="flex justify-end">
        <button
          className="bg-[#2F5EAC] text-white px-6 py-2 rounded-md text-sm my-8 disabled:opacity-50 hover:bg-[#244b90] transition-colors"
          disabled={selectedKeywords.length !== 2}
          onClick={fetchDefinitions}
        >
          See Definition
        </button>
      </div>

      {/* Explanation Box */}
      <div className="flex flex-row-reverse justify-between gap-4 rounded-md mt-16 text-xs text-[#2F5EAC] leading-5">
        <div className="bg-[#FFF8CE] p-6 rounded-xl w-full">
          {selectedKeywords.length === 0 ? (
            <p>
              <strong>
               
              </strong>
            </p>
          ) : (
            selectedKeywords.map((keyword, i) => (
              <div key={i} className="mb-4">
                {explanations[keyword]?.map((entry, j) => (
                  <p key={j} className="mb-2">
                    <strong>
                      {entry.explanation
                        }
                    </strong>
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
        <div>
          <img src={knowledge} className="w-[12rem]" alt="knowledge" />
        </div>
      </div>
    </div>
  );
};

export default DiyBot;
