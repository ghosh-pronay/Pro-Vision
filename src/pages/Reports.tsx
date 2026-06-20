import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t } from "@/i18n/translations";
import { Download, BarChart3 } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  PeriodSelector,
  OverviewTab,
  TasksTab,
  HabitsTab,
  FocusTab,
  FinanceTab,
  WellbeingTab,
  GoalsTab,
  InsightsTab,
} from "@/components/analytics";

// Lazy load PDF libs only when exporting
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type Period = "7d" | "30d" | "90d";

type TabId = "overview" | "tasks" | "habits" | "focus" | "finance" | "wellbeing" | "goals" | "insights";

const TABS: { id: TabId; label: Record<string, string> }[] = [
  { id: "overview", label: { en: "Overview", bn: "সারসংক্ষেপ" } },
  { id: "tasks", label: { en: "Tasks", bn: "কাজ" } },
  { id: "habits", label: { en: "Habits", bn: "অভ্যাস" } },
  { id: "focus", label: { en: "Focus", bn: "ফোকাস" } },
  { id: "finance", label: { en: "Finance", bn: "আর্থিক" } },
  { id: "wellbeing", label: { en: "Wellbeing", bn: "সুস্থতা" } },
  { id: "goals", label: { en: "Goals", bn: "লক্ষ্য" } },
  { id: "insights", label: { en: "Insights", bn: "ইনসাইট" } },
];

function TabContent({ tab, period }: { tab: TabId; period: Period }) {
  switch (tab) {
    case "overview":
      return <OverviewTab period={period} />;
    case "tasks":
      return <TasksTab period={period} />;
    case "habits":
      return <HabitsTab period={period} />;
    case "focus":
      return <FocusTab period={period} />;
    case "finance":
      return <FinanceTab period={period} />;
    case "wellbeing":
      return <WellbeingTab period={period} />;
    case "goals":
      return <GoalsTab />;
    case "insights":
      return <InsightsTab period={period} />;
    default:
      return null;
  }
}

export default function Reports() {
  const { lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPeriod = (searchParams.get("period") as Period) || "30d";
  const initialTab = (searchParams.get("tab") as TabId) || "overview";
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [tab, setTab] = useState<TabId>(initialTab);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setSearchParams({ period: p, tab });
  };

  const handleTabChange = (t: TabId) => {
    setTab(t);
    setSearchParams({ period, tab: t });
  };

  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const downloadPDF = useCallback(async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const el = reportRef.current;
      el.classList.add("pdf-export");

      const canvas = await html2canvas.default(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121820",
        logging: false,
        removeContainer: true,
      });

      el.classList.remove("pdf-export");

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 277;

      const doc = new jsPDF("p", "mm", "a4");
      let yPos = 10;

      doc.setFontSize(18);
      doc.setTextColor(26, 111, 181);
      doc.text("Pro-Vision Analytics", 105, yPos, { align: "center" });
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(107, 122, 153);
      doc.text(lang === "bn" ? `বিশ্লেষণ রিপোর্ট — ${period}` : `Analytics Report — ${period}`, 105, yPos, { align: "center" });
      yPos += 10;

      if (imgHeight <= pageHeight - 20) {
        doc.addImage(imgData, "PNG", 10, yPos, imgWidth, imgHeight);
      } else {
        const totalPages = Math.ceil(imgHeight / (pageHeight - 20));
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) doc.addPage();
          const sliceY = (page * (pageHeight - 20) * canvas.width) / imgWidth;
          const sliceHeight = Math.min((pageHeight - 20) * canvas.width / imgWidth, canvas.height - sliceY);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const sliceCtx = sliceCanvas.getContext("2d");
          if (sliceCtx) {
            sliceCtx.drawImage(canvas, 0, sliceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
            const sliceData = sliceCanvas.toDataURL("image/png");
            const sliceImgH = (sliceHeight * imgWidth) / canvas.width;
            doc.addImage(sliceData, "PNG", 10, 10, imgWidth, sliceImgH);
          }
        }
      }

      const lastPage = doc.getNumberOfPages();
      doc.setPage(lastPage);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const prefix = "Generated by Pro-Vision • An initiative by ";
      const name = "Pronay";
      const fullWidth = doc.getTextWidth(prefix + name);
      const startX = 105 - fullWidth / 2;
      doc.text(prefix, startX, 290);
      doc.setFont(undefined, "bold");
      doc.textWithLink(name, startX + doc.getTextWidth(prefix), 290, {
        url: "https://pronayghosh.site/",
      });
      doc.setFont(undefined, "normal");

      doc.save(`pro-vision-analytics-${tab}-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [lang, period, tab]);

  return (
    <div ref={reportRef} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="size-6 text-[var(--pv-blue)]" />
            {t("nav.reports", lang)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("reports.subtitle", lang)}</p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={exporting}
          className="glass rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className={"size-3.5" + (exporting ? " animate-spin" : "")} />
          {exporting
            ? (lang === "bn" ? "এক্সপোর্ট হচ্ছে..." : "Exporting...")
            : t("reports.export", lang)}
        </button>
      </motion.div>

      {/* Period Selector */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <PeriodSelector value={period} onChange={handlePeriodChange} />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="overflow-x-auto scrollbar-thin -mx-1 px-1">
        <div className="flex gap-1 p-1 glass rounded-2xl min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {lang === "bn" ? t.label.bn : t.label.en}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <TabContent tab={tab} period={period} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

