import { cn } from "@/lib/utils";
import type { StatsData } from "./types";

interface Props {
  stats: StatsData | null;
  t_: (key: string) => string;
}

export function AnalyticsTab({ stats, t_ }: Props) {
  if (!stats) {
    return (
      <div className="text-center py-8 text-white/50">{t_("api.loading")}</div>
    );
  }

  const s = stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs mb-1">{t_("api.totalReq")}</div>
          <div className="text-2xl font-bold text-white">{s.totalRequests}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs mb-1">{t_("api.today")}</div>
          <div className="text-2xl font-bold text-blue-400">
            {s.todayRequests}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs mb-1">
            {t_("api.errorRate")}
          </div>
          <div
            className={cn(
              "text-2xl font-bold",
              s.errorRate > 5 ? "text-red-400" : "text-green-400",
            )}
          >
            {s.errorRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs mb-1">{t_("api.avgResp")}</div>
          <div className="text-2xl font-bold text-white">
            {s.avgResponseTime}ms
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-medium mb-4">
            {t_("api.topEndpoints")}
          </h3>
          <div className="space-y-2">
            {s.topEndpoints.map((ep, i) => {
              const maxCount = s.topEndpoints[0]?.count || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-white/60 text-xs font-mono truncate w-40">
                    {ep.endpoint}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${(ep.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-xs w-10 text-right">
                    {ep.count}
                  </span>
                </div>
              );
            })}
            {s.topEndpoints.length === 0 && (
              <div className="text-white/40 text-sm text-center py-4">
                {t_("api.noData")}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-medium mb-4">
            {t_("api.weeklyActivity")}
          </h3>
          <div className="space-y-2">
            {Object.entries(s.dailyCounts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([day, count]) => {
                const maxDay = Math.max(...Object.values(s.dailyCounts), 1);
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs w-20">
                      {day.slice(5)}
                    </span>
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{ width: `${(count / maxDay) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs w-10 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            {Object.keys(s.dailyCounts).length === 0 && (
              <div className="text-white/40 text-sm text-center py-4">
                {t_("api.noData")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-2">
          {t_("api.keysOverview")}
        </h3>
        <div className="flex gap-6">
          <div>
            <span className="text-white/60 text-sm">
              {t_("api.activeKeys")}:{" "}
            </span>
            <span className="text-green-400 font-bold">{s.activeKeys}</span>
          </div>
          <div>
            <span className="text-white/60 text-sm">
              {t_("api.totalKeys")}:{" "}
            </span>
            <span className="text-white font-bold">{s.totalKeys}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
