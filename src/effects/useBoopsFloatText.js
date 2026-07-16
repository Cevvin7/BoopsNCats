import { useCallback, useState } from 'react';

let nextFloaterId = 0;
// Kept comfortably longer than the CSS rise/fade animation itself (see
// BoopsFloatLayer.css) so a floater is never yanked out of the DOM mid-fade.
const FLOATER_LIFETIME_MS = 1400;

/**
 * Manages the list of currently-rising "+N" reward texts. Any boops-earning
 * action (cat boop, GPX upload, ...) calls the same `trigger`, so the
 * visual feedback stays identical no matter which flow earned the boops.
 */
export function useBoopsFloatText() {
  const [floaters, setFloaters] = useState([]);

  const trigger = useCallback((amount) => {
    if (amount <= 0) return;
    const id = nextFloaterId++;
    setFloaters((prev) => [...prev, { id, amount }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((floater) => floater.id !== id));
    }, FLOATER_LIFETIME_MS);
  }, []);

  return { floaters, trigger };
}
