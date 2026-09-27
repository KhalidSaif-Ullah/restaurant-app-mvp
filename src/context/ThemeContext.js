import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

const lightTheme = {
  background: '#ffffff',
  text: '#000000',
  card: '#f2f2f2',
};

const darkTheme = {
  background: '#121212',
  text: '#ffffff',
  card: '#222222',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark((current) => !current);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}