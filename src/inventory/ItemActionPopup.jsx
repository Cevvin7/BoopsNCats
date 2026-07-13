import './ItemActionPopup.css';

export function ItemActionPopup({ xPercent, yPercent, onMove, onFlip, onDelete, onClose }) {
  return (
    <>
      {/* Tapping anywhere else in the room closes the menu without acting. */}
      <div className="item-action-popup-backdrop" onClick={onClose} />
      <div className="item-action-popup" style={{ left: `${xPercent}%`, top: `${yPercent}%` }}>
        <button type="button" onClick={onMove}>
          Move
        </button>
        <button type="button" onClick={onFlip}>
          Flip
        </button>
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </>
  );
}
