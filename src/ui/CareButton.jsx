// Free interaction that resets the sickness clock. This is deliberately not
// a boop-spending action — "Feed" / "Give toy" as paid care options are the
// future shop hook point; this button is just the baseline "someone is
// paying attention to the cat" signal.
export function CareButton({ onCare }) {
  return (
    <button type="button" className="care-button" onClick={onCare}>
      Pet the cat
    </button>
  );
}
