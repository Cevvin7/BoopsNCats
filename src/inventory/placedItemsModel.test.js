import { describe, it, expect } from 'vitest';
import {
  addPlacedItem,
  removePlacedItem,
  movePlacedItem,
  flipPlacedItem,
  findPlacedItem,
  getPlacedFace,
} from './placedItemsModel.js';

describe('addPlacedItem', () => {
  it('appends a new entry with a generated id, flipped false, and the given position', () => {
    const result = addPlacedItem([], { itemId: 'plant', row: 4, col: 4 });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ itemId: 'plant', row: 4, col: 4, flipped: false });
    expect(result[0].id).toBeTruthy();
  });

  it('gives distinct ids to two instances of the same item', () => {
    const once = addPlacedItem([], { itemId: 'plant', row: 0, col: 0 });
    const twice = addPlacedItem(once, { itemId: 'plant', row: 1, col: 1 });
    expect(twice[0].id).not.toBe(twice[1].id);
  });

  it('stores a face for wall items and leaves it absent for floor items', () => {
    const [shelf] = addPlacedItem([], { itemId: 'shelf', row: 0, col: 0, face: 'right' });
    expect(shelf.face).toBe('right');

    const [plant] = addPlacedItem([], { itemId: 'plant', row: 0, col: 0 });
    expect(plant.face).toBeUndefined();
  });
});

describe('removePlacedItem / findPlacedItem', () => {
  it('removes only the matching id and leaves the rest untouched', () => {
    const withTwo = addPlacedItem(addPlacedItem([], { itemId: 'plant', row: 0, col: 0 }), {
      itemId: 'shelf',
      row: 0,
      col: 1,
    });
    const [plant, shelf] = withTwo;
    const afterRemove = removePlacedItem(withTwo, plant.id);
    expect(afterRemove).toHaveLength(1);
    expect(findPlacedItem(afterRemove, shelf.id)).toBeTruthy();
    expect(findPlacedItem(afterRemove, plant.id)).toBeUndefined();
  });
});

describe('movePlacedItem', () => {
  it('updates row/col for the matching item only', () => {
    const [plant] = addPlacedItem([], { itemId: 'plant', row: 0, col: 0 });
    const moved = movePlacedItem([plant], plant.id, { row: 5, col: 6 });
    expect(moved[0]).toMatchObject({ row: 5, col: 6, itemId: 'plant' });
  });

  it('can move a wall item onto the other face', () => {
    const [shelf] = addPlacedItem([], { itemId: 'shelf', row: 0, col: 0, face: 'left' });
    const moved = movePlacedItem([shelf], shelf.id, { row: 1, col: 2, face: 'right' });
    expect(moved[0]).toMatchObject({ row: 1, col: 2, face: 'right' });
  });
});

describe('getPlacedFace', () => {
  it('returns the stored face when present', () => {
    expect(getPlacedFace({ face: 'right' })).toBe('right');
  });

  it('defaults to left for older save data with no face at all', () => {
    expect(getPlacedFace({ itemId: 'shelf', row: 0, col: 0 })).toBe('left');
  });
});

describe('flipPlacedItem', () => {
  it('toggles flipped without touching row/col/itemId', () => {
    const [plant] = addPlacedItem([], { itemId: 'plant', row: 2, col: 3 });
    const flippedOnce = flipPlacedItem([plant], plant.id);
    expect(flippedOnce[0]).toMatchObject({ row: 2, col: 3, itemId: 'plant', flipped: true });

    const flippedTwice = flipPlacedItem(flippedOnce, plant.id);
    expect(flippedTwice[0].flipped).toBe(false);
  });
});
