import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CAT_POSITION } from '../room/roomGrid.js';
import { getOccupiedFloorTiles } from '../inventory/placement.js';
import {
  WALK_ANIMATION,
  pickWanderDestinationTile,
  randomPointInTile,
  pickIdleAnimation,
  randomIdleIntervalMs,
  randomWanderIntervalMs,
  walkDurationMs,
} from './catWander.js';

// DEFAULT_CAT_POSITION is a tile INDEX (its back corner in continuous grid
// terms); +0.5 both axes gives that tile's center, matching where the cat
// used to sit before it could move at all.
const INITIAL_POSITION = { row: DEFAULT_CAT_POSITION.row + 0.5, col: DEFAULT_CAT_POSITION.col + 0.5 };

/**
 * Drives the cat's idle wandering: every ~30s it picks a new destination
 * and walks to it (retargeting smoothly if it's already mid-walk), and
 * while idle it randomly alternates between the two idle poses every
 * 30-240s. Returns a continuous {row, col} position (not tile-snapped --
 * suitable for roomGrid.js's floorPointPosition) and the animation name
 * that should currently be playing.
 *
 * `paused` (wired to the cat's needsAttention state) stops scheduling
 * *new* wander/idle cycles without yanking an in-flight walk out from
 * under it -- the walk still finishes, then the cat just stays put
 * showing its needs-attention pose instead of continuing to wander.
 */
export function useCatWander({ placedItems, paused = false }) {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [status, setStatus] = useState('idle'); // 'idle' | 'walking'
  const [idleAnimation, setIdleAnimation] = useState(() => pickIdleAnimation());
  const [walk, setWalk] = useState(null); // { from, to, startTime, durationMs }

  const positionRef = useRef(position);
  positionRef.current = position;
  const placedItemsRef = useRef(placedItems);
  placedItemsRef.current = placedItems;
  const claimedTileRef = useRef(null);

  const startWander = useCallback(() => {
    const occupied = getOccupiedFloorTiles(placedItemsRef.current);
    const isTileFree = (tile) => !occupied.has(`${tile.row},${tile.col}`);
    const destinationTile = pickWanderDestinationTile({ isTileFree, excludeTile: claimedTileRef.current });
    if (!destinationTile) return; // no free tile this cycle -- try again next heartbeat

    claimedTileRef.current = destinationTile;
    const from = positionRef.current;
    const to = randomPointInTile(destinationTile);
    const distance = Math.hypot(to.row - from.row, to.col - from.col);

    setWalk({ from, to, startTime: performance.now(), durationMs: walkDurationMs(distance) });
    setStatus('walking');
  }, []);

  // Recurring wander heartbeat -- fires every ~30s regardless of current
  // status, starting a fresh walk if idle or retargeting (smoothly, from
  // wherever the cat currently is) if already walking.
  useEffect(() => {
    if (paused) return undefined;
    let timeoutId;
    function tick() {
      startWander();
      timeoutId = setTimeout(tick, randomWanderIntervalMs());
    }
    timeoutId = setTimeout(tick, randomWanderIntervalMs());
    return () => clearTimeout(timeoutId);
  }, [paused, startWander]);

  // Idle animation reroll -- only ticks while idle. A walk starting
  // (status flipping to 'walking') unmounts this effect, which is
  // "interrupted immediately" for free: useSpriteFrame restarts whenever
  // the rendered animation name changes, and the walk effect below takes
  // over rendering 'Walking' instead.
  useEffect(() => {
    if (paused || status !== 'idle') return undefined;
    const id = setTimeout(() => setIdleAnimation(pickIdleAnimation()), randomIdleIntervalMs());
    return () => clearTimeout(id);
  }, [paused, status, idleAnimation]);

  // Walk interpolation. Re-runs (cancelling the previous frame loop and
  // starting fresh from the new `walk`) whenever `walk` changes, which is
  // exactly what a mid-walk retarget needs: the new walk's `from` is
  // already wherever the cat currently was, so this just smoothly
  // continues toward the new target instead of snapping or waiting.
  useEffect(() => {
    if (status !== 'walking' || !walk) return undefined;
    let rafId;
    function tick(now) {
      const t = walk.durationMs <= 0 ? 1 : Math.min(1, (now - walk.startTime) / walk.durationMs);
      setPosition({
        row: walk.from.row + (walk.to.row - walk.from.row) * t,
        col: walk.from.col + (walk.to.col - walk.from.col) * t,
      });
      if (t >= 1) {
        claimedTileRef.current = null; // arrived -- release the destination claim
        setStatus('idle');
        setWalk(null);
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [status, walk]);

  return {
    position,
    animationName: status === 'walking' ? WALK_ANIMATION : idleAnimation,
  };
}
