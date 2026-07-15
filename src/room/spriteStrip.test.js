import { describe, it, expect } from 'vitest';
import { spriteStripBackgroundStyle } from './spriteStrip.js';

describe('spriteStripBackgroundStyle', () => {
  it('pins a single-frame strip fully in place, no size stretch needed', () => {
    expect(spriteStripBackgroundStyle({ frameCount: 1, frameIndex: 0 })).toEqual({
      backgroundSize: '100% 100%',
      backgroundPosition: '0% 0%',
    });
  });

  it('sizes a multi-frame strip wide enough to fit every frame, and selects the first frame at 0%', () => {
    const style = spriteStripBackgroundStyle({ frameCount: 5, frameIndex: 0 });
    expect(style.backgroundSize).toBe('500% 100%');
    expect(style.backgroundPosition).toBe('0% 0%');
  });

  it('selects the last frame at 100%', () => {
    const style = spriteStripBackgroundStyle({ frameCount: 5, frameIndex: 4 });
    expect(style.backgroundPosition).toBe('100% 0%');
  });

  it('selects a middle frame proportionally', () => {
    const style = spriteStripBackgroundStyle({ frameCount: 5, frameIndex: 2 });
    expect(style.backgroundPosition).toBe('50% 0%');
  });
});
