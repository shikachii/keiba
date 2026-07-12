import { Link, useParams } from 'react-router-dom';
import { apiUrl, useApi } from '../api/client.ts';
import type { RaceDetail } from '../api/types.ts';
import { Spinner, ErrorBox } from '../components/Spinner.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { Tabs, type TabDef } from '../components/Tabs.tsx';
import { HorseTable } from '../components/HorseTable.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { LapCornerPace } from '../components/LapCornerPace.tsx';
import { PayoutTable } from '../components/PayoutTable.tsx';
import { MarkdownView } from '../components/MarkdownView.tsx';

export function RaceDetailPage() {
  const { date, dir } = useParams<{ date: string; dir: string }>();
  const url = date && dir ? apiUrl(`races/${encodeURIComponent(date)}/${encodeURIComponent(dir)}.json`) : null;
  const { data, loading, error } = useApi<RaceDetail>(url);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <ErrorBox message="レースが見つかりません" />;

  const horseData = data.newspaper ?? data.shutuba;
  const horses = horseData?.出走馬 ?? [];

  const tabs: TabDef[] = [
    {
      key: 'shutuba',
      label: '出馬表',
      content: <HorseTable horses={horses} />,
    },
    {
      key: 'result',
      label: '結果',
      disabled: !data.result,
      disabledReason: '未施行のため結果データがありません',
      content: data.result ? (
        <div>
          <LapCornerPace lapData={data.result.lapData} corners={data.result.corners} pace={data.result.pace} />
          <h4>着順</h4>
          <ResultTable results={data.result.results} />
          <h4>払戻</h4>
          <PayoutTable payouts={data.result.payouts} />
        </div>
      ) : null,
    },
    {
      key: 'analysis',
      label: '予想',
      disabled: !data.analysisMd,
      disabledReason: '予想がまだ作成されていません',
      content: data.analysisMd ? <MarkdownView content={data.analysisMd} /> : null,
    },
    {
      key: 'review',
      label: '振り返り',
      disabled: !data.reviewMd,
      disabledReason: '振り返りがまだ作成されていません',
      content: data.reviewMd ? <MarkdownView content={data.reviewMd} /> : null,
    },
  ];

  return (
    <div>
      <header className="page-header">
        <Link to="/" className="header-link">
          ← 一覧に戻る
        </Link>
      </header>

      <div className="race-detail-header">
        <h1>
          {data.venue}
          {data.raceNumber}R {data.raceName}
        </h1>
        <StatusBadge status={data.status} />
      </div>

      <Tabs tabs={tabs} defaultKey="shutuba" />
    </div>
  );
}
