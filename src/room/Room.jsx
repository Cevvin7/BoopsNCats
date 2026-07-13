import { CatSprite } from '../cat/CatSprite.jsx';
import { PlacedItemSprite } from '../inventory/PlacedItemSprite.jsx';
import { ItemActionPopup } from '../inventory/ItemActionPopup.jsx';
import { ITEM_CATALOG, getFootprint } from '../inventory/itemCatalog.js';
import { regionForPlacementType } from '../inventory/placement.js';
import { getPlacedFace } from '../inventory/placedItemsModel.js';
import { TileGridOverlay } from './TileGridOverlay.jsx';
import { DEFAULT_CAT_POSITION, floorCellRect, wallCellRect, getFootprintScreenRect } from './roomGrid.js';
import './Room.css';

const FLOOR_ART_URL = '/sprites/room/TestFloor1.png';
const WALL_ART_URL = '/sprites/room/TestWalls1.png';

// Both art layers are painted on the same 512x448 canvas with transparent
// backgrounds, so stacking them at identical size/position composites them
// into one room — no separate wall/floor rectangles to size independently
// the way the placeholder divs needed. The floor/wall *grid* (rows, cols,
// and the coordinate projection used to place entities below) is
// untouched in roomGrid.js; only how the room is drawn changed.
const ROOM_ART_ASPECT_RATIO = 512 / 448;

// Every entity (cat, placed items) is rendered as a top-left + width +
// height box spanning its full footprint, rather than a single centered
// point — a 4x1 shelf and a 1x1 plant both need their real footprint's
// bounding box, not just an anchor tile's center.
function screenRectForPlacedItem(placedItem) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const footprint = getFootprint(catalogEntry);
  const region = regionForPlacementType(catalogEntry.placementType);

  if (region === 'wall') {
    const anchor = { face: getPlacedFace(placedItem), row: placedItem.row, col: placedItem.col };
    return getFootprintScreenRect(wallCellRect, anchor, footprint);
  }
  return getFootprintScreenRect(floorCellRect, placedItem, footprint);
}

export function Room({ catHappiness, catNeedsAttention, placedItems, editMode, roomEditor }) {
  const catScreenRect = getFootprintScreenRect(floorCellRect, DEFAULT_CAT_POSITION, { width: 1, height: 1 });

  const activeRegion = roomEditor.activePlacementType
    ? regionForPlacementType(roomEditor.activePlacementType)
    : null;

  const menuItem = roomEditor.menuPlacedItem;
  const menuScreenRect = menuItem ? screenRectForPlacedItem(menuItem) : null;

  return (
    <div className="room" style={{ aspectRatio: ROOM_ART_ASPECT_RATIO }}>
      <img className="room-art-layer" src={FLOOR_ART_URL} alt="" />
      <img className="room-art-layer" src={WALL_ART_URL} alt="" />

      <div className="room-entities">
        <div
          className="room-entity"
          style={{
            left: `${catScreenRect.leftPercent}%`,
            top: `${catScreenRect.topPercent}%`,
            width: `${catScreenRect.widthPercent}%`,
            height: `${catScreenRect.heightPercent}%`,
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
                width: `${rect.widthPercent}%`,
                height: `${rect.heightPercent}%`,
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
  );
}
