import { useEffect, useState } from 'react';
import { CAT_ANIMATIONS } from './spriteAnimation.js';

/**
 * Steps through an animation's frames using each frame's own `duration`
 * (from the Aseprite export) rather than a fixed interval, so it stays
 * correct if a future sheet has uneven frame timing. Uses a self-rescheduling
 * setTimeout instead of setInterval for the same reason — each tick reads
 * the duration of the frame it just landed on.
 */
export function useSpriteFrame(animationName) {
  const frames = CAT_ANIMATIONS[animationName] ?? [];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0); // restart from frame 0 whenever the animation changes

    if (frames.length <= 1) return undefined;

    let cancelled = false;
    let timeoutId;

    function scheduleNext(index) {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        const nextIndex = (index + 1) % frames.length;
        setFrameIndex(nextIndex);
        scheduleNext(nextIndex);
      }, frames[index].duration);
    }
    scheduleNext(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [animationName, frames]);

  return frames[frameIndex] ?? null;
}
