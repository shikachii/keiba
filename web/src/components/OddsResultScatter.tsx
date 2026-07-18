import {
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { OddsScatterPoint } from '../api/types.ts';

// dataviz skillのstatus palette（good/critical、mode-invariant）を他チャートと揃えて使用。
const COLOR_HIT = '#0ca30c';
const COLOR_MISS = 'var(--muted)';

// CLAUDE.mdの狙う戦略「5〜9番人気の馬を絡めて勝つ」に対応するゾーン。
const ZONE_MIN = 5;
const ZONE_MAX = 9;

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point: OddsScatterPoint = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">
        {point.venue}
        {point.raceNumber}R {point.horseName ?? `${point.horseNumber}番`}
      </div>
      <div>
        {point.popularity}人気 / {point.odds}倍 → 結果{point.resultRank ?? '不明'}着
      </div>
      <div>{point.mark ?? '無印'}</div>
    </div>
  );
}

export function OddsResultScatter({ points }: { points: OddsScatterPoint[] }) {
  const withRank = points.filter((p) => p.resultRank !== null);
  if (withRank.length === 0) {
    return (
      <p className="empty-note">
        構造化データ（frontmatter）を持つレースがまだありません。新フォーマットの/analysis・/reviewを実行したレースが増えると表示されます。
      </p>
    );
  }

  const hit = withRank.filter((p) => (p.resultRank ?? 99) <= 3);
  const miss = withRank.filter((p) => (p.resultRank ?? 99) > 3);
  const maxRank = Math.max(...withRank.map((p) => p.resultRank ?? 1));

  return (
    <div className="chart-block">
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
          <XAxis
            type="number"
            dataKey="popularity"
            name="人気"
            domain={[1, 'dataMax']}
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            label={{ value: '人気', position: 'insideBottom', offset: -4, fill: 'var(--muted)', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="resultRank"
            name="着順"
            reversed
            domain={[1, maxRank]}
            allowDecimals={false}
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            label={{ value: '着順', angle: -90, position: 'insideLeft', fill: 'var(--muted)', fontSize: 12 }}
          />
          <ReferenceArea x1={ZONE_MIN} x2={ZONE_MAX} fill="var(--accent)" fillOpacity={0.08} ifOverflow="extendDomain" />
          <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => <span style={{ color: 'var(--fg)' }}>{value}</span>} />
          <Scatter name="3着以内" data={hit} fill={COLOR_HIT} />
          <Scatter name="4着以下" data={miss} fill={COLOR_MISS} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="chart-note">網掛け部分は{ZONE_MIN}〜{ZONE_MAX}番人気ゾーン（狙うスタイルの中心帯）</p>
    </div>
  );
}
