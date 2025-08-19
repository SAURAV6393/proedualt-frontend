'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
// Import the charting library components
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BACKEND_URL = "https://proedualt-backend63.onrender.com";

// New Component for the Skills Radar Chart
const SkillsRadarChart = ({ userSkills, requiredSkills }) => {
  // Format the data for the chart
  const data = requiredSkills.map(skill => ({
    skill: skill,
    // If user has the skill, give a score of 100, otherwise 20 (for visual representation)
    "Your Skills": userSkills.includes(skill) ? 100 : 20,
    "Required": 100, // The ideal score is always 100
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#fff', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
        <Radar name="Your Skills" dataKey="Your Skills" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        <Radar name="Required" dataKey="Required" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};


export default function HomePage() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ... (All other functions like useEffect, fetchProfile, etc. remain the same)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchLearningProgress(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchLearningProgress(session.user.id);
      } else {
        setProfile(null);
        setCompletedTasks([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('github_username, resume_skills').eq('id', userId).single();
    if (data) {
      setProfile(data);
      setGithubUsername(data.github_username || '');
      if (!data.github_username) setIsEditing(true);
    }
  }

  async function fetchLearningProgress(userId) {
    const response = await fetch(`${BACKEND_URL}/learning-progress/${userId}`);
    const data = await response.json();
    if (data.completed_ids) setCompletedTasks(data.completed_ids);
  }

  async function handleResumeUpload() {
    if (!selectedFile) return alert("Please select a PDF file first.");
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch(`${BACKEND_URL}/upload-resume/${session.user.id}`, { method: 'POST', body: formData });
      const result = await response.json();
      if (response.ok) {
        alert("Resume processed successfully!\nSkills found: " + (result.skills_found?.join(', ') || 'None'));
        fetchProfile(session.user.id);
      } else {
        throw new Error(result.detail || "Failed to upload resume.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProfileUpdate() {
    if (!githubUsername) return alert("Please enter a GitHub username.");
    const { user } = session;
    const response = await fetch(`${BACKEND_URL}/profile/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, github_username: githubUsername }),
    });
    const result = await response.json();
    if (result.success) {
      alert("Profile updated successfully!");
      fetchProfile(user.id);
      setIsEditing(false);
    } else {
      alert("Error updating profile: " + result.error);
    }
  }

  async function handleAnalyze() {
    if (!githubUsername) return alert("Please save your GitHub username first.");
    setIsLoading(true);
    setAnalysisResult(null);
    setLearningPlan(null);
    try {
      const response = await fetch(`${BACKEND_URL}/analyze/${session.user.id}`);
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      alert("Error: Could not connect to the backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGeneratePlan(recommendation) {
    setIsLoading(true);
    setLearningPlan(null);
    try {
      const response = await fetch(`${BACKEND_URL}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_skills: recommendation.matched_skills, target_career: recommendation }),
      });
      const data = await response.json();
      setLearningPlan(data);
    } catch (error) {
      alert("Error generating plan.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTaskToggle(resourceId, isChecked) {
    if (isChecked) {
      setCompletedTasks([...completedTasks, resourceId]);
    } else {
      setCompletedTasks(completedTasks.filter(id => id !== resourceId));
    }
    await fetch(`${BACKEND_URL}/learning-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: session.user.id, resource_id: resourceId, is_complete: isChecked }),
    });
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4">Welcome to ProEduAlt</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['github', 'google']} theme="dark" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        {/* ... (Header and main app UI remains the same) ... */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm">Welcome, {session.user.email || session.user.phone}</p>
          <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-sm">Sign Out</button>
        </div>
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold">ProEduAlt</h1>
          <Link href="/jobs" className="text-blue-400 hover:underline">View Job Openings</Link>
          <p className="text-lg text-gray-400">Your AI-Powered Career Guide</p>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Your GitHub Profile</h3>
            {isEditing || !profile?.github_username ? (
              <div className="flex items-center space-x-2">
                <input type="text" placeholder="Enter GitHub username" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600" />
                <button onClick={handleProfileUpdate} className="p-2 rounded-lg bg-green-600 hover:bg-green-700">Save</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="font-mono">{profile.github_username}</p>
                <button onClick={() => setIsEditing(true)} className="text-sm text-blue-400 hover:underline">Change</button>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
            <div className="flex items-center space-x-2">
              <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <button onClick={handleResumeUpload} disabled={isLoading || !selectedFile} className="p-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-500">
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {profile?.resume_skills && <p className="text-xs text-gray-400 mt-2">Resume Skills: {profile.resume_skills.join(', ')}</p>}
          </div>
          <button onClick={handleAnalyze} disabled={isLoading || !githubUsername} className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-500">
            Analyze Combined Profile
          </button>
        </div>

        {/* --- UPDATED RESULTS SECTION WITH RADAR CHART --- */}
        {analysisResult && (
          <div className="mt-10 w-full p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">Top Career Recommendations</h2>
            {analysisResult.error ? ( <p className="text-center text-red-400">{analysisResult.error}</p> ) : (
              Array.isArray(analysisResult) && (
                <ul className="space-y-6">
                  {analysisResult.map((rec) => (
                    <li key={rec.career} className="bg-gray-700 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold">{rec.career}</span>
                        <span className="text-blue-400 font-bold">{Math.round(rec.score * 10)} Score</span>
                      </div>
                      {/* Render the new chart component */}
                      <SkillsRadarChart userSkills={rec.matched_skills} requiredSkills={rec.all_required_skills} />
                      <button onClick={() => handleGeneratePlan(rec)} disabled={isLoading} className="mt-3 w-full p-2 text-sm rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-500">
                        Generate My Learning Plan
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}

        {/* ... (Learning Plan section remains the same) ... */}
        {learningPlan && (
          <div className="mt-10 w-full p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">Your Weekly Learning Plan</h2>
            {learningPlan.error ? ( <p className="text-center text-red-400">{learningPlan.error}</p> ) : (
              Array.isArray(learningPlan.plan) && (
                <ul className="space-y-3">
                  {learningPlan.plan.map((item) => (
                    <li key={item.id} className="bg-gray-700 p-3 rounded-md flex items-center">
                      <input type="checkbox" id={`task-${item.id}`} className="mr-3 h-5 w-5 rounded" checked={completedTasks.includes(item.id)} onChange={(e) => handleTaskToggle(item.id, e.target.checked)} />
                      <label htmlFor={`task-${item.id}`} className="flex-1">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-300 hover:underline">{item.title}</a>
                      </label>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
