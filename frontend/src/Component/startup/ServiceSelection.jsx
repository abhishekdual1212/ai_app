import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiCircleChevDown, CiCircleChevUp } from 'react-icons/ci';

const API_BASE = "http://localhost:3000";
const API_HEADERS = { "x-api-key": "1234567890abcdef" };

const ServiceItem = ({ service, onStart }) => {
  const [expanded, setExpanded] = useState(false);

  const handleStartClick = (e) => {
    e.stopPropagation();
    onStart(service);
  };

  return (
    <div
      className={`w-full rounded-xl px-4 py-3 mx-auto my-4 cursor-pointer transition-shadow duration-300 ${
        expanded
          ? "border-[2px] border-[#388E3C] bg-[#EAF2FF] shadow-md"
          : "border border-[#CCCCCC] bg-white"
      }`}
      onClick={() => setExpanded(!expanded)}
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
            {service.name}
          </span>
        </div>

        <div className="flex items-center gap-8">
          {expanded ? (
            <CiCircleChevUp className="text-[#388E3C] w-8 h-8" />
          ) : (
            <CiCircleChevDown className="text-[#388E3C] w-8 h-8" />
          )}
          <button
            onClick={handleStartClick}
            className="bg-[#FA9000] text-white text-sm px-8 py-2 rounded-full font-semibold hover:bg-[#E8850E] transition-colors"
          >
            Start
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 px-4" onClick={(e) => e.stopPropagation()}>
          <hr className="border border-[#D9D9D9]" />
          <div className="mt-4 font-[poppins] text-sm text-[#4B4B4B]">
            <p>{service.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceSelection = () => {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");

  // Mock data for services. You can fetch this from an API.
  const services = [
    { id: 'service_01', name: 'Company Incorporation', description: 'Full support for incorporating your new company.' },
    { id: 'service_02', name: 'Trademark Registration', description: 'Protect your brand by registering your trademark.' },
    { id: 'service_03', name: 'Compliance Audit', description: 'A thorough audit to ensure you meet all regulatory requirements.' },
  ];

  const handleStartService = async (service) => {
    // This function simulates creating a new chat for the selected service
    // and then navigating to the outcome page to show its progress.
    try {
      // In a real app, you would create a new chat session for this service.
      // For this example, we'll simulate it by creating a mock chat ID.
      const mockChatId = `chat_${service.id}_${Date.now()}`;
      console.log(`Starting service '${service.name}' with mock chat ID: ${mockChatId}`);

      // The most important step: set the 'chatId' in localStorage.
      // The OrderIntent component uses this to fetch the correct intent data.
      localStorage.setItem("chatId", mockChatId);
      localStorage.setItem("Schat_id", mockChatId); // For compatibility with other startup components

      // Now, navigate to the outcome page.
      navigate('/dashboard/startup/outcome');

    } catch (error) {
      console.error("Error starting service:", error);
      // const errorMsg = "Could not start the selected service. Please try again.";
    }
  };

  return (
    <div className="bg-[#F8F8F8] w-[48rem] mx-auto my-10 p-8 rounded-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
        Select a Service to Begin
      </h2>
      <div className="w-full max-w-[40rem] mx-auto">
        {services.map((service) => (
          <ServiceItem key={service.id} service={service} onStart={handleStartService} />
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;