// src/Routes/AppRoute.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout, SecondLayout } from "./Layout";

import Home from "../Pages/Home";
import MediaCoverage from "../Component/mediaCoverage/MediaCoverage";
import UseCase from "../Component/useCase/UseCase";

// Dashboard pages/components
import Dashboard from "../Pages/dashboardPages/dashboard";
import ChatBot from "../Pages/dashboardPages/ChatBot";
import OrderDasboard from "../Component/dashboard/OrderDasboard";
import PercentageCard from "../Component/dashboard/PercentageCard";
import Checklist from "../Component/dashboard/CheckList";
import BookCall from "../Component/dashboard/BookCall";
import OrderLayout from "../Component/dashboard/OrderLayout";
import DiyComplience from "../Component/dashboard/DiyComplience";
import DiyKnowledge from "../Component/dashboard/DiyKnowledge";
import PayUi from "../Component/dashboard/PayUi";
import Login from "../Component/Auth/Login";
import Diy from "../Component/dashboard/Diy";
import IntentLayout from "../Component/dashboard/IntentLayout";
import StaticChat from "../Component/dashboard/StaticChat";
import DiyStatus from "../Component/dashboard/DiyStatus";
import DasboardLayout from "../Component/dashboard/DasboardLayout";

// Startup
import StartupPage from "../Pages/startup/StartupPage.jsx";
import StartupOutcome from "../Pages/startup/StartupOutcome.jsx";
import ServiceSelection from "../Component/startup/ServiceSelection.jsx";
import StartupIntentLayout from "../Component/startup/StartupIntentLayout.jsx";

// Auth helpers
import SessionBootstrap from "./SessionBootstrap";
import RequireAuth from "./RequireAuth";
import PrettyGuard from "./PrettyGuard";
import LegacyRedirect from "./LegacyRedirect";
import LawyerDashboardPage from "../Pages/lawyer/LawyerDashboardPage.jsx";

const AppRoute = () => {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/media" element={<MediaCoverage />} />
        <Route path="/useCase" element={<UseCase />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Handshake: /:_id/consume/(explore|dashboard) */}
      <Route path="/:_id/consume/explore" element={<SessionBootstrap />} />
      <Route path="/:_id/consume/dashboard" element={<SessionBootstrap />} />

      {/* LEGACY redirects: keep behavior but always show slugged URLs */}
      <Route path="/dashboard" element={<LegacyRedirect />} />
      <Route path="/dashboard/*" element={<LegacyRedirect />} />

      {/* SLUGGED protected area (canonical) */}
      <Route
        path="/:slug"
        element={
          <RequireAuth>
            <PrettyGuard>
              <SecondLayout />
            </PrettyGuard>
          </RequireAuth>
        }
      >
        {/* Explore home (your old /dashboard index) */}
        <Route path="explore" element={<Dashboard />} />

        {/* Dashboard summary */}
        <Route path="dashboard" element={<DasboardLayout />} />

        {/* Deep dashboard routes (mirror of your old /dashboard/*) */}
        <Route path="dashboard/chat-bot" element={<ChatBot />} />
        {/* <Route path="dashboard/order" element={<OrderDasboard />} /> */}
        <Route path="dashboard/percentage" element={<PercentageCard />} />
        <Route path="dashboard/check" element={<Checklist />} />
        <Route path="dashboard/call" element={<BookCall />} />
        <Route path="dashboard/orde" element={<OrderLayout />} />
        <Route path="dashboard/diy" element={<DiyComplience />} />
        <Route path="dashboard/knowledge" element={<IntentLayout />} />
        <Route path="dashboard/question/:paramQuestionNumber" element={<DiyKnowledge />} />
        <Route path="dashboard/payment" element={<PayUi />} />
        <Route path="dashboard/diyPayment" element={<Diy />} />
        <Route path="dashboard/orderIntent" element={<IntentLayout />} />
        <Route path="dashboard/static" element={<StaticChat />} />
        <Route path="dashboard/diy-status" element={<DiyStatus />} />

        {/* Startup under dashboard */}
        <Route path="dashboard/startup" element={<StartupPage />} />
        <Route path="dashboard/startup/outcome" element={<StartupOutcome />} />
        <Route path="dashboard/startup/services" element={<ServiceSelection />} />
        <Route path="dashboard/startup/order-intent" element={<StartupIntentLayout />} />

           {/* You can add other routes here */}
        <Route path="dashboard/lawyer" element={<LawyerDashboardPage/>} />
     
      </Route>
    </Routes>
  );
};

export default AppRoute;
