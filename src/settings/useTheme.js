import { useEffect } from 'react';
import { useLocalStorage } from '../state/useLocalStorage.js';

const STORAGE_KEY = 'boopTracker.theme';

export const THEMES = { DARK: 'dark', LIGHT: 'light' };

// Persists the choice and mirrors it onto <html data-theme="..."> so
// index.css's `:root[data-theme='light']` override can take effect --
// dark is the base :root styling, so no attribute at all also means dark.
export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEY, THEMES.DARK);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }

  return { theme, toggleTheme };
}
