import { motion } from "framer-motion";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { now, getEventEmoji, fadeUp } from "./FamilyConstants";
import type { FamilyEvent } from "./FamilyTypes";

interface CalendarTabProps {
  events: FamilyEvent[];
  lang: string;
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export default function CalendarTab({
  events,
  lang,
  onAddClick,
  onDelete,
}: CalendarTabProps) {
  const upcomingEvents = [...events]
    .filter((e) => e.date > now)
    .sort((a, b) => a.date - b.date);

  const nextCelebration = upcomingEvents[0];

  const daysLeft = nextCelebration
    ? Math.ceil((nextCelebration.date - now) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="size-5 text-purple-500" />
          {lang === "bn" ? "পরিবারের ক্যালেন্ডার" : "Family Calendar"}
        </h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          {lang === "bn" ? "অনুষ্ঠান যোগ করুন" : "Add Event"}
        </button>
      </div>

      {/* Next Celebration */}
      {nextCelebration && (
        <div className="glass rounded-2xl p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {getEventEmoji(nextCelebration.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{nextCelebration.title}</p>
              <p className="text-sm text-muted-foreground">
                {daysLeft} {lang === "bn" ? "দিন বাকি" : "days left"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-500">{daysLeft}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn" ? "দিন" : "days"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Events */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3">
          {lang === "bn" ? "আসন্ন অনুষ্ঠান" : "Upcoming Events"}
        </h3>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="size-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {lang === "bn" ? "কোনো অনুষ্ঠান নেই" : "No events yet"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {lang === "bn"
                ? "আপনার প্রথম পরিবারের অনুষ্ঠান যোগ করুন"
                : "Add your first family event"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...events]
              .sort((a, b) => a.date - b.date)
              .map((event) => {
                const daysUntil = Math.ceil(
                  (event.date - now) / (24 * 60 * 60 * 1000),
                );
                return (
                  <motion.div
                    key={event.id}
                    variants={fadeUp}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group"
                  >
                    <div className="text-xl">{getEventEmoji(event.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString(
                          lang === "bn" ? "bn-BD" : "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        daysUntil <= 7
                          ? "bg-red-500/20 text-red-400"
                          : daysUntil <= 30
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {daysUntil > 0
                        ? `${daysUntil} ${lang === "bn" ? "দিন" : "d"}`
                        : lang === "bn"
                          ? "আজ"
                          : "Today"}
                    </span>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
