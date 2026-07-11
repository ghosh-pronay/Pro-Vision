import { useEffect, useState, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, RefreshCw } from "lucide-react"
import { useLang } from "@/i18n/LanguageContext"
import { t } from "@/i18n/translations"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const PWARegister = memo(function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const { lang } = useLang()

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.ready
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setShowUpdate(true)
              }
            })
          }
        })
      })
      .catch((e) => {
        console.error("[PWARegister]", "service worker registration failed", e)
      })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  const handleUpdate = () => {
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
        >
          <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="h-10 w-10 rounded-xl bg-[var(--pv-blue)] flex items-center justify-center shrink-0">
              <Download className="size-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {t("pwa.install_title", lang)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {t("pwa.install_desc", lang)}
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-lg bg-[var(--pv-blue)] text-white text-xs font-semibold hover:brightness-110 shrink-0"
            >
              {t("pwa.install", lang)}
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded transition-colors shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}

      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
        >
          <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
              <RefreshCw className="size-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {t("pwa.update_title", lang)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {t("pwa.update_desc", lang)}
              </p>
            </div>
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:brightness-110 shrink-0"
            >
              {t("pwa.update", lang)}
            </button>
            <button
              onClick={() => setShowUpdate(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded transition-colors shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default PWARegister
