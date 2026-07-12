import type { PayoutEntry } from '../api/types.ts';

const BET_TYPE_ORDER = ['単勝', '複勝', '枠連', '馬連', 'ワイド', '馬単', '3連複', '3連単'];

export function PayoutTable({ payouts }: { payouts: Record<string, PayoutEntry> | undefined }) {
  if (!payouts || Object.keys(payouts).length === 0) {
    return <p className="empty-note">払戻データなし</p>;
  }

  const orderedKeys = [
    ...BET_TYPE_ORDER.filter((k) => k in payouts),
    ...Object.keys(payouts).filter((k) => !BET_TYPE_ORDER.includes(k)),
  ];

  return (
    <table className="payout-table">
      <thead>
        <tr>
          <th>券種</th>
          <th>組番</th>
          <th>払戻</th>
          <th>人気</th>
        </tr>
      </thead>
      <tbody>
        {orderedKeys.map((betType) => {
          const entry = payouts[betType];
          const rows = entry.pays.length;
          // nums はフラット配列で、1行あたりの組番数 = nums.length / pays.length
          const chunkSize = rows > 0 ? entry.nums.length / rows : 0;
          return Array.from({ length: rows }, (_, i) => {
            const combo = entry.nums.slice(i * chunkSize, (i + 1) * chunkSize).join('-');
            return (
              <tr key={`${betType}-${i}`}>
                {i === 0 && <th rowSpan={rows}>{betType}</th>}
                <td>{combo}</td>
                <td>{entry.pays[i] ?? ''}</td>
                <td>{entry.ninkis[i] ?? ''}</td>
              </tr>
            );
          });
        })}
      </tbody>
    </table>
  );
}
