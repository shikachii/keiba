import type { PastRace } from '../api/types.ts';
import { popularityStyle } from '../utils/raceColors.ts';

const ATTRIBUTE_ROWS: { key: keyof PastRace; label: string }[] = [
  { key: '着順', label: '着順' },
  { key: '日付場R', label: '日付・場・R' },
  { key: 'レース名', label: 'レース名' },
  { key: 'グレード', label: 'グレード' },
  { key: '条件', label: '条件' },
  { key: '頭数', label: '頭数' },
  { key: '馬番', label: '馬番' },
  { key: '人気', label: '人気' },
  { key: 'コース', label: 'コース' },
  { key: '回り', label: '回り' },
  { key: '馬場', label: '馬場' },
  { key: 'タイム', label: 'タイム' },
  { key: '騎手', label: '騎手' },
  { key: '斤量', label: '斤量' },
  { key: '馬体重', label: '馬体重' },
  { key: '増減', label: '増減' },
  { key: '前3F', label: '前3F' },
  { key: '通過順', label: '通過順' },
  { key: '後3F', label: '後3F' },
  { key: 'ペース', label: 'ペース' },
  { key: '勝ち馬', label: '勝ち馬' },
  { key: '着差', label: '着差' },
  { key: '備考', label: '備考' },
];

export function PastRacesPanel({ pastRaces }: { pastRaces: PastRace[] }) {
  if (!pastRaces || pastRaces.length === 0) {
    return <p className="empty-note">前走データなし</p>;
  }

  return (
    <div className="past-races-scroll">
      <table className="past-races-table">
        <thead>
          <tr>
            <th>項目</th>
            {pastRaces.map((r, i) => (
              <th key={i}>{r.順番 ?? `${i + 1}走前`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTE_ROWS.map(({ key, label }) => (
            <tr key={key}>
              <th>{label}</th>
              {pastRaces.map((r, i) => (
                <td
                  key={i}
                  style={{ whiteSpace: 'pre-line', ...(key === '人気' ? popularityStyle(r[key]) : undefined) }}
                >
                  {r[key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
