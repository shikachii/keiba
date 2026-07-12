import type { LapEntry } from '../api/types.ts';

export function LapCornerPace({
  lapData,
  corners,
  pace,
}: {
  lapData: LapEntry[] | undefined;
  corners: Record<string, string> | undefined;
  pace: string | undefined;
}) {
  return (
    <div className="lap-corner-pace">
      {pace && (
        <p>
          ペース判定: <span className="pace-badge">{pace}</span>
        </p>
      )}

      {corners && Object.keys(corners).length > 0 && (
        <div>
          <h4>コーナー通過順</h4>
          <table className="corners-table">
            <tbody>
              {Object.entries(corners).map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td style={{ fontFamily: 'monospace' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lapData && lapData.length > 0 && (
        <div className="table-scroll">
          <h4>ラップタイム</h4>
          <table className="lap-table">
            <thead>
              <tr>
                {lapData.map((l) => (
                  <th key={l.point}>{l.point}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {lapData.map((l) => (
                  <td key={l.point}>{l.split}</td>
                ))}
              </tr>
              <tr>
                {lapData.map((l) => (
                  <td key={l.point} className="cumulative">
                    {l.cumulative}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
