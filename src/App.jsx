import { useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { GpxUpload } from './upload/GpxUpload.jsx';
import { BoopsDisplay } from './ui/BoopsDisplay.jsx';
import { PlaceholderCat } from './cat/PlaceholderCat.jsx';
import './App.css';

// Phase 2 adds cat happiness on top of Phase 1's upload -> parse ->
// calculate -> display pipeline. Room/sprite/inventory UI still isn't
// built yet — this phase is state + a placeholder box only.
export default function App() {
  const { boops, cat, needsAttention, addBoops, recordActivityUpload, advanceOneDayForTesting } =
    useGameState();
  const [lastUpload, setLastUpload] = useState(null);

  function handleUploadResult(result) {
    addBoops(result.boops);
    recordActivityUpload();
    setLastUpload(result);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Boop Tracker</h1>
        <BoopsDisplay boops={boops} />
      </header>

      <PlaceholderCat happiness={cat.happiness} needsAttention={needsAttention} />

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

      {/* DEV-ONLY — exercises the real decay logic a day at a time so you
          don't have to wait a literal week to see happiness drop. Vite
          strips this out of production builds via import.meta.env.DEV. */}
      {import.meta.env.DEV && (
        <section className="dev-tools">
          <p>Dev tool (not shipped in production build):</p>
          <button type="button" onClick={advanceOneDayForTesting}>
            Advance one day
          </button>
        </section>
      )}
    </div>
  );
}
