import { createContext, useContext, useState } from "react";

const LegalContext = createContext();

export const LegalProvider = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <LegalContext.Provider value={{ selectedOption, setSelectedOption }}>
      {children}
    </LegalContext.Provider>
  );
};

export const useLegal = () => useContext(LegalContext);
