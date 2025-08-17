'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('http://localhost:8000/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-blue-400 hover:underline mb-8 block">&larr; Back to Home</Link>
        <h1 className="text-5xl font-bold mb-8 text-center">Latest Job Openings</h1>
        
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