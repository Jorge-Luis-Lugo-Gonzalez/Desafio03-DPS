import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@theme_preference';

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
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(saved => {
        if (saved !== null) {
          setIsDark(saved === 'dark');
        }
      })
      .catch(() => {})
      .finally(() => setThemeLoaded(true));
  }, []);

  // Guardar preferencia cada vez que cambia
  async function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {}
  }

  const value = {
    isDark,
    themeLoaded,
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