import { motion } from "framer-motion";
import {
  Clipboard,
  DollarSign,
  CalendarDays,
  StickyNote,
  Lock,
} from "lucide-react";
import { fadeUp } from "./types";

interface SharedDataTabProps {
  sharedData: {
    tasks: boolean;
    expenses: boolean;
    calendar: boolean;
    notes: boolean;
  };
  lang: "en" | "bn";
  onToggle: (key: SharedKey) => void;
}

type SharedKey = "tasks" | "expenses" | "calendar" | "notes";

const DATA_ITEMS: {
  key: SharedKey;
  icon: typeof Clipboard;
  labelEn: string;
  labelBn: string;
}[] = [
  { key: "tasks", icon: Clipboard, labelEn: "Tasks", labelBn: "কাজ" },
  { key: "expenses", icon: DollarSign, labelEn: "Expenses", labelBn: "খরচ" },
  {
    key: "calendar",
    icon: CalendarDays,
    labelEn: "Calendar",
    labelBn: "ক্যালেন্ডার",
  },
  { key: "notes", icon: StickyNote, labelEn: "Notes", labelBn: "নোট" },
];

export function SharedDataTab({
  sharedData,
  lang,
  onToggle,
}: SharedDataTabProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {lang === "bn" ? "শেয়ার্ড ডেটা সেটিংস" : "Shared Data Settings"}
      </h2>

      <div className="space-y-3">
        {DATA_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {lang === "bn" ? item.labelBn : item.labelEn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sharedData[item.key]
                        ? lang === "bn"
                          ? "সবার সাথে শেয়ার করা হয়েছে"
                          : "Shared with all members"
                        : lang === "bn"
                          ? "শেয়ার করা হয়নি"
                          : "Not shared"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onToggle(item.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    sharedData[item.key]
                      ? "bg-[var(--pv-blue)]"
                      : "bg-foreground/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      sharedData[item.key] ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="size-5 text-muted-foreground" />
          <span className="font-medium">
            {lang === "bn" ? "ডিফল্ট গোপনীয়তা" : "Default Privacy"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "bn"
            ? "নতুন সদস্যদের জন্য ডিফল্ট গোপনীয়তা সেটিংস। এটি বদলালে বিদ্যমান সদস্যদের উপর প্রভাব ফেলবে না।"
            : "Default privacy setting for new members. Changing this won't affect existing members."}
        </p>
      </div>
    </motion.div>
  );
}
