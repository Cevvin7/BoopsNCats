import { CatSprite } from '../cat/CatSprite.jsx';
import { PlacedItemSprite } from '../inventory/PlacedItemSprite.jsx';
import { ItemActionPopup } from '../inventory/ItemActionPopup.jsx';
import { ITEM_CATALOG, getFootprint } from '../inventory/itemCatalog.js';
import { regionForPlacementType } from '../inventory/placement.js';
import { getPlacedFace } from '../inventory/placedItemsModel.js';
import { TileGridOverlay } from './TileGridOverlay.jsx';
import { DEFAULT_CAT_POSITION, floorCellRect, wallCellRect, getFootprintScreenRect } from './roomGrid.js';
import { SPRITE_NATIVE_PX, ROOM_ART_NATIVE_WIDTH_PX, ROOM_ART_NATIVE_HEIGHT_PX } from './pixelScale.js';
import './Room.css';

// import.meta.env.BASE_URL reflects vite.config.js's configured base
// ('/' in dev, '/BoopsNCats/' in production) -- a hardcoded leading '/'
// here would always resolve to the domain root and 404 once the site is
// served from a subpath, since Vite only rewrites real imports and
// index.html's own tags, not plain string literals in JS.
const FLOOR_ART_URL = `${import.meta.env.BASE_URL}sprites/room/TestFloor1.png`;
const WALL_ART_URL = `${import.meta.env.BASE_URL}sprites/room/TestWalls1.png`;

// Both art layers are painted on the same 512x448 canvas with transparent
// backgrounds, so stacking them at identical size/position composites them
// into one room — no separate wall/floor rectangles to size independently
// the way the placeholder divs needed. The floor/wall *grid* (rows, cols,
// and the coordinate projection used to place entities below) is
// untouched in roomGrid.js; only how the room is drawn changed.

// Every entity (cat, placed items) is positioned as a top-left + width +
// height box spanning its full footprint. Position (left/top) still comes
// from the percentage-based roomGrid projection -- that's fine even
// against a now-fixed-pixel room, percentages of a fixed-size parent are
// just arithmetic. SIZE, though, is a fixed pixel value (native sprite
// resolution x scale), not a percentage -- that's the actual pixel-scaling
// fix; see pixelScale.js.
function screenRectForPlacedItem(placedItem) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const footprint = getFootprint(catalogEntry);
  const region = regionForPlacementType(catalogEntry.placementType);

  if (region === 'wall') {
    const anchor = { face: getPlacedFace(placedItem), row: placedItem.row, col: placedItem.col };
    return { ...getFootprintScreenRect(wallCellRect, anchor, footprint), footprint };
  }
  return { ...getFootprintScreenRect(floorCellRect, placedItem, footprint), footprint };
}

export function Room({ catHappiness, catNeedsAttention, placedItems, editMode, roomEditor, scale }) {
  const roomWidthPx = ROOM_ART_NATIVE_WIDTH_PX * scale;
  const roomHeightPx = ROOM_ART_NATIVE_HEIGHT_PX * scale;
  const spritePx = SPRITE_NATIVE_PX * scale;

  const catScreenRect = getFootprintScreenRect(floorCellRect, DEFAULT_CAT_POSITION, { width: 1, height: 1 });

  const activeRegion = roomEditor.activePlacementType
    ? regionForPlacementType(roomEditor.activePlacementType)
    : null;

  const menuItem = roomEditor.menuPlacedItem;
  const menuScreenRect = menuItem ? screenRectForPlacedItem(menuItem) : null;

  return (
    <div className="room-scroll">
      <div className="room" style={{ width: `${roomWidthPx}px`, height: `${roomHeightPx}px` }}>
        <img className="room-art-layer" src={FLOOR_ART_URL} alt="" />
        <img className="room-art-layer" src={WALL_ART_URL} alt="" />

        <div className="room-entities">
          <div
            className="room-entity"
            style={{
              left: `${catScreenRect.leftPercent}%`,
              top: `${catScreenRect.topPercent}%`,
              width: `${spritePx}px`,
              height: `${spritePx}px`,
            }}
          >
            <CatSprite happiness={catHappiness} needsAttention={catNeedsAttention} />
          </div>

          {placedItems.map((item) => {
            const rect = screenRectForPlacedItem(item);
            return (
              <div
                key={item.id}
                className="room-entity"
                style={{
                  left: `${rect.leftPercent}%`,
                  top: `${rect.topPercent}%`,
                  width: `${SPRITE_NATIVE_PX * rect.footprint.width * scale}px`,
                  height: `${SPRITE_NATIVE_PX * rect.footprint.height * scale}px`,
                }}
              >
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
    </div>
  );
}
