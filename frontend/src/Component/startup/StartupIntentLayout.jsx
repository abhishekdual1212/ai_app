import React, { useState } from 'react';
import BookCall from '../dashboard/BookCall';
import Checklist from '../dashboard/CheckList';
import ChatwhCall from '../dashboard/ChatwhCall';
import StartupOrderIntent from './StartupOrderIntent';
import StartupPercentageCard from './StartupPercentageCard';

const StartupIntentLayout = () => {
  const [progressPercentage, setProgressPercentage] = useState(0);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column */}
      <div className="lg:col-span-2">
        <StartupOrderIntent onProgressUpdate={setProgressPercentage} />
      </div>

      {/* Right Column */}
      <div className="w-full max-w-sm mx-auto lg:max-w-none flex flex-col gap-6 items-center">
        <StartupPercentageCard percentage={progressPercentage} />
        <Checklist />
        <BookCall />
        <ChatwhCall />
      </div>
    </div>
  );
};

export default StartupIntentLayout;