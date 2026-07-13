let idCounter = 0;

// Self-contained id generator (no crypto.randomUUID dependency) — good
// enough uniqueness for a local single-player save file, and avoids
// relying on Web Crypto being present in every test/runtime environment.
function generatePlacedItemId() {
  idCounter += 1;
  return `placed-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addPlacedItem(placedItems, { itemId, row, col }) {
  return [...placedItems, { id: generatePlacedItemId(), itemId, row, col, flipped: false }];
}

export function removePlacedItem(placedItems, placedItemId) {
  return placedItems.filter((item) => item.id !== placedItemId);
}

export function movePlacedItem(placedItems, placedItemId, { row, col }) {
  return placedItems.map((item) => (item.id === placedItemId ? { ...item, row, col } : item));
}

export function flipPlacedItem(placedItems, placedItemId) {
  return placedItems.map((item) => (item.id === placedItemId ? { ...item, flipped: !item.flipped } : item));
}

export function findPlacedItem(placedItems, placedItemId) {
  return placedItems.find((item) => item.id === placedItemId);
}
