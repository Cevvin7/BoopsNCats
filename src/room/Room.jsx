import { CatSprite } from '../cat/CatSprite.jsx';
import { FLOOR_COLS, DEFAULT_CAT_POSITION, floorPosition } from './roomGrid.js';
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

export function Room({ catHappiness, catNeedsAttention }) {
  const catScreenPosition = floorPosition(DEFAULT_CAT_POSITION);

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
      </div>
    </div>
  );
}
