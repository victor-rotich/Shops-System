import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the theme context
export const ThemeContext = createContext();

// Define theme colors
const lightTheme = {
  primary: '#1E88E5',
  secondary: '#26A69A',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#212121',
  border: '#E0E0E0',
  notification: '#FF5252',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',
  navBackground: '#FFFFFF',
  navText: '#212121',
  inputBackground: '#FFFFFF',
  shadow: '#000000',
  chart: [
    '#1E88E5',
    '#26A69A',
    '#FFC107',
    '#F44336',
    '#9C27B0',
    '#FF9800',
    '#4CAF50',
    '#795548',
  ],
};

const darkTheme = {
  primary: '#2196F3',
  secondary: '#4DB6AC',
  background: '#121212',
  card: '#1E1E1E',
  text: '#EEEEEE',
  border: '#333333',
  notification: '#FF5252',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',
  navBackground: '#1E1E1E',
  navText: '#FFFFFF',
  inputBackground: '#333333',
  shadow: '#000000',
  chart: [
    '#2196F3',
    '#4DB6AC',
    '#FFC107',
    '#F44336',
    '#BA68C8',
    '#FF9800',
    '#66BB6A',
    '#8D6E63',
  ],
};

// Define font sizes
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// Define spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define font families
const fontFamilies = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  bold: 'Roboto-Bold',
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [fontScale, setFontScale] = useState(1);

  // Load theme preferences from storage
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const storedThemeMode = await AsyncStorage.getItem('themeMode');
        const storedFontScale = await AsyncStorage.getItem('fontScale');
        
        if (storedThemeMode) {
          setThemeMode(storedThemeMode);
        }
        
        if (storedFontScale) {
          setFontScale(parseFloat(storedFontScale));
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      }
    };
    
    loadThemePreferences();
  }, []);

  // Determine active theme based on theme mode
  const activeTheme = (() => {
    if (themeMode === 'system') {
      return deviceColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  })();

  // Function to toggle theme
  const toggleTheme = async () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    
    try {
      await AsyncStorage.setItem('themeMode', newThemeMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Function to set theme mode
  const setThemeModePreference = async (mode) => {
    setThemeMode(mode);
    
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Function to adjust font scale
  const adjustFontScale = async (scale) => {
    setFontScale(scale);
    
    try {
      await AsyncStorage.setItem('fontScale', scale.toString());
    } catch (error) {
      console.error('Failed to save font scale:', error);
    }
  };

  // Calculate scaled font sizes
  const scaledFontSizes = Object.entries(fontSizes).reduce(
    (acc, [key, value]) => {
      acc[key] = Math.round(value * fontScale);
      return acc;
    },
    {}
  );

  // Provide theme context
  return (
    <ThemeContext.Provider
      value={{
        colors: activeTheme,
        fontSizes: scaledFontSizes,
        spacing,
        fontFamilies,
        isDark: themeMode === 'dark' || (themeMode === 'system' && deviceColorScheme === 'dark'),
        themeMode,
        fontScale,
        toggleTheme,
        setThemeMode: setThemeModePreference,
        adjustFontScale,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};