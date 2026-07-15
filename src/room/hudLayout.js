// The HUD frame renders at native/unscaled size -- unlike the room art
// inside the viewport, it is NOT subject to PIXEL_SCALE's 2x integer
// scaling (see pixelScale.js). These are real CSS px.

// Screen width is locked/consistent across devices this targets, so
// viewport HEIGHT is what actually varies (browser chrome, notches,
// standalone/PWA display mode, etc.) -- that's the axis worth switching
// the frame on. 700px comfortably separates "phone in a mobile browser
// with address-bar chrome eating vertical space" (typically high 500s to
// low/mid 600s of usable height) from "phone in standalone/PWA mode, or a
// taller device" (high 600s and up) -- flag to the user if real-device
// testing suggests a different split.
export const HUD_XL_BREAKPOINT_PX = 700;

export function getHudVariant(viewportHeightPx) {
  return viewportHeightPx >= HUD_XL_BREAKPOINT_PX ? 'xl' : 'standard';
}

// Both frame PNGs share the same left/top origin and horizontal button
// hotspot positions -- only the frame's own height, the viewport window's
// height, and the buttons' Y hotspot change between variants (the XL
// variant is the standard one with extra room-viewport height inserted
// above the same bottom-of-frame button/footer layout).
export const HUD_FRAME_SPECS = {
  standard: {
    frameWidthPx: 380,
    frameHeightPx: 560,
    viewportWidthPx: 300,
    viewportHeightPx: 360,
    buttonHotspotYPx: 509.5,
  },
  xl: {
    frameWidthPx: 380,
    frameHeightPx: 700,
    viewportWidthPx: 300,
    viewportHeightPx: 500,
    buttonHotspotYPx: 649.5,
  },
};

// Where the frame art's transparent viewport hole starts, in its own
// pixels -- identical for both variants.
export const VIEWPORT_LEFT_PX = 40;
export const VIEWPORT_TOP_PX = 80;

// Button hotspot X centers, left to right -- same order as the frame art
// and the button-*.png asset names: inventory (today's edit-mode toggle),
// upload, settings.
export const BUTTON_HOTSPOT_X_PX = [217.5, 277.5, 337.5];
export const BUTTON_FRAME_WIDTH_PX = 44;
export const BUTTON_FRAME_HEIGHT_PX = 49;

// Bottom-left Boops/Energy block -- 20px art bleed + 20px margin, so it
// sits flush with the viewport's own left edge (VIEWPORT_LEFT_PX) and
// clear of the frame's rounded corner/bleed.
export const HUD_FOOTER_LEFT_PX = 40;
export const HUD_FOOTER_BOTTOM_PX = 40;
export const HUD_FOOTER_ROW_GAP_PX = 4; // gap between the Boops row and the energy pip row

export const ENERGY_PIP_COUNT = 7;
export const ENERGY_PIP_WIDTH_PX = 14;
export const ENERGY_PIP_HEIGHT_PX = 22;
export const ENERGY_PIP_GAP_PX = 2;

export const ENERGY_ROW_WIDTH_PX =
  ENERGY_PIP_COUNT * ENERGY_PIP_WIDTH_PX + (ENERGY_PIP_COUNT - 1) * ENERGY_PIP_GAP_PX;
