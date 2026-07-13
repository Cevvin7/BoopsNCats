import { useMemo, useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { computeCatHealth } from './cat/catStateMachine.js';
import { Room } from './room/Room.jsx';
import { GpxUpload } from './upload/GpxUpload.jsx';
import { BoopsDisplay } from './ui/BoopsDisplay.jsx';
import { CatStatusBadge } from './ui/CatStatusBadge.jsx';
import { CareButton } from './ui/CareButton.jsx';
import './App.css';

export default function App() {
  const { boops, lastInteractionAt, addBoops, careForCat } = useGameState();
  const [lastUpload, setLastUpload] = useState(null);
  const [unit, setUnit] = useState('mi');

  // Re-derived from lastInteractionAt on every render rather than stored —
  // there's no need for a ticking clock, health is just "how long has it
  // been" evaluated fresh each time the app is open.
  const catHealth = useMemo(() => computeCatHealth(lastInteractionAt), [lastInteractionAt]);

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

      <Room catHealth={catHealth} />

      <section className="cat-status">
        <CatStatusBadge health={catHealth} />
        <CareButton onCare={careForCat} />
      </section>

      <section className="upload-section">
        <h2>Log a walk</h2>
        <GpxUpload onResult={handleUploadResult} />
        {lastUpload && (
          <div className="upload-summary">
            <p>
              <strong>{lastUpload.fileName}</strong>
            </p>
            <p>
              {unit === 'mi'
                ? `${lastUpload.miles.toFixed(2)} mi`
                : `${lastUpload.km.toFixed(2)} km`}{' '}
              <button
                type="button"
                className="unit-toggle"
                onClick={() => setUnit((u) => (u === 'mi' ? 'km' : 'mi'))}
              >
                switch to {unit === 'mi' ? 'km' : 'mi'}
              </button>
            </p>
            <p>+{lastUpload.boops.toLocaleString()} boops earned</p>
          </div>
        )}
      </section>
    </div>
  );
}
