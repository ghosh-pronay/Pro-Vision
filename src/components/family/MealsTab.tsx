import { UtensilsCrossed, CalendarDays, Coffee, Sun, Moon } from "lucide-react";

interface MealsTabProps {
  lang: string;
  todayMeals: {
    breakfast: { name: string; calories: number };
    lunch: { name: string; calories: number };
    dinner: { name: string; calories: number };
  };
}

export default function MealsTab({ lang, todayMeals }: MealsTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <UtensilsCrossed className="size-5 text-green-500" />
        {lang === "bn" ? "খাদ্য পরিকল্পনা" : "Meal Plan"}
      </h2>

      {/* Today's Meals */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Sun className="size-4 text-amber-500" />
          {lang === "bn" ? "আজকের খাবার" : "Today's Meals"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                key: "breakfast",
                icon: Coffee,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                key: "lunch",
                icon: Sun,
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
              {
                key: "dinner",
                icon: Moon,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
            ] as const
          ).map((meal) => (
            <div key={meal.key} className={`${meal.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <meal.icon className={`size-4 ${meal.color}`} />
                <span className="text-sm font-medium capitalize">
                  {lang === "bn"
                    ? meal.key === "breakfast"
                      ? "সকালের নাস্তা"
                      : meal.key === "lunch"
                        ? "দুপুরের খাবার"
                        : "রাতের খাবার"
                    : meal.key}
                </span>
              </div>
              <p className="font-medium">{todayMeals[meal.key].name}</p>
              <p className="text-xs text-muted-foreground">
                ~{todayMeals[meal.key].calories}{" "}
                {lang === "bn" ? "ক্যালোরি" : "calories"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <CalendarDays className="size-4 text-blue-500" />
          {lang === "bn" ? "সাপ্তাহিক পরিকল্পনা" : "Weekly Plan"}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {(lang === "bn"
            ? ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"]
            : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
          ).map((day, i) => (
            <div
              key={day}
              className={`text-center p-2 rounded-xl ${
                i === new Date().getDay()
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/5"
              }`}
            >
              <p className="text-xs text-muted-foreground">{day}</p>
              <div className="mt-1 space-y-1">
                <div className="text-[10px]">🍛</div>
                <div className="text-[10px]">🍛</div>
                <div className="text-[10px]">🍛</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
