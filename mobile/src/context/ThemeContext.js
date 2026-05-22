import React, { createContext, useContext, useState } from 'react';

export const lightTheme = {
  dark: false,
  bg: '#f5f5f5',
  card: '#ffffff',
  text: '#111111',
  subtext: '#555555',
  muted: '#888888',
  border: '#dddddd',
  inputBg: '#ffffff',
  tabBar: '#ffffff',
  header: '#2196F3',
  chip: '#e0e0e0',
  chipText: '#555555',
};

export const darkTheme = {
  dark: true,
  bg: '#121212',
  card: '#1e1e1e',
  text: '#f0f0f0',
  subtext: '#bbbbbb',
  muted: '#888888',
  border: '#333333',
  inputBg: '#2a2a2a',
  tabBar: '#1e1e1e',
  header: '#1565C0',
  chip: '#333333',
  chipText: '#cccccc',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  const value = {
    isDark,
    toggleTheme,
    theme: isDark ? darkTheme : lightTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
