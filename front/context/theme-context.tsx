import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

const Colors = {
  light: {
    background: '#ffffff',
    text: '#000000',
    card: '#ffffff',
    inputBg: '#f9f9f9',
    inputBorder: '#e5e5e5',
  },
  dark: {
    background: '#121212',
    text: '#ffffff',
    card: '#1e1e1e',
    inputBg: '#2c2c2c',
    inputBorder: '#444444',
  }
};

// Тут ми теж додаємо <any>, щоб не сварився на null
const ThemeContext = createContext<any>(null);

// ВИПРАВЛЕНИЙ РЯДОК НИЖЧЕ:
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme || 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);