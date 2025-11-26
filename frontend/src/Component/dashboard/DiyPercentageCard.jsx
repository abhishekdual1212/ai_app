import React, { useState, useEffect } from 'react';

const DiyPercentageCard = ({ percentage = 0 }) => {
  const [progress, setProgress] = useState(0);

  // Animate percentage increment
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < percentage) {
        setProgress(prev => Math.min(prev + 1, percentage));
      } else if (progress > percentage) {
        setProgress(prev => Math.max(prev - 1, percentage));
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [progress, percentage]);

  // Circle calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full max-w-sm bg-yellow-50 p-6 rounded-2xl flex flex-col items-center shadow-md">
      <h1 className="font-sans font-normal text-lg sm:text-xl text-gray-800 pb-3">
        DIY Compliance Percentage
      </h1>
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="diyProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke="url(#diyProgressGradient)"
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
        <div className="text-lg sm:text-xl font-[poppins] font-medium text-[#FD0000] drop-shadow-sm">
          {percentage}%
        </div>
      </div>

      <p className="text-center mt-4 font-[poppins] text-[#2E2E2E] font-normal text-lg sm:text-xl mb-2.5">
        This is your Compliance Progress
      </p>
    </div>
  );
};

export default DiyPercentageCard;