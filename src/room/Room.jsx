import { CatSprite } from '../cat/CatSprite.jsx';
import { PlacedItemSprite } from '../inventory/PlacedItemSprite.jsx';
import { ItemActionPopup } from '../inventory/ItemActionPopup.jsx';
import { ITEM_CATALOG, getFootprint } from '../inventory/itemCatalog.js';
import { regionForPlacementType, orientedFootprintForPlacedItem } from '../inventory/placement.js';
import { getPlacedFace } from '../inventory/placedItemsModel.js';
import { TileGridOverlay } from './TileGridOverlay.jsx';
import { floorCellRect, wallCellRect, floorPointPosition, getFootprintScreenRect } from './roomGrid.js';
import { sortByDepth } from './depthSort.js';
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
// arithmetic, so position math didn't need to change. Footprint WIDTH has
// to come from that same cell-rect percentage (not a hardcoded
// native-pixel guess): the floor grid's cells (512/8 = 64px wide at
// native res) are twice as wide as the wall grid's cells (512/2/8 = 32px
// wide), so a single hardcoded "sprite native px" applied to both regions
// rendered floor items at half their true tile size. This converts the
// item's real footprint rect (the same source of truth TileGridOverlay
// uses for tile highlighting) into whole CSS pixels against the fixed
// room size instead.
//
// HEIGHT is deliberately not part of that same footprint-rect math.
// footprint.height only describes how much floor/wall depth an item's
// base occupies for placement/collision purposes -- it says nothing
// about how tall the item's own art actually is (a tall bookshelf still
// only occupies one tile of depth even though it visually rises well
// above it). Catalog entries can declare their own native-pixel
// spriteHeightPx for this; entries that don't (no real art yet) fall
// back to the old footprint-height-implies-canvas-height assumption so
// they keep rendering exactly as before.
function screenRectForPlacedItem(placedItem) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const region = regionForPlacementType(catalogEntry.placementType);

  if (region === 'wall') {
    const anchor = { face: getPlacedFace(placedItem), row: placedItem.row, col: placedItem.col };
    return { ...getFootprintScreenRect(wallCellRect, anchor, getFootprint(catalogEntry)), region };
  }
  // onFloorAgainstWall items against the left wall need their catalog
  // footprint transposed (see placement.js's orientedFootprintForPlacedItem)
  // or their rendered box would use the wrong axis; freeStand items pass
  // through unchanged.
  return { ...getFootprintScreenRect(floorCellRect, placedItem, orientedFootprintForPlacedItem(placedItem)), region };
}

// The Y coordinate (room-relative percent) of an entity's own "contact
// point" with the room -- the bottom edge for floor entities (they stand
// on the floor, so their front-most point is what should occlude/be
// occluded by neighbors) and the top edge for wall-mounted ones (they
// hang from their mount point instead, with nothing below them to anchor
// to). This is also exactly the Y each entity is already rendered at
// (see the `style` blocks below), so depth-sorting by it is just "draw
// entities in the same back-to-front order their own anchor points are
// already in" -- no separate/duplicate notion of depth to keep in sync.
// It works uniformly across floor items, wall items, and the cat without
// special-casing any of them: the wall's Y range sits entirely above the
// floor's (see roomGrid.js), so wall-mounted items always land behind
// every floor entity automatically, just from the numbers.
function contactYPercent(rect) {
  return rect.region === 'wall' ? rect.topPercent : rect.topPercent + rect.heightPercent;
}

export function Room({ catHappiness, catNeedsAttention, catWander, placedItems, editMode, roomEditor }) {
  const catSpritePx = CAT_SPRITE_NATIVE_PX * PIXEL_SCALE;

  // The cat isn't meant to fill its whole tile -- its sprite sheet frame is
  // a real, fixed 32x32 native resolution (see pixelScale.js) -- so it
  // keeps its own native pixel size rather than the footprint-rect sizing
  // placed items use below. Its position is continuous, not tile-snapped
  // (useCatWander.js), so it's projected with floorPointPosition (a raw
  // point) rather than a tile's own cell rect.
  const catPoint = floorPointPosition(catWander.position);

  const activeRegion = roomEditor.activePlacementType
    ? regionForPlacementType(roomEditor.activePlacementType)
    : null;

  const menuItem = roomEditor.menuPlacedItem;
  const menuScreenRect = menuItem ? screenRectForPlacedItem(menuItem) : null;

  // One combined list of every positioned entity in the scene -- the cat
  // and every placed item -- so they can be depth-sorted together instead
  // of the cat always drawing first and items always drawing in whatever
  // order they were placed. sortByDepth doesn't know or care that these
  // are cats and furniture; it just orders by the numeric depth each
  // entity reports (see contactYPercent above), which is what makes this
  // the same utility that'll place a *moving* cat correctly among items
  // once movement lands, with no rework here.
  const catEntity = {
    key: 'cat',
    // Recomputed from the cat's live interpolated point every render, not
    // its destination tile -- while it's mid-walk this updates every
    // animation frame (useCatWander's position state), so it correctly
    // slots in front of/behind furniture as it actually crosses the room,
    // not just once it arrives.
    depth: catPoint.yPercent,
    node: (
      <div
        key="cat"
        className="room-entity"
        style={{
          left: `${catPoint.xPercent}%`,
          bottom: `${100 - catPoint.yPercent}%`,
          width: `${catSpritePx}px`,
          height: `${catSpritePx}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <CatSprite
          happiness={catHappiness}
          needsAttention={catNeedsAttention}
          animationName={catWander.animationName}
          flipped={catWander.facingLeft}
        />
      </div>
    ),
  };

  const itemEntities = placedItems.map((item) => {
    const catalogEntry = ITEM_CATALOG[item.itemId];
    const rect = screenRectForPlacedItem(item);
    const widthPx = Math.round((rect.widthPercent / 100) * ROOM_WIDTH_PX);
    const heightPx =
      catalogEntry.spriteHeightPx != null
        ? Math.round(catalogEntry.spriteHeightPx * PIXEL_SCALE)
        : Math.round((rect.heightPercent / 100) * ROOM_HEIGHT_PX);

    // Anchored bottom-center: horizontally centered on the footprint's
    // own center (via left% + translateX(-50%), so it stays centered
    // regardless of the box's actual pixel width), vertically pinned at
    // the footprint's contact edge with the room -- the bottom for floor
    // items (they stand on the floor, so a sprite taller than its
    // footprint rises UP toward the wall instead of sinking down past
    // its own tile) and the top for wall items (they hang from their
    // mount point instead).
    const style = {
      left: `${rect.leftPercent + rect.widthPercent / 2}%`,
      width: `${widthPx}px`,
      height: `${heightPx}px`,
      transform: 'translateX(-50%)',
    };
    if (rect.region === 'wall') {
      style.top = `${rect.topPercent}%`;
    } else {
      style.bottom = `${100 - (rect.topPercent + rect.heightPercent)}%`;
    }

    return {
      key: item.id,
      depth: contactYPercent(rect),
      node: (
        <div key={item.id} className="room-entity" style={style}>
          <PlacedItemSprite
            placedItem={item}
            onTap={editMode ? () => roomEditor.tapPlacedItem(item.id) : undefined}
          />
        </div>
      ),
    };
  });

  const sceneEntities = sortByDepth([catEntity, ...itemEntities], (entity) => entity.depth);

  return (
    <div className="room" style={{ width: `${ROOM_WIDTH_PX}px`, height: `${ROOM_HEIGHT_PX}px` }}>
      <img className="room-art-layer" src={FLOOR_ART_URL} alt="" />
      <img className="room-art-layer" src={WALL_ART_URL} alt="" />

      <div className="room-entities">{sceneEntities.map((entity) => entity.node)}</div>

      {editMode && roomEditor.isSelectingTile && (
        <TileGridOverlay
          positions={roomEditor.highlightedPositions}
          region={activeRegion}
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
