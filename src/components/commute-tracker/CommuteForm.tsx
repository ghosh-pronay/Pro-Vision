import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { X, Check, Bookmark } from "lucide-react"
import { fadeIn, scaleIn, TRANSPORT_MODES } from "./types"

interface CommuteFormProps {
  selectedMode: string
  formData: {
    from: string
    to: string
    departure: string
    arrival: string
    cost: number
    distance: number
    notes: string
  }
  routeName: string
  onSelectMode: (mode: string) => void
  onUpdateForm: (data: Partial<CommuteFormProps["formData"]>) => void
  onUpdateRouteName: (name: string) => void
  onSaveCommute: () => void
  onSaveRoute: () => void
  onClose: () => void
}

export function CommuteForm({
  selectedMode,
  formData,
  routeName,
  onSelectMode,
  onUpdateForm,
  onUpdateRouteName,
  onSaveCommute,
  onSaveRoute,
  onClose,
}: CommuteFormProps) {
  const { lang } = useLang()

  return (
    <motion.div
      initial={fadeIn.hidden}
      animate={fadeIn.visible}
      exit={fadeIn.hidden}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={scaleIn.hidden}
        animate={scaleIn.visible}
        exit={scaleIn.hidden}
        className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              {lang === "bn" ? "নতুন যাতায়াত যোগ করুন" : "Add New Commute"}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "bn" ? "যাতায়াতের মাধ্যম" : "Transport Mode"}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TRANSPORT_MODES.map((mode) => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectMode(mode.id)}
                  className={`p-2 rounded-xl text-center transition-colors ${
                    selectedMode === mode.id
                      ? "bg-primary text-primary-foreground"
                      : "glass-subtle"
                  }`}
                >
                  <span className="text-xl block">{mode.icon}</span>
                  <span className="text-[10px] block mt-1">
                    {lang === "bn" ? mode.nameBn : mode.nameEn}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "bn" ? "থেকে" : "From"}
              </label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => onUpdateForm({ from: e.target.value })}
                placeholder={
                  lang === "bn" ? "যাতায়াত শুরুর স্থান" : "Starting location"
                }
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "bn" ? "পৌঁছাতে" : "To"}
              </label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => onUpdateForm({ to: e.target.value })}
                placeholder={lang === "bn" ? "গন্তব্য" : "Destination"}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "bn" ? "যাতায়াত শুরু" : "Departure"}
              </label>
              <input
                type="time"
                value={formData.departure}
                onChange={(e) => onUpdateForm({ departure: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "bn" ? "পৌঁছানো" : "Arrival"}
              </label>
              <input
                type="time"
                value={formData.arrival}
                onChange={(e) => onUpdateForm({ arrival: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "bn" ? "খরচ (৳)" : "Cost (৳)"}
              </label>
              <input
                type="number"
                value={formData.cost || ""}
                onChange={(e) => onUpdateForm({ cost: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {lang === "bn" ? "দূরত্ব (কিমি)" : "Distance (km)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distance || ""}
                onChange={(e) =>
                  onUpdateForm({ distance: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              {lang === "bn" ? "নোট" : "Notes"}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => onUpdateForm({ notes: e.target.value })}
              placeholder={
                lang === "bn" ? "অতিরিক্ত নোট..." : "Additional notes..."
              }
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={routeName}
              onChange={(e) => onUpdateRouteName(e.target.value)}
              placeholder={
                lang === "bn"
                  ? "এই রুট সংরক্ষণ করুন..."
                  : "Save this route as..."
              }
              aria-label="Route name"
              className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSaveRoute}
              className="px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 text-sm font-medium flex items-center gap-1"
            >
              <Bookmark className="w-4 h-4" />
              {lang === "bn" ? "সংরক্ষণ" : "Save"}
            </motion.button>
          </div>
        </div>

        <div className="p-4 border-t border-border/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSaveCommute}
            disabled={!selectedMode || !formData.from || !formData.to}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {lang === "bn" ? "যাতায়াত সংরক্ষণ করুন" : "Save Commute"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
