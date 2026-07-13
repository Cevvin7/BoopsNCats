import { floorCellRect, wallCellRect } from './roomGrid.js';
import './TileGridOverlay.css';

export function TileGridOverlay({ positions, region, onTapTile }) {
  const cellRect = region === 'wall' ? wallCellRect : floorCellRect;

  return (
    <div className="tile-grid-overlay">
      {positions.map((position) => {
        const rect = cellRect(position);
        return (
          <button
            key={`${position.row}-${position.col}`}
            type="button"
            className="tile-highlight"
            style={{
              left: `${rect.leftPercent}%`,
              top: `${rect.topPercent}%`,
              width: `${rect.widthPercent}%`,
              height: `${rect.heightPercent}%`,
            }}
            onClick={() => onTapTile(position)}
            aria-label={`Place at row ${position.row}, column ${position.col}`}
          />
        );
      })}
    </div>
  );
}
