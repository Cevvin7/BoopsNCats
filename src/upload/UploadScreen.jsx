import { GpxUpload } from './GpxUpload.jsx';
import './UploadScreen.css';

// Embedded directly in RoomViewport's screen area (see the `screen` prop
// there) instead of a floating modal -- App.jsx swaps back to the room
// screen once a file's been processed, so this component doesn't need
// its own close affordance.
export function UploadScreen({ onResult, lastUpload }) {
  return (
    <div className="upload-screen">
      <h2>Log a walk</h2>
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
  );
}
