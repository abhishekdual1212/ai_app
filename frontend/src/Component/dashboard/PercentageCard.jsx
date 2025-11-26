import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const PercentageCard = () => {
  const [progress, setProgress] = useState(0);
  const [targetPercentage, setTargetPercentage] = useState(0); // Final value from API

  const chatId = localStorage.getItem("chatId");

  // Fetch percentage from API on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/session/intent-progress-percentage/${chatId}`,
          {
            headers: {
              "x-api-key": "1234567890abcdef",
            },
          }
        );
        const percentage = res.data?.progress || 0;
        console.log("Fetched percentage:", percentage);
        setTargetPercentage(percentage);
      } catch (error) {
        console.error("Failed to fetch compliance percentage:", error);
      }
    };

    if (chatId) {
      fetchProgress();
    }
  }, [chatId]);

  // Animate percentage increment
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < targetPercentage) {
        setProgress(prev => Math.min(prev + 1, targetPercentage));
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [progress, targetPercentage]);

  // Circle calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <h1 className="font-sans font-normal text-xl text-gray-800 pb-3">
        DIY Compliance Percentage
      </h1>
      <div className="w-full max-w-sm bg-yellow-50 p-6 rounded-2xl flex flex-col items-center">
        {/* SVG Circle Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FD0000" />
                <stop offset="100%" stopColor="#FFC22A" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#EEEEEE"
              strokeWidth="16"
              fill="transparent"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="16"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-300 ease-out drop-shadow-md"
            />
            <circle
              cx="100"
              cy="100"
              r="38"
              fill="#FFF5EE"
              stroke="#F8F8F8"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          </svg>
          <div className="text-xl font-[poppins] font-medium text-[#FD0000] drop-shadow-sm">
            {progress}%
          </div>
        </div>

        <p className="text-center mt-4 font-[poppins] text-[#2E2E2E] font-normal text-xl mb-2.5">
          This is your Compliance Progress
        </p>

        <button className="mt-5 px-6 py-2 border border-[#2F5EAC] rounded-md text-blue-600 font-[poppins] font-normal text-sm">
          DIY Compliance - Check Now
        </button>
      </div>
    </>
  );
};

export default PercentageCard;
