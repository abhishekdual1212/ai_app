import React from "react";

const Intent = () => {
  return (
    <div className="bg-[#FFF3FF96] border border-[#FFDAFA] rounded-2xl w-[28rem] overflow-y-scroll p-4">
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
        <img src="/assets/imgs/Chatbot/lara.svg" alt="lara" className="w-40" />
      </div>

      <div className="bg-[#FFFBD9] h-[40rem] rounded-2xl my-4 p-6 overflow-auto">
       
      </div>
    </div>
  );
};

export default Intent;
