import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react"
import { useLang } from "@/i18n/LanguageContext"
import { t, type TranslationKey } from "@/i18n/translations"
import { toastError } from "@/lib/toast-helpers"
import { logger } from "@/lib/logger"

interface AmbientSound {
  id: string
  name: { en: string; bn: string }
  icon: string
  category: "nature" | "urban" | "focus"
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "rain",
    name: { en: "Rain", bn: "বৃষ্টি" },
    icon: "🌧️",
    category: "nature",
  },
  {
    id: "forest",
    name: { en: "Forest", bn: "বন" },
    icon: "🌲",
    category: "nature",
  },
  {
    id: "ocean",
    name: { en: "Ocean Waves", bn: "সমুদ্রের ঢেউ" },
    icon: "🌊",
    category: "nature",
  },
  {
    id: "fire",
    name: { en: "Campfire", bn: "ক্যাম্পফায়ার" },
    icon: "🔥",
    category: "nature",
  },
  {
    id: "birds",
    name: { en: "Birds", bn: "পাখি" },
    icon: "🐦",
    category: "nature",
  },
  {
    id: "thunder",
    name: { en: "Thunder", bn: "বজ্রপাত" },
    icon: "⛈️",
    category: "nature",
  },
  {
    id: "cafe",
    name: { en: "Cafe", bn: "ক্যাফে" },
    icon: "☕",
    category: "urban",
  },
  {
    id: "keyboard",
    name: { en: "Keyboard", bn: "কীবোর্ড" },
    icon: "⌨️",
    category: "urban",
  },
  {
    id: "whitenoise",
    name: { en: "White Noise", bn: "ওয়াইট নয়েজ" },
    icon: "📻",
    category: "focus",
  },
  {
    id: "brownnoise",
    name: { en: "Brown Noise", bn: "ব্রাউন নয়েজ" },
    icon: "🔊",
    category: "focus",
  },
  {
    id: "piano",
    name: { en: "Piano", bn: "পিয়ানো" },
    icon: "🎹",
    category: "focus",
  },
  {
    id: "lofi",
    name: { en: "Lo-Fi", bn: "লো-ফাই" },
    icon: "🎵",
    category: "focus",
  },
]

interface AmbientSoundsProps {
  onSoundChange?: (soundId: string | null) => void
}

function createNoiseBuffer(
  ctx: AudioContext,
  type: "white" | "brown" | "pink",
): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * 4
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  } else if (type === "brown") {
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
  } else {
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  }
  return buffer
}

function startSound(
  ctx: AudioContext,
  gain: GainNode,
  soundId: string,
): (() => void) | null {
  const noiseBuffer = createNoiseBuffer(ctx, "white")
  const brownBuffer = createNoiseBuffer(ctx, "brown")
  const pinkBuffer = createNoiseBuffer(ctx, "pink")

  const playBuffer = (buffer: AudioBuffer, loop = true) => {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = loop
    source.connect(gain)
    source.start()
    return source
  }

  const makeFilter = (type: BiquadFilterType, freq: number, q = 1) => {
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    f.Q.value = q
    return f
  }

  const stopFns: (() => void)[] = []

  const stopAll = () => stopFns.forEach((fn) => fn())

  switch (soundId) {
    case "rain": {
      const noise = playBuffer(noiseBuffer)
      const lp = makeFilter("lowpass", 3000)
      const hp = makeFilter("highpass", 400)
      noise.disconnect()
      noise.connect(lp)
      lp.connect(hp)
      hp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })

      const drip = () => {
        if (ctx.state === "closed") return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.frequency.value = 800 + Math.random() * 1200
        osc.type = "sine"
        g.gain.setValueAtTime(0.02, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
        setTimeout(drip, 50 + Math.random() * 200)
      }
      drip()
      return stopAll
    }

    case "forest": {
      const noise = playBuffer(pinkBuffer)
      const bp = makeFilter("bandpass", 800, 0.5)
      noise.disconnect()
      noise.connect(bp)
      bp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })

      const chirp = () => {
        if (ctx.state === "closed") return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const baseFreq = 2000 + Math.random() * 2000
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(
          baseFreq + 500,
          ctx.currentTime + 0.05,
        )
        osc.frequency.linearRampToValueAtTime(
          baseFreq - 300,
          ctx.currentTime + 0.1,
        )
        osc.type = "sine"
        g.gain.setValueAtTime(0.015, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
        setTimeout(chirp, 300 + Math.random() * 1500)
      }
      chirp()
      return stopAll
    }

    case "ocean": {
      const noise = playBuffer(brownBuffer)
      const lp = makeFilter("lowpass", 500)
      noise.disconnect()
      noise.connect(lp)
      lp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })

      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.1
      lfoGain.gain.value = 300
      lfo.connect(lfoGain)
      lfoGain.connect(lp.frequency)
      lfo.start()
      stopFns.push(() => {
        try {
          lfo.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })
      return stopAll
    }

    case "fire": {
      const noise = playBuffer(noiseBuffer)
      const bp = makeFilter("bandpass", 1000, 0.3)
      noise.disconnect()
      noise.connect(bp)
      bp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })

      const crackle = () => {
        if (ctx.state === "closed") return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.frequency.value = 2000 + Math.random() * 3000
        osc.type = "square"
        g.gain.setValueAtTime(0.008, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 0.02)
        setTimeout(crackle, 30 + Math.random() * 150)
      }
      crackle()
      return stopAll
    }

    case "birds": {
      const chirp = () => {
        if (ctx.state === "closed") return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const f = 1500 + Math.random() * 2500
        osc.frequency.setValueAtTime(f, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(f + 800, ctx.currentTime + 0.04)
        osc.frequency.linearRampToValueAtTime(f - 500, ctx.currentTime + 0.08)
        osc.frequency.linearRampToValueAtTime(f + 200, ctx.currentTime + 0.12)
        osc.type = "sine"
        g.gain.setValueAtTime(0.02, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)

        if (Math.random() > 0.5) {
          setTimeout(() => {
            if (ctx.state === "closed") return
            const osc2 = ctx.createOscillator()
            const g2 = ctx.createGain()
            const f2 = f + 300
            osc2.frequency.setValueAtTime(f2, ctx.currentTime)
            osc2.frequency.linearRampToValueAtTime(
              f2 + 600,
              ctx.currentTime + 0.03,
            )
            osc2.type = "sine"
            g2.gain.setValueAtTime(0.015, ctx.currentTime)
            g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
            osc2.connect(g2)
            g2.connect(gain)
            osc2.start()
            osc2.stop(ctx.currentTime + 0.1)
          }, 80)
        }
        setTimeout(chirp, 200 + Math.random() * 2000)
      }
      chirp()
      return stopAll
    }

    case "thunder": {
      const noise = playBuffer(brownBuffer)
      const lp = makeFilter("lowpass", 200)
      noise.disconnect()
      noise.connect(lp)
      lp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })

      const rumble = () => {
        if (ctx.state === "closed") return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.frequency.value = 40 + Math.random() * 30
        osc.type = "sine"
        g.gain.setValueAtTime(0.06, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 2)
        setTimeout(rumble, 3000 + Math.random() * 5000)
      }
      rumble()
      return stopAll
    }

    case "cafe": {
      const noise = playBuffer(pinkBuffer)
      const bp = makeFilter("bandpass", 400, 0.8)
      noise.disconnect()
      noise.connect(bp)
      bp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })
      return stopAll
    }

    case "keyboard": {
      const click = () => {
        if (ctx.state === "closed") return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.frequency.value = 3000 + Math.random() * 2000
        osc.type = "square"
        g.gain.setValueAtTime(0.01, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 0.015)
        setTimeout(click, 50 + Math.random() * 200)
      }
      click()
      return stopAll
    }

    case "whitenoise": {
      const noise = playBuffer(noiseBuffer)
      noise.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })
      return stopAll
    }

    case "brownnoise": {
      const noise = playBuffer(brownBuffer)
      noise.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })
      return stopAll
    }

    case "piano": {
      const notes = [
        261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
      ]
      const playChord = () => {
        if (ctx.state === "closed") return
        const base = notes[Math.floor(Math.random() * notes.length)]
        ;[1, 1.25, 1.5].forEach((mult) => {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.frequency.value = base * mult
          osc.type = "sine"
          g.gain.setValueAtTime(0.015, ctx.currentTime)
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3)
          osc.connect(g)
          g.connect(gain)
          osc.start()
          osc.stop(ctx.currentTime + 3)
        })
        setTimeout(playChord, 2000 + Math.random() * 3000)
      }
      playChord()
      return stopAll
    }

    case "lofi": {
      const noise = playBuffer(pinkBuffer)
      const lp = makeFilter("lowpass", 800)
      noise.disconnect()
      noise.connect(lp)
      lp.connect(gain)
      stopFns.push(() => {
        try {
          noise.stop()
        } catch (e) {
          logger.error("AmbientSounds", "audio operation failed", e)
        }
      })

      const pad = () => {
        if (ctx.state === "closed") return
        const notes = [130.81, 164.81, 196.0, 220.0]
        const freq = notes[Math.floor(Math.random() * notes.length)]
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.frequency.value = freq
        osc.type = "sine"
        g.gain.setValueAtTime(0.01, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4)
        osc.connect(g)
        g.connect(gain)
        osc.start()
        osc.stop(ctx.currentTime + 4)
        setTimeout(pad, 2500 + Math.random() * 2000)
      }
      pad()
      return stopAll
    }

    default:
      return null
  }
}

export default function AmbientSounds({ onSoundChange }: AmbientSoundsProps) {
  const { lang } = useLang()
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      stopRef.current?.()
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close()
      }
    }
  }, [])

  const toggleSound = useCallback(
    (sound: AmbientSound) => {
      if (activeSound === sound.id) {
        if (isPlaying && ctxRef.current) {
          ctxRef.current.suspend()
          setIsPlaying(false)
        } else if (ctxRef.current) {
          ctxRef.current.resume()
          setIsPlaying(true)
        }
        return
      }

      stopRef.current?.()
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close()
      }

      try {
        const ctx = new AudioContext()
        const gain = ctx.createGain()
        gain.gain.value = isMuted ? 0 : volume
        gain.connect(ctx.destination)

        ctxRef.current = ctx
        gainRef.current = gain

        const stopFn = startSound(ctx, gain, sound.id)
        stopRef.current = stopFn

        setActiveSound(sound.id)
        setIsPlaying(true)
        onSoundChange?.(sound.id)
      } catch (err) {
        logger.error("AmbientSounds", "Failed to create audio context", err)
        toastError(
          lang === "bn"
            ? "শব্দ চালু করতে ব্যর্থ হয়েছে"
            : "Failed to play sound",
        )
      }
    },
    [activeSound, isPlaying, volume, isMuted, onSoundChange, lang],
  )

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (gainRef.current) {
      gainRef.current.gain.value = isMuted ? 0 : newVolume
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (gainRef.current) {
      gainRef.current.gain.value = isMuted ? volume : 0
    }
  }

  const stopSound = () => {
    stopRef.current?.()
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close()
    }
    ctxRef.current = null
    gainRef.current = null
    stopRef.current = null
    setActiveSound(null)
    setIsPlaying(false)
    onSoundChange?.(null)
  }

  const categories = ["nature", "urban", "focus"] as const
  const categoryLabels: Record<string, { en: string; bn: string }> = {
    nature: { en: "Nature", bn: "প্রকৃতি" },
    urban: { en: "Urban", bn: "শহুরে" },
    focus: { en: "Focus", bn: "ফোকাস" },
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="font-semibold text-sm text-foreground mb-4">
        {t("expense.ambientSounds" as TranslationKey, lang) ||
          (lang === "bn" ? "পরিবেশগত শব্দ" : "Ambient Sounds")}
      </h3>

      {categories.map((category) => (
        <div key={category} className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">
            {categoryLabels[category][lang]}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {AMBIENT_SOUNDS.filter((s) => s.category === category).map(
              (sound) => (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                    activeSound === sound.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-xs text-muted-foreground">
                    {sound.name[lang]}
                  </span>
                  {activeSound === sound.id && isPlaying && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="h-1 w-1 rounded-full bg-primary"
                    />
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      ))}

      {activeSound && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 flex items-center gap-4 rounded-xl bg-white/5 p-3"
        >
          <button
            onClick={() => {
              if (ctxRef.current) {
                if (isPlaying) {
                  ctxRef.current.suspend()
                  setIsPlaying(false)
                } else {
                  ctxRef.current.resume()
                  setIsPlaying(true)
                }
              }
            }}
            className="rounded-full bg-primary p-2 text-primary-foreground"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <button
            onClick={toggleMute}
            className="rounded-lg p-2 hover:bg-white/10"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={stopSound}
            className="rounded-lg p-2 hover:bg-white/10"
            title={lang === "bn" ? "বন্ধ করুন" : "Stop"}
          >
            <Square className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </div>
  )
}
