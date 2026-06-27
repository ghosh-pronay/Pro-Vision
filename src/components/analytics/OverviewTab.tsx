import type { Period } from "./PeriodSelector";

export function OverviewTab({ period }: { period: Period }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Overview</h3>
      <p className="text-muted-foreground text-sm">
        Analytics overview for {period}.
      </p>
    </div>
  );
}
