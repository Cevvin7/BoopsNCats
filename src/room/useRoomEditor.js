import { useReducer, useCallback, useMemo } from 'react';
import { ITEM_CATALOG } from '../inventory/itemCatalog.js';
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

  const activePlacementType = useMemo(() => {
    if (state.mode === EditorMode.PLACING) {
      return ITEM_CATALOG[state.selectedItemId]?.placementType ?? null;
    }
    if (state.mode === EditorMode.MOVING) {
      const placed = findPlacedItem(placedItems, state.activePlacedItemId);
      return placed ? ITEM_CATALOG[placed.itemId]?.placementType ?? null : null;
    }
    return null;
  }, [state, placedItems]);

  const highlightedPositions = useMemo(() => {
    if (!activePlacementType) return [];
    return getValidPositions({
      placementType: activePlacementType,
      placedItems,
      excludePlacedItemId: state.mode === EditorMode.MOVING ? state.activePlacedItemId : undefined,
    });
  }, [activePlacementType, placedItems, state]);

  const menuPlacedItem =
    state.mode === EditorMode.ITEM_MENU ? findPlacedItem(placedItems, state.activePlacedItemId) ?? null : null;

  const selectInventoryItem = useCallback((itemId) => {
    dispatch({ type: 'SELECT_INVENTORY_ITEM', itemId });
  }, []);

  const tapPlacedItem = useCallback((placedItemId) => {
    dispatch({ type: 'TAP_PLACED_ITEM', placedItemId });
  }, []);

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
    activePlacementType,
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
