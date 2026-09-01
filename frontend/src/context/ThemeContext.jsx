import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: 'monochrome',
    name: 'Executive Black & White (Default)',
    icon: '🖤',
    primary: '#FFFFFF',
    secondary: '#CBD5E1',
    accent: '#94A3B8',
    bg: '#040508',
    description: 'Ultra-Clean High-Contrast Executive Noir with Pristine White & Platinum Silver Accents',
  },
  {
    id: 'titanium',
    name: 'Titanium Indigo',
    icon: '⚡',
    primary: '#6366F1',
    secondary: '#06B6D4',
    accent: '#818CF8',
    bg: '#080A11',
    description: 'Silicon Valley Executive Obsidian with Electric Indigo & Cyan Azure',
  },
  {
    id: 'emerald',
    name: 'Industrial Emerald',
    icon: '🍃',
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#06B6D4',
    bg: '#05080A',
    description: 'Precision High-Tech Matrix with Cyber Emerald & Mint Glow',
  },
  {
    id: 'arctic',
    name: 'Arctic Ice Blue',
    icon: '❄️',
    primary: '#38BDF8',
    secondary: '#2563EB',
    accent: '#7DD3FC',
    bg: '#060B18',
    description: 'Nordic Steel Slate with Arctic Cyan & Deep Space Cobalt',
  },
  {
    id: 'gold',
    name: 'Champagne Luxury Gold',
    icon: '👑',
    primary: '#F59E0B',
    secondary: '#FCD34D',
    accent: '#D97706',
    bg: '#0B0A08',
    description: 'Executive Sovereign Noir with Champagne Gold & Warm Amber',
  },
  {
    id: 'aurora',
    name: 'Aurora Cyber Violet',
    icon: '🔮',
    primary: '#A855F7',
    secondary: '#EC4899',
    accent: '#C084FC',
    bg: '#090712',
    description: 'Cyber Horizon with Neon Aurora Violet & Hot Pink Flare',
  },
];

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    if (!saved || saved === 'spiderman') return 'monochrome';
    if (saved === 'cyberpunk') return 'arctic';
    if (saved === 'purple') return 'aurora';
    if (saved === 'solar') return 'gold';
    return saved;
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
