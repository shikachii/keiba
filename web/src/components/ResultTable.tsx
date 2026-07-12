import type { ResultEntry } from '../api/types.ts';

export function ResultTable({ results }: { results: ResultEntry[] }) {
  if (!results || results.length === 0) {
    return <p className="empty-note">結果データなし</p>;
  }

  return (
    <div className="table-scroll">
      <table className="result-table">
        <thead>
          <tr>
            <th>着順</th>
            <th>枠</th>
            <th>馬番</th>
            <th>馬名</th>
            <th>性齢</th>
            <th>斤量</th>
            <th>騎手</th>
            <th>タイム</th>
            <th>着差</th>
            <th>上り3F</th>
            <th>通過</th>
            <th>オッズ</th>
            <th>人気</th>
            <th>馬体重</th>
            <th>厩舎</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.rank}</td>
              <td>{r.wakuNum}</td>
              <td>{r.horseNum}</td>
              <td>{r.horseName}</td>
              <td>{r.sexAge}</td>
              <td>{r.weight}</td>
              <td>{r.jockey}</td>
              <td>{r.finTime}</td>
              <td>{r.margin}</td>
              <td>{r.last3f}</td>
              <td>{r.corner}</td>
              <td>{r.odds}</td>
              <td>{r.popularity}</td>
              <td>
                {r.bodyWeight}
                {r.bodyWeightDiff ? `(${r.bodyWeightDiff})` : ''}
              </td>
              <td>{r.stable ?? r.trainer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
