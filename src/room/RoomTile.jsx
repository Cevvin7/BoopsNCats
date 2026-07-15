import { spriteStripBackgroundStyle } from './spriteStrip.js';
import './RoomTile.css';

/** One floor or wall tile, positioned by its own cell rect (percentages of the room). */
export function RoomTile({ rect, sheetUrl, frameCount, frameIndex }) {
  return (
    <div
      className="room-tile"
      style={{
        left: `${rect.leftPercent}%`,
        top: `${rect.topPercent}%`,
        width: `${rect.widthPercent}%`,
        height: `${rect.heightPercent}%`,
        backgroundImage: `url(${sheetUrl})`,
        ...spriteStripBackgroundStyle({ frameCount, frameIndex }),
      }}
    />
  );
}
