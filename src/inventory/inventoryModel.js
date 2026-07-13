import { ITEM_CATALOG } from './itemCatalog.js';

export const INVENTORY_CAP = 32;
// Seeded starting quantity for this phase's 3 test items — enough to test
// placing multiple instances of the same item without a "give item" dev
// tool. Real quantities will come from the shop later.
const SEEDED_QUANTITY = 3;

export function defaultInventory() {
  return Object.keys(ITEM_CATALOG).map((itemId) => ({
    itemId,
    quantity: SEEDED_QUANTITY,
    cap: INVENTORY_CAP,
  }));
}

export function getInventoryEntry(inventory, itemId) {
  return inventory.find((entry) => entry.itemId === itemId);
}

export function canPlaceFromInventory(inventory, itemId) {
  const entry = getInventoryEntry(inventory, itemId);
  return Boolean(entry) && entry.quantity > 0;
}

export function decrementQuantity(inventory, itemId) {
  return inventory.map((entry) =>
    entry.itemId === itemId ? { ...entry, quantity: Math.max(0, entry.quantity - 1) } : entry,
  );
}

export function incrementQuantity(inventory, itemId) {
  return inventory.map((entry) =>
    entry.itemId === itemId ? { ...entry, quantity: Math.min(entry.cap, entry.quantity + 1) } : entry,
  );
}
