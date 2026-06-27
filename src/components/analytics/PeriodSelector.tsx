export type Period = "7d" | "30d" | "90d";

export function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const periods: { id: Period; label: string }[] = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
  ];
  return (
    <div className="flex gap-1 p-1 glass rounded-2xl">
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            value === p.id
              ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
