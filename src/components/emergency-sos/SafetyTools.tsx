import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  MapPin,
  Flashlight,
  PhoneIncoming,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { fadeUp } from "./types";
import { useState, useCallback } from "react";

interface SafetyToolsProps {
  lang: string;
  sosMessage: string;
  locationCoords: { lat: number; lng: number } | null;
  flashOn: boolean;
  fakeCallActive: boolean;
  fakeCallTimer: number;
  onShareLocation: () => void;
  onToggleFlash: () => void;
  onStartFakeCall: () => void;
  onStopFakeCall: () => void;
}

export function SafetyTools({
  lang,
  sosMessage,
  locationCoords,
  flashOn,
  fakeCallActive,
  fakeCallTimer,
  onShareLocation,
  onToggleFlash,
  onStartFakeCall,
  onStopFakeCall,
}: SafetyToolsProps) {
  const [locationShared, setLocationShared] = useState(false);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
      })
      .catch((e) => console.error("[SafetyTools]", "copy failed", e));
  }, []);

  const handleShareLocation = () => {
    onShareLocation();
    setLocationShared(true);
  };

  return (
    <motion.div variants={fadeUp}>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        {lang === "bn" ? "নিরাপত্তা সরঞ্জাম" : "Safety Tools"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShareLocation}
          className={`glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors
            ${locationShared ? "bg-green-500/10 border border-green-500/30" : "hover:bg-foreground/5"}`}
        >
          <MapPin
            className={`h-6 w-6 ${locationShared ? "text-green-500" : "text-blue-500"}`}
          />
          <span className="text-xs font-medium text-center">
            {locationShared
              ? lang === "bn"
                ? "শেয়ার হয়েছে ✓"
                : "Shared ✓"
              : lang === "bn"
                ? "লোকেশন শেয়ার"
                : "Share Location"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleFlash}
          className={`glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors
            ${flashOn ? "bg-yellow-500/10 border border-yellow-500/30" : "hover:bg-foreground/5"}`}
        >
          <Flashlight
            className={`h-6 w-6 ${flashOn ? "text-yellow-500" : "text-gray-500"}`}
          />
          <span className="text-xs font-medium text-center">
            {flashOn
              ? lang === "bn"
                ? "ফ্ল্যাশ চালু"
                : "Flash ON"
              : lang === "bn"
                ? "ফ্ল্যাশ অ্যালার্ট"
                : "Flash Alert"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fakeCallActive ? onStopFakeCall : onStartFakeCall}
          className={`glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors
            ${fakeCallActive ? "bg-purple-500/10 border border-purple-500/30" : "hover:bg-foreground/5"}`}
        >
          <PhoneIncoming
            className={`h-6 w-6 ${fakeCallActive ? "text-purple-500" : "text-gray-500"}`}
          />
          <span className="text-xs font-medium text-center">
            {fakeCallActive
              ? `📞 ${fakeCallTimer}s`
              : lang === "bn"
                ? "নকল কল"
                : "Fake Call"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowQuickMessage(!showQuickMessage)}
          className="glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-foreground/5"
        >
          <MessageCircle className="h-6 w-6 text-gray-500" />
          <span className="text-xs font-medium text-center">
            {lang === "bn" ? "দ্রুত বার্তা" : "Quick Message"}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showQuickMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-4 mt-3"
          >
            <p className="text-sm font-medium mb-2">
              {lang === "bn" ? "জরুরি বার্তা" : "Emergency Message"}
            </p>
            <textarea
              value={
                quickMessage ||
                `${sosMessage}${locationCoords ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}` : ""}`
              }
              onChange={(e) => setQuickMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border bg-background text-sm p-2.5 resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => copyToClipboard(quickMessage || sosMessage)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium 
                  text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {copiedText ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedText
                  ? lang === "bn"
                    ? "কপি হয়েছে!"
                    : "Copied!"
                  : lang === "bn"
                    ? "কপি"
                    : "Copy"}
              </button>
              <button
                onClick={() => {
                  const msg = encodeURIComponent(quickMessage || sosMessage);
                  window.open(`sms:?body=${msg}`, "_self");
                }}
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium 
                  text-white hover:bg-green-600 cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {lang === "bn" ? "বার্তা পাঠান" : "Send SMS"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
