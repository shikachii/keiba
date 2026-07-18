import { Fragment, useState } from 'react';
import type { NewspaperHorse } from '../api/types.ts';
import { PastRacesPanel } from './PastRacesPanel.tsx';
import { AchievementsTable } from './AchievementsTable.tsx';
import { TrainingBlock } from './TrainingBlock.tsx';
import { wakuStyle, popularityStyle } from '../utils/raceColors.ts';

const COLUMN_COUNT = 12;

export function HorseTable({ horses }: { horses: NewspaperHorse[] }) {
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

  return (
    <div>
      <div className="table-toolbar">
        <button onClick={expandAll}>すべて展開</button>
        <button onClick={collapseAll}>すべて折りたたむ</button>
      </div>
      <div className="table-scroll">
        <table className="horse-table">
          <thead>
            <tr>
              <th></th>
              <th>枠</th>
              <th>馬番</th>
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
                      <td colSpan={COLUMN_COUNT}>
                        <div className="horse-detail">
                          <h4>前走データ</h4>
                          <PastRacesPanel pastRaces={horse.前走データ ?? []} />
                          <h4>コース別実績</h4>
                          <AchievementsTable achievements={horse.実績} />
                          <h4>調教・厩舎</h4>
                          <TrainingBlock
                            training={horse.調教}
                            comment={horse.厩舎コメント}
                            evaluation={horse.厩舎評価}
                          />
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
    </div>
  );
}
