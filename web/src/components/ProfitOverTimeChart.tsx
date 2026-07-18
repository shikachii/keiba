import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RaceSummaryItem } from '../api/types.ts';

const COLOR_LINE = '#2563eb'; // 既存の --accent と同系統（グラフ内では固定色として使用）

function formatDate(date: string): string {
  return `${date.slice(4, 6)}/${date.slice(6, 8)}`;
}

interface DailyPoint {
  date: string;
  label: string;
  dailyProfit: number;
  cumulativeProfit: number;
  knownCount: number;
  raceCount: number;
}

function buildDailySeries(items: RaceSummaryItem[]): DailyPoint[] {
  const byDate = new Map<string, RaceSummaryItem[]>();
  for (const item of items) {
    if (!byDate.has(item.date)) byDate.set(item.date, []);
    byDate.get(item.date)!.push(item);
  }

  const dates = Array.from(byDate.keys()).sort();
  let cumulative = 0;
  return dates.map((date) => {
    const races = byDate.get(date)!;
    const known = races.filter((r) => r.profitYen !== null);
    const dailyProfit = known.reduce((sum, r) => sum + (r.profitYen ?? 0), 0);
    cumulative += dailyProfit;
    return {
      date,
      label: formatDate(date),
      dailyProfit,
      cumulativeProfit: cumulative,
      knownCount: known.length,
      raceCount: races.length,
    };
  });
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point: DailyPoint = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{point.date}</div>
      <div>累積収支: {point.cumulativeProfit.toLocaleString()}円</div>
      <div>
        当日収支: {point.dailyProfit.toLocaleString()}円（{point.knownCount}/{point.raceCount}件集計）
      </div>
    </div>
  );
}

export function ProfitOverTimeChart({ items }: { items: RaceSummaryItem[] }) {
  const series = buildDailySeries(items);
  if (series.length === 0) {
    return <p className="empty-note">収支データがまだありません</p>;
  }

  return (
    <div className="chart-block">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={series} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
          <XAxis dataKey="label" stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
          <YAxis
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <ReferenceLine y={0} stroke="var(--muted)" />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
          <Line
            type="monotone"
            dataKey="cumulativeProfit"
            name="累積収支"
            stroke={COLOR_LINE}
            strokeWidth={2}
            dot={{ r: 4, fill: COLOR_LINE, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
