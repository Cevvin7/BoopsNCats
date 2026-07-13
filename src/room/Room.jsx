import { PlaceholderCat } from '../cat/PlaceholderCat.jsx';
import {
  FLOOR_ROWS,
  FLOOR_COLS,
  WALL_ROWS,
  WALL_COLS,
  WALL_REGION,
  FLOOR_REGION,
  ROOM_ASPECT_RATIO,
  DEFAULT_CAT_POSITION,
  floorPosition,
} from './roomGrid.js';
import './Room.css';

function GridTiles({ rows, cols, className }) {
  return Array.from({ length: rows * cols }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return <div key={`${row}-${col}`} className={className} data-row={row} data-col={col} />;
  });
}

// Single hardcoded room for now — multiple rooms, flooring/wallpaper
// choices, and item placement (Phase 4) would all hook in here without
// touching the coordinate math in roomGrid.js.
export function Room({ catHappiness, catNeedsAttention }) {
  const catScreenPosition = floorPosition(DEFAULT_CAT_POSITION);

  return (
    <div className="room" style={{ aspectRatio: ROOM_ASPECT_RATIO }}>
      <div className="wall-area" style={{ flex: `0 0 ${WALL_REGION.height * 100}%` }}>
        <div
          className="wall-grid"
          style={{
            gridTemplateColumns: `repeat(${WALL_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${WALL_ROWS}, 1fr)`,
          }}
        >
          <GridTiles rows={WALL_ROWS} cols={WALL_COLS} className="wall-slot" />
        </div>
      </div>

      <div className="floor-area" style={{ flex: `0 0 ${FLOOR_REGION.height * 100}%` }}>
        <div
          className="floor-grid"
          style={{
            gridTemplateColumns: `repeat(${FLOOR_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${FLOOR_ROWS}, 1fr)`,
          }}
        >
          <GridTiles rows={FLOOR_ROWS} cols={FLOOR_COLS} className="floor-tile" />
        </div>
      </div>

      <div className="room-entities">
        <div
          className="room-entity"
          style={{
            left: `${catScreenPosition.xPercent}%`,
            top: `${catScreenPosition.yPercent}%`,
            width: `${(1 / FLOOR_COLS) * 100}%`,
          }}
        >
          <PlaceholderCat happiness={catHappiness} needsAttention={catNeedsAttention} />
        </div>
      </div>
    </div>
  );
}
