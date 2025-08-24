import { Inter } from 'next/font/google'; // Import the font
import "./globals.css";

// Configure the font
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ProEduAlt - AI Career Guide',
  description: 'Your AI-Powered Career Guide for Tech Aspirants',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Apply the font class to the body */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}