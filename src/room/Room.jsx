import { CatSprite } from '../cat/CatSprite.jsx';
import { PlacedItemSprite } from '../inventory/PlacedItemSprite.jsx';
import { ItemActionPopup } from '../inventory/ItemActionPopup.jsx';
import { ITEM_CATALOG, getFootprint } from '../inventory/itemCatalog.js';
import { regionForPlacementType } from '../inventory/placement.js';
import { getPlacedFace } from '../inventory/placedItemsModel.js';
import { TileGridOverlay } from './TileGridOverlay.jsx';
import { DEFAULT_CAT_POSITION, floorCellRect, wallCellRect, getFootprintScreenRect } from './roomGrid.js';
import { CAT_SPRITE_NATIVE_PX, ROOM_ART_NATIVE_WIDTH_PX, ROOM_ART_NATIVE_HEIGHT_PX, PIXEL_SCALE } from './pixelScale.js';
import './Room.css';

// import.meta.env.BASE_URL reflects vite.config.js's configured base
// ('/' in dev, '/BoopsNCats/' in production) -- a hardcoded leading '/'
// here would always resolve to the domain root and 404 once the site is
// served from a subpath, since Vite only rewrites real imports and
// index.html's own tags, not plain string literals in JS.
const FLOOR_ART_URL = `${import.meta.env.BASE_URL}sprites/room/TestFloor1.png`;
const WALL_ART_URL = `${import.meta.env.BASE_URL}sprites/room/TestWalls1.png`;

// The room always renders at a fixed pixel size -- an exact integer
// multiple (PIXEL_SCALE) of the source art's 512x448 -- so RoomViewport
// has a stable size to clip/pan against.
export const ROOM_WIDTH_PX = ROOM_ART_NATIVE_WIDTH_PX * PIXEL_SCALE;
export const ROOM_HEIGHT_PX = ROOM_ART_NATIVE_HEIGHT_PX * PIXEL_SCALE;

// Both art layers are painted on the same 512x448 canvas with transparent
// backgrounds, so stacking them at identical size/position composites them
// into one room — no separate wall/floor rectangles to size independently
// the way the placeholder divs needed. The floor/wall *grid* (rows, cols,
// and the coordinate projection used to place entities below) is
// untouched in roomGrid.js; only how the room is drawn changed.

// Every entity (cat, placed items) is positioned from the percentage-based
// roomGrid projection — percentages of the now-fixed-pixel room are just
// arithmetic, so position math didn't need to change. Footprint SIZE has
// to come from that same cell-rect percentage (not a hardcoded
// native-pixel guess): the floor grid's cells (512/8 = 64px wide at
// native res) are twice as wide as the wall grid's cells (512/2/8 = 32px
// wide), so a single hardcoded "sprite native px" applied to both regions
// rendered floor items at half their true tile size. This converts the
// item's real footprint rect (the same source of truth TileGridOverlay
// uses for tile highlighting) into whole CSS pixels against the fixed
// room size instead.
function screenRectForPlacedItem(placedItem) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const footprint = getFootprint(catalogEntry);
  const region = regionForPlacementType(catalogEntry.placementType);

  if (region === 'wall') {
    const anchor = { face: getPlacedFace(placedItem), row: placedItem.row, col: placedItem.col };
    return { ...getFootprintScreenRect(wallCellRect, anchor, footprint), region };
  }
  return { ...getFootprintScreenRect(floorCellRect, placedItem, footprint), region };
}

export function Room({ catHappiness, catNeedsAttention, placedItems, editMode, roomEditor }) {
  const catSpritePx = CAT_SPRITE_NATIVE_PX * PIXEL_SCALE;

  // The cat isn't meant to fill its whole tile -- its sprite sheet frame is
  // a real, fixed 32x32 native resolution (see pixelScale.js) -- so it
  // keeps its own native pixel size rather than the footprint-rect sizing
  // placed items use below.
  const catScreenRect = getFootprintScreenRect(floorCellRect, DEFAULT_CAT_POSITION, { width: 1, height: 1 });

  const activeRegion = roomEditor.activePlacementType
    ? regionForPlacementType(roomEditor.activePlacementType)
    : null;

  const menuItem = roomEditor.menuPlacedItem;
  const menuScreenRect = menuItem ? screenRectForPlacedItem(menuItem) : null;

  return (
    <div className="room" style={{ width: `${ROOM_WIDTH_PX}px`, height: `${ROOM_HEIGHT_PX}px` }}>
      <img className="room-art-layer" src={FLOOR_ART_URL} alt="" />
      <img className="room-art-layer" src={WALL_ART_URL} alt="" />

      <div className="room-entities">
        <div
          className="room-entity"
          style={{
            left: `${catScreenRect.leftPercent}%`,
            top: `${catScreenRect.topPercent}%`,
            width: `${catSpritePx}px`,
            height: `${catSpritePx}px`,
          }}
        >
          <CatSprite happiness={catHappiness} needsAttention={catNeedsAttention} />
        </div>

        {placedItems.map((item) => {
          const rect = screenRectForPlacedItem(item);
          const widthPx = Math.round((rect.widthPercent / 100) * ROOM_WIDTH_PX);
          const heightPx = Math.round((rect.heightPercent / 100) * ROOM_HEIGHT_PX);

          // Floor items (freeStand, onFloorAgainstWall) are anchored by
          // their BASE, not their top -- CSS `bottom` pins the footprint's
          // bottom edge in place so a sprite taller than one tile (e.g. a
          // tall bookshelf) would rise up toward the wall instead of
          // sinking down past its own floor tile. Wall-mounted items have
          // no floor to stand on, so they keep a top-left anchor instead.
          const style = { left: `${rect.leftPercent}%`, width: `${widthPx}px`, height: `${heightPx}px` };
          if (rect.region === 'wall') {
            style.top = `${rect.topPercent}%`;
          } else {
            style.bottom = `${100 - (rect.topPercent + rect.heightPercent)}%`;
          }

          return (
            <div key={item.id} className="room-entity" style={style}>
              <PlacedItemSprite
                placedItem={item}
                onTap={editMode ? () => roomEditor.tapPlacedItem(item.id) : undefined}
              />
            </div>
          );
        })}
      </div>

      {editMode && roomEditor.isSelectingTile && (
        <TileGridOverlay
          positions={roomEditor.highlightedPositions}
          region={activeRegion}
          footprint={roomEditor.activeFootprint}
          onTapTile={roomEditor.tapTile}
        />
      )}

      {editMode && menuItem && menuScreenRect && (
        <ItemActionPopup
          xPercent={menuScreenRect.leftPercent + menuScreenRect.widthPercent / 2}
          yPercent={menuScreenRect.topPercent}
          onMove={roomEditor.startMove}
          onFlip={roomEditor.flip}
          onDelete={roomEditor.remove}
          onClose={roomEditor.cancel}
        />
      )}
    </div>
  );
}
