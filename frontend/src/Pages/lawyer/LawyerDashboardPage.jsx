// src/Pages/lawyer/LawyerDashboardPage.jsx
"use client";
import React from 'react';
import { useParams } from 'react-router-dom';
import LawyerQuestionnaire from '../../Component/lawyer/LawyerQuestionnaire';

export default function LawyerDashboardPage() {
  const { userId } = useParams(); // Get user ID from URL

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Lawyer Compliance Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          For user: <span className="font-mono bg-gray-100 p-1 rounded">{userId}</span>
        </p>
      </header>

      {/* ✅ Use imported component only */}
      <LawyerQuestionnaire />
    </main>
  );
}
