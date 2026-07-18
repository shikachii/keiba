import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, useApi } from '../api/client.ts';
import type { CourseStatItem, OddsScatterPoint, RaceSummaryItem } from '../api/types.ts';
import { Spinner, ErrorBox } from '../components/Spinner.tsx';
import { MarkdownView } from '../components/MarkdownView.tsx';
import { BackLink } from '../components/BackLink.tsx';
import { ProfitOverTimeChart } from '../components/ProfitOverTimeChart.tsx';
import { OddsResultScatter } from '../components/OddsResultScatter.tsx';
import { CourseStatsChart } from '../components/CourseStatsChart.tsx';

function formatDate(date: string): string {
  return `${date.slice(0, 4)}年${date.slice(4, 6)}月${date.slice(6, 8)}日`;
}

function formatYen(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()}円`;
}

function ProfitBadge({ profitYen }: { profitYen: number | null }) {
  if (profitYen === null) {
    return <span className="profit-badge profit-unknown">収支不明</span>;
  }
  const cls = profitYen > 0 ? 'profit-positive' : profitYen < 0 ? 'profit-negative' : 'profit-neutral';
  return <span className={`profit-badge ${cls}`}>{formatYen(profitYen)}</span>;
}

export function SummaryPage() {
  const { data, loading, error } = useApi<RaceSummaryItem[]>(apiUrl('summary.json'));
  const { data: oddsScatter } = useApi<OddsScatterPoint[]>(apiUrl('odds-scatter.json'));
  const { data: courseStats } = useApi<CourseStatItem[]>(apiUrl('course-stats.json'));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (dir: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dir)) next.delete(dir);
      else next.add(dir);
      return next;
    });
  };

  const grouped = useMemo(() => {
    if (!data) return [];
    const byDate = new Map<string, RaceSummaryItem[]>();
    for (const race of data) {
      if (!byDate.has(race.date)) byDate.set(race.date, []);
      byDate.get(race.date)!.push(race);
    }
    return Array.from(byDate.entries());
  }, [data]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <header className="page-header">
        <BackLink label="← 一覧に戻る" />
      </header>
      <h1>収支サマリー</h1>

      {grouped.length === 0 && <p className="empty-note">振り返り済みのレースがありません</p>}

      {data && data.length > 0 && (
        <>
          <h2>累積収支推移</h2>
          <ProfitOverTimeChart items={data} />
        </>
      )}

      <h2>人気オッズ×結果</h2>
      <OddsResultScatter points={oddsScatter ?? []} />

      <h2>コース・条件別成績</h2>
      <CourseStatsChart stats={courseStats ?? []} />

      {grouped.map(([date, races]) => {
        const known = races.filter((r) => r.profitYen !== null);
        const total = known.reduce((sum, r) => sum + (r.profitYen ?? 0), 0);
        return (
          <section key={date} className="date-section">
            <div className="summary-date-header">
              <h2>{formatDate(date)}</h2>
              <div className="summary-date-total">
                <ProfitBadge profitYen={known.length > 0 ? total : null} />
                {known.length < races.length && (
                  <span className="summary-note">
                    （{known.length}/{races.length}件のみ集計、残りは金額記載なし）
                  </span>
                )}
              </div>
            </div>
            <div className="table-scroll">
              <table className="race-list-table">
                <thead>
                  <tr>
                    <th>レース</th>
                    <th>収支</th>
                    <th>回収率</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {races.map((race) => {
                    const isOpen = expanded.has(race.dir);
                    return (
                      <Fragment key={race.dir}>
                        <tr className="race-row" onClick={() => toggle(race.dir)}>
                          <td>
                            <Link
                              to={`/races/${race.date}/${encodeURIComponent(race.dir)}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {race.venue}
                              {race.raceNumber}R {race.raceName}
                            </Link>
                          </td>
                          <td>
                            <ProfitBadge profitYen={race.profitYen} />
                          </td>
                          <td>{race.recoveryRatePercent !== null ? `${race.recoveryRatePercent}%` : '-'}</td>
                          <td>{isOpen ? '▼' : '▶'}</td>
                        </tr>
                        {isOpen && (
                          <tr className="horse-detail-row">
                            <td colSpan={4}>
                              <div className="horse-detail">
                                {race.betsMarkdown ? (
                                  <MarkdownView content={race.betsMarkdown} />
                                ) : (
                                  <p className="empty-note">買い目・収支の記載が見つかりませんでした</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
