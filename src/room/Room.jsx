import { CatSprite } from '../cat/CatSprite.jsx';
import { PlacedItemSprite } from '../inventory/PlacedItemSprite.jsx';
import { ItemActionPopup } from '../inventory/ItemActionPopup.jsx';
import { ITEM_CATALOG } from '../inventory/itemCatalog.js';
import { regionForPlacementType } from '../inventory/placement.js';
import { TileGridOverlay } from './TileGridOverlay.jsx';
import { FLOOR_COLS, WALL_COLS, DEFAULT_CAT_POSITION, floorPosition, wallPosition } from './roomGrid.js';
import './Room.css';

const FLOOR_ART_URL = '/sprites/room/TestFloor1.png';
const WALL_ART_URL = '/sprites/room/TestWalls1.png';

// Both art layers are painted on the same 512x448 canvas with transparent
// backgrounds, so stacking them at identical size/position composites them
// into one room — no separate wall/floor rectangles to size independently
// the way the placeholder divs needed. The floor/wall *grid* (rows, cols,
// and the coordinate projection used to place the cat below) is untouched
// in roomGrid.js; only how the room is drawn changed.
const ROOM_ART_ASPECT_RATIO = 512 / 448;

// A floor-region item is sized to one floor cell's width, a wall-region
// item to one wall cell's width — the two grids have different column
// counts (8 vs 5), so they need different width fractions.
function projectAndSize(placementType, position) {
  const region = regionForPlacementType(placementType);
  if (region === 'wall') {
    return { ...wallPosition(position), widthPercent: (1 / WALL_COLS) * 100 };
  }
  return { ...floorPosition(position), widthPercent: (1 / FLOOR_COLS) * 100 };
}

export function Room({ catHappiness, catNeedsAttention, placedItems, editMode, roomEditor }) {
  const catScreenPosition = floorPosition(DEFAULT_CAT_POSITION);

  const activeRegion = roomEditor.activePlacementType
    ? regionForPlacementType(roomEditor.activePlacementType)
    : null;

  const menuItem = roomEditor.menuPlacedItem;
  const menuScreenPosition = menuItem
    ? projectAndSize(ITEM_CATALOG[menuItem.itemId].placementType, menuItem)
    : null;

  return (
    <div className="room" style={{ aspectRatio: ROOM_ART_ASPECT_RATIO }}>
      <img className="room-art-layer" src={FLOOR_ART_URL} alt="" />
      <img className="room-art-layer" src={WALL_ART_URL} alt="" />

      <div className="room-entities">
        <div
          className="room-entity"
          style={{
            left: `${catScreenPosition.xPercent}%`,
            top: `${catScreenPosition.yPercent}%`,
            width: `${(1 / FLOOR_COLS) * 100}%`,
          }}
        >
          <CatSprite happiness={catHappiness} needsAttention={catNeedsAttention} />
        </div>

        {placedItems.map((item) => {
          const catalogEntry = ITEM_CATALOG[item.itemId];
          const screenPosition = projectAndSize(catalogEntry.placementType, item);
          return (
            <div
              key={item.id}
              className="room-entity"
              style={{
                left: `${screenPosition.xPercent}%`,
                top: `${screenPosition.yPercent}%`,
                width: `${screenPosition.widthPercent}%`,
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
          onTapTile={roomEditor.tapTile}
        />
      )}

      {editMode && menuItem && menuScreenPosition && (
        <ItemActionPopup
          xPercent={menuScreenPosition.xPercent}
          yPercent={menuScreenPosition.yPercent}
          onMove={roomEditor.startMove}
          onFlip={roomEditor.flip}
          onDelete={roomEditor.remove}
          onClose={roomEditor.cancel}
        />
      )}
    </div>
  );
}
