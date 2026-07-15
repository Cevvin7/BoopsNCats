import { floorCellRect, wallCellRect } from './roomGrid.js';
import './TileGridOverlay.css';

/**
 * Renders one marker per valid anchor position, centered on that tile.
 * Footprint doesn't affect this at all -- every position in `positions`
 * is already a valid anchor for the item being placed (see useRoomEditor),
 * so there's no separate multi-cell preview to draw; the marker alone
 * (plus its own larger invisible tap target) tells the player where they
 * can place their item's anchor point.
 */
export function TileGridOverlay({ positions, region, onTapTile }) {
  const cellRect = region === 'wall' ? wallCellRect : floorCellRect;

  return (
    <div className="tile-grid-overlay">
      {positions.map((position) => {
        const rect = cellRect(position);
        const centerXPercent = rect.leftPercent + rect.widthPercent / 2;
        const centerYPercent = rect.topPercent + rect.heightPercent / 2;
        const key = `${position.face ?? 'floor'}-${position.row}-${position.col}`;
        const label = `Place at row ${position.row}, column ${position.col}${position.face ? `, ${position.face} wall` : ''}`;

        return (
          <div
            key={key}
            className="tile-marker-anchor"
            style={{ left: `${centerXPercent}%`, top: `${centerYPercent}%` }}
          >
            <span className="tile-marker-beam" aria-hidden="true" />
            <svg className="tile-marker-cube" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path
                d="M18 3 L33 11 L33 25 L18 33 L3 25 L3 11 Z M18 18 L18 3 M18 18 L3 25 M18 18 L33 25"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <button
              type="button"
              className="tile-marker-tap-target"
              onClick={() => onTapTile(position)}
              aria-label={label}
              title={label}
            />
          </div>
        );
      })}
    </div>
  );
}
