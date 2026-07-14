import { motion } from "framer-motion"
import { QrCode, X } from "lucide-react"

interface QRCodeModalProps {
  billId: string
  onCopyLink: (billId: string) => void
  onClose: () => void
}

export function QRCodeModal({ billId, onCopyLink, onClose }: QRCodeModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-sm space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share Bill</h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 rounded-2xl bg-white flex items-center justify-center">
            <div className="text-center">
              <QrCode className="h-24 w-24 text-black mx-auto" />
              <p className="text-xs text-gray-500 mt-2">Scan to view bill</p>
            </div>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium mb-1 block">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/bill/${billId}`}
                aria-label="Email to share"
                className="flex-1 rounded-xl glass px-3 py-2 text-xs"
              />
              <button
                onClick={() => onCopyLink(billId)}
                className="cursor-pointer px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
