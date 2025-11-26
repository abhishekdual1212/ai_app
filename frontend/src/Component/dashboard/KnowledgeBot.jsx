
import { useState, useEffect } from "react";
import knowledge from "../../../public/assets/knowledge.png";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

const KnowledgeBot = () => {
  const { paramQuestionNumber } = useParams();
  const [option, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [explanationText, setExplanationText] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/diy-questions/${paramQuestionNumber}`,
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );
        setOptions(response.data.groupedTags.tags || []);
        setSelectedOptions([]); 
        setExplanationText("");
      } catch (err) {
        console.error("🔴 Error fetching questions:", err);
      }
    };

    fetchQuestion();
  }, [paramQuestionNumber]);

  const handleOptionClick = (clickedOption) => {
    const alreadySelected = selectedOptions.find(
      (opt) => opt.keywordId === clickedOption.keywordId
    );

    if (alreadySelected) {
      setSelectedOptions((prev) =>
        prev.filter((opt) => opt.keywordId !== clickedOption.keywordId)
      );
      setExplanationText("");
    } else {
      if (selectedOptions.length < 2) {
        setSelectedOptions((prev) => [...prev, clickedOption]);
      }
    }
  };

  const handleSeeDefinition = async () => {
    try {
      const keywordNames = selectedOptions.map((opt) => opt.tag);
      const res = await axios.post(
        `${API_BASE}/api/knowledge/explanations`,
        {
          questionNumber: Number(paramQuestionNumber),
          keywordNames: keywordNames,
        },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      setExplanationText(res.data?.explanation || "No explanation found.");
    } catch (error) {
      console.error("🔴 Error fetching explanation:", error);
      setExplanationText("Currenly have no available defination for that options");
    }
  };

  return (
    <div className="bg-[#FFF8FF] border border-[#FFCACA] h-[65rem] p-6 rounded-xl font-[poppins] mb-7">
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

      {/* Body: Avatar + Options */}
      <div className="flex mt-4 items-start gap-4">
        {/* Avatar */}
        <div className="pt-2">
          <img src={knowledge} className="w-16" alt="knowledge" />
        </div>

        {/* Options */}
        <div className="flex flex-col space-y-6 max-h-[26rem] overflow-y-auto pr-3 w-full">
          {option.map((opt) => {
            const isSelected = selectedOptions.some(
              (selected) => selected.keywordId === opt.keywordId
            );
            return (
              <div key={opt.keywordId} className="w-full">
                <div
                  onClick={() => handleOptionClick(opt)}
                  className={`bg-[#EDF4FF] ${
                    isSelected ? "border border-[#2F5EAC]" : "border-0"
                  } w-[20rem] px-6 py-4 rounded-xl flex items-center gap-2 cursor-pointer transition`}
                >
                  <div className="w-4 h-4 rounded-full border border-[#2F5EAC] flex items-center justify-center">
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#2F5EAC]" />
                    )}
                  </div>
                  <p className="text-sm text-[#2F5EAC] font-[poppins] font-medium">
                    {opt.tag}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Note */}
      <p className="text-[#2F5EAC] text-[14px] mt-16 flex justify-center text-center">
        Select any of the above two keywords to know <br />
        the difference between them.
      </p>

      {/* See Definition Button (replacing Continue) */}
      <div className="flex justify-end">
        {selectedOptions.length === 2 && (
          <button
            className="bg-[#2F5EAC] text-white px-6 py-2 rounded-md text-sm my-8"
            onClick={handleSeeDefinition}
          >
            See Definition
          </button>
        )}
      </div>

      {/* Yellow Info Box with explanation */}
      <div className="flex flex-row-reverse justify-between gap-4 rounded-md mt-16 text-xs text-[#2F5EAC] leading-5">
        <div className="bg-[#FFF8CE] p-6 rounded-xl w-[28rem]">
          <p>
            <strong>
              {explanationText}
      
            </strong>
          </p>
        </div>
        <div>
          <img src={knowledge} className="w-[12rem]" alt="knowledge" />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBot;
