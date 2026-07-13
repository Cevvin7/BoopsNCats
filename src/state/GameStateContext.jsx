import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import {
  defaultCat,
  applyHappinessDecay,
  recordActivityUpload as recordCatActivityUpload,
  needsAttention as computeNeedsAttention,
} from '../cat/happinessModel.js';
import { ITEM_CATALOG } from '../inventory/itemCatalog.js';
import { defaultInventory, decrementQuantity, incrementQuantity } from '../inventory/inventoryModel.js';
import {
  addPlacedItem,
  removePlacedItem,
  movePlacedItem as movePlacedItemInList,
  flipPlacedItem as flipPlacedItemInList,
  findPlacedItem,
} from '../inventory/placedItemsModel.js';
import { isValidPlacementPosition } from '../inventory/placement.js';

const STORAGE_KEY = 'boopTracker.gameState';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// Happiness only ever changes once per (local) day, so polling every few
// minutes is plenty fresh without running a timer that fires constantly.
const DECAY_CHECK_INTERVAL_MS = 5 * 60 * 1000;

const GameStateContext = createContext(null);

function defaultState() {
  return {
    boops: 0,
    cat: defaultCat(),
    inventory: defaultInventory(),
    placedItems: [],
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

  // Re-derives happiness from the two stored timestamps rather than storing
  // a ticking countdown. That makes it correct no matter how long it's been
  // since the last check (tab closed for an hour or a month), and it's the
  // same pattern Phase 1 used for cat health: recompute on demand instead
  // of trusting a background process to have run on schedule.
  const checkHappinessDecay = useCallback(() => {
    setState((prev) => {
      const nextCat = applyHappinessDecay(prev.cat, Date.now());
      return nextCat === prev.cat ? prev : { ...prev, cat: nextCat };
    });
  }, [setState]);

  // Hook point for Phase 1's upload flow: call this in the same success
  // handler that awards boops for a parsed GPX file.
  const recordActivityUpload = useCallback(() => {
    setState((prev) => ({ ...prev, cat: recordCatActivityUpload(prev.cat, Date.now()) }));
  }, [setState]);

  // Places one unit of itemId from inventory onto the room. Re-validates
  // the position itself (rather than trusting the caller) so a stale
  // highlight click can never corrupt state, even though in practice the
  // UI only ever offers already-valid tiles.
  const placeItem = useCallback(
    (itemId, position) => {
      setState((prev) => {
        const catalogEntry = ITEM_CATALOG[itemId];
        if (!catalogEntry) return prev;

        const inventoryEntry = prev.inventory.find((entry) => entry.itemId === itemId);
        if (!inventoryEntry || inventoryEntry.quantity <= 0) return prev;

        const isValid = isValidPlacementPosition({
          placementType: catalogEntry.placementType,
          position,
          placedItems: prev.placedItems,
        });
        if (!isValid) return prev;

        return {
          ...prev,
          inventory: decrementQuantity(prev.inventory, itemId),
          placedItems: addPlacedItem(prev.placedItems, { itemId, row: position.row, col: position.col }),
        };
      });
    },
    [setState],
  );

  const movePlacedItem = useCallback(
    (placedItemId, position) => {
      setState((prev) => {
        const placed = findPlacedItem(prev.placedItems, placedItemId);
        if (!placed) return prev;

        const catalogEntry = ITEM_CATALOG[placed.itemId];
        const isValid = isValidPlacementPosition({
          placementType: catalogEntry.placementType,
          position,
          placedItems: prev.placedItems,
          excludePlacedItemId: placedItemId,
        });
        if (!isValid) return prev;

        return { ...prev, placedItems: movePlacedItemInList(prev.placedItems, placedItemId, position) };
      });
    },
    [setState],
  );

  const flipPlacedItem = useCallback(
    (placedItemId) => {
      setState((prev) => ({ ...prev, placedItems: flipPlacedItemInList(prev.placedItems, placedItemId) }));
    },
    [setState],
  );

  // Deleting never destroys the item — it goes back to inventory.
  const deletePlacedItem = useCallback(
    (placedItemId) => {
      setState((prev) => {
        const placed = findPlacedItem(prev.placedItems, placedItemId);
        if (!placed) return prev;

        return {
          ...prev,
          inventory: incrementQuantity(prev.inventory, placed.itemId),
          placedItems: removePlacedItem(prev.placedItems, placedItemId),
        };
      });
    },
    [setState],
  );

  // DEV-ONLY TESTING TOOL — remove before this game leaves prototype stage.
  // Rewinds lastDecayCheck by 24h so the *real* decay function sees a local
  // noon it hasn't accounted for yet, instead of faking a decrement through
  // a separate code path that could drift from production behavior.
  const advanceOneDayForTesting = useCallback(() => {
    setState((prev) => {
      const rewound = { ...prev.cat, lastDecayCheck: prev.cat.lastDecayCheck - ONE_DAY_MS };
      return { ...prev, cat: applyHappinessDecay(rewound, Date.now()) };
    });
  }, [setState]);

  // Checked on mount, whenever the tab regains visibility (covers "closed
  // for days" and "backgrounded overnight"), and on a coarse interval while
  // open — not a tight polling loop, since browsers throttle background
  // timers anyway and a value that changes once a day doesn't need
  // sub-minute freshness.
  useEffect(() => {
    checkHappinessDecay();

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') checkHappinessDecay();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = setInterval(checkHappinessDecay, DECAY_CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkHappinessDecay]);

  const value = useMemo(
    () => ({
      ...state,
      needsAttention: computeNeedsAttention(state.cat),
      addBoops,
      spendBoops,
      recordActivityUpload,
      advanceOneDayForTesting,
      placeItem,
      movePlacedItem,
      flipPlacedItem,
      deletePlacedItem,
    }),
    [
      state,
      addBoops,
      spendBoops,
      recordActivityUpload,
      advanceOneDayForTesting,
      placeItem,
      movePlacedItem,
      flipPlacedItem,
      deletePlacedItem,
    ],
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
