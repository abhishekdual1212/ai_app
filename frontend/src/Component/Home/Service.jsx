import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiSearch, FiCheck } from "react-icons/fi";
import bit from "/assets/imgs/bit.png";
import bot1 from "/assets/imgs/bot.png";
import axios from "axios";

const Service = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedService, setSelectedService] = useState("Private Limited Company");

  const services = [
    "Private Limited Company",
    "POSH Compliance",
    "Startup Registration",
    "Legal Drafting",
    "Compliance Filing",
    "Trademark",
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className="w-full flex flex-col justify-center items-center relative py-12 sm:py-20 px-4"
      style={{
        background:
          "linear-gradient(177.63deg, #94B4E9 24.97%, #FFFFFF 162.97%)",
      }}
    >
      {/* Search Box */}
      <div className="flex w-full max-w-2xl bg-white rounded-md my-6 sm:my-8 py-2.5 shadow-md">
        <div className="flex items-center pl-3 sm:pl-4">
          <FiSearch className="text-gray-500 text-lg" />
        </div>
        <input
          type="text"
          placeholder="Search your order"
          className="flex-1 px-2 sm:px-3 py-2 outline-none bg-transparent text-sm"
        />
        <button className="bg-[#2F5EAC] text-white px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-md mr-2 sm:mr-3">
          Proceed
        </button>
      </div>

      {/* Buttons Row */}
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3.5 w-full max-w-5xl">
        {services.map((service) => {
          const isSelected = selectedService === service;
          return (
            <button
              key={service}
              onClick={() => handleServiceSelect(service)}
              className={`flex items-center gap-3 font-[poppins] text-xs sm:text-sm rounded-2xl px-4 sm:px-7 py-2.5 transition-colors duration-300 ${
                isSelected
                  ? "bg-[#2F5EAC] text-white"
                  : "bg-[#E0E8F3] text-[#2F5EAC] hover:bg-[#d0dae8]"
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full transition-all ${
                  isSelected
                    ? "bg-white text-[#2F5EAC]"
                    : "border border-[#2F5EAC]"
                }`}
              >
                {/* The FiCheck icon is slightly smaller to fit well */}
                {isSelected && <FiCheck size="14" strokeWidth="3" />}
              </span>
              {service}
            </button>
          );
        })}
      </div>

      {/* Subtext */}
      <p className="font-[Roboto Serif] font-normal text-lg sm:text-2xl text-center px-2 py-8 sm:py-12">
        We will guide you every step of the way—inside the app and out in the
        real world!
      </p>

      {/* Cards */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full max-w-6xl">
        {/* Card 1 */}
        <div className="w-full lg:w-1/2 px-6 sm:px-10 bg-[#FFFBD9] rounded-2xl py-8 sm:py-10 shadow">
          <img src={bit} alt="Bot" className="w-16 sm:w-20" />
          <h2 className="font-[Roboto Serif] font-medium text-xl sm:text-2xl py-2">
            Start Chatting with Our Legal Assistant
          </h2>
          <p className="text-[#787878] font-[poppins] text-sm sm:text-base mb-2">
       
              Get instant legal advice and guidance from our AI-
              <br />
              powered assistant. Get instant legal advice and
              <br />
              guidance from our AI-powered assistant.
            </p>
          
          <button
            onClick={() => handleNavigation("/dashboard/static")}
            className="bg-[#2F5EAC] px-6 sm:px-8 py-2 rounded-md my-4 text-xs sm:text-sm text-white"
          >
Start Chatting          </button>
        </div>

        {/* Card 2 */}
        <div className="w-full lg:w-1/2 px-6 sm:px-10 bg-[#FFF4FB] rounded-2xl py-8 sm:py-10 shadow">
          <img src={bot1} alt="Bot1" className="w-16 sm:w-20" />
          <h2 className="font-[Roboto Serif] font-medium text-xl sm:text-2xl py-2">
            Build & Manage Effortlessly
          </h2>
          <p className="text-[#787878] font-[poppins] text-sm sm:text-base mb-2">
            Empower yourself with our intuitive DIY tools! Whether you're a
            beginner or an expert, customize your website, manage content, and
            optimize features—all without coding.
          </p>
          <button
            onClick={() => handleNavigation("/dashboard/startup")} // Or a specific DIY page
            className="bg-[#2F5EAC] px-6 sm:px-8 py-2 rounded-md my-4 text-xs sm:text-sm text-white"
          >
Start Chatting          </button>
        </div>
      </div>
    </div>
  );
};

export default Service;
