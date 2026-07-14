let idCounter = 0;

// Self-contained id generator (no crypto.randomUUID dependency) — good
// enough uniqueness for a local single-player save file, and avoids
// relying on Web Crypto being present in every test/runtime environment.
function generatePlacedItemId() {
  idCounter += 1;
  return `placed-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

// face is only meaningful for onWall items (left/right); floor items just
// leave it undefined. Spreading `rest` rather than naming `face`
// explicitly keeps this function correct regardless of whether the
// caller passes a face or not, without an `if` branch.
export function addPlacedItem(placedItems, { itemId, row, col, ...rest }) {
  return [...placedItems, { id: generatePlacedItemId(), itemId, row, col, flipped: false, ...rest }];
}

export function removePlacedItem(placedItems, placedItemId) {
  return placedItems.filter((item) => item.id !== placedItemId);
}

// Accepts { row, col, face } — a moved wall item can land on either face
// (Move re-opens tile selection across both), so face needs to be
// updatable here too, not just row/col.
export function movePlacedItem(placedItems, placedItemId, { row, col, face }) {
  return placedItems.map((item) => (item.id === placedItemId ? { ...item, row, col, face } : item));
}

export function flipPlacedItem(placedItems, placedItemId) {
  return placedItems.map((item) => (item.id === placedItemId ? { ...item, flipped: !item.flipped } : item));
}

export function findPlacedItem(placedItems, placedItemId) {
  return placedItems.find((item) => item.id === placedItemId);
}

// Wall items saved before the two-face split have no `face` at all.
// Defaulting to 'left' here (rather than a one-time migration) keeps
// old prototype save data rendering instead of crashing — anywhere code
// needs to know which face a placed item is on should read it through
// this function, not `placedItem.face` directly.
export function getPlacedFace(placedItem) {
  return placedItem.face ?? 'left';
}
