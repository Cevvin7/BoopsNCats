import { MAX_HAPPINESS } from './happinessModel.js';
import './PlaceholderCat.css';

// Placeholder only — no sprite/animation work yet. Now rendered at grid-tile
// size (Phase 3), so the happiness number/label moved to title/aria-label
// instead of visible text — there isn't room for two lines on a small tile,
// and color + emoji is still "just enough visual feedback" to confirm the
// state logic.
export function PlaceholderCat({ happiness, needsAttention }) {
  const statusText = needsAttention ? 'Needs attention!' : `Happy (${happiness}/${MAX_HAPPINESS})`;

  return (
    <div
      className={`placeholder-cat ${needsAttention ? 'placeholder-cat--needs-attention' : 'placeholder-cat--happy'}`}
      title={statusText}
      aria-label={`Cat status: ${statusText}`}
    >
      <span className="placeholder-cat-emoji" aria-hidden="true">
        {needsAttention ? '🙀' : '😺'}
      </span>
    </div>
  );
}
