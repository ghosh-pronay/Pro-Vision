import { motion } from "framer-motion";
import { Target, Plus, Trash2 } from "lucide-react";
import { fadeUp } from "./FamilyConstants";
import type { FamilyMember, FamilyGoal } from "./FamilyTypes";

interface GoalsTabProps {
  goals: FamilyGoal[];
  members: FamilyMember[];
  lang: string;
  onAddClick: () => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (goalId: string, increment: number) => void;
}

function getMemberName(members: FamilyMember[], id: string) {
  return members.find((m) => m.id === id)?.name || "Unknown";
}

function getMemberAvatar(members: FamilyMember[], id: string) {
  return members.find((m) => m.id === id)?.avatar || "🧑";
}

export default function GoalsTab({
  goals,
  members,
  lang,
  onAddClick,
  onDelete,
  onUpdateProgress,
}: GoalsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="size-5 text-blue-500" />
          {lang === "bn" ? "শেয়ার্ড লক্ষ্য" : "Shared Goals"}
        </h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          {lang === "bn" ? "লক্ষ্য যোগ করুন" : "Add Goal"}
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Target className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {lang === "bn" ? "এখনো কোনো লক্ষ্য নেই" : "No goals yet"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {lang === "bn"
              ? "আপনার প্রথম পরিবারের লক্ষ্য নির্ধারণ করুন"
              : "Set your first family goal"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              variants={fadeUp}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium">{goal.title}</p>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {goal.assignedTo && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {getMemberAvatar(members, goal.assignedTo)}{" "}
                        {getMemberName(members, goal.assignedTo)}
                      </span>
                    )}
                    {goal.deadline && (
                      <span className="text-xs text-muted-foreground">
                        •{" "}
                        {new Date(goal.deadline).toLocaleDateString(
                          lang === "bn" ? "bn-BD" : "en-US",
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-red-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lang === "bn" ? "অগ্রগতি" : "Progress"}
                  </span>
                  <span className="font-medium">
                    {goal.progress} / {goal.target}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (goal.progress / goal.target) * 100,
                        100,
                      )}%`,
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateProgress(goal.id, -1)}
                    className="px-3 py-1 rounded-lg glass text-xs hover:bg-white/10 transition-all"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateProgress(goal.id, 1)}
                    className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-all"
                  >
                    +1
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
