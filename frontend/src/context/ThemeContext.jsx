import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "restaurant_theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (e) {
    // localStorage can throw in private mode / blocked contexts — fall through
  }
  // Fall back to the operating system preference the first time round
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply the theme to <html> (Tailwind v4 dark variant) and <body> (base colors)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    // The base page colors live on <body> in index.html; swap them so the
    // whole surface (not just components) responds to the theme.
    body.classList.remove(
      "bg-neutral-950",
      "text-neutral-100",
      "bg-neutral-50",
      "text-neutral-900"
    );
    if (theme === "dark") {
      body.classList.add("bg-neutral-950", "text-neutral-100");
    } else {
      body.classList.add("bg-neutral-50", "text-neutral-900");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Ignore write failures — the theme still applies for this session
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((next) => {
    if (next === "light" || next === "dark") setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === "dark", toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
