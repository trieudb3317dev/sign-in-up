"use client";

import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";
import React from "react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = React.useState<"light" | "dark" | "system">("system");

  // sync localTheme when provider theme changes
  React.useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    if (localTheme === "light") {
      setLocalTheme("dark");
      setTheme("dark");
    } else if (localTheme === "dark") {
      setLocalTheme("system");
      setTheme("system");
    } else {
      setLocalTheme("light");
      setTheme("light");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* Toggle button */}
      <button
        onClick={handleToggleTheme}
        aria-label="Toggle theme"
        className="absolute top-4 right-4 rounded-full p-2 bg-white shadow-md dark:bg-zinc-900"
      >
        {localTheme === "dark" ? "🌙" : localTheme === "light" ? "☀️" : "🖥️"}
      </button>
      <nav className="fixed top-4 left-4">
        <a
          href="/sign-in"
          className="mr-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sign In
        </a>
        <a
          href="/sign-up"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Sign Up
        </a>
      </nav>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome to the Next.js App
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Use the buttons on the top left to sign in or sign up.
        </p>
      </div>
    </div>
  );
}
