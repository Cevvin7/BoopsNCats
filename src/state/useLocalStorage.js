import { useState, useEffect } from 'react';

function readStoredValue(key, defaultValue) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? defaultValue : JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Same shape as useState, but the value is loaded from (and saved to)
 * localStorage under `key`. This is the entire "persistence layer" for now
 * — swapping it for a real backend later means changing this one hook, not
 * every place that reads game state.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => readStoredValue(key, defaultValue));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
