import type { Period } from "./PeriodSelector";

export function GoalsTab() {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Goals</h3>
      <p className="text-muted-foreground text-sm">Goal progress analytics.</p>
    </div>
  );
}

export function InsightsTab({ period }: { period: Period }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Insights</h3>
      <p className="text-muted-foreground text-sm">Insights for {period}.</p>
    </div>
  );
}
