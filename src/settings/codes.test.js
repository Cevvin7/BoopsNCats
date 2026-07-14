import { describe, expect, it } from 'vitest';
import { sanitizeCodeInput, redeemCode, RedeemStatus, MAX_CODE_LENGTH, PROMO_CODES } from './codes.js';

describe('sanitizeCodeInput', () => {
  it('uppercases lowercase input', () => {
    expect(sanitizeCodeInput('b00ps')).toBe('B00PS');
  });

  it('strips O and L', () => {
    expect(sanitizeCodeInput('OLOL123')).toBe('123');
  });

  it('keeps I and digits', () => {
    expect(sanitizeCodeInput('AI9K')).toBe('AI9K');
  });

  it('strips lowercase i and l too, since they get uppercased first', () => {
    // 'i' -> 'I' (kept), 'l' -> 'L' (stripped)
    expect(sanitizeCodeInput('il')).toBe('I');
  });

  it('strips non-alphanumeric characters', () => {
    expect(sanitizeCodeInput('AB-12 34!')).toBe('AB1234');
  });

  it('truncates to the max length', () => {
    expect(sanitizeCodeInput('12345678901234')).toBe('1234567890');
    expect(sanitizeCodeInput('12345678901234').length).toBe(MAX_CODE_LENGTH);
  });
});

describe('redeemCode', () => {
  it('returns success with the reward for a valid, unused code', () => {
    expect(redeemCode('B00PS', [])).toEqual({ status: RedeemStatus.SUCCESS, reward: PROMO_CODES.B00PS });
  });

  it('returns already-used for a valid code already redeemed', () => {
    expect(redeemCode('B00PS', ['B00PS'])).toEqual({ status: RedeemStatus.ALREADY_USED });
  });

  it('returns invalid for an unknown code', () => {
    expect(redeemCode('NOTREAL', [])).toEqual({ status: RedeemStatus.INVALID });
  });
});
