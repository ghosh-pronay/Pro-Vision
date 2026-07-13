import { useRef, useState } from "react"
import { Download, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./button"
import { ConfirmDialog } from "./ConfirmDialog"
import { useLang } from "@/i18n/LanguageContext"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

interface BackupData {
  version: string
  timestamp: string
  localStorage: Record<string, string>
  indexedDB?: Record<string, unknown>
}

const labels = {
  en: {
    exportBtn: "Export Data",
    importBtn: "Import Data",
    exportSuccess: "Data exported successfully",
    exportError: "Failed to export data",
    importSuccess: "Data imported successfully",
    importError: "Failed to import data",
    invalidFile: "Invalid backup file",
    confirmTitle: "Restore Backup",
    confirmDesc: "This will overwrite your current data. Are you sure?",
    restoreBtn: "Restore",
    cancelBtn: "Cancel",
    fileInput: "Select backup file",
  },
  bn: {
    exportBtn: "ডেটা এক্সপোর্ট",
    importBtn: "ডেটা ইম্পোর্ট",
    exportSuccess: "ডেটা সফলভাবে এক্সপোর্ট হয়েছে",
    exportError: "ডেটা এক্সপোর্ট করতে ব্যর্থ",
    importSuccess: "ডেটা সফলভাবে ইম্পোর্ট হয়েছে",
    importError: "ডেটা ইম্পোর্ট করতে ব্যর্থ",
    invalidFile: "অবৈধ ব্যাকআপ ফাইল",
    confirmTitle: "ব্যাকআপ পুনরুদ্ধার",
    confirmDesc: "এটি আপনার বর্তমান ডেটা মুছে দেবে। আপনি কি নিশ্চিত?",
    restoreBtn: "পুনরুদ্ধার",
    cancelBtn: "বাতিল",
    fileInput: "ব্যাকআপ ফাইল নির্বাচন করুন",
  },
}

const EXCLUDED_KEYS = ["emailForSignIn", "pv-fcm-token"]

async function collectLocalStorageData(): Promise<Record<string, string>> {
  const data: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && !EXCLUDED_KEYS.includes(key)) {
      data[key] = localStorage.getItem(key) ?? ""
    }
  }
  return data
}

async function collectIndexedDBData(): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {}
  try {
    const databases = await indexedDB.databases()
    for (const dbInfo of databases) {
      if (!dbInfo.name) continue
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(dbInfo.name!)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })

      const storeData: Record<string, unknown> = {}
      for (const storeName of Array.from(db.objectStoreNames)) {
        const tx = db.transaction(storeName, "readonly")
        const store = tx.objectStore(storeName)
        const allData = await new Promise<unknown[]>((resolve, reject) => {
          const req = store.getAll()
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => reject(req.error)
        })
        storeData[storeName] = allData
      }
      data[dbInfo.name] = { version: dbInfo.version, stores: storeData }
      db.close()
    }
  } catch (e) {
    logger.error("DataBackup", "IndexedDB not available or empty", e)
  }
  return data
}

function triggerDownload(data: BackupData, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function readFileAsJSON(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!data.version || !data.timestamp) {
          reject(new Error("Invalid backup format"))
        }
        resolve(data)
      } catch (e) {
        logger.error("DataBackup", "Failed to parse backup JSON", e)
        reject(new Error("Invalid JSON"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export function DataBackup({ className }: { className?: string }) {
  const { lang } = useLang()
  const t = labels[lang]
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<BackupData | null>(null)

  const handleExport = async () => {
    try {
      const [lsData, idbData] = await Promise.all([
        collectLocalStorageData(),
        collectIndexedDBData(),
      ])

      const backup: BackupData = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        localStorage: lsData,
        indexedDB: idbData,
      }

      const filename = `pro-vision-backup-${new Date().toISOString().slice(0, 10)}.json`
      triggerDownload(backup, filename)
      toast.success(t.exportSuccess, { icon: <CheckCircle /> })
    } catch (e) {
      logger.error("DataBackup", "Export failed", e)
      toast.error(t.exportError, { icon: <AlertCircle /> })
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await readFileAsJSON(file)
      setPendingData(data)
      setShowConfirm(true)
    } catch (e) {
      logger.error("DataBackup", "Invalid file", e)
      toast.error(t.invalidFile, { icon: <AlertCircle /> })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const confirmRestore = async () => {
    if (!pendingData) return

    try {
      if (pendingData.localStorage) {
        const BLOCKED_KEYS = [
          "pv-fcm-token",
          "emailForSignIn",
          "__CONVEX_SHIM_ACTIVE__",
          "pv-encryption-key",
          "pv-accessibility",
        ]
        for (const [key, value] of Object.entries(pendingData.localStorage)) {
          if (typeof value !== "string") continue
          if (BLOCKED_KEYS.some((blocked) => key.startsWith(blocked))) continue
          localStorage.setItem(key, value)
        }
      }
      setShowConfirm(false)
      setPendingData(null)
      toast.success(t.importSuccess, { icon: <CheckCircle /> })
      setTimeout(() => window.location.reload(), 800)
    } catch (e) {
      logger.error("DataBackup", "Import failed", e)
      toast.error(t.importError, { icon: <AlertCircle /> })
    }
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <Button onClick={handleExport} className="glass flex items-center gap-2">
        <Download className="w-4 h-4" />
        {t.exportBtn}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="glass flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {t.importBtn}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onConfirm={confirmRestore}
        onCancel={() => {
          setShowConfirm(false)
          setPendingData(null)
        }}
        title={t.confirmTitle}
        description={t.confirmDesc}
        confirmLabel={t.restoreBtn}
        cancelLabel={t.cancelBtn}
        variant="warning"
      />
    </div>
  )
}
