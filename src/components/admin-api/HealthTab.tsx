import { Activity, Zap, Globe, ToggleRight, ToggleLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthItem } from "./types";
import { METHOD_COLORS } from "./types";

interface Props {
  health: HealthItem[] | undefined;
  t_: (key: string) => string;
  onToggle: (endpoint: string, method: string, enabled: boolean) => void;
}

export function HealthTab({ health, t_, onToggle }: Props) {
  if (!health) {
    return (
      <div className="text-center py-8 text-white/50">{t_("api.loading")}</div>
    );
  }

  const totalRequests = health.reduce((s, h) => s + h.totalRequests, 0);
  const avgUptime =
    health.length > 0
      ? health.reduce((s, h) => s + h.uptime, 0) / health.length
      : 100;
  const avgResponse =
    health.length > 0
      ? health.reduce((s, h) => s + h.avgResponseTime, 0) / health.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-white/60 text-sm">{t_("api.uptime")}</span>
          </div>
          <div
            className={cn(
              "text-2xl font-bold",
              avgUptime >= 99
                ? "text-green-400"
                : avgUptime >= 95
                  ? "text-yellow-400"
                  : "text-red-400",
            )}
          >
            {avgUptime.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-sm">
              {t_("api.avgResponse")}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(avgResponse)}ms
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-white/60 text-sm">
              {t_("api.totalRequests")}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{totalRequests}</div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-medium">{t_("api.endpointStatus")}</h3>
        </div>
        <div className="divide-y divide-white/5">
          {health.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    item.enabled ? "bg-green-400" : "bg-red-400",
                  )}
                />
                <div>
                  <span
                    className={cn(
                      "text-xs font-mono px-2 py-0.5 rounded",
                      METHOD_COLORS[item.method] ||
                        "bg-gray-500/20 text-gray-400",
                    )}
                  >
                    {item.method}
                  </span>
                  <span className="text-white ml-2 font-mono text-sm">
                    {item.endpoint}
                  </span>
                  <span className="text-white/40 ml-2 text-xs">
                    {item.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-white/60">{item.totalRequests} req</span>
                <span
                  className={cn(
                    item.errorRate > 5 ? "text-red-400" : "text-green-400",
                  )}
                >
                  {item.errorRate.toFixed(1)}% err
                </span>
                <span className="text-white/60">{item.avgResponseTime}ms</span>
                <button
                  onClick={() =>
                    onToggle(item.endpoint, item.method, item.enabled)
                  }
                  className="text-white/60 hover:text-white"
                >
                  {item.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-red-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
