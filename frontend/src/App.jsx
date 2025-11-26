// src/App.jsx
import "./utils/storageHygiene"; // <-- add this line at the very top

import { BrowserRouter } from "react-router-dom";
import AppRoute from "./Routes/AppRoute";
import { LegalProvider } from "./Component/LegalContext";
import ProfileSync from "./Component/ProfileSync";
import UserStartGlobalGate from "./Component/UserStartGlobalGate.jsx";
import { SettingsProvider } from "./Component/SettingsContext.jsx";
import UserSettingsModal from "./Component/dashboard/UserSettingsModal.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <LegalProvider>
        <SettingsProvider>
          <ProfileSync />
          <UserStartGlobalGate />
          <AppRoute />
          <UserSettingsModal />
        </SettingsProvider>
      </LegalProvider>
    </BrowserRouter>
  );
};

export default App;
