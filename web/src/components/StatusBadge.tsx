import type { RaceStatus } from '../api/types.ts';

const COLORS: Record<RaceStatus, string> = {
  未着手: '#9ca3af',
  予想のみ: '#3b82f6',
  '施行済み(レビュー未)': '#f59e0b',
  施行済み: '#22c55e',
};

export function StatusBadge({ status }: { status: RaceStatus }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: '0.75rem',
        color: '#fff',
        backgroundColor: COLORS[status],
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
