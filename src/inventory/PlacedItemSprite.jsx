import { useState } from 'react';
import { ITEM_CATALOG } from './itemCatalog.js';
import './PlacedItemSprite.css';

// Items without a spriteUrl render as a flat color box. Items with one
// render the image instead, but fall back to the color box if the image
// fails to load (e.g. the asset hasn't been added to the repo yet) --
// otherwise a missing file would show a broken-image icon. A CSS
// background-image has no load-failure event of its own, so a hidden
// probe <img> detects it and we style the visible element ourselves.
//
// This renders as a plain <div> rather than a <button> so placed items
// don't pick up the browser's native button press/focus/active styling.
// role="button" + a keydown handler keep it screen-reader- and
// keyboard-operable; since a div has no native disabled state, an
// undefined onTap (not in edit mode) simply skips attaching any
// interactive props at all, rather than attaching them and trying to
// suppress default disabled styling.
export function PlacedItemSprite({ placedItem, onTap }) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const [spriteFailed, setSpriteFailed] = useState(false);
  const useSprite = Boolean(catalogEntry.spriteUrl) && !spriteFailed;

  const style = {
    transform: `scaleX(${placedItem.flipped ? -1 : 1})`,
    ...(useSprite ? { backgroundImage: `url(${catalogEntry.spriteUrl})` } : { backgroundColor: catalogEntry.color }),
  };

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTap();
    }
  }

  const interactiveProps = onTap ? { role: 'button', tabIndex: 0, onClick: onTap, onKeyDown: handleKeyDown } : {};

  return (
    <div
      className={`placed-item-sprite${onTap ? ' placed-item-sprite--interactive' : ''}`}
      style={style}
      aria-label={catalogEntry.name}
      title={catalogEntry.name}
      {...interactiveProps}
    >
      {useSprite && (
        <img src={catalogEntry.spriteUrl} alt="" style={{ display: 'none' }} onError={() => setSpriteFailed(true)} />
      )}
    </div>
  );
}
