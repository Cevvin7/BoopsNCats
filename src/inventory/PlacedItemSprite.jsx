import { useState } from 'react';
import { ITEM_CATALOG } from './itemCatalog.js';
import './PlacedItemSprite.css';

// Items without a spriteUrl render as a flat color box. Items with one
// render the image instead, but fall back to the color box if the image
// fails to load (e.g. the asset hasn't been added to the repo yet) --
// otherwise a missing file would show a broken-image icon. A CSS
// background-image has no load-failure event of its own, so a hidden
// probe <img> detects it and we style the visible button ourselves.
export function PlacedItemSprite({ placedItem, onTap }) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const [spriteFailed, setSpriteFailed] = useState(false);
  const useSprite = Boolean(catalogEntry.spriteUrl) && !spriteFailed;

  const style = {
    transform: `scaleX(${placedItem.flipped ? -1 : 1})`,
    ...(useSprite ? { backgroundImage: `url(${catalogEntry.spriteUrl})` } : { backgroundColor: catalogEntry.color }),
  };

  return (
    <button
      type="button"
      className="placed-item-sprite"
      style={style}
      onClick={onTap}
      disabled={!onTap}
      aria-label={catalogEntry.name}
      title={catalogEntry.name}
    >
      {useSprite && (
        <img src={catalogEntry.spriteUrl} alt="" style={{ display: 'none' }} onError={() => setSpriteFailed(true)} />
      )}
    </button>
  );
}
