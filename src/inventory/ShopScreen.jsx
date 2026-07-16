import { ITEM_CATALOG } from './itemCatalog.js';
import { getInventoryEntry } from './inventoryModel.js';
import './ShopScreen.css';

// Flat cost for every item while the shop's core loop is being tested --
// a per-item cost (from the catalog entry itself) can replace this later
// without any other change here.
const ITEM_COST = 1;

const PURCHASE_BUTTON_URL = `${import.meta.env.BASE_URL}sprites/ui/button-purchase.png`;

function ShopItemSwatch({ catalogEntry }) {
  return (
    <span
      className="shop-item-swatch"
      style={
        catalogEntry.spriteUrl
          ? { backgroundImage: `url(${catalogEntry.spriteUrl})` }
          : { backgroundColor: catalogEntry.color }
      }
    />
  );
}

/**
 * Embedded in RoomViewport's screen area, same as Settings/Upload. Every
 * catalog item is a single row: tapping it either buys the first one (not
 * owned yet) or jumps straight to placing it in the room (already owned) --
 * see the shared "tapping an owned item places it" contract App.jsx wires
 * through `onPlaceItem`. Owned items additionally get a small "+" button
 * to buy another without leaving the shop.
 */
export function ShopScreen({ inventory, boops, onBuyItem, onPlaceItem }) {
  const canAfford = boops >= ITEM_COST;

  return (
    <div className="shop-screen">
      <h2>Shop</h2>
      <div className="shop-list">
        {Object.values(ITEM_CATALOG).map((catalogEntry) => {
          const entry = getInventoryEntry(inventory, catalogEntry.id);
          const owned = Boolean(entry) && entry.quantity > 0;

          function handleMainTap() {
            if (owned) {
              onPlaceItem(catalogEntry.id);
            } else if (canAfford) {
              onBuyItem(catalogEntry.id, ITEM_COST);
            }
          }

          return (
            <div key={catalogEntry.id} className="shop-item">
              <button
                type="button"
                className="shop-item-main"
                onClick={handleMainTap}
                disabled={!owned && !canAfford}
              >
                <ShopItemSwatch catalogEntry={catalogEntry} />
                <span className="shop-item-info">
                  <span className="shop-item-name">{catalogEntry.name}</span>
                  <span className="shop-item-detail">
                    {owned ? `Owned x${entry.quantity} — tap to place` : `${ITEM_COST} boop${ITEM_COST === 1 ? '' : 's'}`}
                  </span>
                </span>
              </button>

              {owned && (
                <button
                  type="button"
                  className="shop-item-buy-more"
                  style={{ backgroundImage: `url(${PURCHASE_BUTTON_URL})` }}
                  onClick={() => onBuyItem(catalogEntry.id, ITEM_COST)}
                  disabled={!canAfford}
                  aria-label={`Buy another ${catalogEntry.name} for ${ITEM_COST} boops`}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
