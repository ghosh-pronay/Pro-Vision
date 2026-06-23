import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Role } from "./types";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  role: Role;
  lang: "en" | "bn";
  onNameChange: (name: string) => void;
  onRoleChange: (role: Role) => void;
  onAdd: () => void;
}

export function AddMemberModal({
  open,
  onClose,
  name,
  role,
  lang,
  onNameChange,
  onRoleChange,
  onAdd,
}: AddMemberModalProps) {
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
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? "সদস্য যোগ করুন" : "Add Member"}
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
                  {lang === "bn" ? "নাম" : "Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder={lang === "bn" ? "সদস্যের নাম" : "Member name"}
                  className="w-full px-3 py-2 rounded-xl glass border border-foreground/20 focus:outline-none focus:border-[var(--pv-blue)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  {lang === "bn" ? "ভূমিকা" : "Role"}
                </label>
                <select
                  value={role}
                  onChange={(e) => onRoleChange(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl glass border border-foreground/20 focus:outline-none focus:border-[var(--pv-blue)]"
                >
                  <option value="admin">
                    {lang === "bn" ? "অ্যাডমিন" : "Admin"}
                  </option>
                  <option value="parent">
                    {lang === "bn" ? "বাবা/মা" : "Parent"}
                  </option>
                  <option value="child">
                    {lang === "bn" ? "সন্তান" : "Child"}
                  </option>
                </select>
              </div>

              <button
                onClick={onAdd}
                disabled={!name.trim()}
                className="w-full py-2.5 rounded-xl bg-[var(--pv-blue)] text-white font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {lang === "bn" ? "যোগ করুন" : "Add Member"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
