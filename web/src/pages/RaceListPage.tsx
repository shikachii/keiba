import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrl, useApi } from '../api/client.ts';
import type { RaceListItem, RaceStatus } from '../api/types.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { WeightRefreshedBadge } from '../components/WeightRefreshedBadge.tsx';
import { Spinner, ErrorBox } from '../components/Spinner.tsx';

const STATUS_FILTERS: (RaceStatus | 'すべて')[] = ['すべて', '未着手', '予想のみ', '施行済み(レビュー未)', '施行済み'];

function formatDate(date: string): string {
  return `${date.slice(0, 4)}年${date.slice(4, 6)}月${date.slice(6, 8)}日`;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// ページ表示時点（マウント時）の日付・時刻を基準に「次のレース」を判定する。
// リアルタイム更新は不要なため、以降は時間が経っても再計算しない。
function todayStr(now: Date): string {
  return `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
}

function nowHHMM(now: Date): string {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

function findNextRaceDir(date: string, races: RaceListItem[], today: string, nowTime: string): string | null {
  if (date !== today) return null;
  const upcoming = races.filter((r) => r.startTime && r.startTime >= nowTime);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((min, r) => (r.startTime! < min.startTime! ? r : min)).dir;
}

export function RaceListPage() {
  const { data, loading, error } = useApi<RaceListItem[]>(apiUrl('races.json'));
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);
  const today = todayStr(now);
  const nowTime = nowHHMM(now);

  const statusFilter = (searchParams.get('status') as RaceStatus | null) ?? 'すべて';
  const setStatusFilter = (value: RaceStatus | 'すべて') => {
    if (value === 'すべて') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ status: value }, { replace: true });
    }
  };

  const grouped = useMemo(() => {
    if (!data) return [];
    const filtered = statusFilter === 'すべて' ? data : data.filter((r) => r.status === statusFilter);
    const byDate = new Map<string, RaceListItem[]>();
    for (const race of filtered) {
      if (!byDate.has(race.date)) byDate.set(race.date, []);
      byDate.get(race.date)!.push(race);
    }
    return Array.from(byDate.entries()).map(([date, races]) => {
      const byVenue = new Map<string, RaceListItem[]>();
      for (const race of races) {
        if (!byVenue.has(race.venue)) byVenue.set(race.venue, []);
        byVenue.get(race.venue)!.push(race);
      }
      const venueGroups = Array.from(byVenue.entries()).sort(
        ([, a], [, b]) => (a[0].startTime ?? '99:99').localeCompare(b[0].startTime ?? '99:99'),
      );
      return [date, venueGroups] as const;
    });
  }, [data, statusFilter]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div>
      <header className="page-header">
        <h1>競馬レースビューア</h1>
        <div className="header-links">
          <Link to="/summary" className="header-link">
            収支サマリー
          </Link>
          <Link to="/rules-log" className="header-link">
            ルール適用ログ
          </Link>
        </div>
      </header>

      <div className="filter-bar">
        <label>
          ステータス絞り込み:{' '}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RaceStatus | 'すべて')}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {grouped.length === 0 && <p className="empty-note">該当するレースがありません</p>}

      {grouped.map(([date, venueGroups]) => (
        <section key={date} className="date-section">
          <h2>{formatDate(date)}</h2>
          {venueGroups.map(([venue, races]) => {
            const nextRaceDir = findNextRaceDir(date, races, today, nowTime);
            return (
            <div key={venue} className="venue-group">
              <h3 className="venue-heading">{venue}</h3>
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
                        className={race.dir === nextRaceDir ? 'race-row race-row-next' : 'race-row'}
                        onClick={() => navigate(`/races/${race.date}/${encodeURIComponent(race.dir)}`)}
                      >
                        <td>
                          {race.dir === nextRaceDir && <span className="next-race-badge">次走</span>}
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
                          <div className="status-cell">
                            <StatusBadge status={race.status} />
                            <WeightRefreshedBadge weightRefreshedAt={race.weightRefreshedAt} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
