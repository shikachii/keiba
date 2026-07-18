import type { AnalysisMark } from '../api/types.ts';

const MARK_ORDER: Record<string, number> = { '◎': 0, '○': 1, '▲': 2, '△': 3, '✕': 4 };

function sortMarks(marks: AnalysisMark[]): AnalysisMark[] {
  return [...marks]
    .filter((m) => m.mark)
    .sort((a, b) => (MARK_ORDER[a.mark ?? ''] ?? 99) - (MARK_ORDER[b.mark ?? ''] ?? 99));
}

export function MarksSummary({ marks }: { marks: AnalysisMark[] }) {
  const sorted = sortMarks(marks);
  if (sorted.length === 0) return null;

  return (
    <div className="marks-summary">
      {sorted.map((m) => (
        <span key={m.horseNumber ?? m.horseName} className="marks-summary-item">
          <span className="mark-cell">{m.mark}</span>
          <span className="marks-summary-horse">
            {m.horseNumber != null ? `${m.horseNumber}番 ` : ''}
            {m.horseName ?? ''}
          </span>
          {m.popularity != null && m.odds != null && (
            <span className="marks-summary-odds">
              （{m.popularity}人気 {m.odds}倍）
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
