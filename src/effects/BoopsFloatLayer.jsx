import './BoopsFloatLayer.css';

/**
 * Renders every currently-rising "+N" text (see useBoopsFloatText.js).
 * Mounted once at the RoomViewport frame level so it floats above
 * whichever embedded screen is showing (room, upload, or settings) --
 * boops can be earned from more than one of them.
 */
export function BoopsFloatLayer({ floaters }) {
  return (
    <div className="boops-float-layer" aria-hidden="true">
      {floaters.map((floater) => (
        <span key={floater.id} className="boops-float-text">
          +{floater.amount.toLocaleString()}
        </span>
      ))}
    </div>
  );
}
