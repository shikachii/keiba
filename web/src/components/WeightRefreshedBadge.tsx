export function WeightRefreshedBadge({ weightRefreshedAt }: { weightRefreshedAt: string | null }) {
  if (!weightRefreshedAt) return null;
  return (
    <span className="weight-refreshed-badge" title={`馬体重が${weightRefreshedAt}に確定`}>
      馬体重確定 {weightRefreshedAt}
    </span>
  );
}
