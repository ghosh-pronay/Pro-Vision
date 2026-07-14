import { Trophy, PartyPopper, Star, Trash2 } from "lucide-react"
import { now, getEventEmoji } from "./FamilyConstants"
import type { FamilyEvent } from "./FamilyTypes"

interface CelebrationsTabProps {
  events: FamilyEvent[]
  lang: string
  onDelete: (id: string) => void
}

export default function CelebrationsTab({
  events,
  lang,
  onDelete,
}: CelebrationsTabProps) {
  const upcomingEvents = [...events]
    .filter((e) => e.date > now)
    .sort((a, b) => a.date - b.date)

  const nextCelebration = upcomingEvents[0]

  const daysLeft = nextCelebration
    ? Math.ceil((nextCelebration.date - now) / (24 * 60 * 60 * 1000))
    : null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="size-5 text-amber-500" />
        {lang === "bn" ? "উদযাপন" : "Celebrations"}
      </h2>

      {/* Next Celebration */}
      {nextCelebration && (
        <div className="glass rounded-2xl p-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 text-center">
          <div className="text-5xl mb-3">
            {getEventEmoji(nextCelebration.type)}
          </div>
          <h3 className="text-xl font-bold">{nextCelebration.title}</h3>
          <p className="text-muted-foreground mt-1">
            {new Date(nextCelebration.date).toLocaleDateString(
              lang === "bn" ? "bn-BD" : "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
            <span className="text-2xl font-bold text-pink-500">{daysLeft}</span>
            <span className="text-sm">
              {lang === "bn" ? "দিন বাকি" : "days left"}
            </span>
          </div>
        </div>
      )}

      {/* All Celebrations */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <PartyPopper className="size-4 text-amber-500" />
          {lang === "bn" ? "সব উদযাপন" : "All Celebrations"}
        </h3>
        <div className="space-y-2">
          {[...events]
            .sort((a, b) => a.date - b.date)
            .map((event) => {
              const daysUntil = Math.ceil(
                (event.date - now) / (24 * 60 * 60 * 1000),
              )
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group"
                >
                  <div className="text-xl">{getEventEmoji(event.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-US",
                        {
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {daysUntil > 0
                      ? `${daysUntil} ${lang === "bn" ? "দিন" : "days"}`
                      : lang === "bn"
                        ? "আজ!"
                        : "Today!"}
                  </span>
                  <button
                    onClick={() => onDelete(event.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                    aria-label="Delete event"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )
            })}
        </div>
      </div>

      {/* Family Achievements */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Star className="size-4 text-amber-500" />
          {lang === "bn" ? "পরিবারের সাফল্য" : "Family Achievements"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              icon: "🏆",
              label: lang === "bn" ? "১০ দিনের স্ট্রিক" : "10-day streak",
              done: true,
            },
            {
              icon: "📚",
              label: lang === "bn" ? "৫টি বই পড়েছে" : "5 books read",
              done: true,
            },
            {
              icon: "💰",
              label: lang === "bn" ? "সঞ্চয় লক্ষ্য পূরণ" : "Savings goal met",
              done: false,
            },
            {
              icon: "🏃",
              label: lang === "bn" ? "পরিবার দৌড়" : "Family run",
              done: true,
            },
            {
              icon: "🎯",
              label: lang === "bn" ? "মাসিক লক্ষ্য" : "Monthly goal",
              done: false,
            },
            {
              icon: "❤️",
              label: lang === "bn" ? "৩৬৫ দিন একসাথে" : "365 days together",
              done: false,
            },
          ].map((ach, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-center ${
                ach.done ? "bg-amber-500/10" : "bg-white/5 opacity-50"
              }`}
            >
              <div className="text-2xl mb-1">{ach.icon}</div>
              <p className="text-xs font-medium">{ach.label}</p>
              {ach.done && (
                <span className="text-[10px] text-green-500">
                  ✓ {lang === "bn" ? "অর্জিত" : "Achieved"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
