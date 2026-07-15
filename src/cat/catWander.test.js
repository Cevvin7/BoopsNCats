import { describe, it, expect } from 'vitest';
import {
  IDLE_ANIMATIONS,
  pickWanderDestinationTile,
  randomPointInTile,
  pickIdleAnimation,
  randomIdleIntervalMs,
  randomWanderIntervalMs,
  walkDurationMs,
  walkFacingLeft,
} from './catWander.js';

// A queue-based fake random -- returns each value in sequence, so tests
// can dictate exactly which "random" tile gets drawn on each attempt.
function queuedRandom(values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

describe('pickWanderDestinationTile', () => {
  it('accepts the first tile drawn if it is free', () => {
    // random() = 0.5 with an 8x8 grid draws row=4, col=4.
    const random = queuedRandom([0.5, 0.5]);
    const tile = pickWanderDestinationTile({ isTileFree: () => true, random, rows: 8, cols: 8 });
    expect(tile).toEqual({ row: 4, col: 4 });
  });

  it('rejects an occupied tile and draws again', () => {
    // First draw -> (4,4); second draw -> (1,1).
    const random = queuedRandom([0.5, 0.5, 0.125, 0.125]);
    const isTileFree = (tile) => !(tile.row === 4 && tile.col === 4);
    const tile = pickWanderDestinationTile({ isTileFree, random, rows: 8, cols: 8 });
    expect(tile).toEqual({ row: 1, col: 1 });
  });

  it('rejects the excluded tile (the cat\'s current destination) even if otherwise free', () => {
    const random = queuedRandom([0.5, 0.5, 0.125, 0.125]);
    const tile = pickWanderDestinationTile({
      isTileFree: () => true,
      excludeTile: { row: 4, col: 4 },
      random,
      rows: 8,
      cols: 8,
    });
    expect(tile).toEqual({ row: 1, col: 1 });
  });

  it('gives up and returns null if nothing free turns up within the attempt budget', () => {
    const tile = pickWanderDestinationTile({ isTileFree: () => false, random: () => 0.5, rows: 8, cols: 8 });
    expect(tile).toBeNull();
  });
});

describe('randomPointInTile', () => {
  it('stays within [row, row+1) x [col, col+1) for any random() in [0, 1)', () => {
    for (const value of [0, 0.001, 0.5, 0.999]) {
      const point = randomPointInTile({ row: 3, col: 5 }, () => value);
      expect(point.row).toBeGreaterThanOrEqual(3);
      expect(point.row).toBeLessThan(4);
      expect(point.col).toBeGreaterThanOrEqual(5);
      expect(point.col).toBeLessThan(6);
    }
  });

  it('is exactly the tile\'s own corner when random() is 0', () => {
    expect(randomPointInTile({ row: 2, col: 2 }, () => 0)).toEqual({ row: 2, col: 2 });
  });
});

describe('pickIdleAnimation', () => {
  it('returns one of the two known idle animations', () => {
    expect(IDLE_ANIMATIONS).toContain(pickIdleAnimation(() => 0));
    expect(IDLE_ANIMATIONS).toContain(pickIdleAnimation(() => 0.999));
  });

  it('maps random() = 0 to the first animation and near-1 to the last', () => {
    expect(pickIdleAnimation(() => 0)).toBe(IDLE_ANIMATIONS[0]);
    expect(pickIdleAnimation(() => 0.999)).toBe(IDLE_ANIMATIONS[IDLE_ANIMATIONS.length - 1]);
  });
});

describe('randomIdleIntervalMs', () => {
  it('stays within the documented 30-240 second range', () => {
    expect(randomIdleIntervalMs(() => 0)).toBe(30_000);
    expect(randomIdleIntervalMs(() => 1)).toBe(240_000);
    expect(randomIdleIntervalMs(() => 0.5)).toBe(135_000);
  });
});

describe('randomWanderIntervalMs', () => {
  it('stays within a small jitter band around 30 seconds', () => {
    expect(randomWanderIntervalMs(() => 0)).toBe(25_000);
    expect(randomWanderIntervalMs(() => 1)).toBe(35_000);
    expect(randomWanderIntervalMs(() => 0.5)).toBe(30_000);
  });
});

describe('walkDurationMs', () => {
  it('is zero for zero distance', () => {
    expect(walkDurationMs(0)).toBe(0);
  });

  it('scales linearly with distance', () => {
    const short = walkDurationMs(1);
    const long = walkDurationMs(3);
    expect(long).toBeCloseTo(short * 3, 8);
  });
});

describe('walkFacingLeft', () => {
  it('faces right when col increases with row held fixed (toward the right wall)', () => {
    expect(walkFacingLeft({ row: 0, col: 0 }, { row: 0, col: 5 })).toBe(false);
  });

  it('faces left when col decreases with row held fixed (toward the left wall)', () => {
    expect(walkFacingLeft({ row: 0, col: 5 }, { row: 0, col: 0 })).toBe(true);
  });

  it('faces left when row increases with col held fixed (toward the left wall)', () => {
    expect(walkFacingLeft({ row: 0, col: 0 }, { row: 3, col: 0 })).toBe(true);
  });

  it('faces right when row decreases with col held fixed (toward the right wall)', () => {
    expect(walkFacingLeft({ row: 3, col: 0 }, { row: 0, col: 0 })).toBe(false);
  });

  it('returns null when the walk has no left-right screen motion at all (row and col change equally)', () => {
    expect(walkFacingLeft({ row: 2, col: 2 }, { row: 5, col: 5 })).toBeNull();
  });

  it('returns null for a zero-distance walk', () => {
    expect(walkFacingLeft({ row: 2, col: 2 }, { row: 2, col: 2 })).toBeNull();
  });
});
