'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BACKEND_URL = "https://proedualt-backend63.onrender.com";

const SkillsRadarChart = ({ userSkills, requiredSkills }) => {
  const data = requiredSkills.map(skill => ({
    skill: skill, "Your Skills": userSkills.includes(skill) ? 100 : 20, "Required": 100,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#475569" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#e2e8f0', fontSize: 12 }} />
        <Radar name="Your Skills" dataKey="Your Skills" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} />
        <Radar name="Required" dataKey="Required" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} />
        <Legend />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default function DashboardPage() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
    const { data } = await supabase.from('profiles').select('github_username, resume_skills, total_xp').eq('id', userId).single();
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
    fetchProfile(session.user.id);
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md glass-card p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-white">Welcome to ProEduAlt</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['github', 'google']} theme="dark" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        <header className="flex justify-between items-center glass-card p-4">
          <div className="text-sm">
            <p className="text-slate-300">Welcome, {session.user.email || session.user.phone}</p>
            <p className="font-bold text-yellow-400 text-base">Total XP: {profile?.total_xp || 0}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 font-semibold text-sm transition-colors">
              Settings
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-sm transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold">ProEduAlt Dashboard</h1>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/jobs" className="text-blue-400 hover:text-blue-300 transition-colors">View Job Openings</Link>
            <Link href="/interview" className="text-green-400 hover:text-green-300 transition-colors">Practice Mock Interview</Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">Your GitHub Profile</h3>
              {isEditing || !profile?.github_username ? (
                <div className="flex items-center space-x-2">
                  <input type="text" placeholder="Enter GitHub username" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <button onClick={handleProfileUpdate} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors">Save</button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="font-mono text-slate-300">{profile.github_username}</p>
                  <button onClick={() => setIsEditing(true)} className="text-sm text-blue-400 hover:underline">Change</button>
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">Upload Your Resume</h3>
              <div className="flex items-center space-x-2">
                <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} className="flex-1 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600" />
                <button onClick={handleResumeUpload} disabled={isLoading || !selectedFile} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-500 transition-colors">
                  {isLoading ? '...' : 'Upload'}
                </button>
              </div>
              {profile?.resume_skills && <p className="text-xs text-slate-400 mt-2">Resume Skills: {profile.resume_skills.join(', ')}</p>}
            </div>
        </div>

        <button onClick={handleAnalyze} disabled={isLoading || !githubUsername} className="w-full cool-button-blue text-lg">
          {isLoading ? 'Analyzing...' : 'Analyze Combined Profile'}
        </button>

        {analysisResult && (
          <div className="w-full glass-card p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Top Career Recommendations</h2>
            {analysisResult.error ? ( <p className="text-center text-red-400">{analysisResult.error}</p> ) : (
              Array.isArray(analysisResult) && (
                <ul className="space-y-8">
                  {analysisResult.map((rec) => (
                    <li key={rec.career} className="bg-slate-800 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold">{rec.career}</span>
                        <span className="text-blue-400 font-bold">{Math.round(rec.score * 10)} Score</span>
                      </div>
                      <SkillsRadarChart userSkills={rec.matched_skills} requiredSkills={rec.all_required_skills} />
                      <button onClick={() => handleGeneratePlan(rec)} disabled={isLoading} className="mt-4 w-full cool-button-green">
                        Generate My Learning Plan
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
        
        {learningPlan && (
          <div className="w-full glass-card p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Your Weekly Learning Plan</h2>
            {learningPlan.error ? ( <p className="text-center text-red-400">{learningPlan.error}</p> ) : (
              Array.isArray(learningPlan.plan) && (
                <ul className="space-y-3">
                  {learningPlan.plan.map((item) => (
                    <li key={item.id} className="bg-slate-700 p-3 rounded-md flex items-center justify-between hover:bg-slate-600 transition-colors">
                      <div className="flex items-center">
                        <input type="checkbox" id={`task-${item.id}`} className="mr-4 h-5 w-5 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500" checked={completedTasks.includes(item.id)} onChange={(e) => handleTaskToggle(item.id, e.target.checked)} />
                        <label htmlFor={`task-${item.id}`} className="flex-1">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-300 hover:underline">{item.title}</a>
                        </label>
                      </div>
                      <span className="text-sm font-bold text-yellow-400">+{item.xp_points} XP</span>
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
