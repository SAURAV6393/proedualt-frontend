import "./globals.css";

export const metadata = {
  title: 'ProEduAlt - AI Career Guide',
  description: 'Your AI-Powered Career Guide for Tech Aspirants',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}