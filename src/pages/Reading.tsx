import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import {
  BookOpen,
  Plus,
  Search,
  Star,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Check,
  Book,
  Headphones,
  Video,
  FileText,
} from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { toastSuccess } from "@/lib/toast-helpers"
import { sanitizeInput } from "@/lib/input-sanitizer"

interface ReadingItem {
  _id: string
  title: string
  author?: string
  type: "book" | "article" | "podcast" | "video"
  status: "want_to_read" | "reading" | "completed"
  progress: number
  rating?: number
  notes?: string
  url?: string
  coverUrl?: string
  totalPages?: number
  currentPage?: number
  createdAt: number
  updatedAt: number
}

const TYPE_ICONS = {
  book: Book,
  article: FileText,
  podcast: Headphones,
  video: Video,
}

const TYPE_COLORS = {
  book: "text-blue-500",
  article: "text-green-500",
  podcast: "text-purple-500",
  video: "text-red-500",
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Reading() {
  const { lang } = useLang()
  const items = useQuery(api.readingList.list)
  const createItem = useMutation(api.readingList.create, "readingList")
  const updateItem = useMutation(api.readingList.update, "readingList")
  const deleteItem = useMutation(api.readingList.remove, "readingList")

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<
    "all" | "want_to_read" | "reading" | "completed"
  >("all")
  const [showEditor, setShowEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<ReadingItem | null>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [type, setType] = useState<"book" | "article" | "podcast" | "video">(
    "book",
  )
  const [status, setStatus] = useState<
    "want_to_read" | "reading" | "completed"
  >("want_to_read")
  const [progress, setProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState("")
  const [url, setUrl] = useState("")
  const [totalPages, setTotalPages] = useState("")
  const [currentPage, setCurrentPage] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    if (!items) return []
    return items
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.author?.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === "all" || item.status === filter
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [items, search, filter])

  const stats = useMemo(() => {
    if (!items) return { total: 0, reading: 0, completed: 0, wantToRead: 0 }
    return {
      total: items.length,
      reading: items.filter((i) => i.status === "reading").length,
      completed: items.filter((i) => i.status === "completed").length,
      wantToRead: items.filter((i) => i.status === "want_to_read").length,
    }
  }, [items])

  const handleSave = async () => {
    if (!title.trim()) return

    const data = {
      title: sanitizeInput(title.trim()),
      author: sanitizeInput(author.trim()) || undefined,
      type,
      status,
      progress,
      rating: rating > 0 ? rating : undefined,
      notes: sanitizeInput(notes.trim()) || undefined,
      url: url.trim() || undefined,
      totalPages: totalPages ? parseInt(totalPages) : undefined,
      currentPage: currentPage ? parseInt(currentPage) : undefined,
    }

    if (editingItem) {
      await updateItem({ id: editingItem._id, ...data })
      toastSuccess(lang === "bn" ? "আইটেম আপডেট হয়েছে" : "Item updated")
    } else {
      await createItem(data)
      toastSuccess(lang === "bn" ? "আইটেম যোগ হয়েছে" : "Item added")
    }

    resetEditor()
  }

  const handleEdit = (item: ReadingItem) => {
    setEditingItem(item)
    setTitle(item.title)
    setAuthor(item.author || "")
    setType(item.type)
    setStatus(item.status)
    setProgress(item.progress)
    setRating(item.rating || 0)
    setNotes(item.notes || "")
    setUrl(item.url || "")
    setTotalPages(item.totalPages?.toString() || "")
    setCurrentPage(item.currentPage?.toString() || "")
    setShowEditor(true)
  }

  const handleDelete = async (id: string) => {
    await deleteItem({ id })
    toastSuccess(lang === "bn" ? "আইটেম মুছে ফেলা হয়েছে" : "Item deleted")
  }

  const resetEditor = () => {
    setShowEditor(false)
    setEditingItem(null)
    setTitle("")
    setAuthor("")
    setType("book")
    setStatus("want_to_read")
    setProgress(0)
    setRating(0)
    setNotes("")
    setUrl("")
    setTotalPages("")
    setCurrentPage("")
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {lang === "bn" ? "পড়াশোনা" : "Reading List"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "আপনার পড়াশোনার যাত্রা ট্র্যাক করুন"
              : "Track your reading journey"}
          </p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "আইটেম যোগ করুন" : "Add Item"}
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট" : "Total"}
          </p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.reading}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "পড়ছি" : "Reading"}
          </p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সম্পন্ন" : "Completed"}
          </p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">
            {stats.wantToRead}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "পড়তে চাই" : "Want to Read"}
          </p>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              lang === "bn" ? "বই, লেখক খুঁজুন..." : "Search books, authors..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-foreground/5 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-foreground/5 p-1 flex-wrap">
          {(["all", "reading", "completed", "want_to_read"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover-tab"
                }`}
              >
                {f === "all"
                  ? lang === "bn"
                    ? "সব"
                    : "All"
                  : f === "reading"
                    ? lang === "bn"
                      ? "পড়ছি"
                      : "Reading"
                    : f === "completed"
                      ? lang === "bn"
                        ? "সম্পন্ন"
                        : "Done"
                      : lang === "bn"
                        ? "পড়তে চাই"
                        : "Want to Read"}
              </button>
            ),
          )}
        </div>
      </motion.div>

      {/* Items List */}
      <motion.div variants={fadeUp} className="space-y-3">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              lang === "bn"
                ? "আপনার পড়ার তালিকা খালি"
                : "Your reading list is empty"
            }
            description={
              lang === "bn"
                ? "আপনার প্রথম বই, নিবন্ধ, বা পডকাস্ট যোগ করুন"
                : "Add your first book, article, or podcast"
            }
            action={{
              label: lang === "bn" ? "আইটেম যোগ করুন" : "Add Item",
              onClick: () => setShowEditor(true),
            }}
          />
        ) : (
          filteredItems.map((item) => {
            const Icon = TYPE_ICONS[item.type]
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 glass-card-hover"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-3 bg-foreground/5 ${TYPE_COLORS[item.type]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      {item.rating && item.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < item.rating!
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {item.author && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.author}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          item.status === "reading"
                            ? "bg-blue-500/10 text-blue-500"
                            : item.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-orange-500/10 text-orange-500"
                        }`}
                      >
                        {item.status === "reading"
                          ? lang === "bn"
                            ? "পড়ছি"
                            : "Reading"
                          : item.status === "completed"
                            ? lang === "bn"
                              ? "সম্পন্ন"
                              : "Completed"
                            : lang === "bn"
                              ? "পড়তে চাই"
                              : "Want to Read"}
                      </span>
                      {item.status === "reading" &&
                        item.totalPages &&
                        item.currentPage && (
                          <span>
                            {item.currentPage} / {item.totalPages}{" "}
                            {lang === "bn" ? "পৃষ্ঠা" : "pages"}
                          </span>
                        )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {lang === "bn" ? "লিঙ্ক" : "Link"}
                        </a>
                      )}
                    </div>
                    {item.status === "reading" && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item._id)}
                      className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={resetEditor}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:max-h-[85vh] z-50 glass rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/20">
                <h2 className="font-semibold">
                  {editingItem
                    ? lang === "bn"
                      ? "সম্পাদনা"
                      : "Edit"
                    : lang === "bn"
                      ? "নতুন আইটেম"
                      : "New Item"}
                </h2>
                <button
                  onClick={resetEditor}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <input
                  type="text"
                  placeholder={lang === "bn" ? "শিরোনাম..." : "Title..."}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <input
                  type="text"
                  placeholder={lang === "bn" ? "লেখক..." : "Author..."}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "ধরন" : "Type"}
                  </label>
                  <div className="flex gap-2">
                    {(["book", "article", "podcast", "video"] as const).map(
                      (t) => {
                        const Icon = TYPE_ICONS[t]
                        return (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                              type === t
                                ? "bg-primary text-primary-foreground"
                                : "bg-foreground/5 hover:bg-foreground/10"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {t === "book"
                              ? lang === "bn"
                                ? "বই"
                                : "Book"
                              : t === "article"
                                ? lang === "bn"
                                  ? "নিবন্ধ"
                                  : "Article"
                                : t === "podcast"
                                  ? lang === "bn"
                                    ? "পডকাস্ট"
                                    : "Podcast"
                                  : lang === "bn"
                                    ? "ভিডিও"
                                    : "Video"}
                          </button>
                        )
                      },
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "অবস্থা" : "Status"}
                  </label>
                  <div className="flex gap-2">
                    {(["want_to_read", "reading", "completed"] as const).map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(s)}
                          className={`cursor-pointer rounded-xl px-3 py-2 text-sm transition-colors ${
                            status === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground/5 hover:bg-foreground/10"
                          }`}
                        >
                          {s === "want_to_read"
                            ? lang === "bn"
                              ? "পড়তে চাই"
                              : "Want to Read"
                            : s === "reading"
                              ? lang === "bn"
                                ? "পড়ছি"
                                : "Reading"
                              : lang === "bn"
                                ? "সম্পন্ন"
                                : "Completed"}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {status === "reading" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {lang === "bn" ? "মোট পৃষ্ঠা" : "Total Pages"}
                      </label>
                      <input
                        type="number"
                        value={totalPages}
                        onChange={(e) => setTotalPages(e.target.value)}
                        className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {lang === "bn" ? "বর্তমান পৃষ্ঠা" : "Current Page"}
                      </label>
                      <input
                        type="number"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "অগ্রগতি" : "Progress"} ({progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "রেটিং" : "Rating"}
                  </label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRating(rating === i + 1 ? 0 : i + 1)}
                        className="cursor-pointer hover:text-[var(--pv-orange)] transition-colors"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            i < rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  placeholder={
                    lang === "bn" ? "লিঙ্ক (ঐচ্ছিক)" : "URL (optional)"
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <textarea
                  placeholder={lang === "bn" ? "নোট..." : "Notes..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-border/20">
                <button
                  onClick={resetEditor}
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {lang === "bn" ? "সংরক্ষণ" : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId)
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "আইটেম মুছুন?" : "Delete item?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  )
}
