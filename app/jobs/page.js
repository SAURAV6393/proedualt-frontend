'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const BACKEND_URL = "https://proedualt-backend63.onrender.com";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false); // Naya state scraping ke liye

  // Function to fetch jobs from the backend
  async function fetchJobs() {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/jobs`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Pehli baar page load hone par jobs fetch karo
  useEffect(() => {
    fetchJobs();
  }, []);

  // Naya function jo scraper ko chalayega
  async function handleScrapeJobs() {
    setIsScraping(true);
    try {
      const response = await fetch(`${BACKEND_URL}/scrape-jobs`, {
        method: 'POST',
      });
      const result = await response.json();
      alert(result.message || result.detail); // Scraper ka result popup me dikhao
      fetchJobs(); // Nayi jobs dikhane ke liye list ko refresh karo
    } catch (error) {
      alert("An error occurred while scraping jobs.");
    } finally {
      setIsScraping(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-blue-400 hover:underline mb-4 block">&larr; Back to Home</Link>
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bold">Latest Job Openings</h1>
            {/* Naya Scraper Button */}
            <button 
                onClick={handleScrapeJobs} 
                disabled={isScraping}
                className="p-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold disabled:bg-gray-500"
            >
                {isScraping ? 'Fetching...' : 'Fetch Latest Internships'}
            </button>
        </div>
        
        {isLoading ? (
          <p className="text-center">Loading jobs...</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <p className="text-gray-400">{job.company_name} - {job.location}</p>
                </div>
                <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold">
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
