import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { FamilyGroup } from "./types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  familyGroup: FamilyGroup;
  lang: "en" | "bn";
  onUpdateGroup: (name: string) => void;
}

export function SettingsModal({
  open,
  onClose,
  familyGroup,
  lang,
  onUpdateGroup,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? "পরিবার সেটিংস" : "Family Settings"}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {lang === "bn" ? "পরিবারের নাম" : "Group Name"}
                </label>
                <input
                  type="text"
                  value={familyGroup.name}
                  onChange={(e) => onUpdateGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass border border-foreground/20 focus:outline-none focus:border-[var(--pv-blue)]"
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">
                  {lang === "bn" ? "নোটিফিকেশন" : "Notifications"}
                </div>
                {[
                  { labelEn: "Task Updates", labelBn: "কাজ আপডেট" },
                  { labelEn: "Expense Alerts", labelBn: "খরচ সতর্কতা" },
                  { labelEn: "Calendar Events", labelBn: "ক্যালেন্ডার ইভেন্ট" },
                  { labelEn: "Member Activity", labelBn: "সদস্য কার্যক্রম" },
                ].map((item) => (
                  <div
                    key={item.labelEn}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">
                      {lang === "bn" ? item.labelBn : item.labelEn}
                    </span>
                    <button className="relative w-10 h-5 rounded-full bg-[var(--pv-blue)]">
                      <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white translate-x-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">
                  {lang === "bn" ? "ডিফল্ট গোপনীয়তা" : "Default Privacy"}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-[var(--pv-blue)] text-white text-sm">
                    {lang === "bn" ? "সব শেয়ার" : "Share All"}
                  </button>
                  <button className="flex-1 py-2 rounded-xl glass text-sm">
                    {lang === "bn" ? "সীমিত" : "Limited"}
                  </button>
                  <button className="flex-1 py-2 rounded-xl glass text-sm">
                    {lang === "bn" ? "ব্যক্তিগত" : "Private"}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-foreground/10">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-[var(--pv-blue)] text-white font-medium hover:brightness-110 transition-all"
                >
                  {lang === "bn" ? "সংরক্ষণ" : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
