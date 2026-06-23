import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiLogItem, ApiConfigItem } from "./types";
import { METHOD_COLORS, STATUS_COLORS } from "./types";

interface Props {
  logs: ApiLogItem[] | undefined;
  configs: ApiConfigItem[] | undefined;
  endpointFilter: string;
  statusFilter: number | "";
  t_: (key: string) => string;
  formatTimestamp: (ts: number) => string;
  onEndpointFilterChange: (v: string) => void;
  onStatusFilterChange: (v: number | "") => void;
  onClearLogs: () => void;
}

export function LogsTab({
  logs,
  configs,
  endpointFilter,
  statusFilter,
  t_,
  formatTimestamp,
  onEndpointFilterChange,
  onStatusFilterChange,
  onClearLogs,
}: Props) {
  if (!logs) {
    return (
      <div className="text-center py-8 text-white/50">{t_("api.loading")}</div>
    );
  }

  const logData = logs as ApiLogItem[];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select
            value={endpointFilter}
            onChange={(e) => onEndpointFilterChange(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="">{t_("api.allEndpoints")}</option>
            {configs &&
              [
                ...new Set((configs as ApiConfigItem[]).map((c) => c.endpoint)),
              ].map((ep) => (
                <option key={ep} value={ep}>
                  {ep}
                </option>
              ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(
                e.target.value === "" ? "" : parseInt(e.target.value),
              )
            }
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="">{t_("api.allStatuses")}</option>
            <option value={200}>200 OK</option>
            <option value={201}>201 Created</option>
            <option value={400}>400 Bad Request</option>
            <option value={401}>401 Unauthorized</option>
            <option value={403}>403 Forbidden</option>
            <option value={404}>404 Not Found</option>
            <option value={500}>500 Server Error</option>
          </select>
        </div>
        <button
          onClick={onClearLogs}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20"
        >
          <Trash2 className="w-4 h-4" />
          {t_("api.clearLogs")}
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white/60 font-medium">
                  {t_("api.time")}
                </th>
                <th className="text-left p-3 text-white/60 font-medium">
                  {t_("api.method")}
                </th>
                <th className="text-left p-3 text-white/60 font-medium">
                  {t_("api.endpoint")}
                </th>
                <th className="text-left p-3 text-white/60 font-medium">
                  {t_("api.status")}
                </th>
                <th className="text-left p-3 text-white/60 font-medium">
                  {t_("api.response")}
                </th>
                <th className="text-left p-3 text-white/60 font-medium">
                  {t_("api.size")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logData.map((log) => (
                <tr key={log._id} className="hover:bg-white/5">
                  <td className="p-3 text-white/50 text-xs">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded",
                        METHOD_COLORS[log.method] ||
                          "bg-gray-500/20 text-gray-400",
                      )}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="p-3 text-white font-mono text-xs">
                    {log.endpoint}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "font-mono text-xs",
                        STATUS_COLORS[log.status] || "text-white/60",
                      )}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-white/60 text-xs">
                    {log.responseTime}ms
                  </td>
                  <td className="p-3 text-white/40 text-xs">
                    {log.payloadSize}B
                  </td>
                </tr>
              ))}
              {logData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">
                    {t_("api.noLogs")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
