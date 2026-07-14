import { useState } from 'react';
import { ITEM_CATALOG } from './itemCatalog.js';
import './InventoryPanel.css';

// Same color-vs-sprite-with-fallback approach as PlacedItemSprite: shows
// the real art if the catalog entry has a spriteUrl and it loads, falls
// back to the flat color otherwise (e.g. asset not added to the repo yet).
function InventorySwatch({ catalogEntry }) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const useSprite = Boolean(catalogEntry.spriteUrl) && !spriteFailed;

  return (
    <span
      className="inventory-item-swatch"
      style={useSprite ? { backgroundImage: `url(${catalogEntry.spriteUrl})` } : { backgroundColor: catalogEntry.color }}
    >
      {useSprite && (
        <img src={catalogEntry.spriteUrl} alt="" style={{ display: 'none' }} onError={() => setSpriteFailed(true)} />
      )}
    </span>
  );
}

export function InventoryPanel({ inventory, selectedItemId, onSelectItem }) {
  return (
    <div className="inventory-panel">
      {inventory.map((entry) => {
        const catalogEntry = ITEM_CATALOG[entry.itemId];
        const disabled = entry.quantity <= 0;
        const selected = entry.itemId === selectedItemId;

        return (
          <button
            key={entry.itemId}
            type="button"
            className={`inventory-item${selected ? ' inventory-item--selected' : ''}`}
            disabled={disabled}
            onClick={() => onSelectItem(entry.itemId)}
          >
            <InventorySwatch catalogEntry={catalogEntry} />
            <span className="inventory-item-name">{catalogEntry.name}</span>
            <span className="inventory-item-quantity">x{entry.quantity}</span>
          </button>
        );
      })}
    </div>
  );
}
