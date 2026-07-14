import { useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { RoomViewport } from './room/RoomViewport.jsx';
import { useRoomEditor, EditorMode } from './room/useRoomEditor.js';
import { useCatWander } from './cat/useCatWander.js';
import { useTheme } from './settings/useTheme.js';
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
    redeemCode,
    factoryReset,
  } = useGameState();
  const { theme, toggleTheme } = useTheme();
  const [lastUpload, setLastUpload] = useState(null);
  const [editMode, setEditMode] = useState(false);
  // What the RoomViewport frame's screen is currently showing -- 'room' is
  // the default, camera-panned view; 'upload' and 'settings' replace it
  // entirely with an embedded screen (see RoomViewport.jsx).
  const [screen, setScreen] = useState('room');

  const roomEditor = useRoomEditor({ placedItems, placeItem, movePlacedItem, flipPlacedItem, deletePlacedItem });
  // Paused (not stopped mid-stride) while the cat needs attention -- see
  // useCatWander.js for why an in-flight walk is still allowed to finish.
  const catWander = useCatWander({ placedItems, paused: needsAttention });

  function handleUploadResult(result) {
    addBoops(result.boops);
    recordActivityUpload();
    setLastUpload(result);
    setScreen('room'); // swap back to the room now that the walk's logged
  }

  function toggleEditMode() {
    setEditMode((wasEditing) => {
      if (wasEditing) roomEditor.cancel(); // drop any in-progress selection/popup on exit
      return !wasEditing;
    });
    setScreen('room'); // editing only makes sense with the room actually visible
  }

  // Opening the upload or settings screen exits edit mode -- the
  // inventory panel and tile-placement flow don't make sense while the
  // viewport is showing something other than the room. Tapping the same
  // hit-area again swaps back to the room, rather than needing a
  // separate close button.
  function openScreen(next) {
    if (editMode) {
      roomEditor.cancel();
      setEditMode(false);
    }
    setScreen((current) => (current === next ? 'room' : next));
  }

  return (
    <div className="app">
      <RoomViewport
        catHappiness={cat.happiness}
        catNeedsAttention={needsAttention}
        catWander={catWander}
        placedItems={placedItems}
        editMode={editMode}
        roomEditor={roomEditor}
        screen={screen}
        editModeActive={editMode}
        onTapEdit={toggleEditMode}
        onTapUpload={() => openScreen('upload')}
        onTapSettings={() => openScreen('settings')}
        boops={boops}
        onUploadResult={handleUploadResult}
        lastUpload={lastUpload}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRedeemCode={redeemCode}
        onFactoryReset={factoryReset}
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
    </div>
  );
}
