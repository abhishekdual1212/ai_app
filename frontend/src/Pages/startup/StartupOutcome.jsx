import React from 'react';
import CertificationSteps from '../../Component/startup/CertificationSteps';
import BookCall from '../../Component/dashboard/BookCall';
import Checklist from '../../Component/dashboard/CheckList';
import PercentageCard from '../../Component/dashboard/PercentageCard';
import ChatwhCall from '../../Component/dashboard/ChatwhCall';
import OrderIntent from '../../Component/dashboard/OrderIntent';

const OutcomePage = () => {
  return (
    <>
      <div className="flex w-full">
        {/* Left Column */}
        <div className="flex w-[60%]">
          <CertificationSteps />
        </div>

        {/* Right Column */}
        <div className="w-[30%] flex flex-col gap-6 items-center">
          <div className="my-8">
            <PercentageCard />
          </div>
          <Checklist />
          <BookCall />
          <ChatwhCall />
        </div>
      </div>
    </>
  );
};

export default OutcomePage;
