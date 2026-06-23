import { Globe, CheckCircle, XCircle, Key } from "lucide-react";
import type { DeploymentData } from "./types";

interface Props {
  deployment: DeploymentData | null;
  t_: (key: string) => string;
  formatTimestamp: (ts: number) => string;
  lang: string;
}

export function DeploymentTab({
  deployment,
  t_,
  formatTimestamp,
  lang,
}: Props) {
  if (!deployment) {
    return (
      <div className="text-center py-8 text-white/50">{t_("api.loading")}</div>
    );
  }

  const d = deployment;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-xs">
              {t_("api.totalEndpoints")}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {d.totalEndpoints}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white/60 text-xs">{t_("api.enabled")}</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {d.enabledEndpoints}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-white/60 text-xs">{t_("api.disabled")}</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {d.disabledEndpoints}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span className="text-white/60 text-xs">{t_("api.apiKeys")}</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {d.activeKeys}/{d.totalKeys}
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-3">{t_("api.categories")}</h3>
        <div className="flex gap-2 flex-wrap">
          {d.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-3">
          {t_("api.deploymentInfo")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">
                {t_("api.totalLogs")}
              </span>
              <span className="text-white font-medium">{d.totalLogs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">
                {t_("api.lastActivity")}
              </span>
              <span className="text-white font-medium">
                {d.lastActivity
                  ? formatTimestamp(d.lastActivity)
                  : lang === "bn"
                    ? "কখনো নয়"
                    : "Never"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">{t_("api.storage")}</span>
              <span className="text-white font-medium">localStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">
                {t_("api.environment")}
              </span>
              <span className="text-white font-medium">Development</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-3">
          {t_("api.backendFunctions")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            "getConfig",
            "updateConfig",
            "getHealth",
            "listKeys",
            "createKey",
            "revokeKey",
            "deleteKey",
            "getLogs",
            "getStats",
            "getDeploymentInfo",
            "logRequest",
            "clearLogs",
          ].map((fn) => (
            <div
              key={fn}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg"
            >
              <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
              <span className="text-white/70 text-xs font-mono">{fn}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
