import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CourseStatItem } from '../api/types.ts';

const COLOR_POSITIVE = '#0ca30c';
const COLOR_NEGATIVE = '#d03b3b';

// ホビー規模のデータでは少件数のコースはノイズになりやすいため、目安件数未満は
// 参考程度の扱いにする（非表示にはせず、注記のみ）。
const MIN_SAMPLE_SIZE = 10;

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row: CourseStatItem = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{row.course}</div>
      <div>収支合計: {row.profitYen.toLocaleString()}円（{row.knownProfitCount}/{row.raceCount}件集計）</div>
      {row.raceCount < MIN_SAMPLE_SIZE && <div className="chart-note">サンプル数が少なく参考値</div>}
    </div>
  );
}

export function CourseStatsChart({ stats }: { stats: CourseStatItem[] }) {
  if (stats.length === 0) {
    return (
      <p className="empty-note">
        構造化データ（frontmatter）を持つレースがまだありません。新フォーマットの/analysisを実行したレースが増えると表示されます。
      </p>
    );
  }

  const height = Math.max(160, stats.length * 32 + 40);

  return (
    <div className="chart-block">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={stats} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <YAxis type="category" dataKey="course" width={140} stroke="var(--muted)" tick={{ fill: 'var(--fg)', fontSize: 12 }} />
          <ReferenceLine x={0} stroke="var(--muted)" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--header-bg)' }} />
          <Bar dataKey="profitYen" name="収支">
            {stats.map((s) => (
              <Cell key={s.course} fill={s.profitYen >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {stats.some((s) => s.raceCount < MIN_SAMPLE_SIZE) && (
        <p className="chart-note">{MIN_SAMPLE_SIZE}件未満のコースは参考値（サンプル不足）</p>
      )}
    </div>
  );
}
