import { describe, it, expect } from 'vitest';
import {
  defaultInventory,
  getInventoryEntry,
  canPlaceFromInventory,
  decrementQuantity,
  incrementQuantity,
  INVENTORY_CAP,
} from './inventoryModel.js';
import { ITEM_CATALOG } from './itemCatalog.js';

describe('defaultInventory', () => {
  it('seeds one entry per catalog item, starting unowned with the shared cap', () => {
    const inventory = defaultInventory();
    expect(inventory.map((e) => e.itemId).sort()).toEqual(Object.keys(ITEM_CATALOG).sort());
    for (const entry of inventory) {
      expect(entry.quantity).toBe(0);
      expect(entry.cap).toBe(INVENTORY_CAP);
    }
  });
});

describe('canPlaceFromInventory', () => {
  it('is true when quantity > 0 and false at 0 or for an unknown item', () => {
    const inventory = [{ itemId: 'plant', quantity: 1, cap: 32 }, { itemId: 'shelf', quantity: 0, cap: 32 }];
    expect(canPlaceFromInventory(inventory, 'plant')).toBe(true);
    expect(canPlaceFromInventory(inventory, 'shelf')).toBe(false);
    expect(canPlaceFromInventory(inventory, 'nonexistent')).toBe(false);
  });
});

describe('decrementQuantity / incrementQuantity', () => {
  it('decrements one item without affecting others, floored at 0', () => {
    const inventory = [{ itemId: 'plant', quantity: 1, cap: 32 }, { itemId: 'shelf', quantity: 3, cap: 32 }];
    const once = decrementQuantity(inventory, 'plant');
    expect(getInventoryEntry(once, 'plant').quantity).toBe(0);
    expect(getInventoryEntry(once, 'shelf').quantity).toBe(3);

    const twice = decrementQuantity(once, 'plant');
    expect(getInventoryEntry(twice, 'plant').quantity).toBe(0); // never goes negative
  });

  it('increments one item without affecting others, capped', () => {
    const inventory = [{ itemId: 'plant', quantity: 31, cap: 32 }];
    const once = incrementQuantity(inventory, 'plant');
    expect(getInventoryEntry(once, 'plant').quantity).toBe(32);

    const twice = incrementQuantity(once, 'plant');
    expect(getInventoryEntry(twice, 'plant').quantity).toBe(32); // never exceeds cap
  });
});
