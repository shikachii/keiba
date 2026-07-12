import type { Achievement } from '../api/types.ts';

export function AchievementsTable({ achievements }: { achievements: Achievement[] | undefined }) {
  if (!achievements || achievements.length === 0) {
    return <p className="empty-note">実績データなし</p>;
  }

  return (
    <table className="achievements-table">
      <thead>
        <tr>
          <th>条件</th>
          <th>勝</th>
          <th>連</th>
          <th>複</th>
          <th>着外</th>
        </tr>
      </thead>
      <tbody>
        {achievements.map((a, i) => (
          <tr key={i}>
            <td>{a.条件}</td>
            <td>{a.勝}</td>
            <td>{a.連}</td>
            <td>{a.複}</td>
            <td>{a.着外}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
