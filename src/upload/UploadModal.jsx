import { GpxUpload } from './GpxUpload.jsx';
import './UploadModal.css';

// Same backdrop-click-to-close pattern as ItemActionPopup: a full-screen
// backdrop closes the modal, and the dialog itself stops that click from
// bubbling up so interacting with the dropzone doesn't dismiss it.
export function UploadModal({ onResult, lastUpload, onClose }) {
  return (
    <div className="upload-modal-backdrop" onClick={onClose}>
      <div className="upload-modal" onClick={(event) => event.stopPropagation()}>
        <div className="upload-modal-header">
          <h2>Log a walk</h2>
          <button type="button" className="upload-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <GpxUpload onResult={onResult} />
        {lastUpload && (
          <div className="upload-summary">
            <p>
              <strong>{lastUpload.fileName}</strong>
            </p>
            <p>
              {lastUpload.miles.toFixed(2)} mi ({lastUpload.km.toFixed(2)} km)
            </p>
            <p>+{lastUpload.boops.toLocaleString()} boops earned</p>
          </div>
        )}
      </div>
    </div>
  );
}
