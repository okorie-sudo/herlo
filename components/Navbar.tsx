"use client";

import { useAuth } from "@/app/context/auth-context";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const { signOut, user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to dark mode

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <nav className="relative z-50 bg-gradient-to-r from-indigo-900 via-purple-700 to-purple-300 dark:from-gray-900 dark:via-purple-900 dark:to-purple-500 border-b border-purple-300/50 dark:border-purple-600/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-200 to-purple-400 dark:from-purple-100 dark:to-purple-300 bg-clip-text text-transparent">
              herlo
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/matches"
              className="text-purple-200 dark:text-purple-100 hover:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Discover
            </Link>
            <Link
              href="/matches/list"
              className="text-purple-200 dark:text-purple-100 hover:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Matches
            </Link>
            <Link
              href="/chat"
              className="text-purple-200 dark:text-purple-100 hover:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Messages
            </Link>
            <Link
              href="/profile"
              className="text-purple-200 dark:text-purple-100 hover:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Profile
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="inline-flex items-center px-3 py-1 border border-purple-300 dark:border-purple-600 rounded-md text-sm font-medium text-purple-200 dark:text-purple-100 hover:bg-purple-500 dark:hover:bg-purple-700 hover:text-white transition-colors duration-200"
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
            {user ? (
              <button
                onClick={signOut}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-purple-800 dark:hover:from-purple-800 dark:hover:to-purple-950 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-purple-800 dark:hover:from-purple-800 dark:hover:to-purple-950 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
