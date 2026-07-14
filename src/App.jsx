import { useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { UploadModal } from './upload/UploadModal.jsx';
import { BoopsDisplay } from './ui/BoopsDisplay.jsx';
import { RoomViewport } from './room/RoomViewport.jsx';
import { useRoomEditor, EditorMode } from './room/useRoomEditor.js';
import { useCatWander } from './cat/useCatWander.js';
import { InventoryPanel } from './inventory/InventoryPanel.jsx';
import './App.css';

export default function App() {
  const {
    boops,
    cat,
    needsAttention,
    inventory,
    placedItems,
    addBoops,
    recordActivityUpload,
    placeItem,
    movePlacedItem,
    flipPlacedItem,
    deletePlacedItem,
  } = useGameState();
  const [lastUpload, setLastUpload] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const roomEditor = useRoomEditor({ placedItems, placeItem, movePlacedItem, flipPlacedItem, deletePlacedItem });
  // Paused (not stopped mid-stride) while the cat needs attention -- see
  // useCatWander.js for why an in-flight walk is still allowed to finish.
  const catWander = useCatWander({ placedItems, paused: needsAttention });

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
          <button type="button" className="upload-toggle" onClick={() => setUploadModalOpen(true)}>
            Upload
          </button>
          <button type="button" className="edit-mode-toggle" onClick={toggleEditMode}>
            {editMode ? 'Done' : 'Edit'}
          </button>
          <BoopsDisplay boops={boops} />
        </div>
      </header>

      <RoomViewport
        catHappiness={cat.happiness}
        catNeedsAttention={needsAttention}
        catWander={catWander}
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

      {uploadModalOpen && (
        <UploadModal
          onResult={handleUploadResult}
          lastUpload={lastUpload}
          onClose={() => setUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
