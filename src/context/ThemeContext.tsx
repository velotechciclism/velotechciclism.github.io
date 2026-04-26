import React, { createContext, useContext, useEffect } from "react";

export type Theme = "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "green", "dark");
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const setTheme = () => {
    localStorage.setItem("theme", "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme: "dark", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
};
