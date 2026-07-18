import { Fragment, useState } from 'react';
import type { NewspaperHorse } from '../api/types.ts';
import { PastRacesPanel } from './PastRacesPanel.tsx';
import { AchievementsTable } from './AchievementsTable.tsx';
import { TrainingBlock } from './TrainingBlock.tsx';
import { wakuStyle, popularityStyle, markClass } from '../utils/raceColors.ts';

const BASE_COLUMN_COUNT = 12;

function parseBodyWeight(raw: string | undefined): { value: string; diff: number | null } | null {
  if (!raw) return null;
  const m = raw.match(/(\d+)\s*kg\s*\(([+-]?\d+)\)/);
  if (!m) return { value: raw.replace(/kg/, '').trim(), diff: null };
  return { value: m[1], diff: Number(m[2]) };
}

function weightDiffClass(diff: number | null): string {
  if (diff === null) return '';
  return diff > 0 ? 'up' : diff < 0 ? 'down' : '';
}

function weightDiffText(diff: number | null): string {
  if (diff === null) return '';
  return diff > 0 ? `(+${diff})` : `(${diff})`;
}

function HorseDetailContent({ horse }: { horse: NewspaperHorse }) {
  return (
    <>
      <h4>前走データ</h4>
      <PastRacesPanel pastRaces={horse.前走データ ?? []} />
      <h4>コース別実績</h4>
      <AchievementsTable achievements={horse.実績} />
      <h4>調教・厩舎</h4>
      <TrainingBlock training={horse.調教} comment={horse.厩舎コメント} evaluation={horse.厩舎評価} />
    </>
  );
}

export function HorseTable({
  horses,
  marksByHorseNumber,
}: {
  horses: NewspaperHorse[];
  marksByHorseNumber?: Map<string, string | null>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (horseNum: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(horseNum)) next.delete(horseNum);
      else next.add(horseNum);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(horses.map((h) => h.馬番)));
  const collapseAll = () => setExpanded(new Set());

  const sorted = [...horses].sort((a, b) => Number(a.馬番) - Number(b.馬番));
  const columnCount = marksByHorseNumber ? BASE_COLUMN_COUNT + 1 : BASE_COLUMN_COUNT;

  return (
    <div>
      <div className="table-toolbar">
        <button onClick={expandAll}>すべて展開</button>
        <button onClick={collapseAll}>すべて折りたたむ</button>
      </div>
      <div className="table-scroll desktop-only">
        <table className="horse-table">
          <thead>
            <tr>
              <th></th>
              <th>枠</th>
              <th>馬番</th>
              {marksByHorseNumber && <th>印</th>}
              <th>馬名</th>
              <th>性齢</th>
              <th>騎手</th>
              <th>斤量</th>
              <th>オッズ</th>
              <th>人気</th>
              <th>調教師</th>
              <th>脚質ローテ</th>
              <th>馬体重</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((horse) => {
              const isOpen = expanded.has(horse.馬番);
              return (
                <Fragment key={horse.馬番}>
                  <tr className="horse-row" onClick={() => toggle(horse.馬番)}>
                    <td>{isOpen ? '▼' : '▶'}</td>
                    <td style={wakuStyle(horse.枠番)}>{horse.枠番}</td>
                    <td style={wakuStyle(horse.枠番)}>{horse.馬番}</td>
                    {marksByHorseNumber && (
                      <td className="mark-cell">{marksByHorseNumber.get(horse.馬番) || '-'}</td>
                    )}
                    <td>{horse.馬名}</td>
                    <td>{horse.性齢}</td>
                    <td>{horse.騎手}</td>
                    <td>{horse.斤量}</td>
                    <td>{horse.オッズ}</td>
                    <td style={popularityStyle(horse.人気)}>{horse.人気}</td>
                    <td>{horse.調教師}</td>
                    <td>{horse.脚質ローテ}</td>
                    <td>{horse.馬体重 || '-'}</td>
                  </tr>
                  {isOpen && (
                    <tr className="horse-detail-row">
                      <td colSpan={columnCount}>
                        <div className="horse-detail">
                          <HorseDetailContent horse={horse} />
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

      <div className="horse-card-list mobile-only">
        {sorted.map((horse) => {
          const isOpen = expanded.has(horse.馬番);
          const mark = marksByHorseNumber?.get(horse.馬番) || '-';
          const weight = parseBodyWeight(horse.馬体重);
          return (
            <div className="horse-card" key={horse.馬番}>
              <div
                className="horse-card-row"
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => toggle(horse.馬番)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(horse.馬番);
                  }
                }}
              >
                <span className="horse-card-waku" style={wakuStyle(horse.枠番)}>
                  {horse.枠番}
                </span>
                <span className="horse-card-num">{horse.馬番}</span>
                {marksByHorseNumber && <span className={`horse-card-mark ${markClass(mark)}`}>{mark}</span>}
                <span className="horse-card-name">{horse.馬名}</span>
                <div className="horse-card-weight">
                  <span className="horse-card-weight-value">{weight ? weight.value : '-'}</span>
                  <span className={`horse-card-weight-diff ${weightDiffClass(weight?.diff ?? null)}`}>
                    {weight ? weightDiffText(weight.diff) : ''}
                  </span>
                </div>
                <div className="horse-card-odds">
                  <span className="horse-card-odds-value">{horse.オッズ || '-'}</span>
                  <span className="horse-card-pop" style={popularityStyle(horse.人気)}>
                    {horse.人気 ? `${horse.人気}人気` : '-'}
                  </span>
                </div>
              </div>
              <div className="horse-card-meta">
                {horse.性齢} ・ {horse.斤量}kg ・ {horse.騎手} ・ {horse.調教師}
              </div>
              <button
                className="horse-card-more"
                aria-expanded={isOpen}
                onClick={() => toggle(horse.馬番)}
              >
                <span className="horse-card-more-arrow">▾</span>
                {isOpen ? '閉じる' : `もっと見る（脚質ローテ${horse.脚質ローテ ? `：${horse.脚質ローテ}` : ''}）`}
              </button>
              {isOpen && (
                <div className="horse-card-detail">
                  <HorseDetailContent horse={horse} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
