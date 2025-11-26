import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiUpload, FiArrowLeft, FiArrowRight, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

// Define the file name
const CSV_PATH = '/excel_sheets/Trademark_Classes.csv';
 

export default function TrademarkIndiaForm({ onSubmitSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [trademarkClassOptions, setTrademarkClassOptions] = useState([]);
  const [viennaCodeLoading, setViennaCodeLoading] = useState(false);
  const [viennaCodeOptions, setViennaCodeOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]); 

  const fileInputRefs = useRef({});

  const questions = [
    { id: 1, type: "text", question: "Enter Company Name:", validation: "text" }, // Step 0
    { id: 2, type: "tel", question: "Enter Phone Number:", validation: "phone" }, // Step 0
    { id: 3, type: "text", question: "Enter Brand Name:", validation: "text" }, // Step 1
    { id: 4, type: "file", question: "Upload Trademark Logo:", validation: "file" }, // Step 2
    { id: 5, type: "yesno", question: "Do you have a domain name?", validation: "yesno" }, // Step 3
    { id: 6, type: "dropdown", question: "Select Trademark Class:", validation: "dropdown" }, // Step 4 (Trademark Class)
    { id: 7, type: "dropdown", question: "Select Vienna Code:", validation: "dropdown" }, // Step 5
  ];

  const totalSteps = 6; // Step 0: Q1,2. Step 1: Q3. Step 2: Q4. Step 3: Q5. Step 4: Q6. Step 5: Q7.

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- 1. Fetch Trademark Classes from CSV ---
        // Using the unencoded path to avoid the previous URL parsing error
        const csvRes = await fetch(CSV_PATH);
        
        if (!csvRes.ok) {
          throw new Error(`Failed to fetch CSV: ${csvRes.statusText}. Check if file at '${CSV_PATH}' is present in the public folder.`);
        }
        
        const csvText = await csvRes.text();
        
        // Refined CSV parser
        const rows = csvText.split('\n').map(row => row.trim()).filter(Boolean);
        
        if (rows.length > 1) {
          // Splitting the header and trimming/cleaning whitespace/quotes
          const header = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));

          // Identify headers for "class", "Tag", and "Heading"
          let classIndex = header.indexOf('class');
          let tagIndex = header.indexOf('Tag');
          let headingIndex = header.indexOf('Heading');

          if (classIndex !== -1 && tagIndex !== -1 && headingIndex !== -1) {
            const classes = rows.slice(1).map(row => {
              // More robust CSV row parsing to handle commas inside quotes
              const columns = [];
              let current = '';
              let inQuotes = false;
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  columns.push(current.trim());
                  current = '';
                } else {
                  current += char;
                }
              }
              columns.push(current.trim());
              
              return {
                value: columns[classIndex]?.trim().replace(/"/g, ''),
                tag: columns[tagIndex]?.trim().replace(/"/g, ''),
                label: columns[headingIndex]?.trim().replace(/"/g, ''),
              };
            }).filter(item => item.value); // Filter out any empty rows

            setTrademarkClassOptions(classes);
          } else {
            console.error(`CSV header error: Could not find 'class', 'Tag', or 'Heading' in headers: ${header.join(', ')}`);
          }
        }

        // --- 2. Fetch Service Options (Retained from original code) ---
        try {
           const serviceRes = await axios.get("http://localhost:3000/api/trademark/services");
           setServiceOptions(serviceRes.data || []);
        } catch (axiosError) {
             console.warn("Failed to fetch service options from API. Using empty list.", axiosError.message);
        }

      } catch (err) {
        console.error("Failed to fetch or parse data lists:", err);
      }
    };

    fetchData();
  }, []);

  const setAnswerForStep = (stepIndex, payload) => {
    setAnswers((prev) => ({
      ...prev,
      [stepIndex]: {
        ...prev[stepIndex],
        ...payload,
      },
    }));
  };

  const handleTextChange = (e, questionIndex) => {
    setAnswerForStep(questionIndex, { text: e.target.value, type: 'text' });
  };

  const handleYesNo = (val, questionIndex) => {
    setAnswerForStep(questionIndex, { yesno: val, type: 'yesno' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setAnswerForStep(3, { file }); // Question 4 is at index 3

    // --- API Call to Vienna Code Analyzer ---
    setViennaCodeLoading(true);
    setViennaCodeOptions([]); // Clear previous options
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://trademark-checker-967613878221.us-central1.run.app/api/v1/vienna/analyze-logo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // Log the full response to the console as requested
      console.log("API Response:", response.data);
      // Extract the array of codes and update the state for the dropdown
      const viennaCodes = response.data?.top_3_vienna_codes || [];
      setViennaCodeOptions(viennaCodes);
    } catch (err) {
      console.error("Vienna code analysis failed:", err);
    } finally {
      setViennaCodeLoading(false);
    }
  };

  const handleDropdown = (e, questionIndex) => {
    setAnswerForStep(questionIndex, { dropdown: e.target.value, type: 'dropdown' });
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleNext = async () => {
    // Basic validation check before moving to the next step
    let isValid = true;
    if (currentStep === 0) {
        const companyNameAnswer = answers[0] || {};
        const phoneAnswer = answers[1] || {};
        const isCompanyValid = !!companyNameAnswer.text?.trim();
        const isPhoneValid = /^\d{10}$/.test(phoneAnswer.text);
        if (!isPhoneValid) console.error("Please enter a valid 10-digit phone number.");
        isValid = isCompanyValid && isPhoneValid;
    } else {
        // Map step to the correct question index
        // Step 1 -> Q3 (idx 2)
        // Step 2 -> Q4 (idx 3)
        // Step 3 -> Q5 (idx 4)
        // Step 4 -> Q6 (idx 5)
        // Step 5 -> Q7 (idx 6)
        const questionIndex = currentStep + 1;
        const currentQuestion = questions[questionIndex];
        const currentAnswer = answers[questionIndex] || {};

        switch (currentQuestion.type) {
          case "file":
            isValid = !!currentAnswer.file;
            break;
          case "yesno":
            isValid = !!currentAnswer.yesno;
            break;
          case "dropdown":
            isValid = !!currentAnswer.dropdown;
            break;
          case "text":
            isValid = !!currentAnswer.text?.trim();
            break;
          default:
            isValid = true;
        }
    }

    if (!isValid) {
        // Using console.error instead of alert as per instructions
        console.error("Please provide a valid answer before proceeding.");
        // A user-facing message/modal is usually better here, but sticking to console for simplicity
        return; 
    }


    if (currentStep < totalSteps -1) {
      setCurrentStep((s) => s + 1);
    } else {
      await submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers[i] || {};
        const formData = new FormData();

        formData.append("questionNumber", i + 1);
        formData.append("questionText", question.question);

        // Append the relevant answer type
        if (answer?.file instanceof File) {
          formData.append("file", answer.file, answer.file.name);
        } else if (answer?.text) {
          formData.append("answer", answer.text);
        } else if (answer?.yesno) {
          formData.append("answer", answer.yesno);
        } else if (answer?.dropdown) {
          // Append the selected dropdown value
          formData.append("answer", answer.dropdown);
        }

        // Posting each answer individually (can be optimized by batching)
        await axios.post("http://localhost:3000/api/trademark/answers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsSubmitted(true);
      setAnswers({});
      setCurrentStep(0);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred during submission.";
      console.error("Error submitting trademark answers:", err);
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInputForQuestion = (questionIndex) => {
    const question = questions[questionIndex];
    const answer = answers[questionIndex] || {};

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder="Type your answer..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
            value={answer?.text || ""}
            onChange={(e) => handleTextChange(e, questionIndex)}
          />
        );
      case "tel":
        return (
          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
            value={answer?.text || ""}
            onChange={(e) => handleTextChange(e, questionIndex)}
          />
        );
      case "yesno":
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleYesNo("Yes", questionIndex)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                answer?.yesno === "Yes" ? "bg-[#2F5EAC] text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleYesNo("No", questionIndex)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                answer?.yesno === "No" ? "bg-[#2F5EAC] text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              No
            </button>
          </div>
        );
      case "file":
        return (
          <div>
            <label className="w-full flex items-center justify-center px-4 py-3 bg-white text-[#2F5EAC] rounded-lg shadow-sm tracking-wide uppercase border border-blue-300 cursor-pointer hover:bg-[#2F5EAC] hover:text-white transition-colors">
                <FiUpload className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{answer.file ? "Change file" : "Select a file"}</span>
                <input
                    ref={(el) => (fileInputRefs.current[questionIndex] = el)}
                    type='file'
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>
             {answer.file && (
                <p className="mt-2 text-xs text-gray-500">Selected: {answer.file.name}</p>
            )}
          </div>
        );
      case "dropdown":
        // questionIndex 5 is 'Select Trademark Class', questionIndex 6 is 'Select Vienna Code'
        const opts = questionIndex === 5 ? trademarkClassOptions : (questionIndex === 6 ? viennaCodeOptions : serviceOptions);
        
        // Provide a clearer selection guide for the large class list
        const titlePlaceholder = questionIndex === 5 ? "Select a Trademark Class (1-45)"
            : (questionIndex === 6 ? "Select a Vienna Code" : "Select a Service Type");
        
        // Custom styling for a modern dropdown
        // Note: Individual option styling (bg-color/hover) is hard to control on native <select>
        return (
        <div className="relative">
            <select
          className="w-full border-2 border-gray-300 rounded-xl p-4 text-base bg-white cursor-pointer appearance-none 
                     shadow-inner focus:border-[#2F5EAC] focus:ring-2 focus:ring-[#2F5EAC] transition-all duration-200"
          value={answer?.dropdown || ""}
          onChange={(e) => handleDropdown(e, questionIndex)}
          disabled={questionIndex === 6 && viennaCodeLoading}
        >
          <option value="" disabled hidden>
            {questionIndex === 6 && viennaCodeLoading ? "Analyzing logo..." : titlePlaceholder}
          </option>
          {opts.map((opt, idx) => {
            if (questionIndex === 5) {
              return (
                <option
                  key={idx}
                  value={opt.tag} // Use the tag as the value to be stored
                  title={opt.label} // Show full description on hover
                >
                  {`${opt.value}: ${opt.tag}`}
                </option>
              );
            }
            // Handle Vienna codes which are objects from the new API response
            if (questionIndex === 6) {
              return (
                <option key={idx} value={opt.vienna_code} title={opt.description}>
                  {`${opt['6_digit_code']}: ${opt.description}`}
                </option>
              );
            }

            // Fallback for other dropdowns (Service Type)
            const value = opt.value || opt;
            const label = opt.label || opt.value || opt;

            return (
              <option
                key={idx}
                value={value}
                title={label}
              >
                {label}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
        </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[#FFFBD9] rounded-2xl w-full max-w-md p-8 text-center shadow-lg h-[40rem] flex flex-col items-center justify-center">
        <FiCheckCircle className="text-green-500 w-20 h-20 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#2F5EAC] mb-2">Successfully Submitted!</h2>
        <p className="text-gray-600">Your Trademark India form has been recorded. We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF3FF96] border border-[#FFDAFA] rounded-2xl w-full max-w-md p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[#FFCC55] text-3xl font-semibold">
            Compliance <span className="text-[#2F5EAC]">bot</span>
          </p>
          <p className="text-[#6A6A6A] mt-3 tracking-wider text-sm">
            Help us create your compliance report by answering a few questions
          </p>
        </div>
        <img src="/assets/imgs/Chatbot/lara.svg" alt="Lara the bot" className="w-40 flex-shrink-0" />
      </div>

      {/* Question Box */}
      <div className="bg-[#FFFBD9] h-[40rem] rounded-2xl my-4 p-6 overflow-auto flex flex-col">
        <div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-[#E5E5E5] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-[#2F5EAC] transition-all duration-500"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>

          <p className="text-[#2F5EAC] font-semibold mb-10">
            Question {currentStep + 1}/{totalSteps}
          </p>
        </div>

        <div className="flex-grow">
          {currentStep === 0 ? (
            <>
              <p className="text-black text-lg font-semibold mb-4 tracking-wide">{questions[0].question}</p>
              <div className="mb-8">{renderInputForQuestion(0)}</div>
              
              <p className="text-black text-lg font-semibold mb-4 tracking-wide">{questions[1].question}</p>
              <div>{renderInputForQuestion(1)}</div>
            </>
          ) : (
            <>
              <p className="text-black text-lg font-semibold mb-8 tracking-wide">
                {questions[currentStep + 1].question}
              </p>
              {renderInputForQuestion(currentStep + 1)}
            </>
          )}
        </div>

        {/* Vienna Code Loading Indicator */}
        {viennaCodeLoading && currentStep === 2 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
                <FiLoader className="animate-spin w-5 h-5" />
                <span>Analyzing logo for Vienna Code...</span>
            </div>
        )}

        {/* Submission Error Message */}
        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center gap-2 mt-4">
              <FiXCircle className="w-5 h-5"/>
              <span className="block sm:inline text-sm">{submitError}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || submitting}
            className={`px-8 py-2 rounded-lg transition-all ${
              currentStep === 0 || submitting
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-[#f1f1f1] text-[#2F5EAC] hover:bg-gray-200"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={submitting}
            className={`px-8 py-2 text-white rounded-lg transition-all ${
              !submitting
                ? "bg-[#2F5EAC] hover:bg-[#244b90]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : currentStep === totalSteps - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}