import { describe, it, expect } from 'vitest';
import { sortByDepth } from './depthSort.js';

describe('sortByDepth', () => {
  it('orders entities ascending by the depth their accessor returns', () => {
    const entities = [{ id: 'a', depth: 5 }, { id: 'b', depth: 1 }, { id: 'c', depth: 3 }];
    const sorted = sortByDepth(entities, (entity) => entity.depth);
    expect(sorted.map((entity) => entity.id)).toEqual(['b', 'c', 'a']);
  });

  it('is stable: equal-depth entities keep their original relative order', () => {
    const entities = [
      { id: 'a', depth: 1 },
      { id: 'b', depth: 1 },
      { id: 'c', depth: 0 },
      { id: 'd', depth: 1 },
    ];
    const sorted = sortByDepth(entities, (entity) => entity.depth);
    expect(sorted.map((entity) => entity.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('does not mutate the input array', () => {
    const entities = [{ id: 'a', depth: 2 }, { id: 'b', depth: 1 }];
    const original = [...entities];
    sortByDepth(entities, (entity) => entity.depth);
    expect(entities).toEqual(original);
  });

  it('doesn\'t care what shape the entities are or what the depth number means', () => {
    // Proves this isn't hardcoded to any one entity type -- plain numbers,
    // strings tagged with a lookup, whatever the caller's depth concept is.
    const cat = { kind: 'cat', row: 4, col: 4 };
    const bookshelf = { kind: 'item', row: 0, col: 2 };
    const plant = { kind: 'item', row: 6, col: 1 };
    const sorted = sortByDepth([cat, bookshelf, plant], (entity) => entity.row + entity.col);
    expect(sorted).toEqual([bookshelf, plant, cat]);
  });
});
