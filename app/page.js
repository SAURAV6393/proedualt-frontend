import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white text-center p-8">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Stop Guessing, Start Growing
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          ProEduAlt is an AI-powered platform that analyzes your GitHub profile and resume to provide personalized career recommendations.
        </p>
        <div className="flex justify-center">
          <Link href="/dashboard" className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}