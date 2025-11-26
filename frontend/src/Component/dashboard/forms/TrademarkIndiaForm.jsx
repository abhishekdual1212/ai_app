import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
 
const CSV_PATH = "/excel_sheets/Trademark_Classes.csv";
const API_BASE = "http://localhost:3000/api";
const API_KEY = "1234567890abcdef";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
 
export default function TrademarkIndiaForm({ onSubmitSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trademarkClassOptions, setTrademarkClassOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [trademarkId, setTrademarkId] = useState(null);
  const fileInputRefs = useRef({});
  const [viennaCodeOptions, setViennaCodeOptions] = useState([]);
const [viennaCodeLoading, setViennaCodeLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState({ imageUrl: '', sessionId: '' });
  const [captchaLoading, setCaptchaLoading] = useState(false);
 
  const questions = [
    { id: 1, type: "text", question: "Enter Company Name:", validation: "text" },
    { id: 2, type: "tel", question: "Enter Phone Number:", validation: "phone" },
    { id: 3, type: "text", question: "Enter Brand Name:", validation: "text" },
    { id: 4, type: "file", question: "Upload Trademark Logo:", validation: "file" },
    { id: 5, type: "yesno", question: "Do you have a domain name?", validation: "yesno" },
    { id: 6, type: "dropdown", question: "Select Trademark Class:", validation: "dropdown" },
    { id: 7, type: "dropdown", question: "Select Vienna Code:", validation: "dropdown" },
    { id: 8, type: "captcha", question: "Enter the code from the image:", validation: "text" },
  ];
 

  const analyzeLogoViennaCode = async (file) => {
  if (!file) return;

  setViennaCodeLoading(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      "https://trademark-checker-967613878221.us-central1.run.app/api/v1/vienna/analyze-logo",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    console.log("Vienna API Response:", response.data);

    const viennaCodes = response.data?.top_3_vienna_codes || [];
    setViennaCodeOptions(viennaCodes);
  } catch (err) {
    console.error("Vienna code analysis failed:", err);
  } finally {
    setViennaCodeLoading(false);
  }
};

  // Fetch trademark classes & services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvRes = await fetch(CSV_PATH);
        if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.statusText}`);
        const csvText = await csvRes.text();
        const rows = csvText.split("\n").map(r => r.trim()).filter(Boolean);
 
        if (rows.length > 1) {
          const header = rows[0].split(",").map(h => h.trim().replace(/"/g, ""));
          const classIndex = header.indexOf("class");
          const tagIndex = header.indexOf("Tag");
          const headingIndex = header.indexOf("Heading");
 
          if (classIndex !== -1 && tagIndex !== -1 && headingIndex !== -1) {
            const classes = rows.slice(1).map(row => {
              const cols = [];
              let current = "", inQuotes = false;
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
                  inQuotes = !inQuotes;
                } else if (char === "," && !inQuotes) {
                  cols.push(current.trim());
                  current = "";
                } else {
                  current += char;
                }
              }
              cols.push(current.trim());
              return {
                classNum: cols[classIndex]?.replace(/"/g, ""),
                tag: cols[tagIndex]?.replace(/"/g, ""),
                description: cols[headingIndex]?.replace(/"/g, "")
              };
            }).filter(Boolean);
            setTrademarkClassOptions(classes);
          }
        }
 
        const svcRes = await axios.get(`${API_BASE}/trademarks/services`, {
          headers: { "x-api-key": API_KEY }
        });
        setServiceOptions(svcRes.data || []);
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };
    fetchData();
  }, []);
 
  // Fetch Captcha when step becomes active
  useEffect(() => {
    const fetchCaptcha = async () => {
      if (currentStep === 7) { // Captcha step
        setCaptchaLoading(true);
        try {
          const response = await axios.get('https://trademark-checker-967613878221.us-central1.run.app/api/v1/tm-india/captcha/get-real');
          console.log("Captcha API Response:", response.data);
          // The actual data might be nested inside a 'data' property.
          const captchaResponseData = response.data.data || response.data;
          setCaptchaData({
            imageUrl: captchaResponseData.captcha_image,
            sessionId: captchaResponseData.captcha_id,
          });
        } catch (err) {
          console.error("Failed to fetch captcha:", err);
        } finally {
          setCaptchaLoading(false);
        }
      }
    };
    fetchCaptcha();
  }, [currentStep]);

  const setAnswerForStep = (step, payload) =>
    setAnswers(prev => ({ ...prev, [step]: { ...prev[step], ...payload } }));
 
  const handleTextChange = e => setAnswerForStep(currentStep, { text: e.target.value });
  const handleYesNo = val => setAnswerForStep(currentStep, { yesno: val });
  const handleDropdown = e => setAnswerForStep(currentStep, { dropdown: e.target.value });
 
  const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    alert("Invalid file type. Only JPG, JPEG, PNG, PDF allowed.");
    e.target.value = "";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    alert("File too large. Max 5 MB allowed.");
    e.target.value = "";
    return;
  }

  setAnswerForStep(currentStep, { file });

  // Call Vienna code API for logo analysis
  if (currentStep === 3) { // The logo upload is at index 3
    await analyzeLogoViennaCode(file);
  }
};

 
  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };
 
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
 
  const handleNext = async () => {
    const currentAnswer = answers[currentStep] || {};
    const currentQuestion = questions[currentStep];
 
    // Validation
    let isValid = false;
    switch (currentQuestion.validation) {
      case "text": isValid = !!currentAnswer.text; break;
      case "phone": isValid = !!currentAnswer.text && /^[0-9]{10}$/.test(currentAnswer.text); break;
      case "yesno": isValid = currentAnswer.yesno === "Yes" || currentAnswer.yesno === "No"; break;
      case "file": isValid = !!currentAnswer.file; break;
      case "dropdown": isValid = !!currentAnswer.dropdown; break;
      default: isValid = true;
    }
 
    if (!isValid) {
      alert(currentQuestion.validation === "phone" ? "Phone must be exactly 10 digits." : "Answer required.");
      return;
    }
 
    try {
      let id = trademarkId;
      if (!id) {
        const res = await axios.post(`${API_BASE}/trademarks`, {}, {
          headers: { "x-api-key": API_KEY }
        });
        if (!res.data?.id) throw new Error("Failed to create trademark form");
        id = res.data.id;
        setTrademarkId(id);
      }
 
      // Check if last question
      if (currentStep < questions.length - 1) {
        setSubmitting(true);
        // Save current answer and move to next step
        setAnswers(prev => ({ ...prev, [currentStep]: currentAnswer }));
        setCurrentStep(s => s + 1);
        setSubmitting(false);
      } else {
        // Final step: Verify captcha then submit form
        setSubmitting(true);
        try {
          // 1. Verify Captcha
          const captchaFormData = new FormData();
          captchaFormData.append('captcha_id', captchaData.sessionId);
          captchaFormData.append('captcha_solution', currentAnswer.text || '');

          await axios.post(
            'https://trademark-checker-967613878221.us-central1.run.app/api/v1/tm-india/captcha/verify-real',
            captchaFormData
          );

          // 2. If captcha is correct, proceed with form submission
          const allAnswers = {};
          const finalAnswers = { ...answers, [currentStep]: currentAnswer };

          for (let idx = 0; idx < questions.length; idx++) {
            const ans = finalAnswers[idx] || {};
            switch (idx) {
              case 0: allAnswers.companyName = ans.text || ""; break;
              case 1: allAnswers.phoneNumber = ans.text || ""; break;
              case 2: allAnswers.brandName = ans.text || ""; break;
              case 3: allAnswers.logo = ans.file ? await toBase64(ans.file) : ""; break;
              case 4: allAnswers.hasTrademark = ans.yesno || ""; break;
              case 5: allAnswers.trademarkClass = ans.dropdown || ""; break;
              case 6: allAnswers.viennaCode = ans.dropdown || ""; break;
              // Captcha data is not needed for the final trademark submission
              case 7: break; 
              default: break;
            }
          }
  
          await axios.patch(`${API_BASE}/trademarks/${id}`, allAnswers, {
            headers: { "x-api-key": API_KEY }
          });
  
          setIsSubmitted(true);
          setAnswers({});
          setCurrentStep(0);
          setTrademarkId(null);
          if (onSubmitSuccess) onSubmitSuccess();
        } catch (captchaError) {
          console.error("Captcha verification failed:", captchaError.response?.data || captchaError.message);
          alert("Captcha verification failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err.message);
      alert("Submission failed. Check console.");
    } finally {
      setSubmitting(false);
    }
  };
 
  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentStep] || {};
 
  const renderInput = () => {
    {viennaCodeLoading && <p>Analyzing logo... please wait.</p>}

    switch (currentQuestion.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder="Type your answer..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
            value={currentAnswer.text || ""}
            onChange={handleTextChange}
          />
        );
      case "tel":
        return (
          <input
            type="tel"
            placeholder="Enter 10 digit phone number"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
            value={currentAnswer.text || ""}
            maxLength={10}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) setAnswerForStep(currentStep, { text: val });
            }}
          />
        );
      case "yesno":
        return (
          <div className="flex gap-4">
            {["Yes", "No"].map(val => (
              <button
                key={val}
                onClick={() => handleYesNo(val)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  currentAnswer.yesno === val
                    ? "bg-[#2F5EAC] text-white shadow-md"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        );
      case "file":
        return (
          <div>
            <input
              type="file"
              ref={el => (fileInputRefs.current[currentStep] = el)}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0 file:text-sm file:font-semibold
                file:bg-[#2F5EAC] file:text-white hover:file:bg-[#244b90] cursor-pointer"
            />
            {currentAnswer.file && (
              <p className="mt-2 text-xs text-gray-500">
                Selected: {currentAnswer.file.name}
              </p>
            )}
          </div>
        );
      case "dropdown":
        let opts = [];
        let placeholder = "";
        if (currentStep === 5) {
          opts = trademarkClassOptions;
          placeholder = "Select a Trademark Class (1-45)";
        } else if (currentStep === 6) {
          opts = viennaCodeOptions;
          placeholder = viennaCodeLoading ? "Analyzing logo..." : "Select a Vienna Code";
        }
        return (
          <select
            className="w-full border-2 border-gray-300 rounded-xl p-4 text-base bg-white
              cursor-pointer appearance-none shadow-inner focus:border-[#2F5EAC] focus:ring-2 focus:ring-[#2F5EAC]"
            value={currentAnswer.dropdown || ""}
            onChange={handleDropdown}
          >
            <option value="" disabled hidden>{placeholder}</option>
            {opts.map((opt, idx) => {
              if (currentStep === 5) {
                return (
                  <option key={idx} value={opt.classNum} title={opt.description}>
                    {`${opt.classNum}: ${opt.tag}`}
                  </option>
                );
              } else if (currentStep === 6) {
                return (
                  <option key={idx} value={opt['6_digit_code']} title={opt.description}>
                    {`${opt['6_digit_code']}: ${opt.description}`}
                  </option>
                )
              }
            })}
          </select>
        );
      case "captcha":
        return (
          <div>
            {captchaLoading ? (
              <p>Loading captcha...</p>
            ) : (
              captchaData.imageUrl && <img src={captchaData.imageUrl} alt="Captcha" className="mb-4 border rounded" />
            )}
            <input
              type="text"
              placeholder="Enter captcha code"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-[#2F5EAC]"
              value={currentAnswer.text || ""}
              onChange={handleTextChange}
              disabled={captchaLoading}
            />
          </div>
        );
      default:
        return null;
    }
  };
 
  if (isSubmitted) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2F5EAC] mb-4">
            Successfully Submitted!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Your Trademark India form has been recorded.
          </p>
          <p className="text-sm text-gray-500">
            Thank you for completing the questionnaire. We will contact you shortly.
          </p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-[#FFF3FF96] border border-[#FFDAFA] rounded-2xl w-full max-w-md md:max-w-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#FFCC55] text-3xl font-semibold">
            Compliance <span className="text-[#2F5EAC]">bot</span>
          </p>
          <p className="text-[#6A6A6A] mt-3 tracking-wider text-sm">
            Help us create your compliance report by answering a few questions
          </p>
        </div>
        <img src="/assets/imgs/Chatbot/lara.svg" alt="lara" className="w-32 md:w-40" />
      </div>

      {/* Question Box */}
      <div className="bg-[#FFFBD9] h-[40rem] md:h-auto rounded-2xl my-4 p-6 overflow-auto">
        <div className="w-full h-2 bg-[#E5E5E5] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[#2F5EAC] transition-all duration-500"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-[#2F5EAC] font-semibold mb-10">
          Question {currentStep + 1}/{questions.length}
        </p>
        <p className="text-black text-lg font-semibold mb-8 tracking-wide">
          {currentQuestion.question}
        </p>
        <div className="space-y-4">
          {renderInput()}
        </div>
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
              submitting ? "bg-gray-300 cursor-not-allowed" : "bg-[#2F5EAC] hover:bg-[#244b90]"
            }`}
          >
            {submitting ? "Submitting..." : currentStep === questions.length - 1 ? "Submit" : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
 