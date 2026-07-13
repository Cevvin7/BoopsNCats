import { CatHealth } from '../cat/catStateMachine.js';

const LABELS = {
  [CatHealth.HEALTHY]: { text: 'Healthy', className: 'status-healthy' },
  [CatHealth.NEEDS_ATTENTION]: { text: 'Needs attention', className: 'status-needs-attention' },
  [CatHealth.SICK]: { text: 'Sick', className: 'status-sick' },
};

export function CatStatusBadge({ health }) {
  const { text, className } = LABELS[health];
  return <span className={`status-badge ${className}`}>{text}</span>;
}
