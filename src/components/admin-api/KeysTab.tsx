import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Copy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastSuccess } from "@/lib/toast-helpers";
import type { ApiKeyItem } from "./types";

interface Props {
  keys: ApiKeyItem[] | undefined;
  t_: (key: string) => string;
  lang: string;
  formatTimestamp: (ts: number) => string;
  onCreateKey: (name: string, permissions: string[]) => void;
  onRevokeKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
}

export function KeysTab({
  keys,
  t_,
  lang,
  formatTimestamp,
  onCreateKey,
  onRevokeKey,
  onDeleteKey,
}: Props) {
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([
    "read",
  ]);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [confirmDeleteKeyId, setConfirmDeleteKeyId] = useState<string | null>(
    null,
  );

  if (!keys) {
    return (
      <div className="text-center py-8 text-white/50">{t_("api.loading")}</div>
    );
  }

  const keyData = keys as ApiKeyItem[];

  const toggleKeyReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess(lang === "bn" ? "কপি হয়েছে" : "Copied to clipboard");
  };

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    onCreateKey(newKeyName, newKeyPermissions);
    setNewKeyName("");
    setNewKeyPermissions(["read"]);
    setShowKeyForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-medium">{t_("api.manageKeys")}</h3>
        <button
          onClick={() => setShowKeyForm(!showKeyForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30"
        >
          <Plus className="w-4 h-4" />
          {t_("api.generateKey")}
        </button>
      </div>

      {showKeyForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-1 block">
              {t_("api.keyName")}
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={
                lang === "bn" ? "যেমন: মোবাইল অ্যাপ" : "e.g., Mobile App"
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-1 block">
              {t_("api.permissions")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {["read", "write", "admin"].map((perm) => (
                <button
                  key={perm}
                  onClick={() => {
                    setNewKeyPermissions((prev) =>
                      prev.includes(perm)
                        ? prev.filter((p) => p !== perm)
                        : [...prev, perm],
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    newKeyPermissions.includes(perm)
                      ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                      : "bg-white/5 text-white/60 border border-white/10",
                  )}
                >
                  {perm}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50"
            >
              {t_("api.create")}
            </button>
            <button
              onClick={() => setShowKeyForm(false)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
            >
              {t_("api.cancel")}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {keyData.map((k) => (
            <div
              key={k._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{k.name}</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      k.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400",
                    )}
                  >
                    {k.active
                      ? lang === "bn"
                        ? "সক্রিয়"
                        : "Active"
                      : lang === "bn"
                        ? "নিষ্ক্রিয়"
                        : "Revoked"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-white/40 text-xs font-mono">
                    {revealedKeys.has(k._id)
                      ? k.key
                      : k.key.slice(0, 12) + "••••••••"}
                  </code>
                  <button
                    onClick={() => toggleKeyReveal(k._id)}
                    className="text-white/40 hover:text-white"
                  >
                    {revealedKeys.has(k._id) ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(k.key)}
                    className="text-white/40 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-1 mt-1">
                  {k.permissions.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-1.5 py-0.5 bg-white/5 text-white/40 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="text-white/30 text-xs mt-1">
                  {t_("api.uses")}: {k.usageCount} · {t_("api.created")}:{" "}
                  {formatTimestamp(k.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {k.active ? (
                  <button
                    onClick={() => onRevokeKey(k._id)}
                    className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs hover:bg-yellow-500/20"
                  >
                    {t_("api.revoke")}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteKeyId(k._id)}
                    className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    {t_("api.delete")}
                  </button>
                )}
              </div>
            </div>
          ))}
          {keyData.length === 0 && (
            <div className="p-8 text-center text-white/40">
              {t_("api.noKeys")}
            </div>
          )}
        </div>
      </div>

      {confirmDeleteKeyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-white font-medium">
                {t_("api.confirmDelete")}
              </h3>
            </div>
            <p className="text-white/60 text-sm mb-6">
              {t_("api.confirmDeleteMsg")}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteKeyId(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
              >
                {t_("api.cancel")}
              </button>
              <button
                onClick={() => {
                  onDeleteKey(confirmDeleteKeyId);
                  setConfirmDeleteKeyId(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                {t_("api.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
