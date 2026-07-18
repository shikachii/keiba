import { useState } from 'react';
import { apiUrl, useApi } from '../api/client.ts';
import type { RulesLogResponse, RuleStatItem } from '../api/types.ts';
import { Spinner, ErrorBox } from '../components/Spinner.tsx';
import { MarkdownView } from '../components/MarkdownView.tsx';
import { BackLink } from '../components/BackLink.tsx';
import { RuleHitRateChart } from '../components/RuleHitRateChart.tsx';

export function RulesLogPage() {
  const { data, loading, error } = useApi<RulesLogResponse>(apiUrl('rules-log.json'));
  const { data: stats } = useApi<RuleStatItem[]>(apiUrl('rule-stats.json'));
  const [filter, setFilter] = useState('');

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <ErrorBox message="rules_log.md が見つかりません" />;

  const content = filter.trim()
    ? data.content
        .split('\n')
        .filter((line) => !line.startsWith('|') || line.toLowerCase().includes(filter.toLowerCase()) || line.includes('---'))
        .join('\n')
    : data.content;

  return (
    <div>
      <header className="page-header">
        <BackLink label="← 一覧に戻る" />
      </header>
      <h1>ルール適用ログ</h1>

      <h2>ルール別 的中率</h2>
      {stats && (
        <RuleHitRateChart
          stats={
            filter.trim()
              ? stats.filter((s) => s.ruleId.toLowerCase().includes(filter.toLowerCase()))
              : stats
          }
        />
      )}

      <div className="filter-bar">
        <label>
          絞り込み（ルールIDなど）:{' '}
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="例: R-09" />
        </label>
      </div>
      <MarkdownView content={content} />
    </div>
  );
}
