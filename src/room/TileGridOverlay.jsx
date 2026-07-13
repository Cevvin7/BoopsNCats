import { Fragment } from 'react';
import { floorCellRect, wallCellRect, getFootprintScreenRect } from './roomGrid.js';
import './TileGridOverlay.css';

const SINGLE_TILE = { width: 1, height: 1 };

/**
 * Renders two layers per valid anchor: a footprint-sized preview (the
 * full contiguous block the item would occupy) and a separate 1-cell
 * click target at just the anchor itself. Neighboring anchors' footprint
 * previews routinely overlap (e.g. a 4-wide shelf has adjacent starting
 * columns whose footprints mostly cover the same tiles) — if the preview
 * itself were the click target, whichever one rendered last would
 * intercept clicks meant for an anchor underneath it. Anchor tiles never
 * overlap each other, so making *that* the real target keeps every valid
 * position individually clickable regardless of how much the previews
 * visually overlap.
 */
export function TileGridOverlay({ positions, region, footprint = SINGLE_TILE, onTapTile }) {
  const cellRect = region === 'wall' ? wallCellRect : floorCellRect;

  return (
    <div className="tile-grid-overlay">
      {positions.map((position) => {
        const previewRect = getFootprintScreenRect(cellRect, position, footprint);
        const anchorRect = cellRect(position);
        const key = `${position.face ?? 'floor'}-${position.row}-${position.col}`;
        const label = `Place at row ${position.row}, column ${position.col}${position.face ? `, ${position.face} wall` : ''}`;

        return (
          <Fragment key={key}>
            <div
              className="tile-highlight-preview"
              style={{
                left: `${previewRect.leftPercent}%`,
                top: `${previewRect.topPercent}%`,
                width: `${previewRect.widthPercent}%`,
                height: `${previewRect.heightPercent}%`,
              }}
            />
            <button
              type="button"
              className="tile-highlight-anchor"
              style={{
                left: `${anchorRect.leftPercent}%`,
                top: `${anchorRect.topPercent}%`,
                width: `${anchorRect.widthPercent}%`,
                height: `${anchorRect.heightPercent}%`,
              }}
              onClick={() => onTapTile(position)}
              aria-label={label}
              title={label}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
