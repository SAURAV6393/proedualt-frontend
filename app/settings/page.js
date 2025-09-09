'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BACKEND_URL = "https://proedualt-backend63.onrender.com";

export default function SettingsPage() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    linkedin_url: '',
    is_public: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        linkedin_url: data.linkedin_url || '',
        is_public: data.is_public || false,
      });
    }
    setIsLoading(false);
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id, ...formData }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Profile updated successfully!");
        fetchProfile(session.user.id);
      } else {
        throw new Error(result.error || "Failed to update profile.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSyncProjects = async () => {
    setIsSyncing(true);
    try {
        const response = await fetch(`${BACKEND_URL}/sync-projects/${session.user.id}`, {
            method: 'POST',
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            throw new Error(result.detail || "Failed to sync projects.");
        }
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center p-8 animated-background"><p className="text-white text-xl">Loading...</p></main>;
  }

  if (!session) {
    return <main className="min-h-screen flex items-center justify-center p-8 animated-background"><p className="text-center text-white">Please <Link href="/dashboard" className="text-blue-400">log in</Link> to view your settings.</p></main>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 animated-background text-slate-200">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-8 block">&larr; Back to Dashboard</Link>
        <div className="glass-card p-8 space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-6">Profile Settings</h1>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-slate-300">Full Name</label>
                  <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleInputChange} className="mt-1 block w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-slate-300">Your Bio</label>
                  <textarea name="bio" id="bio" rows="3" value={formData.bio} onChange={handleInputChange} className="mt-1 block w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="A short bio about your skills and goals..."></textarea>
                </div>
                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-slate-300">LinkedIn Profile URL</label>
                  <input type="url" name="linkedin_url" id="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="mt-1 block w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="is_public" id="is_public" checked={formData.is_public} onChange={handleInputChange} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500" />
                  <label htmlFor="is_public" className="ml-2 block text-sm text-slate-300">Make my portfolio page public</label>
                </div>
                <button type="submit" disabled={isLoading} className="w-full cool-button-blue">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
              {profile?.is_public && profile?.github_username && (
                  <div className="mt-6 text-center">
                      <p className="text-slate-300">Your portfolio is live!</p>
                      <Link href={`/p/${profile.github_username}`} target="_blank" className="text-green-400 hover:underline font-semibold">
                          View Your Public Profile
                      </Link>
                  </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">GitHub Projects</h2>
              <p className="text-slate-400 text-sm mb-4">Sync your top projects from GitHub to showcase on your public portfolio page.</p>
              <button onClick={handleSyncProjects} disabled={isSyncing} className="w-full cool-button-green">
                  {isSyncing ? 'Syncing...' : 'Sync Projects from GitHub'}
              </button>
            </div>
        </div>
      </div>
    </main>
  );
}

