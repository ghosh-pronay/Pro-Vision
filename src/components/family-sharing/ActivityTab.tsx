import { motion } from "framer-motion";
import type { Activity, FamilyMember } from "./types";
import { ACTIVITY_ICONS, formatTimeAgo, fadeUp } from "./types";

interface ActivityTabProps {
  activityFeed: Activity[];
  members: FamilyMember[];
  lang: "en" | "bn";
}

export function ActivityTab({ activityFeed, members, lang }: ActivityTabProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {lang === "bn" ? "পরিবারের কার্যক্রম" : "Family Activity"}
      </h2>

      <div className="space-y-2">
        {activityFeed.map((activity) => {
          const member = members.find((m) => m.id === activity.memberId);
          const Icon = ACTIVITY_ICONS[activity.type];
          return (
            <motion.div
              key={activity.id}
              variants={fadeUp}
              className="glass rounded-xl p-3 flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">
                    {member?.name || "Unknown"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.timestamp, lang)}
                </div>
              </div>
              <div className="text-2xl">{member?.avatar}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
