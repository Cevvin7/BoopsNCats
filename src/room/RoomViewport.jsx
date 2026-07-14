import { useState } from 'react';
import { Room, ROOM_WIDTH_PX, ROOM_HEIGHT_PX } from './Room.jsx';
import { useCameraPan } from './useCameraPan.js';
import { UploadScreen } from '../upload/UploadScreen.jsx';
import { SettingsScreen } from '../settings/SettingsScreen.jsx';
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
const iconUrl = (name) => `${import.meta.env.BASE_URL}sprites/ui/icon-${name}.png`;

// Measured directly from the frame art's pixel data (three purple
// circles, each exactly 40px in diameter): centers at (254.5,29.5),
// (299.5,29.5), (344.5,29.5) in the frame's own 380x560 space -- which is
// also plain CSS px, since the frame (unlike the room) isn't scaled by
// PIXEL_SCALE.
const HIT_AREA_DIAMETER_PX = 40;
const HIT_AREA_POSITIONS = {
  edit: { centerX: 254.5, centerY: 29.5 },
  upload: { centerX: 299.5, centerY: 29.5 },
  settings: { centerX: 344.5, centerY: 29.5 },
};

/**
 * Clips the (much larger) room down to a fixed 340x460 window. In the
 * default 'room' screen, that window lets the player drag-to-pan around
 * it, with the static decorative frame image overlaid on top (purely
 * visual -- pointer-events: none, so drags always reach the room
 * underneath it). Tapping the Upload or Settings hit-areas (overlaid on
 * the frame art's own purple circles) swaps that same window to an
 * embedded screen instead, in place of the room -- camera panning only
 * makes sense for the room, so pan handlers/transform are scoped to the
 * 'room' screen alone.
 */
export function RoomViewport({
  screen,
  editModeActive,
  onTapEdit,
  onTapUpload,
  onTapSettings,
  boops,
  onUploadResult,
  lastUpload,
  ...roomProps
}) {
  const [frameFailed, setFrameFailed] = useState(false);
  const { offset, handlers } = useCameraPan({
    contentWidth: ROOM_WIDTH_PX,
    contentHeight: ROOM_HEIGHT_PX,
    viewportWidth: VIEWPORT_WIDTH_PX,
    viewportHeight: VIEWPORT_HEIGHT_PX,
  });

  const hitAreas = [
    { key: 'edit', label: 'Edit room', onTap: onTapEdit, active: editModeActive },
    { key: 'upload', label: 'Log a walk', onTap: onTapUpload, active: screen === 'upload' },
    { key: 'settings', label: 'Settings', onTap: onTapSettings, active: screen === 'settings' },
  ];

  return (
    <div className="room-viewport-frame" style={{ width: `${FRAME_WIDTH_PX}px`, height: `${FRAME_HEIGHT_PX}px` }}>
      <div
        className={`room-viewport-window${screen === 'room' ? '' : ' room-viewport-window--panel'}`}
        style={{
          left: `${VIEWPORT_LEFT_PX}px`,
          top: `${VIEWPORT_TOP_PX}px`,
          width: `${VIEWPORT_WIDTH_PX}px`,
          height: `${VIEWPORT_HEIGHT_PX}px`,
        }}
        {...(screen === 'room' ? handlers : {})}
      >
        {screen === 'room' && (
          <div className="room-viewport-camera" style={{ transform: `translate(${-offset.x}px, ${-offset.y}px)` }}>
            <Room {...roomProps} />
          </div>
        )}
        {screen === 'upload' && <UploadScreen onResult={onUploadResult} lastUpload={lastUpload} />}
        {screen === 'settings' && <SettingsScreen />}
      </div>

      {/* The frame art (including its own painted circles) has to sit
          BELOW the hit-area buttons/icons and the Boops counter in DOM
          order, or those would be visually hidden underneath it --
          pointer-events: none on the image is what keeps it from
          blocking clicks/drags either way. */}
      {!frameFailed && (
        <img className="room-viewport-hud" src={HUD_FRAME_URL} alt="" onError={() => setFrameFailed(true)} />
      )}

      {hitAreas.map(({ key, label, onTap, active }) => {
        const { centerX, centerY } = HIT_AREA_POSITIONS[key];
        return (
          <button
            key={key}
            type="button"
            className={`room-viewport-hit-area${active ? ' room-viewport-hit-area--active' : ''}`}
            style={{
              left: `${centerX - HIT_AREA_DIAMETER_PX / 2}px`,
              top: `${centerY - HIT_AREA_DIAMETER_PX / 2}px`,
              width: `${HIT_AREA_DIAMETER_PX}px`,
              height: `${HIT_AREA_DIAMETER_PX}px`,
            }}
            onClick={onTap}
            aria-label={label}
            title={label}
          >
            <img className="room-viewport-hit-area-icon" src={iconUrl(key)} alt="" />
          </button>
        );
      })}

      <div className="room-viewport-boops">
        <span className="room-viewport-boops-label">Boops</span>
        <span className="room-viewport-boops-count">{boops.toLocaleString()}</span>
      </div>
    </div>
  );
}
