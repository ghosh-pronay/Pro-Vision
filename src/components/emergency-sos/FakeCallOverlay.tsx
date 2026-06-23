import { motion, AnimatePresence } from "framer-motion";
import { Users, Phone } from "lucide-react";

interface FakeCallOverlayProps {
  lang: string;
  fakeCallTimer: number;
  onStopFakeCall: () => void;
}

export function FakeCallOverlay({
  lang,
  fakeCallTimer,
  onStopFakeCall,
}: FakeCallOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-between p-8"
      >
        <div className="text-center mt-16">
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto 
            flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30"
          >
            <Users className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-1">
            {lang === "bn" ? "মা" : "Mom"}
          </h2>
          <p className="text-gray-400 text-lg">
            {lang === "bn" ? "কলিং..." : "Calling..."}
          </p>
          <p className="text-gray-500 text-sm mt-2">{fakeCallTimer}s</p>
        </div>

        <div className="flex gap-8 mb-16">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gray-700/50 flex items-center justify-center">
              <span className="text-2xl">🔇</span>
            </div>
            <span className="text-gray-400 text-xs">
              {lang === "bn" ? "মিউট" : "Mute"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gray-700/50 flex items-center justify-center">
              <span className="text-2xl">🔊</span>
            </div>
            <span className="text-gray-400 text-xs">
              {lang === "bn" ? "স্পিকার" : "Speaker"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gray-700/50 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <span className="text-gray-400 text-xs">
              {lang === "bn" ? "ব্লুটুথ" : "Bluetooth"}
            </span>
          </div>
        </div>

        <motion.button
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          onClick={onStopFakeCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors
            shadow-lg shadow-red-500/50 mb-8"
        >
          <Phone className="h-8 w-8 text-white rotate-[135deg]" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
