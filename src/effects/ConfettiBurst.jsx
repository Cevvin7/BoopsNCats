import './ConfettiBurst.css';

const COLORS = ['#f4c94d', '#ef8354', '#ef476f', '#8d99ae', '#06d6a0'];
const PIECE_COUNT = 24;
// Deterministic (not Math.random()) so the burst always looks intentional
// rather than occasionally clumping pieces in one direction.
const PIECES = Array.from({ length: PIECE_COUNT }, (_, i) => ({
  angle: (360 / PIECE_COUNT) * i,
  delay: (i % 6) * 0.03,
  color: COLORS[i % COLORS.length],
}));

/**
 * A brief celebratory burst -- mounted only while `active`, so each
 * trigger restarts the CSS animation from scratch rather than reusing
 * stale keyframe state from a previous burst.
 */
export function ConfettiBurst({ active }) {
  if (!active) return null;

  return (
    <div className="confetti-burst" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            '--angle': `${piece.angle}deg`,
            '--delay': `${piece.delay}s`,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}
