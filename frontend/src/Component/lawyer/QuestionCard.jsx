// src/components/lawyer/QuestionCard.jsx

import React from 'react';

export default function QuestionCard({ question }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200">
      <p className="text-sm font-semibold text-indigo-600">{question.category || 'General'}</p>
      <p className="mt-2 text-lg text-gray-800">{question.text}</p>
    </div>
  );
}
