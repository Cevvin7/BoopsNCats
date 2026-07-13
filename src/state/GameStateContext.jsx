import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

const STORAGE_KEY = 'boopTracker.gameState';

const GameStateContext = createContext(null);

function defaultState() {
  return {
    boops: 0,
    // Start "healthy" on a fresh install rather than immediately stale.
    lastInteractionAt: Date.now(),
  };
}

export function GameStateProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, defaultState());

  const addBoops = useCallback(
    (amount) => {
      if (amount <= 0) return;
      setState((prev) => ({ ...prev, boops: prev.boops + amount }));
    },
    [setState],
  );

  const careForCat = useCallback(() => {
    setState((prev) => ({ ...prev, lastInteractionAt: Date.now() }));
  }, [setState]);

  // Hook point for the future shop (feeding/toys/decor): this is the API a
  // "buy" button would call. Not wired to any UI yet.
  const spendBoops = useCallback(
    (amount) => {
      if (state.boops < amount) return false;
      setState((prev) => ({ ...prev, boops: prev.boops - amount }));
      return true;
    },
    [state.boops, setState],
  );

  const value = useMemo(
    () => ({ ...state, addBoops, careForCat, spendBoops }),
    [state, addBoops, careForCat, spendBoops],
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return ctx;
}
