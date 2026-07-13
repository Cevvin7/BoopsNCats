import { ITEM_CATALOG } from './itemCatalog.js';
import './PlacedItemSprite.css';

// Flat color placeholder — swap for a spriteUrl on the catalog entry once
// real item art exists; this is the one component that would need to
// branch on it (img vs colored div), same seam as CatSprite for the cat.
export function PlacedItemSprite({ placedItem, onTap }) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];

  return (
    <button
      type="button"
      className="placed-item-sprite"
      style={{
        backgroundColor: catalogEntry.color,
        transform: `scaleX(${placedItem.flipped ? -1 : 1})`,
      }}
      onClick={onTap}
      disabled={!onTap}
      aria-label={catalogEntry.name}
      title={catalogEntry.name}
    />
  );
}
