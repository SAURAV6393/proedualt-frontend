'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Initialize Supabase client using your .env.local file
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Define the live backend URL
const BACKEND_URL = "https://proedualt-backend63.onrender.com";

export default function HomePage() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to fetch user profile from our 'profiles' table
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('github_username')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
      setGithubUsername(data.github_username || '');
      if (!data.github_username) {
        setIsEditing(true); // If no username, open edit mode automatically
      }
    }
  }

  // Function to save the GitHub username to the backend
  async function handleProfileUpdate() {
    if (!githubUsername) {
      alert("Please enter a GitHub username.");
      return;
    }
    const user = session.user;
    
    const response = await fetch(`${BACKEND_URL}/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, github_username: githubUsername })
    });
    
    const result = await response.json();
    if (result.success) {
        alert("Profile updated successfully!");
        fetchProfile(user.id); // Refresh profile data from DB
        setIsEditing(false);
    } else {
        alert("Error updating profile: " + result.error);
    }
  }

  // Function to analyze the GitHub profile
  async function handleAnalyze() {
    if (!githubUsername) {
      alert("Please save your GitHub username first.");
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/analyze?github_username=${githubUsername}`);
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      alert("Error: Could not connect to the backend. Is it running?");
    } finally {
      setIsLoading(false);
    }
  }

  // Helper component for the score bar
  const ScoreBar = ({ score }) => {
    const percentage = Math.min(Math.round(score), 100);
    return (
      <div className="w-full bg-gray-600 rounded-full h-4">
        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  // If user is not logged in, show the login form
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4">Welcome to ProEduAlt</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['github', 'google', 'linkedin', 'phone']}
            theme="dark"
          />
        </div>
      </main>
    );
  }

  // If user is logged in, show the main application
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm">Welcome, {session.user.email || session.user.phone}</p>
          <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-sm">Sign Out</button>
        </div>

        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold">ProEduAlt</h1>
          <Link href="/jobs" className="text-blue-400 hover:underline">View Job Openings</Link>
          <p className="text-lg text-gray-400">Your AI-Powered Career Guide</p>
          
          {/* Personalized Profile Section */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Your GitHub Profile</h3>
            {isEditing || !profile?.github_username ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter your GitHub username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600"
                />
                <button onClick={handleProfileUpdate} className="p-2 rounded-lg bg-green-600 hover:bg-green-700">Save</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="font-mono">{profile.github_username}</p>
                <button onClick={() => setIsEditing(true)} className="text-sm text-blue-400 hover:underline">Change</button>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !githubUsername}
            className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-500"
          >
            {isLoading ? 'Analyzing...' : 'Analyze My Profile'}
          </button>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="mt-10 w-full p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">Top Career Recommendations</h2>
            {analysisResult.error ? (
              <p className="text-center text-red-400">{analysisResult.error}</p>
            ) : (
              <ul className="space-y-4">
                {analysisResult.map((rec) => (
                  <li key={rec.career} className="bg-gray-700 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold">{rec.career}</span>
                      <span className="text-blue-400 font-bold">{Math.round(rec.score)} Score</span>
                    </div>
                    <ScoreBar score={rec.score} />
                    <p className="text-xs text-gray-400 mt-2">Based on skills: {rec.matched_skills.join(', ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
