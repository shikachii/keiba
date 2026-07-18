import { Fragment } from 'react';
import type { AnalysisBet } from '../api/types.ts';
import { wakuStyle } from '../utils/raceColors.ts';

function formatYen(n: number): string {
  return `${n.toLocaleString()}円`;
}

export function BetsSummary({
  bets,
  wakuByHorseNumber,
}: {
  bets: AnalysisBet[];
  wakuByHorseNumber?: Map<string, string>;
}) {
  const withPoints = bets.filter((b) => b.points.length > 0);
  if (withPoints.length === 0) return null;

  return (
    <div className="bets-summary">
      {withPoints.map((bet, i) => {
        const total = bet.unitYen != null ? bet.unitYen * bet.points.length : null;
        return (
          <div key={`${bet.type ?? 'bet'}-${i}`} className="bets-summary-group">
            <div className="bets-summary-header">
              <span className="bets-summary-type">{bet.type ?? '買い目'}</span>
              <span className="bets-summary-meta">
                {bet.points.length}点
                {bet.unitYen != null && ` × ${bet.unitYen}円`}
                {total != null && `（計${formatYen(total)}）`}
              </span>
            </div>
            <div className="bets-summary-points">
              {bet.points.map((p) => {
                const horseNumbers = p.split('-');
                return (
                  <span key={p} className="bets-summary-point">
                    {horseNumbers.map((n, idx) => (
                      <Fragment key={idx}>
                        {idx > 0 && <span className="bets-summary-point-sep">-</span>}
                        <span
                          className="bets-summary-point-num"
                          style={wakuByHorseNumber ? wakuStyle(wakuByHorseNumber.get(n.trim())) : undefined}
                        >
                          {n}
                        </span>
                      </Fragment>
                    ))}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
