import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RuleStatItem } from '../api/types.ts';

// dataviz skillの status palette（good/warning/critical、mode-invariant）をそのまま使用。
// ❌が先頭（x=0起点）になるようスタック順を固定し、見直し閾値（3回）の参照線をそこに重ねる。
const COLOR_NG = '#d03b3b';
const COLOR_WARN = '#fab219';
const COLOR_OK = '#0ca30c';

const NG_THRESHOLD = 3;
const Y_AXIS_LABEL_MAX = 11;

function truncateRuleId(value: string): string {
  return value.length > Y_AXIS_LABEL_MAX ? `${value.slice(0, Y_AXIS_LABEL_MAX)}…` : value;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const row: RuleStatItem = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      <div>❌ 失敗: {row.ngCount}</div>
      <div>⚠️ 見送り相当: {row.warnCount}</div>
      <div>✅ 的中: {row.okCount}</div>
    </div>
  );
}

export function RuleHitRateChart({ stats }: { stats: RuleStatItem[] }) {
  if (stats.length === 0) {
    return <p className="empty-note">rules_log.md にルール適用ログがまだありません</p>;
  }

  const height = Math.max(200, stats.length * 28 + 40);

  return (
    <div className="chart-block">
      <ResponsiveContainer width="100%" height={height + 20}>
        <BarChart data={stats} layout="vertical" margin={{ top: 24, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" allowDecimals={false} stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="ruleId"
            width={150}
            stroke="var(--muted)"
            tick={{ fill: 'var(--fg)', fontSize: 12 }}
            tickFormatter={truncateRuleId}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--header-bg)' }} />
          <Legend
            formatter={(value) => <span style={{ color: 'var(--fg)' }}>{value}</span>}
            wrapperStyle={{ fontSize: 12 }}
          />
          <ReferenceLine
            x={NG_THRESHOLD}
            stroke={COLOR_NG}
            strokeDasharray="4 4"
            label={{ value: `❌${NG_THRESHOLD}回ライン`, position: 'top', fill: COLOR_NG, fontSize: 11 }}
          />
          <Bar dataKey="ngCount" name="❌ 失敗" stackId="stat" fill={COLOR_NG} />
          <Bar dataKey="warnCount" name="⚠️ 見送り相当" stackId="stat" fill={COLOR_WARN} />
          <Bar dataKey="okCount" name="✅ 的中" stackId="stat" fill={COLOR_OK} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
