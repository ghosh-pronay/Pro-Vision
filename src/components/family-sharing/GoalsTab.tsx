import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { SharedGoal, FamilyMember } from "./types";
import { fadeUp } from "./types";

interface GoalsTabProps {
  sharedGoals: SharedGoal[];
  members: FamilyMember[];
  lang: "en" | "bn";
}

export function GoalsTab({ sharedGoals, members, lang }: GoalsTabProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {lang === "bn" ? "শেয়ার্ড লক্ষ্য" : "Shared Goals"}
        </h2>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm hover:brightness-110 transition-all">
          <Plus className="size-4" />
          {lang === "bn" ? "যোগ করুন" : "Add"}
        </button>
      </div>

      <div className="space-y-3">
        {sharedGoals.map((goal) => {
          const progress = Math.round((goal.progress / goal.target) * 100);
          const assignedMember = goal.assignedTo
            ? members.find((m) => m.id === goal.assignedTo)
            : null;
          return (
            <motion.div
              key={goal.id}
              variants={fadeUp}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">{goal.title}</div>
                  {assignedMember && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <span>{assignedMember.avatar}</span>
                      {assignedMember.name}
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold text-[var(--pv-blue)]">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {goal.progress.toLocaleString()} /{" "}
                {goal.target.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
