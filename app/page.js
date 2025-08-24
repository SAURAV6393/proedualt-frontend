'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center p-8">
      <div className="space-y-8 max-w-3xl">
        <h1 className="text-6xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 animate-fade-in-up">
          Unlock Your Tech Career Path
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 animate-fade-in-up animation-delay-300">
          Stop guessing, start growing. ProEduAlt uses AI to analyze your skills and recommends the perfect career for you.
        </p>
        
        <div className="animate-fade-in-up animation-delay-600">
          <Link href="/dashboard" className="cool-button-blue text-lg">
            Get Started for Free
          </Link>
        </div>
      </div>
    </main>
  );
}
