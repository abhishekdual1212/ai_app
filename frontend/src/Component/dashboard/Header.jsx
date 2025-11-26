import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Cards from "./Cards";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // track user login status
  const [selectedOptions, setSelectedOptions] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const staticOptions = [
    "IPR",
    "Labour law",
    "Fractional Legal Counsel",
    "Contract",            // ✅ was: "General Corporate – Contracts & Drafting"
    "Privacy",             // ✅ was: "Privacy & Data Protection"
    "File international"
  ];

  // Check user login status once when component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch API suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(searchValue)}`, {
          headers: {
            "x-api-key": "1234567890abcdef",
          },
        });
        const data = await res.json();

        if (data.success) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchValue]);

  // When user clicks an option
  const handleOptionClick = (option) => {
    if (!user) {
      navigate("/login"); // redirect to login if not logged in
      return;
    }
    setSelectedOptions(option);
    setSearchValue(option);
    setShowSuggestions(false);
  };

  // When user clicks Proceed
  const handleProceed = () => {
    if (!user) {
      navigate("/login"); // redirect to login if not logged in
      return;
    }

    const optionToUse = selectedOptions || searchValue;
    if (optionToUse) {
      const queryParam = encodeURIComponent(optionToUse);
      navigate(`/dashboard/chat-bot?option=${queryParam}`);
    } else {
      alert("Please select an option before proceeding.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
        {/* Heading */}
        <h1 className="text-center text-xl sm:text-2xl lg:text-3xl font-light leading-relaxed font-[Roboto Serif]">
          Hassle-Free Registrations, Compliance,
          <br />
          and <span className="text-blue-600 font-light">Legal Solutions</span>
        </h1>

        {/* Search Box */}
        <div className="relative w-full max-w-2xl mt-8">
          <div className="flex bg-[#F8F8F8] rounded-md py-2.5 items-center">
            <div className="pl-4">
              <FiSearch className="text-gray-500 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search your order"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setSelectedOptions(""); // reset selected option when typing
              }}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 px-3 py-2 outline-none bg-transparent text-sm"
            />
            <button
              className="bg-[#2F5EAC] text-white px-6 py-2 text-sm font-medium rounded-md mr-3"
              onClick={handleProceed}
            >
              Proceed
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute w-full mt-1 bg-[#E3EFFF] rounded-md shadow-sm z-10 overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 cursor-pointer text-sm hover:bg-[#D1E3FF] transition-all"
                  onClick={() => handleOptionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clickable Options */}
        <div className="flex flex-wrap justify-center gap-4 max-w-6xl mt-14">
          {staticOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`flex items-center justify-between px-6 py-2.5 rounded-full text-sm transition-all duration-200 ${
                selectedOptions === option
                  ? "bg-blue-900 text-white"
                  : "bg-blue-100 text-[#2F5EAC]"
              }`}
            >
              <span>{option}</span>
              <span
                className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                  selectedOptions === option
                    ? "bg-[#2DC937] text-black"
                    : "border border-[#2F5EAC]"
                }`}
              >
                {selectedOptions === option ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Component */}
      <div className="relative bottom-40">
        <Cards />
      </div>
    </>
  );
}
