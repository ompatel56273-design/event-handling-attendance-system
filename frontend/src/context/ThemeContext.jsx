import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: 'spiderman',
    name: 'Spider-Man Cyber (Default)',
    icon: '🕷️',
    primary: '#E20626',
    secondary: '#0EA5E9',
    accent: '#9C23D9',
    bg: '#08080D',
    description: 'Vibrant Crimson Spider-Red with dark midnight mesh',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '⚡',
    primary: '#00F0FF',
    secondary: '#D946EF',
    accent: '#3B82F6',
    bg: '#060814',
    description: 'Electric Neon Cyan with cyber violet glows',
  },
  {
    id: 'purple',
    name: 'Amethyst Void',
    icon: '🔮',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#06B6D4',
    bg: '#0A0612',
    description: 'Royal Purple with neon magenta highlights',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    icon: '🍃',
    primary: '#00D27A',
    secondary: '#F59E0B',
    accent: '#10B981',
    bg: '#050C08',
    description: 'Cyber Matrix Green with golden accents',
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    icon: '🔥',
    primary: '#FF5722',
    secondary: '#FACC15',
    accent: '#EF4444',
    bg: '#0D0807',
    description: 'Neon Sunset Flame Orange with solar gold',
  },
];

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'spiderman';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('app_theme', currentTheme);
  }, [currentTheme]);

  const activeThemeConfig = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme: setCurrentTheme,
        themes: THEMES,
        activeThemeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
