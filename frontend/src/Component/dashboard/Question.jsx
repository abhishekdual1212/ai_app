import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import bro from "../../../public/assets/bro.png";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

const Question = () => {
  const [allAnswers, setAllAnswers] = useState([]);
  const [questions, setQuestions] = useState({});
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { paramQuestionNumber } = useParams();
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");

  const questionNumber = parseInt(paramQuestionNumber, 10);
  const progressPercentage = Math.min(
    ((questionNumber && !isNaN(questionNumber) ? questionNumber : 0) / 10) * 100,
    100
  );

  const handlePrevious = () => {
    const prevQuestion = parseInt(paramQuestionNumber) - 1;
    if (prevQuestion > 0) {
      navigate(`/dashboard/question/${prevQuestion}`);
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSaveAndNext = () => {
    const currentQuestionNumber = parseInt(paramQuestionNumber);

    setAllAnswers((prev) => {
      const updated = prev.filter(
        (a) => a.questionNumber !== currentQuestionNumber
      );
      return [
        ...updated,
        {
          questionNumber: currentQuestionNumber,
          selectedOptions: selectedOptions,
        },
      ];
    });

    setSelectedOptions([]);
    navigate(`/dashboard/question/${currentQuestionNumber + 1}`);
  };

  const handleSubmitAll = async () => {
    const currentQuestionNumber = parseInt(paramQuestionNumber);
    const updatedAnswers = [
      ...allAnswers.filter((a) => a.questionNumber !== currentQuestionNumber),
      {
        questionNumber: currentQuestionNumber,
        selectedOptions: selectedOptions,
      },
    ];

    try {
      for (const ans of updatedAnswers) {
        const payload = {
          chat_id: localStorage.getItem("Dchat_id"),
          questionNumber: ans.questionNumber,
          selectedOptions: ans.selectedOptions.map((opt) =>
            Number(opt.keywordId)
          ),
        };

        console.log("Sending payload:", payload);

        await axios.post(
          `${API_BASE}/api/session/${sessionId}/save-diy-outcome`,
          payload,
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
      }

      alert("✅ All answers submitted successfully!");
      navigate("/dashboard/diypayment");
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("Failed to submit. Try again.");
    }
  };

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

        setQuestions(response.data.question);
        setOptions(response.data.groupedTags.tags || []);
        console.log(response.data.groupedTags.tags);
      } catch (err) {
        console.error("🔴 Error fetching questions:", err);
      }
    };

    fetchQuestion();
  }, [paramQuestionNumber]);

  return (
    <div className="flex pb-10">
      <div className="w-[50rem] bg-[#2F5EAC] rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div className="px-16 pb-10">
            <h1 className="text-white font-[Roboto Serif] font-medium text-3xl">
              Answer the Questionnaire
            </h1>
            <p className="text-white font-light text-sm mt-2">
              Help us create your compliance report by <br />
              answering a few questions
            </p>
          </div>
          <div className="w-[10rem]">
            <img src={bro} alt="bro" className="w-full object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-xl pb-20">
          {/* Navigation buttons */}
          <div className="flex justify-between p-6">
            <div
              onClick={handlePrevious}
              className="text-[#2F5EAC] font-[poppins] font-normal flex items-center gap-2 cursor-pointer underline"
            >
              <CiCircleChevLeft className="w-6 h-6" />
              Previous
            </div>
            <div className="bg-[#E9FCE8] text-[#34A853] text-sm px-6 py-2 rounded-full font-medium">
              Question No {questions?.questionNumber}
            </div>
          </div>

          {/* Progress Bar moved below */}
          <div className="p-6">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-[#34A853]">
                Progress
              </span>
              <span className="text-sm font-medium text-[#34A853]">
                {`${progressPercentage}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#34A853] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="my-10 bg-[#2F5EAC0D] px-10 py-14">
            <p className="text-[#000000] font-[poppins] font-normal">
              {questions?.question}
            </p>
            <div className="border-b border-[#6A6A6A40] pb-4 my-4"></div>

            <div className="flex flex-col space-y-4 font-[poppins] font-normal py-4">
              {options.map((item) => (
                <div
                  key={item.keywordId}
                  onClick={() => handleOptionSelect(item)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded-sm border ${
                      selectedOptions.includes(item)
                        ? "bg-[#34A853] border-[#34A853]"
                        : "bg-white border-[#2F5EAC]"
                    }`}
                  >
                    {selectedOptions.includes(item) && (
                      <FaCheck className="text-white text-[8px]" />
                    )}
                  </div>

                  <div
                    className={`px-6 py-2 rounded-full w-[20rem] text-left text-sm ${
                      selectedOptions.includes(item)
                        ? "bg-[#2F5EAC] text-white"
                        : "bg-[#2F5EAC33] text-[#2F5EAC]"
                    }`}
                  >
                    {item.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center gap-24">
            <button className="border border-[#2F5EAC] text-[#2F5EAC] px-8 py-2 rounded-md">
              Save as Draft
            </button>
            {10 === questions?.questionNumber ? (
              <button
                className="bg-[#2F5EAC] text-white px-8 py-2 rounded-md"
                onClick={handleSubmitAll}
              >
                Submit
              </button>
            ) : (
              <button
                className="bg-[#2F5EAC] text-white px-8 py-2 rounded-md"
                onClick={handleSaveAndNext}
              >
                Save and Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
