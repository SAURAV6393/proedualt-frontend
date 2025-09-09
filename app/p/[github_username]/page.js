'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BACKEND_URL = "https://proedualt-backend63.onrender.com";

// Helper components for icons
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);
const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-star mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);


export default function PortfolioPage({ params }) {
  const { github_username } = params;
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (github_username) {
      fetchPortfolioData();
    }
  }, [github_username]);

  async function fetchPortfolioData() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/portfolio/${github_username}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Profile not found or is not public.");
      }
      const data = await response.json();
      setPortfolioData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center p-8 animated-background"><p className="text-white text-xl">Loading Portfolio...</p></main>;
  }

  if (error) {
    return <main className="min-h-screen flex items-center justify-center p-8 animated-background"><p className="text-red-400 text-xl">{error}</p></main>;
  }

  if (!portfolioData) {
    return null; // Or some other fallback UI
  }

  const { profile, projects } = portfolioData;
  const allSkills = [...new Set([...(profile.resume_skills || []), ...(projects.flatMap(p => p.languages) || [])])];


  return (
    <main className="min-h-screen p-4 sm:p-8 animated-background text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                {profile.full_name || github_username}
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{profile.bio || "A passionate developer exploring the world of technology."}</p>
            <div className="flex justify-center items-center space-x-4">
                <a href={`https://github.com/${github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                    <GitHubIcon />
                    <span>GitHub</span>
                </a>
                {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                        <LinkedInIcon />
                        <span>LinkedIn</span>
                    </a>
                )}
            </div>
        </header>

        {/* Stats and Skills Section */}
        <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
                <p className="text-5xl font-bold text-yellow-400">{profile.total_xp || 0}</p>
                <p className="text-slate-400 mt-1">Total XP Earned</p>
            </div>
            <div className="md:col-span-2 glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Top Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {allSkills.slice(0, 15).map(skill => (
                        <span key={skill} className="px-3 py-1 bg-slate-700 text-sm font-semibold rounded-full">{skill}</span>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Projects Section */}
        <div className="glass-card p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Featured Projects</h2>
            <div className="space-y-6">
                {projects.map(project => (
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" key={project.id} className="block bg-slate-800 p-4 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 hover:border-blue-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-blue-400">{project.repo_name}</h3>
                            <span className="flex items-center text-yellow-400 font-bold">
                                <StarIcon /> {project.stars}
                            </span>
                        </div>
                        <p className="text-slate-400 my-2 text-sm">{project.description || "No description available."}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {project.languages.map(lang => (
                                <span key={lang} className="px-2 py-1 bg-slate-600 text-xs font-semibold rounded-full">{lang}</span>
                            ))}
                        </div>
                    </a>
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}

```