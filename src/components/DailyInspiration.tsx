import { motion } from "framer-motion"
import { useI18n } from "@/hooks/use-i18n"
import { useState, useMemo } from "react"
import { Sparkles, BookOpen, Quote } from "lucide-react"

interface HoroscopeData {
  sign: string
  prediction: string
  lucky: string
  color: string
}

interface OnThisDayEvent {
  year: number
  event: string
}

interface QuoteData {
  text: string
  author: string
}

const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", dates: "Mar 21 - Apr 19" },
  { name: "Taurus", symbol: "♉", dates: "Apr 20 - May 20" },
  { name: "Gemini", symbol: "♊", dates: "May 21 - Jun 20" },
  { name: "Cancer", symbol: "♋", dates: "Jun 21 - Jul 22" },
  { name: "Leo", symbol: "♌", dates: "Jul 23 - Aug 22" },
  { name: "Virgo", symbol: "♍", dates: "Aug 23 - Sep 22" },
  { name: "Libra", symbol: "♎", dates: "Sep 23 - Oct 22" },
  { name: "Scorpio", symbol: "♏", dates: "Oct 23 - Nov 21" },
  { name: "Sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21" },
  { name: "Capricorn", symbol: "♑", dates: "Dec 22 - Jan 19" },
  { name: "Aquarius", symbol: "♒", dates: "Jan 20 - Feb 18" },
  { name: "Pisces", symbol: "♓", dates: "Feb 19 - Mar 20" },
] as const

const HOROSCOPE_PREDICTIONS: Record<string, string[]> = {
  Aries: [
    "Today brings new opportunities for growth. Trust your instincts.",
    "A creative solution will present itself. Stay open to possibilities.",
    "Your energy is high today. Use it to tackle important tasks.",
  ],
  Taurus: [
    "Financial matters look favorable. Consider long-term investments.",
    "A relationship deepens today. Quality time is key.",
    "Your patience will be rewarded. Stay the course.",
  ],
  Gemini: [
    "Communication is your superpower today. Express yourself clearly.",
    "A surprise connection leads to something meaningful.",
    "Your adaptability will help you navigate challenges smoothly.",
  ],
  Cancer: [
    "Home and family bring comfort today. Nurture your closest bonds.",
    "Your intuition is particularly strong. Trust your feelings.",
    "A nurturing act returns to you tenfold.",
  ],
  Leo: [
    "Your creativity shines today. Share your ideas with confidence.",
    "Leadership opportunities arise. Step up with grace.",
    "A celebration or recognition is on the horizon.",
  ],
  Virgo: [
    "Details matter today. Your analytical skills are sharp.",
    "Health and wellness improvements are favored.",
    "A systematic approach solves a complex problem.",
  ],
  Libra: [
    "Balance is key today. Seek harmony in all interactions.",
    "A partnership or collaboration brings positive results.",
    "Your charm and diplomacy open new doors.",
  ],
  Scorpio: [
    "Deep transformation is possible today. Embrace change.",
    "Your determination helps you overcome obstacles.",
    "A mystery unfolds in your favor. Stay curious.",
  ],
  Sagittarius: [
    "Adventure calls! Say yes to new experiences.",
    "Your optimism inspires those around you.",
    "Learning and exploration bring unexpected joy.",
  ],
  Capricorn: [
    "Hard work pays off today. Your discipline shows results.",
    "Career matters progress favorably. Stay focused.",
    "A mentor or authority figure offers valuable guidance.",
  ],
  Aquarius: [
    "Innovation is your theme today. Think outside the box.",
    "Community and social causes energize you.",
    "Your unique perspective solves a group problem.",
  ],
  Pisces: [
    "Your creativity and empathy are heightened today.",
    "A spiritual or emotional insight brings clarity.",
    "Artistic expression flows naturally. Create something beautiful.",
  ],
}

const QUOTES: QuoteData[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  {
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    text: "If you look at what you have in life, you'll always have more.",
    author: "Oprah Winfrey",
  },
]

const ON_THIS_DAY_EVENTS: OnThisDayEvent[] = [
  {
    year: 1858,
    event:
      "The first documented case of a baseball being played under modern rules.",
  },
  {
    year: 1928,
    event:
      "Amelia Earhart becomes the first woman to fly across the Atlantic Ocean.",
  },
  {
    year: 1948,
    event:
      "The United Nations Universal Declaration of Human Rights is adopted.",
  },
  {
    year: 1969,
    event: "Apollo 11 astronauts become the first humans to walk on the Moon.",
  },
  { year: 1981, event: "The first space shuttle Columbia is launched." },
  { year: 1991, event: "The Soviet Union dissolves, ending the Cold War era." },
  { year: 2003, event: "The Human Genome Project is completed." },
  { year: 2012, event: "The Higgs boson particle is confirmed at CERN." },
  {
    year: 1789,
    event: "The French Revolution begins with the storming of the Bastille.",
  },
  { year: 1961, event: "Bernie Basie records 'The Pink Panther Theme'." },
  { year: 1978, event: "The first email is sent over ARPANET." },
  { year: 1999, event: "The Euro currency is introduced in 11 EU countries." },
  { year: 2000, event: "The Millennium Bridge opens in London." },
  {
    year: 1994,
    event:
      "Nelson Mandela is inaugurated as South Africa's first Black president.",
  },
  { year: 1977, event: "The first Star Wars film is released in theaters." },
  {
    year: 1945,
    event: "The United Nations Charter is signed in San Francisco.",
  },
  {
    year: 1930,
    event: "The first Earth Day-like event is held, focused on conservation.",
  },
  { year: 1885, event: "The Statue of Liberty arrives in New York Harbor." },
]

function getDailyHoroscope(sign: string): HoroscopeData {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  )
  const predictions = HOROSCOPE_PREDICTIONS[sign] || HOROSCOPE_PREDICTIONS.Aries
  const prediction = predictions[dayOfYear % predictions.length]
  const colors = ["Red", "Blue", "Green", "Gold", "Purple", "Silver"]
  const lucky = String(((dayOfYear * 7 + sign.charCodeAt(0)) % 10) + 1)

  return {
    sign,
    prediction,
    lucky,
    color: colors[dayOfYear % colors.length],
  }
}

function getQuoteOfTheDay(): QuoteData {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  )
  return QUOTES[dayOfYear % QUOTES.length]
}

function getOnThisDayEvent(): OnThisDayEvent {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  )
  return ON_THIS_DAY_EVENTS[dayOfYear % ON_THIS_DAY_EVENTS.length]
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DailyInspiration() {
  const { t } = useI18n()
  const [selectedSign, setSelectedSign] = useState<string>("Aries")
  const [showSignPicker, setShowSignPicker] = useState(false)

  const horoscope = useMemo(
    () => getDailyHoroscope(selectedSign),
    [selectedSign],
  )
  const quote = useMemo(() => getQuoteOfTheDay(), [])
  const onThisDay = useMemo(() => getOnThisDayEvent(), [])

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 p-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <h3 className="font-semibold text-sm">{t.daily.title}</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-purple-500/10 p-1.5">
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
            <h4 className="font-semibold text-sm">{t.daily.horoscope}</h4>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSignPicker(!showSignPicker)}
              className="w-full flex items-center justify-between rounded-xl bg-foreground/5 px-3 py-2 text-sm mb-3 hover:bg-foreground/10 transition-colors"
              aria-expanded={showSignPicker}
              aria-haspopup="listbox"
              aria-label={t.daily.selectSign}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">
                  {ZODIAC_SIGNS.find((s) => s.name === selectedSign)?.symbol}
                </span>
                <span>{selectedSign}</span>
              </span>
              <span className="text-xs text-muted-foreground">▼</span>
            </button>

            {showSignPicker && (
              <div
                className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl bg-background border border-border shadow-lg max-h-48 overflow-y-auto"
                role="listbox"
                aria-label={t.daily.selectSign}
              >
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    key={sign.name}
                    role="option"
                    aria-selected={selectedSign === sign.name}
                    onClick={() => {
                      setSelectedSign(sign.name)
                      setShowSignPicker(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-foreground/5 transition-colors ${
                      selectedSign === sign.name
                        ? "bg-primary/10 text-primary"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{sign.symbol}</span>
                    <span>{sign.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {horoscope && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {horoscope.prediction}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">{t.daily.lucky}</span>
                  <span className="font-medium">{horoscope.lucky}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">{t.daily.color}</span>
                  <span className="font-medium">{horoscope.color}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-blue-500/10 p-1.5">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <h4 className="font-semibold text-sm">{t.daily.onThisDay}</h4>
          </div>

          {onThisDay && (
            <div className="space-y-2">
              <div className="rounded-xl bg-blue-500/5 p-3">
                <span className="text-2xl font-bold text-blue-500">
                  {onThisDay.year}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({new Date().getFullYear() - onThisDay.year}{" "}
                  {t.daily.yearsAgo})
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {onThisDay.event}
              </p>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-orange-500/10 p-1.5">
              <Quote className="h-4 w-4 text-orange-500" />
            </div>
            <h4 className="font-semibold text-sm">{t.daily.quote}</h4>
          </div>

          {quote && (
            <div className="space-y-3">
              <blockquote className="text-sm italic text-muted-foreground leading-relaxed border-l-2 border-orange-500/30 pl-3">
                "{quote.text}"
              </blockquote>
              <p className="text-xs text-right text-orange-500 font-medium">
                — {quote.author}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
