import { useReducer, useCallback, useMemo } from 'react';
import { ITEM_CATALOG, getFootprint } from '../inventory/itemCatalog.js';
import { getValidPositions } from '../inventory/placement.js';
import { findPlacedItem } from '../inventory/placedItemsModel.js';

// Edit-mode interaction as an explicit small state machine (useReducer)
// rather than a handful of independent booleans — that would let you
// represent nonsense combinations (a tile-selection in progress *and* a
// popup open at once). Only one of these four states can be true.
export const EditorMode = Object.freeze({
  IDLE: 'idle',
  PLACING: 'placing', // choosing a tile for a NEW item from inventory
  MOVING: 'moving', // choosing a new tile for an EXISTING placed item
  ITEM_MENU: 'itemMenu', // Move/Flip/Delete popup open for a placed item
});

const initialState = { mode: EditorMode.IDLE, selectedItemId: null, activePlacedItemId: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_INVENTORY_ITEM':
      return { mode: EditorMode.PLACING, selectedItemId: action.itemId, activePlacedItemId: null };
    case 'TAP_PLACED_ITEM':
      // Only opens the menu from a neutral state — ignore taps on other
      // items while mid-placement/move so selections can't stack.
      if (state.mode !== EditorMode.IDLE) return state;
      return { mode: EditorMode.ITEM_MENU, selectedItemId: null, activePlacedItemId: action.placedItemId };
    case 'START_MOVE':
      return { mode: EditorMode.MOVING, selectedItemId: null, activePlacedItemId: state.activePlacedItemId };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useRoomEditor({ placedItems, placeItem, movePlacedItem, flipPlacedItem, deletePlacedItem }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // The catalog entry currently driving tile selection — either the
  // selected inventory item (PLACING) or the item being relocated
  // (MOVING). Both placementType and footprint come from the same
  // lookup, so they're derived together to avoid finding it twice.
  const activeItemConfig = useMemo(() => {
    let catalogEntry = null;
    if (state.mode === EditorMode.PLACING) {
      catalogEntry = ITEM_CATALOG[state.selectedItemId] ?? null;
    } else if (state.mode === EditorMode.MOVING) {
      const placed = findPlacedItem(placedItems, state.activePlacedItemId);
      catalogEntry = placed ? ITEM_CATALOG[placed.itemId] ?? null : null;
    }
    if (!catalogEntry) return null;
    return { placementType: catalogEntry.placementType, footprint: getFootprint(catalogEntry) };
  }, [state, placedItems]);

  const highlightedPositions = useMemo(() => {
    if (!activeItemConfig) return [];
    return getValidPositions({
      placementType: activeItemConfig.placementType,
      footprint: activeItemConfig.footprint,
      placedItems,
      excludePlacedItemId: state.mode === EditorMode.MOVING ? state.activePlacedItemId : undefined,
    });
  }, [activeItemConfig, placedItems, state]);

  const menuPlacedItem =
    state.mode === EditorMode.ITEM_MENU ? findPlacedItem(placedItems, state.activePlacedItemId) ?? null : null;

  const selectInventoryItem = useCallback((itemId) => {
    dispatch({ type: 'SELECT_INVENTORY_ITEM', itemId });
  }, []);

  const tapPlacedItem = useCallback((placedItemId) => {
    dispatch({ type: 'TAP_PLACED_ITEM', placedItemId });
  }, []);

  // `position` here is whatever getValidPositions produced for this
  // selection — {row, col} for floor, {face, row, col} for wall — so it
  // already carries a face through to placeItem/movePlacedItem untouched.
  const tapTile = useCallback(
    (position) => {
      if (state.mode === EditorMode.PLACING) {
        placeItem(state.selectedItemId, position);
      } else if (state.mode === EditorMode.MOVING) {
        movePlacedItem(state.activePlacedItemId, position);
      }
      dispatch({ type: 'RESET' });
    },
    [state, placeItem, movePlacedItem],
  );

  const startMove = useCallback(() => dispatch({ type: 'START_MOVE' }), []);

  const flip = useCallback(() => {
    if (state.activePlacedItemId) flipPlacedItem(state.activePlacedItemId);
    dispatch({ type: 'RESET' });
  }, [state.activePlacedItemId, flipPlacedItem]);

  const remove = useCallback(() => {
    if (state.activePlacedItemId) deletePlacedItem(state.activePlacedItemId);
    dispatch({ type: 'RESET' });
  }, [state.activePlacedItemId, deletePlacedItem]);

  const cancel = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    mode: state.mode,
    selectedItemId: state.selectedItemId,
    isSelectingTile: state.mode === EditorMode.PLACING || state.mode === EditorMode.MOVING,
    activePlacementType: activeItemConfig?.placementType ?? null,
    highlightedPositions,
    menuPlacedItem,
    selectInventoryItem,
    tapPlacedItem,
    tapTile,
    startMove,
    flip,
    remove,
    cancel,
  };
}
