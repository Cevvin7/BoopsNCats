import { useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { GpxUpload } from './upload/GpxUpload.jsx';
import { BoopsDisplay } from './ui/BoopsDisplay.jsx';
import { RoomViewport } from './room/RoomViewport.jsx';
import { useRoomEditor, EditorMode } from './room/useRoomEditor.js';
import { InventoryPanel } from './inventory/InventoryPanel.jsx';
import './App.css';

// Phase 4 adds inventory + item placement on top of the Phase 3.5 room.
// The "Edit" button here stands in for what will eventually be one of
// three header buttons (Edit, Upload, Settings).
export default function App() {
  const {
    boops,
    cat,
    needsAttention,
    inventory,
    placedItems,
    addBoops,
    recordActivityUpload,
    advanceOneDayForTesting,
    placeItem,
    movePlacedItem,
    flipPlacedItem,
    deletePlacedItem,
  } = useGameState();
  const [lastUpload, setLastUpload] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const roomEditor = useRoomEditor({ placedItems, placeItem, movePlacedItem, flipPlacedItem, deletePlacedItem });

  function handleUploadResult(result) {
    addBoops(result.boops);
    recordActivityUpload();
    setLastUpload(result);
  }

  function toggleEditMode() {
    setEditMode((wasEditing) => {
      if (wasEditing) roomEditor.cancel(); // drop any in-progress selection/popup on exit
      return !wasEditing;
    });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>BoopsNCats</h1>
        <div className="app-header-actions">
          <button type="button" className="edit-mode-toggle" onClick={toggleEditMode}>
            {editMode ? 'Done' : 'Edit'}
          </button>
          <BoopsDisplay boops={boops} />
        </div>
      </header>

      <RoomViewport
        catHappiness={cat.happiness}
        catNeedsAttention={needsAttention}
        placedItems={placedItems}
        editMode={editMode}
        roomEditor={roomEditor}
      />

      {editMode && (
        <section className="inventory-section">
          <h2>Inventory</h2>
          <InventoryPanel
            inventory={inventory}
            selectedItemId={roomEditor.mode === EditorMode.PLACING ? roomEditor.selectedItemId : null}
            onSelectItem={roomEditor.selectInventoryItem}
          />
        </section>
      )}

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
