import { useState } from 'react';
import type { AnalysisMark } from '../api/types.ts';
import { wakuStyle } from '../utils/raceColors.ts';

const MARK_ORDER: Record<string, number> = { '◎': 0, '○': 1, '▲': 2, '△': 3, '✕': 4 };
const CROSSED_MARK = '✕';

function sortMarks(marks: AnalysisMark[]): AnalysisMark[] {
  return [...marks]
    .filter((m) => m.mark)
    .sort((a, b) => (MARK_ORDER[a.mark ?? ''] ?? 99) - (MARK_ORDER[b.mark ?? ''] ?? 99));
}

export function MarksSummary({
  marks,
  wakuByHorseNumber,
}: {
  marks: AnalysisMark[];
  wakuByHorseNumber?: Map<string, string>;
}) {
  const [showCrossed, setShowCrossed] = useState(false);

  const sorted = sortMarks(marks);
  if (sorted.length === 0) return null;

  const crossedCount = sorted.filter((m) => m.mark === CROSSED_MARK).length;
  const visible = showCrossed ? sorted : sorted.filter((m) => m.mark !== CROSSED_MARK);

  return (
    <div>
      {crossedCount > 0 && (
        <label className="marks-summary-toggle">
          <input type="checkbox" checked={showCrossed} onChange={(e) => setShowCrossed(e.target.checked)} />
          消し馬を表示（✕ {crossedCount}頭）
        </label>
      )}
      <div className="table-scroll marks-summary-scroll">
        <table className="marks-summary-table">
          <thead>
            <tr>
              <th>印</th>
              <th>馬番</th>
              <th>馬名</th>
              <th>人気</th>
              <th>オッズ</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-note">
                  表示できる馬がいません
                </td>
              </tr>
            ) : (
              visible.map((m) => {
                const horseNum = m.horseNumber != null ? String(m.horseNumber) : null;
                return (
                  <tr key={horseNum ?? m.horseName}>
                    <td className="mark-cell">{m.mark}</td>
                    <td
                      style={wakuByHorseNumber && horseNum ? wakuStyle(wakuByHorseNumber.get(horseNum)) : undefined}
                    >
                      {horseNum ?? '-'}
                    </td>
                    <td>{m.horseName ?? '-'}</td>
                    <td>{m.popularity != null ? `${m.popularity}人気` : '-'}</td>
                    <td>{m.odds != null ? `${m.odds}倍` : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
