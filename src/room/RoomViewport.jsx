import { useEffect, useState } from 'react';
import { Room, ROOM_WIDTH_PX, ROOM_HEIGHT_PX } from './Room.jsx';
import { useCameraPan } from './useCameraPan.js';
import { useHudVariant } from './useHudVariant.js';
import { HudButton } from './HudButton.jsx';
import { UploadScreen } from '../upload/UploadScreen.jsx';
import { SettingsScreen } from '../settings/SettingsScreen.jsx';
import { ShopScreen } from '../inventory/ShopScreen.jsx';
import { BoopsFloatLayer } from '../effects/BoopsFloatLayer.jsx';
import { ConfettiBurst } from '../effects/ConfettiBurst.jsx';
import {
  HUD_FRAME_SPECS,
  VIEWPORT_LEFT_PX,
  VIEWPORT_TOP_PX,
  BUTTON_HOTSPOT_X_PX,
  HUD_FOOTER_LEFT_PX,
  HUD_FOOTER_BOTTOM_PX,
  ENERGY_PIP_COUNT,
  ENERGY_PIP_WIDTH_PX,
  ENERGY_PIP_HEIGHT_PX,
  ENERGY_PIP_GAP_PX,
  ENERGY_ROW_WIDTH_PX,
} from './hudLayout.js';
import './RoomViewport.css';

// See the matching comment in Room.jsx: BASE_URL keeps this correct under
// both dev ('/') and the production subpath ('/BoopsNCats/').
const hudFrameUrl = (variant) =>
  `${import.meta.env.BASE_URL}sprites/ui/hud-background${variant === 'xl' ? 'XL' : ''}.png`;

// Left to right, matching both the frame art and BUTTON_HOTSPOT_X_PX:
// inventory (opens the shop -- see onTapEdit's name/App.jsx for why it's
// still called "edit" under the hood), upload, settings.
const HUD_BUTTONS = [
  { key: 'inventory', spriteName: 'inventory', label: 'Inventory' },
  { key: 'upload', spriteName: 'upload', label: 'Log a walk' },
  { key: 'settings', spriteName: 'settings', label: 'Settings' },
];

/**
 * Clips the (much larger) room down to a fixed-size window sized to
 * whichever HUD variant is currently active (see useHudVariant.js). In
 * the default 'room' screen, that window lets the player drag-to-pan
 * around it, with the static decorative frame image overlaid on top
 * (purely visual -- pointer-events: none, so drags always reach the room
 * underneath it). Tapping the Upload or Settings buttons (overlaid on the
 * frame art's own button hotspots) swaps that same window to an embedded
 * screen instead, in place of the room -- camera panning only makes
 * sense for the room, so pan handlers/transform are scoped to the 'room'
 * screen alone.
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
  theme,
  onToggleTheme,
  onRedeemCode,
  onFactoryReset,
  boopsFloaters,
  confettiActive,
  inventory,
  onBuyItem,
  onPlaceItem,
  ...roomProps
}) {
  const variant = useHudVariant();
  const spec = HUD_FRAME_SPECS[variant];

  // Reset per variant -- a 404 on the standard frame shouldn't keep the
  // fallback showing forever if the player's viewport later crosses the
  // breakpoint into the XL frame (a different URL, so it deserves its own
  // chance to load).
  const [frameFailed, setFrameFailed] = useState(false);
  useEffect(() => {
    setFrameFailed(false);
  }, [variant]);

  const { offset, handlers } = useCameraPan({
    contentWidth: ROOM_WIDTH_PX,
    contentHeight: ROOM_HEIGHT_PX,
    viewportWidth: spec.viewportWidthPx,
    viewportHeight: spec.viewportHeightPx,
  });

  const buttonHandlers = {
    inventory: onTapEdit,
    upload: onTapUpload,
    settings: onTapSettings,
  };
  const buttonActive = {
    inventory: editModeActive,
    upload: screen === 'upload',
    settings: screen === 'settings',
  };

  return (
    <div
      className="room-viewport-frame"
      style={{ width: `${spec.frameWidthPx}px`, height: `${spec.frameHeightPx}px` }}
    >
      <div
        className={`room-viewport-window${screen === 'room' ? '' : ' room-viewport-window--panel'}`}
        style={{
          left: `${VIEWPORT_LEFT_PX}px`,
          top: `${VIEWPORT_TOP_PX}px`,
          width: `${spec.viewportWidthPx}px`,
          height: `${spec.viewportHeightPx}px`,
        }}
        {...(screen === 'room' ? handlers : {})}
      >
        {screen === 'room' && (
          <div className="room-viewport-camera" style={{ transform: `translate(${-offset.x}px, ${-offset.y}px)` }}>
            <Room {...roomProps} />
          </div>
        )}
        {screen === 'shop' && (
          <ShopScreen inventory={inventory} boops={boops} onBuyItem={onBuyItem} onPlaceItem={onPlaceItem} />
        )}
        {screen === 'upload' && <UploadScreen onResult={onUploadResult} lastUpload={lastUpload} />}
        {screen === 'settings' && (
          <SettingsScreen
            theme={theme}
            onToggleTheme={onToggleTheme}
            onRedeemCode={onRedeemCode}
            onFactoryReset={onFactoryReset}
          />
        )}
      </div>

      {/* The frame art has to sit BELOW the title/buttons/footer in DOM
          order, or those would be visually hidden underneath it (its
          header/footer bands are opaque, not just decorative trim) --
          pointer-events: none on the image is what keeps it from
          blocking clicks/drags either way. */}
      {!frameFailed && (
        <img
          className="room-viewport-hud"
          src={hudFrameUrl(variant)}
          alt=""
          onError={() => setFrameFailed(true)}
        />
      )}

      {/* Above the frame art and every embedded screen -- boops can be
          earned from more than one of them (the room's cat, the upload
          screen), so this stays mounted regardless of which is showing. */}
      <BoopsFloatLayer floaters={boopsFloaters} />
      <ConfettiBurst active={confettiActive} />

      <div className="room-viewport-title">Boops N Cats</div>

      {HUD_BUTTONS.map(({ key, spriteName, label }, index) => (
        <HudButton
          key={key}
          spriteName={spriteName}
          centerX={BUTTON_HOTSPOT_X_PX[index]}
          centerY={spec.buttonHotspotYPx}
          active={buttonActive[key]}
          onTap={buttonHandlers[key]}
          label={label}
        />
      ))}

      <div
        className="room-viewport-footer"
        style={{ left: `${HUD_FOOTER_LEFT_PX}px`, bottom: `${HUD_FOOTER_BOTTOM_PX}px`, width: `${ENERGY_ROW_WIDTH_PX}px` }}
      >
        <div className="room-viewport-boops-row">
          <span className="room-viewport-boops-label">Boops</span>
          <span className="room-viewport-boops-count">{boops.toLocaleString()}</span>
        </div>
        <div className="room-viewport-energy-row" style={{ gap: `${ENERGY_PIP_GAP_PX}px` }}>
          {Array.from({ length: ENERGY_PIP_COUNT }, (_, index) => (
            <span
              key={index}
              className="room-viewport-energy-pip"
              style={{ width: `${ENERGY_PIP_WIDTH_PX}px`, height: `${ENERGY_PIP_HEIGHT_PX}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
