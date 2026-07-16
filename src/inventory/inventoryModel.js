import { ITEM_CATALOG } from './itemCatalog.js';

export const INVENTORY_CAP = 32;

// Every catalog item starts owned at 0 -- the shop (ShopScreen.jsx) is now
// the only way to acquire one, so a fresh player shouldn't already own
// three of everything for free.
export function defaultInventory() {
  return Object.keys(ITEM_CATALOG).map((itemId) => ({
    itemId,
    quantity: 0,
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
