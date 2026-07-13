import { describe, it, expect } from 'vitest';
import { CAT_ANIMATIONS, CAT_SHEET_WIDTH, CAT_SHEET_HEIGHT } from './spriteAnimation.js';

describe('CAT_ANIMATIONS (parsed from the Aseprite export)', () => {
  it('groups frames into the four named animations from the sheet', () => {
    expect(Object.keys(CAT_ANIMATIONS).sort()).toEqual(
      ['NeedsExercise', 'SitIdle', 'StandIdle', 'Walking'].sort(),
    );
  });

  it('gives each animation its 2 frames in order', () => {
    expect(CAT_ANIMATIONS.SitIdle).toHaveLength(2);
    expect(CAT_ANIMATIONS.SitIdle.map((f) => f.index)).toEqual([0, 1]);
    expect(CAT_ANIMATIONS.SitIdle[0]).toMatchObject({ x: 0, y: 0, w: 32, h: 32, duration: 1000 });
    expect(CAT_ANIMATIONS.SitIdle[1]).toMatchObject({ x: 32, y: 0, w: 32, h: 32 });
  });

  it('reads NeedsExercise frames from the correct row of the sheet', () => {
    expect(CAT_ANIMATIONS.NeedsExercise[0]).toMatchObject({ x: 0, y: 96, w: 32, h: 32 });
    expect(CAT_ANIMATIONS.NeedsExercise[1]).toMatchObject({ x: 32, y: 96, w: 32, h: 32 });
  });

  it('picks up the sheet dimensions from the export metadata', () => {
    expect(CAT_SHEET_WIDTH).toBe(64);
    expect(CAT_SHEET_HEIGHT).toBe(128);
  });
});
