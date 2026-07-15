import { describe, it, expect } from 'vitest';
import { tileVariantIndex } from './tileTheme.js';

describe('tileVariantIndex', () => {
  it('always returns the single frame for a 1-frame (solid) range', () => {
    const theme = { range: [4, 4] };
    expect(tileVariantIndex(theme, 0, 0)).toBe(4);
    expect(tileVariantIndex(theme, 3, 5)).toBe(4);
  });

  it('alternates between the two frames of a 2-frame range in a checkerboard pattern', () => {
    const theme = { range: [0, 1] };
    expect(tileVariantIndex(theme, 0, 0)).toBe(0); // row+col even
    expect(tileVariantIndex(theme, 0, 1)).toBe(1); // row+col odd
    expect(tileVariantIndex(theme, 1, 0)).toBe(1);
    expect(tileVariantIndex(theme, 1, 1)).toBe(0);
  });

  it('offsets into a range that does not start at 0', () => {
    const theme = { range: [2, 3] };
    expect(tileVariantIndex(theme, 0, 0)).toBe(2);
    expect(tileVariantIndex(theme, 0, 1)).toBe(3);
  });

  it('cycles through a wider range in row+col order', () => {
    const theme = { range: [4, 7] }; // length 4
    expect(tileVariantIndex(theme, 0, 0)).toBe(4);
    expect(tileVariantIndex(theme, 0, 1)).toBe(5);
    expect(tileVariantIndex(theme, 0, 2)).toBe(6);
    expect(tileVariantIndex(theme, 0, 3)).toBe(7);
    expect(tileVariantIndex(theme, 0, 4)).toBe(4); // wraps back around
  });
});
