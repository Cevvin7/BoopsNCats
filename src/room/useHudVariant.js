import { useEffect, useState } from 'react';
import { getHudVariant } from './hudLayout.js';

// Runtime check (not a one-time hardcoded choice) so rotating the device
// or (on desktop) resizing the window re-evaluates which frame fits.
export function useHudVariant() {
  const [variant, setVariant] = useState(() => getHudVariant(window.innerHeight));

  useEffect(() => {
    function handleViewportChange() {
      setVariant(getHudVariant(window.innerHeight));
    }
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  return variant;
}
