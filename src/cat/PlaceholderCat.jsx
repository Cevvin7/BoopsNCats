import { MAX_HAPPINESS } from './happinessModel.js';

// Placeholder only — no sprite/animation work yet. Just enough visual
// feedback to confirm the happiness/decay state logic is behaving.
export function PlaceholderCat({ happiness, needsAttention }) {
  return (
    <div className={`placeholder-cat ${needsAttention ? 'placeholder-cat--needs-attention' : 'placeholder-cat--happy'}`}>
      <span className="placeholder-cat-emoji">{needsAttention ? '🙀' : '😺'}</span>
      <span className="placeholder-cat-happiness">
        {happiness} / {MAX_HAPPINESS}
      </span>
      {needsAttention && <span className="placeholder-cat-label">Needs attention!</span>}
    </div>
  );
}
