// src/Component/lawyer/LawyerQuestionnaire.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import axios from 'axios';
import QuestionCard from './QuestionCard';

// ✅ Lawyer API endpoint
const API_URL =
  'https://compliance-checker-967613878221.us-central1.run.app/api/v1/compliance/questions/lawyer';

// --- Helper Components ---
const Chip = ({ children }) => (
  <span className="rounded-full bg-[#e9f7ef] px-3 py-1 text-[11px] font-semibold text-[#3c7d31] ring-1 ring-emerald-200">
    {children}
  </span>
);

const RadioRow = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 py-1.5"
  >
    <span
      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${
        active ? 'bg-[#1f3e82] border-[#1f3e82]' : 'bg-white border-slate-300'
      }`}
    >
      {active && (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    <span
      className={`flex-1 rounded-full px-3 py-1 text-left text-[12px] font-medium ${
        active ? 'bg-[#2f57c0] text-white' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {label}
    </span>
  </button>
);

// --- Utility Function ---
// ✅ Parse options from keywords_tags instead of keywords
const parseKeywordsTags = (keywordsString) => {
  if (!keywordsString || typeof keywordsString !== 'string') return [];
  return keywordsString
    .split('), (')
    .map((part) => part.replace(/[()]/g, '').trim())
    .filter((part) => part)
    .map((part) => {
      const [id, ...textParts] = part.split(', ');
      return { id: id.trim(), text: textParts.join(', ').trim() };
    });
};

// --- Main Component ---
const LawyerQuestionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        console.log('Lawyer Questions API Response:', response.data);

        if (response.data && Array.isArray(response.data.questions)) {
          const parsed = response.data.questions.map((q) => ({
            ...q,
            options: parseKeywordsTags(q.keywords_tags),
          }));
          setQuestions(parsed);
        } else {
          console.warn('Invalid API response structure:', response.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching lawyer questions:', err);
        setError('Failed to load lawyer questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentStep].question_id]: answer,
    }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }

    const payload = {
      user_type: 'lawyer',
      previous_answers: Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId, 10),
        answer: ans.id,
      })),
    };

    try {
      setLoading(true);
      const response = await axios.post(
        'https://compliance-checker-967613878221.us-central1.run.app/api/v1/compliance/next-questions',
        payload
      );
      console.log('Next Lawyer Questions Response:', response.data);

      const nextQuestions = response.data?.next_questions || [];
      if (nextQuestions.length > 0) {
        const parsed = nextQuestions.map((q) => ({
          ...q,
          options: parseKeywordsTags(q.keywords_tags),
        }));

        const existingIds = new Set(questions.map((q) => q.question_id));
        const newQs = parsed.filter((q) => !existingIds.has(q.question_id));

        setQuestions((prev) => [...prev, ...newQs]);
        setCurrentStep((s) => s + 1);
      } else if (questions.length >= 10) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error fetching next lawyer questions:', err);
      setError('Failed to load next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      question_id: parseInt(qId, 10),
      answer: ans.id,
    }));
    console.log('Submitted Lawyer Answers:', formattedAnswers);
    alert('Lawyer questionnaire submitted successfully!');
  };

  const currentAnswer = useMemo(() => {
    if (!questions[currentStep]) return undefined;
    return answers[questions[currentStep].question_id];
  }, [answers, currentStep, questions]);

  // --- UI Rendering ---
  if (loading && questions.length === 0) {
    return (
      <div className="rounded-2xl bg-[#5b7fc6] p-5 flex justify-center items-center">
        <div className="flex flex-col items-center text-white">
          <Loader className="animate-spin" size={40} />
          <span className="mt-4 text-lg">Loading lawyer questions...</span>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="rounded-2xl bg-red-200 p-5 text-red-800">{error}</div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-[#5b7fc6] p-5 text-white">
        No lawyer questions available.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-green-200 p-5 text-green-800">
        Lawyer questionnaire completed! Answers submitted.
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const options = currentQuestion.options || [];
  const isLast = currentStep === questions.length - 1 && questions.length >= 10;

  return (
    <div className="rounded-2xl bg-[#5b7fc6] p-5">
      <div className="rounded-xl bg-white/10 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Answer the Questionnaire</div>
          <Chip>
            Question {currentStep + 1}/{questions.length}
          </Chip>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white p-5 shadow">
        <div className="mb-4">
          {/* ✅ Show Question ID and Text */}
          <h2 className="text-sm font-bold text-gray-600">
            QID: {currentQuestion.question_id}
          </h2>
          <p className="mt-1 text-base text-gray-900 font-semibold">
            {currentQuestion.question}
          </p>
        </div>

        {/* ✅ Options from keywords_tags */}
        <div className="space-y-2">
          {options.length > 0 ? (
            options.map((option) => (
              <RadioRow
                key={option.id}
                label={`${option.id}. ${option.text}`}
                active={currentAnswer?.id === option.id}
                onClick={() => handleAnswer(option)}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500">
              No options available for this question.
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow disabled:opacity-50"
          >
            Previous
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-md bg-[#2f57c0] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#254aa6]"
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer || loading}
              className="rounded-md bg-[#2f57c0] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#254aa6] disabled:bg-slate-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Loading...
                </>
              ) : (
                'Save and Next'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerQuestionnaire;
