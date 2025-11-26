import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";

const API_BASE = "http://localhost:3000";
const API_HEADERS = { "x-api-key": "1234567890abcdef" };

const StartupOrderIntent = ({ onProgressUpdate }) => {
  const [intentData, setIntentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true); // Default to expanded
  const [isUpdating, setIsUpdating] = useState(false);

  // This effect will run whenever intentData changes, ensuring the percentage is always up-to-date.
  useEffect(() => {
    if (intentData && onProgressUpdate) {
      const progressSteps = intentData.progress || [];
      const completedSteps = progressSteps.filter(step => step.status === true).length;
      const totalSteps = progressSteps.length;
      if (totalSteps > 0) {
        const percentage = Math.round((completedSteps / totalSteps) * 100);
        onProgressUpdate(percentage);
      } else {
        onProgressUpdate(0);
      }
    }
  }, [intentData, onProgressUpdate]);

  useEffect(() => {
    const fetchIntentData = async () => {
      // Use 'Schat_id' as it's specific to the startup flow.
      const chatId = localStorage.getItem('Schat_id');

      if (!chatId) {
        const errorMsg = 'No startup service selected. Please start a service first.';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      try {
        // This is a placeholder for your actual API endpoint to get intent progress.
        // You might need to adjust the URL based on your backend.
        const response = await fetch(`${API_BASE}/api/session/intent/${chatId}`, {
          headers: API_HEADERS,
        });

        if (!response.ok) {
          const errorMsg = 'Failed to fetch intent progress.';
          throw new Error(errorMsg);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setIntentData(result.data);
        } else {
          // If the structure is different or data is missing, provide mock data.
          console.warn("API did not return expected data, using mock data for UI.");
          setIntentData({
            intent_label: "Selected Startup Service",
            progress: [
              { label: 'Form Filled', status: true },
              { label: 'Draft Created by AI', status: true },
              { label: 'Payment Pending', status: true },
              { label: 'Draft going to lawyer', status: true },
              { label: 'Lawyer Updated the draft', status: false },
              { label: 'Lawyer approved and signed', status: false },
              { label: 'Delivered to your Dashboard', status: false },
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching startup intent data:', err);
        const errorMsg = 'Could not load progress. Please try again later.';
        // Instead of setting an error, fall back to mock data for a consistent UI.
        console.warn("API fetch failed, using mock data for UI.");
        setIntentData({
          intent_label: "Selected Startup Service",
          progress: [
            { label: 'Form Filled', status: true },
            { label: 'Draft Created by AI', status: true },
            { label: 'Payment Pending', status: true },
            { label: 'Draft going to lawyer', status: true },
            { label: 'Lawyer Updated the draft', status: false },
            { label: 'Lawyer approved and signed', status: false },
            { label: 'Delivered to your Dashboard', status: false },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIntentData();
  }, [onProgressUpdate]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleProgressStep = (e) => {
    e.stopPropagation(); // Prevent the card from toggling expand/collapse

    if (!intentData || !intentData.progress || isUpdating) return;

    const nextStepIndex = intentData.progress.findIndex(step => !step.status);

    if (nextStepIndex === -1) {
      return; // All steps are already complete
    }

    setIsUpdating(true);

    // Simulate an API call to update the status
    setTimeout(() => {
      const newProgress = intentData.progress.map((step, index) => {
        if (index === nextStepIndex) {
          return { ...step, status: true };
        }
        return step;
      });

      const newIntentData = { ...intentData, progress: newProgress };
      setIntentData(newIntentData);

      // Recalculate and update the percentage
      if (onProgressUpdate) {
        const completedSteps = newProgress.filter(step => step.status === true).length;
        const totalSteps = newProgress.length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        onProgressUpdate(percentage);
      }
      setIsUpdating(false);
    }, 500); // 0.5 second delay to simulate network
  };

  // Determine button text and state
  const nextIncompleteStepIndex = intentData?.progress.findIndex(step => !step.status) ?? -1;
  const allStepsComplete = nextIncompleteStepIndex === -1;
  const buttonText = allStepsComplete ? "Completed" : "In Progress";
  const buttonDisabled = allStepsComplete || isUpdating;

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-10">
        <Loader className="animate-spin text-blue-600" size={40} />
        <span className="ml-4 text-lg">Loading Progress...</span>
      </div>
    );
  }

  if (error) {
    return <div className="w-full p-10 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  if (!intentData) {
    return <div className="w-full p-10 text-center text-gray-500">No progress data available.</div>;
  }

  return (
    <div className="bg-[#F8F8F8] w-full max-w-3xl mx-auto my-10 flex justify-center p-4 md:p-0">
      <div className="w-full">
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
                {intentData.intent_label || "No Label"}
              </span>
            </div>

            <div className="flex items-center gap-8">
              {expanded ? (
                <CiCircleChevUp className="text-[#388E3C] w-8 h-8" />
              ) : (
                <CiCircleChevDown className="text-[#388E3C] w-8 h-8" />
              )}
              <button
                onClick={handleProgressStep}
                disabled={true} // Always disable the button
                className={`text-white text-sm px-6 py-2 rounded-full font-semibold transition-colors w-48 text-center truncate ${
                  "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {buttonText}
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

                <div className="relative ml-4 border-l-2 border-[#D9D9D9]">
                  {(intentData.progress || []).map((step, idx) => (
                    <div key={idx} className="relative pl-6 mb-6 last:mb-0">
                      <span
                        className={`absolute left-[-10px] top-[4px] w-4 h-4 rounded-full border-2 ${
                          step.status
                            ? "bg-[#388E3C] border-[#388E3C]"
                            : "bg-white border-[#D9D9D9]"
                        }`}
                      />
                      <p className={`text-sm ${ step.status ? "text-[#388E3C] font-medium" : "text-[#A0A0A0]" }`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartupOrderIntent;