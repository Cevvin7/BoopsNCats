import { useState } from 'react';
import { Room, ROOM_WIDTH_PX, ROOM_HEIGHT_PX } from './Room.jsx';
import { useCameraPan } from './useCameraPan.js';
import './RoomViewport.css';

const FRAME_WIDTH_PX = 380;
const FRAME_HEIGHT_PX = 560;
// Where the frame art's transparent interior hole sits, in its own pixels.
const VIEWPORT_LEFT_PX = 20;
const VIEWPORT_TOP_PX = 60;
const VIEWPORT_WIDTH_PX = 340;
const VIEWPORT_HEIGHT_PX = 460;

// See the matching comment in Room.jsx: BASE_URL keeps this correct under
// both dev ('/') and the production subpath ('/BoopsNCats/').
const HUD_FRAME_URL = `${import.meta.env.BASE_URL}sprites/ui/hud-background.png`;

/**
 * Clips the (much larger) room down to a fixed 340x460 window and lets the
 * player drag-to-pan around it, with a static decorative frame image
 * overlaid on top. The frame is purely visual -- it has no role in
 * panning and never intercepts pointer events, so drags reach the room
 * underneath it all the way to the frame's inner edge.
 */
export function RoomViewport(roomProps) {
  const [frameFailed, setFrameFailed] = useState(false);
  const { offset, handlers } = useCameraPan({
    contentWidth: ROOM_WIDTH_PX,
    contentHeight: ROOM_HEIGHT_PX,
    viewportWidth: VIEWPORT_WIDTH_PX,
    viewportHeight: VIEWPORT_HEIGHT_PX,
  });

  return (
    <div className="room-viewport-frame" style={{ width: `${FRAME_WIDTH_PX}px`, height: `${FRAME_HEIGHT_PX}px` }}>
      <div
        className="room-viewport-window"
        style={{
          left: `${VIEWPORT_LEFT_PX}px`,
          top: `${VIEWPORT_TOP_PX}px`,
          width: `${VIEWPORT_WIDTH_PX}px`,
          height: `${VIEWPORT_HEIGHT_PX}px`,
        }}
        {...handlers}
      >
        <div className="room-viewport-camera" style={{ transform: `translate(${-offset.x}px, ${-offset.y}px)` }}>
          <Room {...roomProps} />
        </div>
      </div>

      {!frameFailed && (
        <img className="room-viewport-hud" src={HUD_FRAME_URL} alt="" onError={() => setFrameFailed(true)} />
      )}
    </div>
  );
}
