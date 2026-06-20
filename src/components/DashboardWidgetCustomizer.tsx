import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { LayoutGrid, GripVertical, Eye, EyeOff, Save } from "lucide-react";

interface Widget {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

const AVAILABLE_WIDGETS: Widget[] = [
  { id: "tasks", name: "Tasks", visible: true, color: "blue" },
  { id: "habits", name: "Habits", visible: true, color: "green" },
  { id: "focus", name: "Focus", visible: true, color: "red" },
  { id: "finance", name: "Finance", visible: true, color: "yellow" },
  { id: "health", name: "Health", visible: true, color: "purple" },
  { id: "mood", name: "Mood", visible: true, color: "pink" },
  { id: "weather", name: "Weather", visible: true, color: "cyan" },
  { id: "quote", name: "Quote", visible: true, color: "orange" },
  { id: "activity", name: "Activity", visible: true, color: "indigo" },
  { id: "goals", name: "Goals", visible: true, color: "teal" },
];

const WIDGET_KEY_MAP: Record<string, TranslationKey> = {
  tasks: "dash.widget.modules",
  habits: "dash.widget.streaks",
  focus: "dash.widget.quickActions",
  finance: "dash.widget.finance",
  health: "dash.widget.wellbeing",
  mood: "dash.widget.summary",
  weather: "dash.widget.insights",
  quote: "dash.widget.dailyInspiration",
  activity: "dash.widget.activity",
  goals: "dash.widget.lifeScore",
};

const WIDGET_COLORS: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-500/5 text-blue-500",
  green: "from-green-500/20 to-green-500/5 text-green-500",
  red: "from-red-500/20 to-red-500/5 text-red-500",
  yellow: "from-yellow-500/20 to-yellow-500/5 text-yellow-500",
  purple: "from-purple-500/20 to-purple-500/5 text-purple-500",
  pink: "from-pink-500/20 to-pink-500/5 text-pink-500",
  cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-500",
  orange: "from-orange-500/20 to-orange-500/5 text-orange-500",
  indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
  teal: "from-teal-500/20 to-teal-500/5 text-teal-500",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardWidgetCustomizer() {
  const { lang } = useLang();
  const [widgets, setWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS);
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setWidgets((prev) => {
      const newWidgets = [...prev];
      [newWidgets[index - 1], newWidgets[index]] = [
        newWidgets[index],
        newWidgets[index - 1],
      ];
      return newWidgets;
    });
  };

  const moveDown = (index: number) => {
    if (index === widgets.length - 1) return;
    setWidgets((prev) => {
      const newWidgets = [...prev];
      [newWidgets[index], newWidgets[index + 1]] = [
        newWidgets[index + 1],
        newWidgets[index],
      ];
      return newWidgets;
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setWidgets(AVAILABLE_WIDGETS);
  };

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-2">
            <LayoutGrid className="h-4 w-4 text-cyan-500" />
          </div>
          <h3 className="font-semibold text-sm">
            {t("dash.customize" as TranslationKey, lang)}
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <GripVertical className="h-3 w-3 rotate-180" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === widgets.length - 1}
                  className="cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              </div>

              <div
                className={`rounded-lg bg-gradient-to-br p-2 ${WIDGET_COLORS[widget.color]}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">
                  {t(
                    WIDGET_KEY_MAP[widget.id] ||
                      ("dash.widget.modules" as TranslationKey),
                    lang,
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {widget.visible
                    ? lang === "bn"
                      ? "দৃশ্যমান"
                      : "Visible"
                    : lang === "bn"
                      ? "লুকানো"
                      : "Hidden"}
                </p>
              </div>

              <button
                onClick={() => toggleVisibility(widget.id)}
                className={`cursor-pointer rounded-lg p-2 transition-colors ${
                  widget.visible
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                }`}
              >
                {widget.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4" />
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {lang === "bn" ? "সংরক্ষিত!" : "Saved!"}
              </motion.span>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {lang === "bn" ? "সংরক্ষণ করুন" : "Save Changes"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={handleReset}
          className="cursor-pointer rounded-xl bg-foreground/5 px-4 py-2 text-sm text-muted-foreground hover:bg-foreground/10 transition-colors"
        >
          {t("dash.resetWidgets" as TranslationKey, lang)}
        </button>
      </div>
    </motion.div>
  );
}
