import { useCallback, useRef, useState } from 'react';

// A gesture only starts panning once it moves past this many pixels, so a
// plain tap (selecting a tile or a placed item underneath the viewport)
// still reaches its own click handler undisturbed -- only once the
// threshold is crossed do we take pointer capture, which also reroutes the
// eventual click event away from whatever's under the finger/cursor.
const DRAG_THRESHOLD_PX = 6;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Tracks a clamped camera offset (x, y) for panning a fixed-size content
 * layer inside a smaller viewport window. Driven entirely by Pointer
 * Events, which unify mouse drag (desktop) and touch drag (mobile) behind
 * one API -- no separate mouse/touch handlers needed.
 */
export function useCameraPan({ contentWidth, contentHeight, viewportWidth, viewportHeight }) {
  const maxOffsetX = Math.max(0, contentWidth - viewportWidth);
  const maxOffsetY = Math.max(0, contentHeight - viewportHeight);

  // Centered by default rather than pinned to a corner.
  const [offset, setOffset] = useState(() => ({
    x: clamp(maxOffsetX / 2, 0, maxOffsetX),
    y: clamp(maxOffsetY / 2, 0, maxOffsetY),
  }));

  const dragRef = useRef(null);

  const onPointerDown = useCallback(
    (event) => {
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffset: offset,
        isDragging: false,
      };
    },
    [offset],
  );

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startClientX;
      const dy = event.clientY - drag.startClientY;

      if (!drag.isDragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
        drag.isDragging = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      setOffset({
        x: clamp(drag.startOffset.x - dx, 0, maxOffsetX),
        y: clamp(drag.startOffset.y - dy, 0, maxOffsetY),
      });
    },
    [maxOffsetX, maxOffsetY],
  );

  const endDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === event.pointerId && drag.isDragging) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }, []);

  return {
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
