import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "green" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Recuperar tema salvo do localStorage ou usar "light" como padrão
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      return savedTheme || "light";
    }
    return "light";
  });

  useEffect(() => {
    // Aplicar tema ao documento
    const root = document.documentElement;
    
    // Remover todas as classes de tema
    root.classList.remove("light", "green", "dark");
    
    // Adicionar a classe do tema atual
    root.classList.add(theme);
    
    // Salvar no localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
