import { describe, it, expect } from 'vitest';
import {
  computeCatHealth,
  CatHealth,
  ATTENTION_AFTER_DAYS,
  SICK_AFTER_DAYS,
} from './catStateMachine.js';

const DAY = 24 * 60 * 60 * 1000;

describe('computeCatHealth', () => {
  it('is healthy right after interacting', () => {
    const now = Date.now();
    expect(computeCatHealth(now, now)).toBe(CatHealth.HEALTHY);
  });

  it('is healthy just before the attention threshold', () => {
    const now = Date.now();
    const lastInteraction = now - (ATTENTION_AFTER_DAYS * DAY - 1000);
    expect(computeCatHealth(lastInteraction, now)).toBe(CatHealth.HEALTHY);
  });

  it('needs attention once the threshold is crossed', () => {
    const now = Date.now();
    const lastInteraction = now - ATTENTION_AFTER_DAYS * DAY;
    expect(computeCatHealth(lastInteraction, now)).toBe(CatHealth.NEEDS_ATTENTION);
  });

  it('becomes sick once the sick threshold is crossed', () => {
    const now = Date.now();
    const lastInteraction = now - SICK_AFTER_DAYS * DAY;
    expect(computeCatHealth(lastInteraction, now)).toBe(CatHealth.SICK);
  });

  it('recovers to healthy immediately once cared for, no matter how sick', () => {
    const now = Date.now();
    const wayPastSick = now - SICK_AFTER_DAYS * DAY * 10;
    expect(computeCatHealth(wayPastSick, now)).toBe(CatHealth.SICK);
    // Caring for the cat means lastInteractionAt becomes "now".
    expect(computeCatHealth(now, now)).toBe(CatHealth.HEALTHY);
  });
});
