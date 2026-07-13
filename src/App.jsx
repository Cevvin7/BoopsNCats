import { useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { GpxUpload } from './upload/GpxUpload.jsx';
import { BoopsDisplay } from './ui/BoopsDisplay.jsx';
import './App.css';

// Phase 1 scope: upload -> parse -> calculate -> display only.
// Cat sprite, room, and the care/sickness state machine already exist
// under src/cat and src/room but are intentionally not rendered here yet.
export default function App() {
  const { boops, addBoops } = useGameState();
  const [lastUpload, setLastUpload] = useState(null);

  function handleUploadResult(result) {
    addBoops(result.boops);
    setLastUpload(result);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Boop Tracker</h1>
        <BoopsDisplay boops={boops} />
      </header>

      <section className="upload-section">
        <h2>Log a walk</h2>
        <GpxUpload onResult={handleUploadResult} />
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
      </section>
    </div>
  );
}
