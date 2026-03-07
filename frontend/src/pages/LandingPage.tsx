import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
    <header className="w-full flex justify-between items-center p-6 bg-white/80 shadow-md">
      <h1 className="text-3xl font-bold text-indigo-700">Campus Compass</h1>
      <nav className="space-x-6">
        <Link to="/" className="hover:text-indigo-600 font-medium">Home</Link>
        <Link to="/students" className="hover:text-indigo-600 font-medium">Students</Link>
        <Link to="/companies" className="hover:text-indigo-600 font-medium">Companies</Link>
        <Link to="/data-management" className="hover:text-indigo-600 font-medium">Data Management</Link>
        <Link to="/analytics" className="hover:text-indigo-600 font-medium">Analytics</Link>
      </nav>
    </header>
    <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-5xl font-extrabold text-indigo-800 mb-4">Empowering Campus Placements</h2>
      <p className="text-lg text-gray-700 mb-8 max-w-2xl">
        Welcome to Campus Compass, your all-in-one platform for managing campus placements, tracking student progress, and gaining actionable insights. Experience seamless data management, innovative analytics, and a beautiful, professional interface.
      </p>
      <Link to="/data-management">
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition text-lg font-semibold">
          Get Started
        </button>
      </Link>
    </main>
    <footer className="w-full text-center py-4 text-gray-500 bg-white/70 mt-8">
      &copy; {new Date().getFullYear()} Campus Compass. All rights reserved.
    </footer>
  </div>
);

export default LandingPage;
