import { useState } from 'react';
import type { ResultEntry } from '../api/types.ts';
import { wakuStyle, popularityStyle } from '../utils/raceColors.ts';

function rankClass(rank: string): string {
  return rank === '1' || rank === '2' || rank === '3' ? `rank-${rank}` : '';
}

function weightDiffClass(diff: string | undefined): string {
  if (!diff) return '';
  if (diff.startsWith('-')) return 'down';
  if (diff.startsWith('+') && diff !== '+0') return 'up';
  return '';
}

export function ResultTable({ results }: { results: ResultEntry[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!results || results.length === 0) {
    return <p className="empty-note">結果データなし</p>;
  }

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      <div className="table-scroll desktop-only">
        <table className="result-table">
          <thead>
            <tr>
              <th>着順</th>
              <th>枠</th>
              <th>馬番</th>
              <th>馬名</th>
              <th>性齢</th>
              <th>斤量</th>
              <th>騎手</th>
              <th>タイム</th>
              <th>着差</th>
              <th>上り3F</th>
              <th>通過</th>
              <th>オッズ</th>
              <th>人気</th>
              <th>馬体重</th>
              <th>厩舎</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.rank}</td>
                <td style={wakuStyle(r.wakuNum)}>{r.wakuNum}</td>
                <td style={wakuStyle(r.wakuNum)}>{r.horseNum}</td>
                <td>{r.horseName}</td>
                <td>{r.sexAge}</td>
                <td>{r.weight}</td>
                <td>{r.jockey}</td>
                <td>{r.finTime}</td>
                <td>{r.margin}</td>
                <td>{r.last3f}</td>
                <td>{r.corner}</td>
                <td>{r.odds}</td>
                <td style={popularityStyle(r.popularity)}>{r.popularity}</td>
                <td>
                  {r.bodyWeight}
                  {r.bodyWeightDiff ? `(${r.bodyWeightDiff})` : ''}
                </td>
                <td>{r.stable ?? r.trainer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="result-card-list mobile-only">
        {results.map((r, i) => {
          const key = r.horseNum || String(i);
          const isOpen = expanded.has(key);
          return (
            <div className={`result-card ${rankClass(r.rank)}`} key={key}>
              <div
                className="result-card-row"
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => toggle(key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(key);
                  }
                }}
              >
                <span className="result-card-rank">{r.rank}</span>
                <span className="horse-card-waku" style={wakuStyle(r.wakuNum)}>
                  {r.wakuNum}
                </span>
                <span className="horse-card-num">{r.horseNum}</span>
                <span className="horse-card-name">{r.horseName}</span>
                <div className="horse-card-weight">
                  <span className="horse-card-weight-value">{r.bodyWeight || '-'}</span>
                  <span className={`horse-card-weight-diff ${weightDiffClass(r.bodyWeightDiff)}`}>
                    {r.bodyWeightDiff ? `(${r.bodyWeightDiff})` : ''}
                  </span>
                </div>
                <div className="horse-card-odds">
                  <span className="horse-card-odds-value">{r.odds || '-'}</span>
                  <span className="horse-card-pop" style={popularityStyle(r.popularity)}>
                    {r.popularity ? `${r.popularity}人気` : '-'}
                  </span>
                </div>
              </div>
              <div className="horse-card-meta">
                {r.sexAge} ・ {r.weight}kg ・ {r.jockey} ・ {r.stable ?? r.trainer}
              </div>
              <button className="horse-card-more" aria-expanded={isOpen} onClick={() => toggle(key)}>
                <span className="horse-card-more-arrow">▾</span>
                {isOpen ? '閉じる' : 'もっと見る（タイム・着差・上り3F・通過）'}
              </button>
              {isOpen && (
                <dl className="result-card-detail">
                  <dt>タイム</dt>
                  <dd>{r.finTime || '-'}</dd>
                  <dt>着差</dt>
                  <dd>{r.margin || '-'}</dd>
                  <dt>上り3F</dt>
                  <dd>{r.last3f || '-'}</dd>
                  <dt>通過</dt>
                  <dd>{r.corner || '-'}</dd>
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
