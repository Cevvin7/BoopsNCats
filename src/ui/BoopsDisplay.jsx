export function BoopsDisplay({ boops }) {
  return (
    <div className="boops-display">
      <span className="boops-count">{boops.toLocaleString()}</span>
      <span className="boops-label">Boops</span>
    </div>
  );
}
