import { Heart, Syringe, Stethoscope } from "lucide-react";
import { now } from "./FamilyConstants";
import type { FamilyMember, FamilyEvent } from "./FamilyTypes";

interface HealthTabProps {
  events: FamilyEvent[];
  members: FamilyMember[];
  lang: string;
}

export default function HealthTab({ events, members, lang }: HealthTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Heart className="size-5 text-red-500" />
        {lang === "bn" ? "স্বাস্থ্য ট্র্যাকার" : "Health Tracker"}
      </h2>

      {/* Vaccinations */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Syringe className="size-4 text-blue-500" />
          {lang === "bn" ? "টিকাকরণ" : "Vaccinations"}
        </h3>
        <div className="space-y-2">
          {events
            .filter((e) => e.type === "vaccination")
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl"
              >
                <Syringe className="size-5 text-blue-500" />
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
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  {lang === "bn" ? "নির্ধারিত" : "Scheduled"}
                </span>
              </div>
            ))}
          {events.filter((e) => e.type === "vaccination").length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lang === "bn" ? "কোনো টিকার তারিখ নেই" : "No vaccination dates"}
            </p>
          )}
        </div>
      </div>

      {/* Check-up Reminders */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Stethoscope className="size-4 text-green-500" />
          {lang === "bn" ? "চেক-আপ রিমাইন্ডার" : "Check-up Reminders"}
        </h3>
        <div className="space-y-2">
          {events
            .filter((e) => e.type === "checkup")
            .map((event) => {
              const daysUntil = Math.ceil(
                (event.date - now) / (24 * 60 * 60 * 1000),
              );
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl"
                >
                  <Stethoscope className="size-5 text-green-500" />
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
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {daysUntil} {lang === "bn" ? "দিন বাকি" : "days left"}
                  </span>
                </div>
              );
            })}
          {events.filter((e) => e.type === "checkup").length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lang === "bn" ? "কোনো চেক-আপ নেই" : "No check-up reminders"}
            </p>
          )}
        </div>
      </div>

      {/* Family Health Summary */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Heart className="size-4 text-red-500" />
          {lang === "bn"
            ? "পরিবারের স্বাস্থ্য সারাংশ"
            : "Family Health Summary"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{member.avatar}</div>
              <p className="text-xs font-medium">{member.name}</p>
              <div className="mt-2 flex justify-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
