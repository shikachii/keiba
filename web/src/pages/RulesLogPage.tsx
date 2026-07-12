import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, useApi } from '../api/client.ts';
import type { RulesLogResponse } from '../api/types.ts';
import { Spinner, ErrorBox } from '../components/Spinner.tsx';
import { MarkdownView } from '../components/MarkdownView.tsx';

export function RulesLogPage() {
  const { data, loading, error } = useApi<RulesLogResponse>(apiUrl('rules-log.json'));
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
        <Link to="/" className="header-link">
          ← 一覧に戻る
        </Link>
      </header>
      <h1>ルール適用ログ</h1>
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
