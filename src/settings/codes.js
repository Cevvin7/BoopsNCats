// Allowed charset excludes O (visually confusable with 0 -- codes use only
// the digit) and L (visually confusable with 1/I -- I remains available).
const ALLOWED_CHARS_PATTERN = /[^0-9A-KM-NP-Z]/g;
export const MAX_CODE_LENGTH = 10;

// Applied to the input's value on every keystroke: uppercases, strips any
// disallowed character, and truncates -- so the field can never even
// contain something an entered code wouldn't match.
export function sanitizeCodeInput(rawValue) {
  return rawValue.toUpperCase().replace(ALLOWED_CHARS_PATTERN, '').slice(0, MAX_CODE_LENGTH);
}

// Hardcoded lookup table of valid codes -> rewards. Update this map to add
// new promo codes; no backend involved.
export const PROMO_CODES = {
  B00PS: { boops: 100 },
};

export const RedeemStatus = {
  SUCCESS: 'success',
  INVALID: 'invalid',
  ALREADY_USED: 'already-used',
};

// Pure decision of what redeeming `code` against `redeemedCodes` (the list
// of codes already claimed, from persisted state) should do. Doesn't
// mutate anything -- the caller applies the reward/records the code.
export function redeemCode(code, redeemedCodes) {
  const reward = PROMO_CODES[code];
  if (!reward) return { status: RedeemStatus.INVALID };
  if (redeemedCodes.includes(code)) return { status: RedeemStatus.ALREADY_USED };
  return { status: RedeemStatus.SUCCESS, reward };
}
