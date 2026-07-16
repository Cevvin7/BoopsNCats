import { useState } from 'react';
import { useGameState } from './state/GameStateContext.jsx';
import { RoomViewport } from './room/RoomViewport.jsx';
import { useRoomEditor } from './room/useRoomEditor.js';
import { useCatWander } from './cat/useCatWander.js';
import { useTheme } from './settings/useTheme.js';
import { useBoopsFloatText } from './effects/useBoopsFloatText.js';
import { BOOP_REWARD_AMOUNT } from './cat/boopReward.js';
import './App.css';

// How long the upload screen lingers on its confetti + "boops earned"
// confirmation before automatically returning to the room.
const UPLOAD_CELEBRATION_MS = 2200;
const CONFETTI_DURATION_MS = 1000;

export default function App() {
  const {
    boops,
    cat,
    needsAttention,
    inventory,
    placedItems,
    addBoops,
    buyItem,
    recordActivityUpload,
    claimBoopReward,
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
  const [confettiActive, setConfettiActive] = useState(false);
  const { floaters: boopsFloaters, trigger: triggerBoopsFloatText } = useBoopsFloatText();

  const roomEditor = useRoomEditor({ placedItems, placeItem, movePlacedItem, flipPlacedItem, deletePlacedItem });
  // Paused (not stopped mid-stride) while the cat needs attention -- see
  // useCatWander.js for why an in-flight walk is still allowed to finish.
  const catWander = useCatWander({ placedItems, paused: needsAttention });

  function handleUploadResult(result) {
    addBoops(result.boops);
    recordActivityUpload();
    setLastUpload(result);
    triggerBoopsFloatText(result.boops);
    setConfettiActive(true);
    window.setTimeout(() => setConfettiActive(false), CONFETTI_DURATION_MS);
    // Lingers on the upload screen's own confirmation/confetti for a beat
    // before returning to the room -- but only if the player hasn't
    // already navigated elsewhere in the meantime.
    window.setTimeout(() => {
      setScreen((current) => (current === 'upload' ? 'room' : current));
    }, UPLOAD_CELEBRATION_MS);
  }

  function handleBoopCat() {
    const claimed = claimBoopReward();
    if (claimed) triggerBoopsFloatText(BOOP_REWARD_AMOUNT);
  }

  // The inventory HUD button toggles a whole "editing session," not just
  // the shop screen itself: turning it on opens the shop (to buy/select
  // something), and it *stays* on when the shop hands off to the room
  // (see handlePlaceItem) so existing placed items are also tappable
  // there for their move/flip/delete popup. Tapping the button again --
  // from either the shop or the room -- closes the whole session.
  function toggleEditMode() {
    setEditMode((wasEditing) => {
      if (wasEditing) {
        roomEditor.cancel();
        setScreen('room');
      } else {
        setScreen('shop');
      }
      return !wasEditing;
    });
  }

  // Opening the upload or settings screen exits any editing session -- the
  // shop and tile-placement flow don't make sense while the viewport is
  // showing something other than the room. Tapping the same hit-area again
  // swaps back to the room, rather than needing a separate close button.
  function openScreen(next) {
    if (editMode) {
      roomEditor.cancel();
      setEditMode(false);
    }
    setScreen((current) => (current === next ? 'room' : next));
  }

  function handleBuyItem(itemId, cost) {
    buyItem(itemId, cost);
  }

  // Tapping an already-owned item in the shop -- hands off straight to the
  // existing tile-placement flow instead of buying another. Edit mode
  // stays on throughout (see toggleEditMode).
  function handlePlaceItem(itemId) {
    roomEditor.selectInventoryItem(itemId);
    setScreen('room');
  }

  return (
    <div className="app">
      <RoomViewport
        catHappiness={cat.happiness}
        catNeedsAttention={needsAttention}
        catWander={catWander}
        onBoopCat={handleBoopCat}
        placedItems={placedItems}
        editMode={editMode}
        roomEditor={roomEditor}
        screen={screen}
        boopsFloaters={boopsFloaters}
        confettiActive={confettiActive}
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
        inventory={inventory}
        onBuyItem={handleBuyItem}
        onPlaceItem={handlePlaceItem}
      />
    </div>
  );
}
