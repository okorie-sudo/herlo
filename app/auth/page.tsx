"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to dark mode
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setError(`Please confirm your email ${email}`);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setLoading(false);
    } catch (error: any) {
      setError(error?.message || error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-700 to-purple-300 dark:from-gray-900 dark:via-purple-900 dark:to-purple-500 min-h-screen flex items-center justify-center transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-200 dark:text-purple-100 mb-2">
            herlo
          </h1>
          <p className="text-purple-300 dark:text-purple-200">
            {isSignup ? "Sign Up" : "Sign In"}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleAuth}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-purple-200 dark:text-purple-100"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-purple-300 dark:border-purple-600 bg-transparent text-purple-100 placeholder-purple-400 dark:placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-purple-200 dark:text-purple-100"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-purple-300 dark:border-purple-600 bg-transparent text-purple-100 placeholder-purple-400 dark:placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 rounded-md"
            />
          </div>
          {error && (
            <div className="text-purple-400 dark:text-purple-300 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900 hover:from-purple-600 hover:to-purple-800 dark:hover:from-purple-800 dark:hover:to-purple-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <div className="text-center space-y-4">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-purple-400 dark:text-purple-300 hover:text-purple-500 dark:hover:text-purple-200 text-sm transition-colors"
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex justify-center py-2 px-4 border border-purple-300 dark:border-purple-600 rounded-md text-sm font-medium text-purple-200 dark:text-purple-100 hover:bg-purple-500 dark:hover:bg-purple-700 hover:text-white transition-colors"
          >
            {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
