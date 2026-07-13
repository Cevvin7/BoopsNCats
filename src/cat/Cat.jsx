import { useEffect, useRef, useState } from 'react';
import { CatHealth } from './catStateMachine.js';

// Files in public/ are served as-is at these paths — no bundler import
// needed. Swap these three files for your pixel art and nothing else here
// has to change.
const SPRITES = {
  idle: '/sprites/cat/idle.svg',
  walking: '/sprites/cat/walking.svg',
  sitting: '/sprites/cat/sitting.svg',
};

// Percentage-based bounds within the room so the cat stays on the floor
// and doesn't clip through walls, regardless of room pixel size.
const BOUNDS = { minX: 8, maxX: 88, minY: 55, maxY: 85 };
const SPEED_PERCENT_PER_SEC = 12;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Cat AI is intentionally dumb: pick a random spot on the floor, walk
 * there, rest a bit (sitting or idle), repeat forever. It knows nothing
 * about boops or health — `health` only changes how it's *drawn*, so this
 * component stays swappable for a real sprite/animation system later.
 */
export function Cat({ health }) {
  const [position, setPosition] = useState(() => ({
    x: randomInRange(BOUNDS.minX, BOUNDS.maxX),
    y: randomInRange(BOUNDS.minY, BOUNDS.maxY),
  }));
  const [animState, setAnimState] = useState('sitting');
  const [facingLeft, setFacingLeft] = useState(false);
  const [transitionSeconds, setTransitionSeconds] = useState(0);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    cancelledRef.current = false;

    function scheduleNextMove() {
      const restMs = randomInRange(2000, 5000);
      setAnimState(Math.random() < 0.5 ? 'sitting' : 'idle');

      timeoutRef.current = setTimeout(() => {
        if (cancelledRef.current) return;

        setPosition((prev) => {
          const next = {
            x: randomInRange(BOUNDS.minX, BOUNDS.maxX),
            y: randomInRange(BOUNDS.minY, BOUNDS.maxY),
          };
          const distance = Math.hypot(next.x - prev.x, next.y - prev.y);
          setFacingLeft(next.x < prev.x);
          setTransitionSeconds(distance / SPEED_PERCENT_PER_SEC);
          return next;
        });
        setAnimState('walking');

        const distanceMs = randomInRange(1500, 3000);
        timeoutRef.current = setTimeout(() => {
          if (cancelledRef.current) return;
          scheduleNextMove();
        }, distanceMs);
      }, restMs);
    }

    scheduleNextMove();

    return () => {
      cancelledRef.current = true;
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const isUnwell = health === CatHealth.SICK || health === CatHealth.NEEDS_ATTENTION;

  return (
    <img
      className="cat-sprite"
      src={SPRITES[animState]}
      alt={`Cat, currently ${animState}${isUnwell ? `, ${health}` : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transitionDuration: `${transitionSeconds}s`,
        transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
        filter: health === CatHealth.SICK ? 'grayscale(0.8) brightness(0.85)' : 'none',
      }}
    />
  );
}
