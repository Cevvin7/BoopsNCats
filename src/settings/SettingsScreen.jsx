import './SettingsScreen.css';

// Placeholder scaffold only -- this pass is the panel-swapping mechanism
// (see RoomViewport.jsx's `screen` prop), not the actual settings list.
// Real entries land in a future pass; this just proves the screen swaps
// in correctly and scrolls if its content ever outgrows the viewport.
export function SettingsScreen() {
  return (
    <div className="settings-screen">
      <h2>Settings</h2>
      <p className="settings-screen-placeholder">More options coming soon.</p>
    </div>
  );
}
