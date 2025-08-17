# ProEduAlt - Frontend 🚀

<!-- Note: You need to upload your logo to a site like Imgur and paste the direct link here -->

This is the frontend for **ProEduAlt**, an AI-powered career guidance platform built with Next.js and React. This application provides a user-friendly interface for users to analyze their skills, get career recommendations, and find job opportunities.

---

## 🌐 Live Application

You can view the live deployed version of this project here:

- **Live URL:** **[https://proedualt-frontend.vercel.app/](https://proedualt-frontend.vercel.app/)**

---

## ✨ Features

- **User Authentication:** Secure login and signup using Supabase Auth, with providers like GitHub, Google, LinkedIn, and Phone.
- **Personalized Dashboard:** Users can save their GitHub username for a personalized experience.
- **Dynamic Career Recommendations:** Displays AI-powered career suggestions based on the user's GitHub profile analysis.
- **Interactive UI:** A clean, modern, and responsive user interface built with Tailwind CSS.
- **Job Listings Page:** A dedicated page to browse relevant job and internship opportunities.

---

## 🛠️ Tech Stack

- **Framework:** **Next.js** (React) - A powerful framework for building server-rendered and static web applications.
- **Styling:** **Tailwind CSS** - A utility-first CSS framework for rapid UI development.
- **Authentication & Database Client:** **Supabase Client** - Used for handling user authentication and fetching data from the Supabase database.

---

## ⚙️ Backend Server

This frontend application communicates with a separate backend server built with FastAPI.

- **Backend GitHub Repo:** **[https://github.com/SAURAV6393/proedualt-backend](https://github.com/SAURAV6393/proedualt-backend)**

---

## 🚀 Local Setup and Installation

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/SAURAV6393/proedualt-frontend.git](https://github.com/SAURAV6393/proedualt-frontend.git)
    cd proedualt-frontend
    ```

2.  **Install the required packages:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a new file named `.env.local` in the root of your project folder. Add your Supabase keys to this file:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    You can find these keys in your Supabase project dashboard under **Settings > API**.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ☁️ Deployment

This frontend is deployed on **Vercel**. Any changes pushed to the `main` branch will trigger an automatic redeployment, ensuring the live application is always up-to-date.
