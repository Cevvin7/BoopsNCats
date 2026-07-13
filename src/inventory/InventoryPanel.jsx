import { ITEM_CATALOG } from './itemCatalog.js';
import './InventoryPanel.css';

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
            {/* Flat color placeholder — swap for a spriteUrl on the
                catalog entry once real item art exists. */}
            <span className="inventory-item-swatch" style={{ backgroundColor: catalogEntry.color }} />
            <span className="inventory-item-name">{catalogEntry.name}</span>
            <span className="inventory-item-quantity">x{entry.quantity}</span>
          </button>
        );
      })}
    </div>
  );
}
