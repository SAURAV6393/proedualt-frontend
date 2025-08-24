'use client';
import { useState } from 'react';
import Link from 'next/link';

const BACKEND_URL = "https://proedualt-backend63.onrender.com";

export default function InterviewPage() {
  const [selectedCareer, setSelectedCareer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const careerOptions = [
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist / ML Engineer"
  ];

  const handleStartInterview = async () => {
    if (!selectedCareer) {
      alert("Please select a career path first.");
      return;
    }
    setIsLoading(true);
    setFeedback('');
    setUserAnswer('');
    try {
      const response = await fetch(`${BACKEND_URL}/start-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career_path: selectedCareer }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentQuestion(data);
        setInterviewStarted(true);
      } else {
        throw new Error(data.detail || "Failed to start interview.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer) {
      alert("Please provide an answer.");
      return;
    }
    setIsLoading(true);
    setFeedback('');
    try {
      const response = await fetch(`${BACKEND_URL}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question_text,
          answer: userAnswer,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setFeedback(data.feedback);
      } else {
        throw new Error(data.detail || "Failed to get feedback.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-8 block">&larr; Back to Dashboard</Link>
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold">AI Mock Interview</h1>
          <p className="text-gray-400 mt-2">Practice your interview skills with an AI-powered mentor.</p>
        </div>

        {!interviewStarted ? (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h2 className="text-2xl font-bold mb-4">Choose Your Career Path</h2>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg mb-4"
            >
              <option value="" disabled>Select a role...</option>
              {careerOptions.map(career => (
                <option key={career} value={career}>{career}</option>
              ))}
            </select>
            <button
              onClick={handleStartInterview}
              disabled={isLoading || !selectedCareer}
              className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-500"
            >
              {isLoading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-400">Question:</h3>
              <p className="text-xl mt-2">{currentQuestion?.question_text}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-400">Your Answer:</h3>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows="6"
                className="w-full p-3 bg-gray-700 rounded-lg mt-2 focus:outline-none"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={isLoading || !userAnswer}
                className="w-full mt-4 p-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold disabled:bg-gray-500"
              >
                {isLoading ? 'Evaluating...' : 'Submit Answer for Feedback'}
              </button>
            </div>

            {feedback && (
              <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-700">
                <h3 className="text-lg font-semibold text-blue-300">AI Feedback:</h3>
                <p className="text-md mt-2 whitespace-pre-wrap">{feedback}</p>
                <button
                  onClick={handleStartInterview}
                  disabled={isLoading}
                  className="w-full mt-4 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-500"
                >
                  {isLoading ? 'Loading...' : 'Ask Next Question'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
