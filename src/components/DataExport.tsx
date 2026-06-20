import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

type ExportType = "all" | "tasks" | "habits" | "transactions" | "journal";

const EXPORT_OPTIONS: { value: ExportType; labelKey: string }[] = [
  { value: "all", labelKey: "All Data" },
  { value: "tasks", labelKey: "Tasks" },
  { value: "habits", labelKey: "Habits" },
  { value: "transactions", labelKey: "Transactions" },
  { value: "journal", labelKey: "Journal" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DataExport() {
  const { lang } = useLang();
  const tasks = useQuery(api.tasks.list);
  const habits = useQuery(api.habits.list);
  const transactions = useQuery(api.transactions.list);

  const [selectedType, setSelectedType] = useState<ExportType>("all");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const convertToCSV = (data: Record<string, unknown>[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = String(val ?? "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    setExported(false);

    try {
      await new Promise((r) => setTimeout(r, 500));

      let data: Record<string, unknown>[] = [];
      let filename = "pro-vision-export";

      if (selectedType === "all" || selectedType === "tasks") {
        const taskData = (tasks || []).map((t) => ({
          type: "task",
          title: t.title,
          completed: t.completed,
          priority: t.priority || "",
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : "",
          createdAt: new Date(t.createdAt).toISOString(),
        }));
        if (selectedType === "tasks") {
          data = taskData;
          filename = "pro-vision-tasks";
        } else {
          data = [...data, ...taskData];
        }
      }

      if (selectedType === "all" || selectedType === "habits") {
        const habitData = (habits || []).map((h) => ({
          type: "habit",
          name: h.name,
          frequency: h.frequency,
          completedDates: h.completedDates.length,
          createdAt: new Date(h.createdAt).toISOString(),
        }));
        if (selectedType === "habits") {
          data = habitData;
          filename = "pro-vision-habits";
        } else {
          data = [...data, ...habitData];
        }
      }

      if (selectedType === "all" || selectedType === "transactions") {
        const txData = (transactions || []).map((t) => ({
          type: "transaction",
          transactionType: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description || "",
          date: new Date(t.date).toISOString(),
          createdAt: new Date(t.createdAt).toISOString(),
        }));
        if (selectedType === "transactions") {
          data = txData;
          filename = "pro-vision-transactions";
        } else {
          data = [...data, ...txData];
        }
      }

      const csv = convertToCSV(data);
      downloadFile(csv, `${filename}.csv`, "text/csv");
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch {
      console.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          {lang === "bn" ? "ডেটা এক্সপোর্ট" : "Export Data"}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        {lang === "bn"
          ? "আপনার ডেটা ডাউনলোড করুন"
          : "Download your data as CSV files"}
      </p>

      <div className="space-y-2">
        {EXPORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedType(option.value)}
            className={`cursor-pointer w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors ${
              selectedType === option.value
                ? "bg-primary/10 text-primary"
                : "bg-foreground/5 hover:bg-foreground/10"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">
              {lang === "bn"
                ? option.value === "all"
                  ? "সব ডেটা"
                  : option.value === "tasks"
                    ? "কাজ"
                    : option.value === "habits"
                      ? "অভ্যাস"
                      : option.value === "transactions"
                        ? "লেনদেন"
                        : "ডায়েরি"
                : option.labelKey}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleExportCSV}
        disabled={exporting}
        className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {lang === "bn" ? "এক্সপোর্ট হচ্ছে..." : "Exporting..."}
          </>
        ) : exported ? (
          <>
            <CheckCircle className="h-4 w-4" />
            {lang === "bn" ? "সফল!" : "Done!"}
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4" />
            {lang === "bn" ? "CSV হিসেবে এক্সপোর্ট" : "Export as CSV"}
          </>
        )}
      </button>
    </motion.div>
  );
}
