import React, { createContext, useContext, useState, useEffect } from 'react';
// 👇 ВИПРАВЛЕНО: Видалено Alert, оскільки не використовується
import { Appearance } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_COLORS = {
  light: {
    background: '#FDF5E6',       
    text: '#004E8C',             
    primary: '#3B82F6',          
    card: '#004E8C',             
    secondaryText: '#555',       
    separator: '#DDD',           
  },
  dark: { 
    background: '#212121',       
    text: '#E0E0E0',             
    primary: '#303030',          
    card: '#A34343',             
    secondaryText: '#A0A0A0',    
    separator: '#424242',        
  },
};
export type ThemeName = 'light' | 'dark';
export type ThemeColors = typeof THEME_COLORS.light;

interface ThemeContextProps {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  colors: THEME_COLORS.light,
  setTheme: () => {},
});

const STORAGE_KEY = 'user-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initialTheme = (Appearance.getColorScheme() || 'light') as ThemeName;
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = (await AsyncStorage.getItem(STORAGE_KEY)) as ThemeName;
        if (storedTheme) {
          setCurrentTheme(storedTheme);
        }
      } catch (e) {
        console.error("Failed to load theme from storage", e);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (theme: ThemeName) => {
    setCurrentTheme(theme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.error("Failed to save theme to storage", e);
    }
  };

  const contextValue = {
    theme: currentTheme,
    colors: THEME_COLORS[currentTheme],
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);