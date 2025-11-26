//frontend\src\Component\startup\StartupSplitLayout.jsx
 
import React, { useMemo, useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Helper Components ---
const Chip = ({ children }) => (
  <span className="rounded-full bg-[#e9f7ef] px-3 py-1 text-[11px] font-semibold text-[#3c7d31] ring-1 ring-emerald-200">{children}</span>
);
 
const RadioRow = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-1.5">
    <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${active ? 'bg-[#1f3e82] border-[#1f3e82]' : 'bg-white border-slate-300'}`}>
      {active && (<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
    </span>
    <span className={`flex-1 rounded-full px-3 py-1 text-left text-[12px] font-medium ${active ? 'bg-[#2f57c0] text-white' : 'bg-slate-100 text-slate-600'}`}>{label}</span>
  </button>
);
 
// --- Utility Function ---
/**
 * Parses the keyword string from the API into an array of options.
 * e.g., "(1, Yes), (2, No)" -> [{ id: '1', text: 'Yes' }, { id: '2', text: 'No' }]
 * @param {string | null} keywordsString - The string to parse.
 * @returns {Array<{id: string, text: string}>}
 */
const parseKeywords = (keywordsString) => {
  if (!keywordsString || typeof keywordsString !== 'string') {
    return [];
  }
  return keywordsString
    .split('), (')
    .map(part => part.replace(/[()]/g, '').trim())
    .filter(part => part)
    .map(part => {
      const [id, ...textParts] = part.split(',');
      return { id: id.trim(), text: textParts.join(',').trim() };
    });
};
 
const QuestionnairePanel = ({ onAllQuestionsAnswered, onQuestionChange }) => {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://compliance-checker-967613878221.us-central1.run.app/api/v1/compliance/questions/startup');
        console.log('Initial questions API response:', response.data);
        // The API response has a `questions` array at the root level.
        if (response.data && Array.isArray(response.data.questions)) {
          const parsedQuestions = response.data.questions.map(q => ({
            ...q,
            options: parseKeywords(q.keywords)
          }));
          setQuestions(parsedQuestions);
        } else {
          console.warn("API response did not contain a 'questions' array.", response.data);
        }
        setError(null);
      } catch (err) {
        const errorMsg = 'Failed to load questions. Please try again later.';
        setError(errorMsg);
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchQuestions();
  }, []);
 
  useEffect(() => {
    if (questions.length > 0 && questions[currentStep]) {
      const currentQuestion = questions[currentStep];
      onQuestionChange?.(currentQuestion.popup_info || currentQuestion.question);
    }
  }, [currentStep, questions, onQuestionChange]);
 
  const handleAnswer = (answer) => {
    // Store the option object, not just the text
    setAnswers(prev => ({ ...prev, [questions[currentStep].question_id]: answer }));
  };
 
  const handleNext = async () => {
    // Move to the next question if it's already loaded
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
      return;
    }
 
    // If at the end of current questions, fetch the next batch
    const payload = {
      user_type: "startup",
      previous_answers: Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId, 10),
        answer: ans.id,
      })),
    };
 
    try {
      setLoading(true);
      const response = await axios.post('https://compliance-checker-967613878221.us-central1.run.app/api/v1/compliance/next-questions', payload);
      console.log('Next questions API response:', response.data);
     
      const nextQuestions = response.data?.next_questions || [];
 
      if (nextQuestions.length > 0) {
        const parsedQuestions = nextQuestions.map(q => ({
          ...q,
          options: parseKeywords(q.keywords)
        }));
       
        // Add only new questions to avoid duplicates
        const existingQuestionIds = new Set(questions.map(q => q.question_id));
        const newQuestions = parsedQuestions.filter(q => !existingQuestionIds.has(q.question_id));
 
        setQuestions(prev => [...prev, ...newQuestions]);
        setCurrentStep(s => s + 1);
      } else {
        // No more questions, the questionnaire is finished
        // The currentAnswer is for the question being displayed, which is the last one.
        // We need to include it in the final set of answers before calling the completion handler.
        const finalAnswers = { ...answers, [questions[currentStep].question_id]: currentAnswer };
        onAllQuestionsAnswered?.(finalAnswers);
        // alert("Questionnaire finished!"); // The navigation will happen now, so alert is not needed.
      }
    } catch (err) {
      const errorMsg = 'Failed to load the next question. Please try again.';
      setError(errorMsg);
      console.error("Failed to fetch next question:", err);
    } finally {
      setLoading(false);
    }
  };
 
  const currentAnswer = useMemo(() => {
    if (!questions[currentStep]) return undefined;
    return answers[questions[currentStep].question_id];
  }, [answers, currentStep, questions]);
 
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };
 
  if (loading && questions.length === 0) {
    return (
      <div className="rounded-2xl bg-[#5b7fc6] p-5 flex justify-center items-center">
        <div className="flex flex-col items-center text-white">
          <Loader className="animate-spin" size={40} />
          <span className="mt-4 text-lg">Loading questions...</span>
        </div>
      </div>
    );
  }
 
  if (error && questions.length === 0) {
    return <div className="rounded-2xl bg-red-200 p-5 text-red-800">{error}</div>;
  }
 
  if (questions.length === 0) {
    return <div className="rounded-2xl bg-[#5b7fc6] p-5 text-white">No questions available.</div>;
  }
 
  const currentQuestion = questions[currentStep];
  const options = currentQuestion.options || [];
 
  return (
    <div className="rounded-2xl bg-[#5b7fc6] p-5">
      <div className="rounded-xl bg-white/10 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Answer the Questionnaire</div>
          <Chip>Question No {currentStep + 1}/{questions.length}</Chip>
        </div>
      </div>
 
      <div className="mt-4 rounded-xl bg-white p-5 shadow">
        <div className="mb-6 flex items-center justify-between text-[12px]">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 text-[#2f57c0] disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <span>◀</span> Previous
          </button>
        </div>
        <div className="text-sm font-semibold text-slate-700">{currentStep + 1}. {currentQuestion.question}</div>
        <div className="mt-2 h-px w-full bg-slate-200" />
 
        <div className="mt-4 space-y-2">
          {options.map((option) => (
            <RadioRow key={option.id} label={option.text} active={currentAnswer?.id === option.id} onClick={() => handleAnswer(option)} />
          ))}
        </div>
 
        <div className="mt-10 flex justify-center">
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
            ) : 'Save and Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
 
const KnowledgeBotPanel = ({ prompt }) => {
  return (
    <div className="rounded-2xl bg-[#fff6fb] p-5 ring-1 ring-rose-100">
      <div className="rounded-xl border border-rose-100 bg-white/40 p-4">
        <div className="text-lg"><span className="font-semibold text-amber-600">Knowledge</span> <span className="font-semibold text-slate-700">bot</span></div>
        <p className="mt-2 text-[11px] text-slate-600">Help Us Create Your Compliance Report by Answering A Few Questions</p>
      </div>
      <div className="mt-5 h-64 md:h-auto rounded-xl bg-white/70 p-4">
        <div className="text-sm font-semibold text-slate-800">{prompt}</div>
        <div className="mt-24 h-3 w-3 animate-pulse rounded-full bg-amber-200" />
      </div>
    </div>
  );
};
 
const StartupSplitLayout = () => {
  const [prompt, setPrompt] = useState('Are You a registered entity?');
  const navigate = useNavigate();
 
  const handleAllQuestionsAnswered = (allAnswers) => {
    console.log('All answers received in layout:', allAnswers);
    const formattedAnswers = Object.entries(allAnswers).map(([qId, ans]) => ({
        question_id: parseInt(qId, 10),
        answer: ans.id,
    }));
 
    navigate('outcome', { state: { answers: formattedAnswers } });
    // You can now use these answers to update other parts of your UI or submit them.
  };
 
  const handleQuestionChange = (newPrompt) => {
    setPrompt(newPrompt);
  };
 
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <QuestionnairePanel onAllQuestionsAnswered={handleAllQuestionsAnswered} onQuestionChange={handleQuestionChange} />
      <KnowledgeBotPanel prompt={prompt} />
    </div>
  );
};
 
export default StartupSplitLayout;