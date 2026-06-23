import { Search, ToggleRight, ToggleLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiConfigItem } from "./types";
import { METHOD_COLORS, CATEGORIES } from "./types";

interface Props {
  configs: ApiConfigItem[] | undefined;
  filteredConfigs: ApiConfigItem[];
  searchQuery: string;
  categoryFilter: string;
  t_: (key: string) => string;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: string) => void;
  onToggle: (endpoint: string, method: string, enabled: boolean) => void;
  onUpdateRateLimit: (
    endpoint: string,
    method: string,
    rateLimit: number,
  ) => void;
}

export function ConfigTab({
  configs,
  filteredConfigs,
  searchQuery,
  categoryFilter,
  t_,
  onSearchChange,
  onCategoryChange,
  onToggle,
  onUpdateRateLimit,
}: Props) {
  if (!configs) {
    return (
      <div className="text-center py-8 text-white/50">{t_("api.loading")}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t_("api.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                categoryFilter === cat
                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10",
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {filteredConfigs.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/5"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded shrink-0",
                    METHOD_COLORS[item.method] ||
                      "bg-gray-500/20 text-gray-400",
                  )}
                >
                  {item.method}
                </span>
                <span className="text-white font-mono text-sm truncate">
                  {item.endpoint}
                </span>
                <span className="text-white/30 text-xs hidden md:inline">
                  {item.description}
                </span>
                <span className="text-white/20 text-xs px-2 py-0.5 rounded bg-white/5 hidden md:inline">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-white/40 text-xs">
                    {t_("api.rateLimit")}
                  </label>
                  <input
                    type="number"
                    value={item.rateLimit}
                    onChange={(e) =>
                      onUpdateRateLimit(
                        item.endpoint,
                        item.method,
                        parseInt(e.target.value) || 60,
                      )
                    }
                    className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white/40 text-xs">
                    {t_("api.timeout")}
                  </label>
                  <span className="text-white text-xs">{item.timeout}ms</span>
                </div>
                <button
                  onClick={() =>
                    onToggle(item.endpoint, item.method, item.enabled)
                  }
                  className="text-white/60 hover:text-white"
                >
                  {item.enabled ? (
                    <ToggleRight className="w-6 h-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-red-400" />
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
