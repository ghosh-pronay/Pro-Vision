import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const shortcutData = {
  en: {
    navigation: {
      title: "Navigation",
      items: [
        { keys: ["Ctrl", "1-9"], label: "Go to section 1-9" },
        { keys: ["Ctrl", "H"], label: "Go to Dashboard" },
        { keys: ["Ctrl", "T"], label: "Go to Tasks" },
        { keys: ["Ctrl", "B"], label: "Go to Habits" },
        { keys: ["Ctrl", "E"], label: "Go to Expenses" },
      ],
    },
    actions: {
      title: "Actions",
      items: [
        { keys: ["Ctrl", "N"], label: "New task" },
        { keys: ["Ctrl", "K"], label: "Quick search" },
        { keys: ["Ctrl", "S"], label: "Save current" },
        { keys: ["Ctrl", "D"], label: "Toggle dark mode" },
        { keys: ["Ctrl", "L"], label: "Toggle language" },
      ],
    },
    global: {
      title: "Global",
      items: [
        { keys: ["Esc"], label: "Close modal / Go back" },
        { keys: ["Ctrl", "/"], label: "Show shortcuts" },
        { keys: ["?"], label: "Toggle help" },
      ],
    },
  },
  bn: {
    navigation: {
      title: "নেভিগেশন",
      items: [
        { keys: ["Ctrl", "১-৯"], label: "সেকশন ১-৯ এ যান" },
        { keys: ["Ctrl", "H"], label: "ড্যাশবোর্ডে যান" },
        { keys: ["Ctrl", "T"], label: "কাজে যান" },
        { keys: ["Ctrl", "B"], label: "অভ্যাসে যান" },
        { keys: ["Ctrl", "E"], label: "খরচে যান" },
      ],
    },
    actions: {
      title: "কার্যক্রম",
      items: [
        { keys: ["Ctrl", "N"], label: "নতুন কাজ" },
        { keys: ["Ctrl", "K"], label: "দ্রুত অনুসন্ধান" },
        { keys: ["Ctrl", "S"], label: "সংরক্ষণ করুন" },
        { keys: ["Ctrl", "D"], label: "ডার্ক মোড টগল" },
        { keys: ["Ctrl", "L"], label: "ভাষা পরিবর্তন" },
      ],
    },
    global: {
      title: "গ্লোবাল",
      items: [
        { keys: ["Esc"], label: "মডাল বন্ধ / পূর্ববর্তী পৃষ্ঠায় যান" },
        { keys: ["Ctrl", "/"], label: "শর্টকাট দেখুন" },
        { keys: ["?"], label: "সাহায্য টগল" },
      ],
    },
  },
};

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-medium text-muted-foreground bg-muted border border-border rounded-md shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  const { lang } = useLang();
  const data = shortcutData[lang];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-strong rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden relative z-10"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {lang === "bn" ? "কীবোর্ড শর্টকাট" : "Keyboard Shortcuts"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
              {Object.values(data).map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-foreground">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((key, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {i > 0 && (
                                <span className="text-muted-foreground/50 text-xs">
                                  +
                                </span>
                              )}
                              <KeyBadge>{key}</KeyBadge>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
