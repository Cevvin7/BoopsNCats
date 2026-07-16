import { useState } from 'react';
import { BUTTON_FRAME_WIDTH_PX, BUTTON_FRAME_HEIGHT_PX } from './hudLayout.js';
import './HudButton.css';

const spriteUrl = (name) => `${import.meta.env.BASE_URL}sprites/ui/button-${name}.png`;

/**
 * A 2-frame (up/down) sprite button, positioned by its own hotspot center
 * rather than a top-left corner so callers don't have to do that offset
 * math themselves. Pointer Events unify mouse and touch, so the same
 * down/up handlers work on both. `active` (this button's screen/mode is
 * currently open) also renders the down frame -- there's otherwise no
 * visual difference between "pressed right now" and "toggled on", and
 * both mean the same thing here: this control is currently engaged.
 */
export function HudButton({ spriteName, centerX, centerY, active, onTap, label }) {
  const [isPressed, setIsPressed] = useState(false);
  const showDownFrame = isPressed || active;

  // pointerup fires (and would flip isPressed back to false) a moment
  // *before* the click event that follows it -- if that click is what
  // flips `active` on (e.g. opening the inventory), that's a real
  // in-between render with both isPressed and active false, i.e. a
  // one-frame flash back to the "up" sprite before it lands on "down"
  // again. Deferring the reset past the click's own render (a plain
  // macrotask is enough; click always fires before it) skips that frame.
  function handlePointerUp() {
    setTimeout(() => setIsPressed(false), 0);
  }

  return (
    <button
      type="button"
      className="hud-button"
      style={{
        left: `${centerX - BUTTON_FRAME_WIDTH_PX / 2}px`,
        top: `${centerY - BUTTON_FRAME_HEIGHT_PX / 2}px`,
        backgroundImage: `url(${spriteUrl(spriteName)})`,
        backgroundPosition: showDownFrame ? `-${BUTTON_FRAME_WIDTH_PX}px 0` : '0 0',
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onClick={onTap}
      aria-label={label}
      title={label}
    />
  );
}
