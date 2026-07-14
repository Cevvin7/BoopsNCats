import { useLocalStorage } from '../state/useLocalStorage.js';
import { PIXEL_SCALES } from './pixelScale.js';

const STORAGE_KEY = 'boopTracker.pixelScaleDoubled';

// A dedicated localStorage entry (not folded into the main game-state
// blob) since this is a display preference, not game data -- same
// useLocalStorage hook everything else in the app persists through.
export function usePixelScale() {
  const [isDoubled, setIsDoubled] = useLocalStorage(STORAGE_KEY, false);
  const scale = isDoubled ? PIXEL_SCALES.DOUBLED : PIXEL_SCALES.NORMAL;
  const toggle = () => setIsDoubled((prev) => !prev);
  return { scale, isDoubled, toggle };
}
