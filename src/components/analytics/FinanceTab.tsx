import { useState, useMemo, memo } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { Calendar } from "lucide-react";

type ReportView = "balanceSheet" | "incomeExpense";

type DatePreset =
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "lastYear"
  | "allTime"
  | "custom";

const VIEW_TABS = [
  { id: "balanceSheet" as const, en: "Balance Sheet", bn: "ব্যালেন্স শিট" },
  { id: "incomeExpense" as const, en: "Income & Expense", bn: "আয় ও ব্যয়" },
];

const PRESET_OPTIONS: { id: DatePreset; en: string; bn: string }[] = [
  { id: "thisMonth", en: "This Month", bn: "এই মাস" },
  { id: "lastMonth", en: "Last Month", bn: "গত মাস" },
  { id: "thisQuarter", en: "This Quarter", bn: "এই ত্রৈমাসিক" },
  { id: "lastQuarter", en: "Last Quarter", bn: "গত ত্রৈমাসিক" },
  { id: "thisYear", en: "This Year", bn: "এই বছর" },
  { id: "lastYear", en: "Last Year", bn: "গত বছর" },
  { id: "allTime", en: "All Time", bn: "সব সময়" },
  { id: "custom", en: "Custom Range", bn: "কাস্টম রেঞ্জ" },
];

function getDateRange(
  preset: DatePreset,
  customStart?: string,
  customEnd?: string,
): { startDate: number; endDate: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  switch (preset) {
    case "thisMonth":
      return {
        startDate: new Date(year, month, 1).getTime(),
        endDate: new Date(year, month, day, 23, 59, 59, 999).getTime(),
      };
    case "lastMonth":
      return {
        startDate: new Date(year, month - 1, 1).getTime(),
        endDate: new Date(year, month, 0, 23, 59, 59, 999).getTime(),
      };
    case "thisQuarter": {
      const quarterStart = Math.floor(month / 3) * 3;
      return {
        startDate: new Date(year, quarterStart, 1).getTime(),
        endDate: new Date(year, month, day, 23, 59, 59, 999).getTime(),
      };
    }
    case "lastQuarter": {
      const lastQStart = Math.floor(month / 3) * 3 - 3;
      const lastQEnd = Math.floor(month / 3) * 3 - 1;
      return {
        startDate: new Date(year, lastQStart, 1).getTime(),
        endDate: new Date(year, lastQEnd + 1, 0, 23, 59, 59, 999).getTime(),
      };
    }
    case "thisYear":
      return {
        startDate: new Date(year, 0, 1).getTime(),
        endDate: new Date(year, month, day, 23, 59, 59, 999).getTime(),
      };
    case "lastYear":
      return {
        startDate: new Date(year - 1, 0, 1).getTime(),
        endDate: new Date(year - 1, 11, 31, 23, 59, 59, 999).getTime(),
      };
    case "allTime":
      return {
        startDate: new Date(2020, 0, 1).getTime(),
        endDate: new Date(year, month, day, 23, 59, 59, 999).getTime(),
      };
    case "custom": {
      const start = customStart
        ? new Date(customStart).getTime()
        : new Date(year, month, 1).getTime();
      const end = customEnd
        ? new Date(customEnd + "T23:59:59.999").getTime()
        : new Date(year, month, day, 23, 59, 59, 999).getTime();
      return { startDate: start, endDate: end };
    }
  }
}

function formatDateLabel(start: number, end: number): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}`;
}

function formatBDT(amount: number): string {
  if (Math.abs(amount) >= 100000) {
    return `৳${(amount / 100000).toFixed(2)}L`;
  }
  return `৳${amount.toLocaleString()}`;
}

function formatChange(pct: number): { text: string; positive: boolean } {
  if (pct === 0) return { text: "0%", positive: true };
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, positive: pct > 0 };
}

const BSRow = memo(function BSRow({
  label,
  amount,
  indent = false,
  bold = false,
  underline = false,
}: {
  label: string;
  amount: number;
  indent?: boolean;
  bold?: boolean;
  underline?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-1.5 ${indent ? "pl-4" : ""} ${bold ? "font-semibold" : ""} ${underline ? "border-t border-border/40 mt-1 pt-2" : ""}`}
    >
      <span className="text-sm text-foreground">{label}</span>
      <span
        className={`text-sm tabular-nums ${bold ? "font-bold" : ""} ${amount < 0 ? "text-red-500" : ""}`}
      >
        {formatBDT(amount)}
      </span>
    </div>
  );
});

const BSGroup = memo(function BSGroup({
  title,
  items,
  total,
  totalLabel,
  level,
}: {
  title: string;
  items: {
    label: string;
    amount: number;
    breakdown?: { name: string; amount: number }[];
  }[];
  total: number;
  totalLabel: string;
  level?: "current" | "nonCurrent";
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-2 h-2 rounded-full ${level === "nonCurrent" ? "bg-[var(--pv-teal)]" : "bg-[var(--pv-blue)]"}`}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="ml-4">
        {items.map((item) => (
          <div key={item.label}>
            <BSRow label={item.label} amount={item.amount} indent />
            {item.breakdown &&
              item.breakdown
                .filter((b) => b.amount !== 0)
                .map((b) => (
                  <BSRow
                    key={b.name}
                    label={`  ${b.name}`}
                    amount={b.amount}
                    indent
                  />
                ))}
          </div>
        ))}
      </div>
      <BSRow label={totalLabel} amount={total} bold underline />
    </div>
  );
});

const IESection = memo(function IESection({
  title,
  color,
  categories,
  total,
  compCategories,
  compTotal,
}: {
  title: string;
  color: string;
  categories: { name: string; amount: number; pct: number }[];
  total: number;
  compCategories: { name: string; amount: number }[];
  compTotal: number;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span
          className="ml-auto text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {formatBDT(total)}
        </span>
      </div>
      <div className="space-y-1.5">
        {categories.length === 0 && (
          <div className="text-xs text-muted-foreground py-2">
            No transactions in this period
          </div>
        )}
        {categories.map((cat) => {
          const compAmount =
            compCategories.find((l) => l.name === cat.name)?.amount ?? 0;
          const change =
            compAmount > 0
              ? Math.round(((cat.amount - compAmount) / compAmount) * 100)
              : null;
          return (
            <div key={cat.name} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-foreground truncate">
                    {cat.name}
                  </span>
                  <span className="text-xs font-medium tabular-nums text-foreground ml-2 shrink-0">
                    {formatBDT(cat.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%`, background: color }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                    {cat.pct}%
                  </span>
                  {change !== null && (
                    <span
                      className={`text-xs w-10 text-right shrink-0 ${change > 0 ? "text-red-500" : change < 0 ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      {change > 0 ? "+" : ""}
                      {change}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const DateRangePicker = memo(function DateRangePicker({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  lang,
}: {
  preset: DatePreset;
  onPresetChange: (p: DatePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
  lang: string;
}) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-2">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              onPresetChange(opt.id);
              if (opt.id !== "custom") setShowCustom(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              preset === opt.id
                ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {lang === "bn" ? opt.bn : opt.en}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {(preset === "custom" || showCustom) && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs bg-foreground/5 border border-border/40 text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--pv-blue)]/50"
            />
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs bg-foreground/5 border border-border/40 text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--pv-blue)]/50"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export function FinanceTab({ period }: { period: "7d" | "30d" | "90d" }) {
  const [view, setView] = useState<ReportView>("balanceSheet");
  const [datePreset, setDatePreset] = useState<DatePreset>("thisMonth");
  const [customStart, setCustomStart] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset, customStart, customEnd),
    [datePreset, customStart, customEnd],
  );

  const { lang } = useI18n();

  const bs = {
    asOf: endDate,
    assets: {
      total: 0,
      current: 0,
      nonCurrent: 0,
      currentBreakdown: [],
      nonCurrentBreakdown: [],
    },
    liabilities: {
      total: 0,
      current: 0,
      nonCurrent: 0,
      currentBreakdown: [],
      nonCurrentBreakdown: [],
    },
    netWorth: 0,
  };
  const ie = {
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0,
      periodIncome: 0,
      periodExpense: 0,
      periodNet: 0,
      compIncome: 0,
      compExpense: 0,
      compNet: 0,
      yearIncome: 0,
      yearExpense: 0,
      yearNet: 0,
      incomeChange: 0,
      expenseChange: 0,
    },
    period: { selected: "", comparison: "", year: 2025 },
    selectedPeriod: {
      income: { categories: [] as any[], total: 0 },
      expense: { categories: [] as any[], total: 0 },
    },
    comparisonPeriod: {
      income: { categories: [] as any[], total: 0 },
      expense: { categories: [] as any[], total: 0 },
    },
  };

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="flex gap-1 p-1 glass rounded-2xl">
        {VIEW_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              view === t.id
                ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {t.id === "balanceSheet" ? "⚖️" : "📊"}
              {lang === "bn" ? t.bn : t.en}
            </span>
          </button>
        ))}
      </div>

      {/* Date Range Picker */}
      <div className="glass rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {lang === "bn" ? "সময়কাল নির্বাচন করুন" : "Select Date Range"}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDateLabel(startDate, endDate)}
          </span>
        </div>
        <DateRangePicker
          preset={datePreset}
          onPresetChange={setDatePreset}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          lang={lang}
        />
      </div>

      {view === "balanceSheet" && (
        <BalanceSheetView
          data={bs}
          lang={lang}
          dateLabel={formatDateLabel(startDate, endDate)}
        />
      )}

      {view === "incomeExpense" && <IncomeExpenseView data={ie} lang={lang} />}
    </div>
  );
}

function BalanceSheetView({
  data,
  lang,
  dateLabel,
}: {
  data: any;
  lang: string;
  dateLabel: string;
}) {
  const { assets, liabilities, netWorth } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-4">
        <div className="text-center mb-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Pro-Vision Financial Position
          </div>
          <div className="text-sm font-bold text-foreground">
            Statement of Financial Position
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            As at {dateLabel}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Presented in accordance with IAS 1 — Presentation of Financial
            Statements
          </div>
        </div>
      </div>

      {/* Net Worth Highlight */}
      <div
        className={`glass-strong rounded-2xl p-4 text-center ${netWorth >= 0 ? "glow-green" : "glow-orange"}`}
      >
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {lang === "bn" ? "নিট সম্পদ" : "Net Worth"}
        </div>
        <div
          className={`text-3xl font-extrabold tabular-nums ${netWorth >= 0 ? "text-[var(--pv-green)]" : "text-red-500"}`}
        >
          {formatBDT(netWorth)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {lang === "bn" ? "সম্পদ − দায়" : "Total Assets − Total Liabilities"}
        </div>
      </div>

      {/* Two-column layout on larger screens */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* ASSETS */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
            <div className="w-3 h-3 rounded-full bg-[var(--pv-blue)]" />
            <span className="text-sm font-bold text-foreground uppercase tracking-wider">
              {lang === "bn" ? "সম্পদ" : "ASSETS"}
            </span>
            <span className="ml-auto text-sm font-bold tabular-nums text-[var(--pv-blue)]">
              {formatBDT(assets.total)}
            </span>
          </div>

          <BSGroup
            title={lang === "bn" ? "চলতি সম্পদ" : "Current Assets"}
            items={assets.currentBreakdown}
            total={assets.current}
            totalLabel={
              lang === "bn" ? "মোট চলতি সম্পদ" : "Total Current Assets"
            }
            level="current"
          />

          <BSGroup
            title={lang === "bn" ? "দীর্ঘমেয়াদী সম্পদ" : "Non-current Assets"}
            items={assets.nonCurrentBreakdown}
            total={assets.nonCurrent}
            totalLabel={
              lang === "bn"
                ? "মোট দীর্ঘমেয়াদী সম্পদ"
                : "Total Non-current Assets"
            }
            level="nonCurrent"
          />

          <BSRow
            label={lang === "bn" ? "মোট সম্পদ" : "TOTAL ASSETS"}
            amount={assets.total}
            bold
            underline
          />
        </div>

        {/* LIABILITIES */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm font-bold text-foreground uppercase tracking-wider">
              {lang === "bn" ? "দায়" : "LIABILITIES"}
            </span>
            <span className="ml-auto text-sm font-bold tabular-nums text-red-500">
              {formatBDT(liabilities.total)}
            </span>
          </div>

          <BSGroup
            title={lang === "bn" ? "চলতি দায়" : "Current Liabilities"}
            items={liabilities.currentBreakdown}
            total={liabilities.current}
            totalLabel={
              lang === "bn" ? "মোট চলতি দায়" : "Total Current Liabilities"
            }
            level="current"
          />

          <BSGroup
            title={
              lang === "bn" ? "দীর্ঘমেয়াদী দায়" : "Non-current Liabilities"
            }
            items={liabilities.nonCurrentBreakdown}
            total={liabilities.nonCurrent}
            totalLabel={
              lang === "bn"
                ? "মোট দীর্ঘমেয়াদী দায়"
                : "Total Non-current Liabilities"
            }
            level="nonCurrent"
          />

          <BSRow
            label={lang === "bn" ? "মোট দায়" : "TOTAL LIABILITIES"}
            amount={liabilities.total}
            bold
            underline
          />
        </div>
      </div>

      {/* Net Worth / Equity */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
          <div className="w-3 h-3 rounded-full bg-[var(--pv-green)]" />
          <span className="text-sm font-bold text-foreground uppercase tracking-wider">
            {lang === "bn" ? "নিট সম্পদ (ইকুইটি)" : "NET WORTH (EQUITY)"}
          </span>
        </div>
        <div className="ml-4">
          <BSRow
            label={
              lang === "bn"
                ? "মোট সম্পদ − মোট দায়"
                : "Total Assets − Total Liabilities"
            }
            amount={assets.total - liabilities.total}
          />
        </div>
        <BSRow
          label={lang === "bn" ? "মোট নিট সম্পদ" : "TOTAL NET WORTH"}
          amount={netWorth}
          bold
          underline
        />
      </div>

      {/* Accounting Equation */}
      <div className="glass rounded-2xl p-4 text-center">
        <div className="text-xs text-muted-foreground mb-2">
          {lang === "bn" ? "হিসাব সমীকরণ" : "Accounting Equation (IAS 1)"}
        </div>
        <div className="text-sm text-foreground">
          <span className="font-semibold">Assets</span>
          {" = "}
          <span className="font-semibold">Liabilities</span>
          {" + "}
          <span className="font-semibold">Equity</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 tabular-nums">
          {formatBDT(assets.total)} = {formatBDT(liabilities.total)} +{" "}
          {formatBDT(netWorth)}
        </div>
      </div>
    </div>
  );
}

function IncomeExpenseView({ data, lang }: { data: any; lang: string }) {
  const { summary, selectedPeriod, comparisonPeriod, period } = data;

  const incomeChange = formatChange(summary.incomeChange);
  const expenseChange = formatChange(summary.expenseChange);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-4">
        <div className="text-center mb-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Pro-Vision Financial Performance
          </div>
          <div className="text-sm font-bold text-foreground">
            Statement of Comprehensive Income
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            For the period: {period.selected}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Presented in accordance with IAS 1 — Presentation of Financial
            Statements
          </div>
        </div>
      </div>

      {/* Net Income Highlight */}
      <div
        className={`glass-strong rounded-2xl p-4 text-center ${summary.periodNet >= 0 ? "glow-green" : "glow-orange"}`}
      >
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {lang === "bn"
            ? "নির্বাচিত সময়ের নিট আয়"
            : "Net Income for Selected Period"}
        </div>
        <div
          className={`text-3xl font-extrabold tabular-nums ${summary.periodNet >= 0 ? "text-[var(--pv-green)]" : "text-red-500"}`}
        >
          {formatBDT(summary.periodNet)}
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "আয়" : "Income"}:{" "}
            <span className="text-[var(--pv-green)] font-medium">
              {formatBDT(summary.periodIncome)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "ব্যয়" : "Expense"}:{" "}
            <span className="text-red-500 font-medium">
              {formatBDT(summary.periodExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-3.5 rounded-full bg-[var(--pv-green)]" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "এই সময়ের আয়" : "Period Income"}
            </span>
          </div>
          <div className="text-lg font-bold tabular-nums text-[var(--pv-green)]">
            {formatBDT(summary.periodIncome)}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {incomeChange.positive && summary.incomeChange > 0 ? (
              <span className="text-[var(--pv-green)] text-xs">↑</span>
            ) : summary.incomeChange < 0 ? (
              <span className="text-red-500 text-xs">↓</span>
            ) : null}
            <span
              className={`text-xs ${incomeChange.positive ? "text-[var(--pv-green)]" : "text-red-500"}`}
            >
              {incomeChange.text}{" "}
              {lang === "bn" ? "তুলনামূলক সময় থেকে" : "vs comparison"}
            </span>
          </div>
        </div>
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-3.5 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "এই সময়ের ব্যয়" : "Period Expense"}
            </span>
          </div>
          <div className="text-lg font-bold tabular-nums text-red-500">
            {formatBDT(summary.periodExpense)}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {summary.expenseChange > 0 ? (
              <span className="text-red-500 text-xs">↑</span>
            ) : summary.expenseChange < 0 ? (
              <span className="text-[var(--pv-green)] text-xs">↓</span>
            ) : null}
            <span
              className={`text-xs ${summary.expenseChange > 0 ? "text-red-500" : "text-[var(--pv-green)]"}`}
            >
              {expenseChange.text}{" "}
              {lang === "bn" ? "তুলনামূলক সময় থেকে" : "vs comparison"}
            </span>
          </div>
        </div>
      </div>

      {/* Year to Date */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {lang === "bn"
            ? "বছরের সংক্ষিপ্ত সারসংক্ষেপ"
            : `Year ${period.year} to Date Summary`}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-[var(--pv-green)]">
              {formatBDT(summary.yearIncome)}
            </div>
            <div className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট আয়" : "Total Income"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-red-500">
              {formatBDT(summary.yearExpense)}
            </div>
            <div className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট ব্যয়" : "Total Expense"}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold tabular-nums ${summary.yearNet >= 0 ? "text-[var(--pv-green)]" : "text-red-500"}`}
            >
              {formatBDT(summary.yearNet)}
            </div>
            <div className="text-xs text-muted-foreground">
              {lang === "bn" ? "নিট আয়" : "Net Income"}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Period Summary */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {lang === "bn"
            ? "তুলনামূলক সময়কাল"
            : `Comparison Period: ${period.comparison}`}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-[var(--pv-green)]">
              {formatBDT(summary.compIncome)}
            </div>
            <div className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট আয়" : "Total Income"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-red-500">
              {formatBDT(summary.compExpense)}
            </div>
            <div className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট ব্যয়" : "Total Expense"}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold tabular-nums ${summary.compNet >= 0 ? "text-[var(--pv-green)]" : "text-red-500"}`}
            >
              {formatBDT(summary.compNet)}
            </div>
            <div className="text-xs text-muted-foreground">
              {lang === "bn" ? "নিট আয়" : "Net Income"}
            </div>
          </div>
        </div>
      </div>

      {/* IAS 1: Statement of Comprehensive Income format */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border/40">
          {lang === "bn"
            ? "সমগ্র আয় বিবরণী"
            : "Statement of Comprehensive Income"}
        </div>

        {/* Revenue */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[var(--pv-green)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === "bn" ? "আয়" : "REVENUE"}
            </span>
          </div>
          <div className="ml-4">
            {selectedPeriod.income.categories.map((cat: any) => (
              <div key={cat.name} className="flex justify-between py-1 text-sm">
                <span className="text-foreground pl-4">{cat.name}</span>
                <span className="font-medium tabular-nums text-[var(--pv-green)]">
                  {formatBDT(cat.amount)}
                </span>
              </div>
            ))}
            {selectedPeriod.income.categories.length === 0 && (
              <div className="py-1 text-sm text-muted-foreground pl-4">
                No income
              </div>
            )}
            <div className="flex justify-between py-1.5 text-sm font-semibold border-t border-border/40 mt-1 pt-2">
              <span className="text-foreground">Total Revenue</span>
              <span className="tabular-nums text-[var(--pv-green)]">
                {formatBDT(summary.periodIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === "bn" ? "ব্যয়" : "EXPENSES"}
            </span>
          </div>
          <div className="ml-4">
            {selectedPeriod.expense.categories.map((cat: any) => (
              <div key={cat.name} className="flex justify-between py-1 text-sm">
                <span className="text-foreground pl-4">{cat.name}</span>
                <span className="font-medium tabular-nums text-red-500">
                  ({formatBDT(cat.amount)})
                </span>
              </div>
            ))}
            {selectedPeriod.expense.categories.length === 0 && (
              <div className="py-1 text-sm text-muted-foreground pl-4">
                No expenses
              </div>
            )}
            <div className="flex justify-between py-1.5 text-sm font-semibold border-t border-border/40 mt-1 pt-2">
              <span className="text-foreground">Total Expenses</span>
              <span className="tabular-nums text-red-500">
                ({formatBDT(summary.periodExpense)})
              </span>
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="border-t-2 border-foreground/20 pt-2">
          <div className="flex justify-between py-1.5">
            <span className="text-sm font-bold text-foreground uppercase">
              {lang === "bn" ? "নিট আয়" : "NET INCOME"}
            </span>
            <span
              className={`text-sm font-bold tabular-nums ${summary.periodNet >= 0 ? "text-[var(--pv-green)]" : "text-red-500"}`}
            >
              {formatBDT(summary.periodNet)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {lang === "bn"
              ? "সমগ্র আয় = মোট আয় − মোট ব্যয়"
              : "Net Income = Total Revenue − Total Expenses"}
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      <IESection
        title={`${lang === "bn" ? "আয়ের বিশ্লেষণ" : "Income Breakdown"}`}
        color="var(--pv-green)"
        categories={selectedPeriod.income.categories}
        total={selectedPeriod.income.total}
        compCategories={comparisonPeriod.income.categories}
        compTotal={comparisonPeriod.income.total}
      />

      {/* Expense Breakdown */}
      <IESection
        title={`${lang === "bn" ? "ব্যয়ের বিশ্লেষণ" : "Expense Breakdown"}`}
        color="var(--pv-red)"
        categories={selectedPeriod.expense.categories}
        total={selectedPeriod.expense.total}
        compCategories={comparisonPeriod.expense.categories}
        compTotal={comparisonPeriod.expense.total}
      />
    </div>
  );
}
