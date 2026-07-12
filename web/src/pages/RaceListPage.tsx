import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl, useApi } from '../api/client.ts';
import type { RaceListItem, RaceStatus } from '../api/types.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { Spinner, ErrorBox } from '../components/Spinner.tsx';

const STATUS_FILTERS: (RaceStatus | 'すべて')[] = ['すべて', '未着手', '予想のみ', '施行済み(レビュー未)', '施行済み'];

function formatDate(date: string): string {
  return `${date.slice(0, 4)}年${date.slice(4, 6)}月${date.slice(6, 8)}日`;
}

export function RaceListPage() {
  const { data, loading, error } = useApi<RaceListItem[]>(apiUrl('races.json'));
  const [statusFilter, setStatusFilter] = useState<RaceStatus | 'すべて'>('すべて');
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    if (!data) return [];
    const filtered = statusFilter === 'すべて' ? data : data.filter((r) => r.status === statusFilter);
    const byDate = new Map<string, RaceListItem[]>();
    for (const race of filtered) {
      if (!byDate.has(race.date)) byDate.set(race.date, []);
      byDate.get(race.date)!.push(race);
    }
    return Array.from(byDate.entries());
  }, [data, statusFilter]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <header className="page-header">
        <h1>競馬レースビューア</h1>
        <Link to="/rules-log" className="header-link">
          ルール適用ログ
        </Link>
      </header>

      <div className="filter-bar">
        <label>
          ステータス絞り込み:{' '}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RaceStatus | 'すべて')}>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {grouped.length === 0 && <p className="empty-note">該当するレースがありません</p>}

      {grouped.map(([date, races]) => (
        <section key={date} className="date-section">
          <h2>{formatDate(date)}</h2>
          <div className="table-scroll">
            <table className="race-list-table">
              <thead>
                <tr>
                  <th>レース</th>
                  <th>コース</th>
                  <th>発走</th>
                  <th>天候・馬場</th>
                  <th>頭数</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {races.map((race) => (
                  <tr
                    key={race.dir}
                    className="race-row"
                    onClick={() => navigate(`/races/${race.date}/${encodeURIComponent(race.dir)}`)}
                  >
                    <td>
                      <Link
                        to={`/races/${race.date}/${encodeURIComponent(race.dir)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {race.venue}
                        {race.raceNumber}R {race.raceName}
                      </Link>
                    </td>
                    <td>{race.course ?? '-'}</td>
                    <td>{race.startTime ?? '-'}</td>
                    <td>
                      {race.weather ?? '-'} / {race.trackCondition ?? '-'}
                    </td>
                    <td>{race.headcount}</td>
                    <td>
                      <StatusBadge status={race.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
