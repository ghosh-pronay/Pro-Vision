import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t } from "@/i18n/translations"
import { useState, useCallback, useEffect, useRef } from "react"
import { Globe, RefreshCw, ExternalLink, Search, Clock } from "lucide-react"
import { logger } from "@/lib/logger"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface Article {
  title: string
  description: string
  url: string
  image: string
  publishedAt: string
  source: { name: string; url: string }
}

const fetchNews = async (_opts?: Record<string, unknown>) => ({
  articles: [],
  source: "demo",
})

const categoryMap: Record<string, string> = {
  all: "all",
  World: "world",
  বিশ্ব: "world",
  Technology: "technology",
  প্রযুক্তি: "technology",
  Sports: "sports",
  খেলাধুলা: "sports",
  Business: "business",
  অর্থনীতি: "business",
  Science: "science",
  বিজ্ঞান: "science",
}

export default function News() {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<string>("")

  const categories =
    lang === "bn"
      ? ["all", "বিশ্ব", "প্রযুক্তি", "খেলাধুলা", "অর্থনীতি", "বিজ্ঞান"]
      : ["all", "World", "Technology", "Sports", "Business", "Science"]

  const loadNewsRef =
    useRef<(query?: string, cat?: string) => Promise<void>>(undefined)

  const loadNews = useCallback(
    async (query?: string, cat?: string) => {
      setLoading(true)
      try {
        const result = await fetchNews({
          query: query || undefined,
          lang,
          category:
            cat && cat !== "all" ? (categoryMap[cat] ?? cat) : undefined,
        })
        setArticles(result.articles)
        setSource(result.source)
      } catch (err) {
        logger.error("News", "Failed to load news", err)
      } finally {
        setLoading(false)
      }
    },
    [lang],
  )

  useEffect(() => {
    loadNewsRef.current = loadNews
  })

  useEffect(() => {
    void loadNewsRef.current?.()
  }, [])

  const handleSearch = () => {
    loadNews(search || undefined, category)
  }

  const handleRefresh = () => {
    setSearch("")
    setCategory("all")
    loadNews()
  }

  const filtered = articles.filter((a) => {
    if (
      search &&
      !a.title.toLowerCase().includes(search.toLowerCase()) &&
      !a.description?.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const timeAgo = (dateStr: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.news", lang)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("news.subtitle", lang)}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="glass rounded-xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("news.search", lang)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {search && (
            <button
              onClick={handleSearch}
              className="text-xs text-[var(--pv-blue)] font-medium shrink-0"
            >
              {lang === "bn" ? "খুঁজুন" : "Search"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
      >
        {categories.map((c) => (
          <button
            className={`shrink-0 glass rounded-xl px-3 py-2 min-h-[44px] text-xs font-medium transition-all ${category === c ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
          >
            {c === "all" ? t("news.all", lang) : c}
          </button>
        ))}
      </motion.div>

      {/* Source badge */}
      {source && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Globe className="size-2.5" />
          {source === "api"
            ? "GNews API"
            : source === "cache"
              ? "Cached"
              : lang === "bn"
                ? "ডেমো ডাটা"
                : "Demo data"}
          {source === "api" && (
            <span className="text-[var(--pv-green)]">• Live</span>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-3 bg-foreground/5 rounded w-20 mb-2" />
              <div className="h-4 bg-foreground/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-foreground/5 rounded w-full mb-1" />
              <div className="h-3 bg-foreground/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Articles */}
      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <Globe className="size-10 mx-auto mb-3 text-[var(--pv-blue)] opacity-50" />
              <p className="text-sm text-muted-foreground">
                {lang === "bn"
                  ? "কোনো খবর পাওয়া যায়নি। আবার চেষ্টা করুন।"
                  : "No articles found. Try a different search."}
              </p>
            </div>
          )}
          {filtered.map((article, i) => (
            <motion.article
              key={article.url + i}
              custom={i + 2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="glass glass-card-hover rounded-2xl p-5 cursor-pointer group"
              onClick={() =>
                article.url !== "#" && window.open(article.url, "_blank")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium glass text-[var(--pv-blue)]">
                      {article.source?.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {timeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--pv-blue)] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                  )}
                </div>
                {article.image && (
                  <img
                    src={article.image}
                    alt=""
                    className="size-14 sm:size-16 rounded-xl object-cover shrink-0"
                  />
                )}
                <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
