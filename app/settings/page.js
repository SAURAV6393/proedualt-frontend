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

  if (isLoading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  if (!session) {
    return <p className="text-center mt-20">Please <Link href="/dashboard" className="text-blue-400">log in</Link> to view your settings.</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-900 text-white">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-8 block">&larr; Back to Dashboard</Link>
        <div className="glass-card p-8">
          <h1 className="text-4xl font-bold mb-6">Profile Settings</h1>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-300">Full Name</label>
              <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleInputChange} className="mt-1 block w-full p-2 rounded-lg bg-slate-700 border border-slate-600" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-300">Your Bio</label>
              <textarea name="bio" id="bio" rows="3" value={formData.bio} onChange={handleInputChange} className="mt-1 block w-full p-2 rounded-lg bg-slate-700 border border-slate-600" placeholder="A short bio about your skills and goals..."></textarea>
            </div>
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-slate-300">LinkedIn Profile URL</label>
              <input type="url" name="linkedin_url" id="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="mt-1 block w-full p-2 rounded-lg bg-slate-700 border border-slate-600" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="is_public" id="is_public" checked={formData.is_public} onChange={handleInputChange} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-500" />
              <label htmlFor="is_public" className="ml-2 block text-sm text-slate-300">Make my portfolio page public</label>
            </div>
            <button type="submit" disabled={isLoading} className="w-full cool-button-blue">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
