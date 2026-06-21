import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Mic,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MicOff,
  Play,
  Pause,
  Square,
  Search,
  Trash2,
  Edit3,
  Download,
  Share2,
  Tag,
  Clock,
  FileText,
  X,
  Check,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Copy,
  Globe,
  Headphones,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/toast-helpers";

interface VoiceNote {
  id: string;
  title: string;
  transcription: string;
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  language: "bn" | "en";
  tags: string[];
  createdAt: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function VoiceNotes() {
  const { lang } = useLang();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<"bn" | "en">("bn");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.transcription.toLowerCase().includes(q) ||
        note.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [notes, searchQuery]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formatDate = useCallback(
    (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString(
        lang === "bn" ? "bn-BD" : "en-US",
        {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    },
    [lang],
  );

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height,
          0,
          canvas.height - barHeight,
        );
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.8)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toastError(t("voiceNotes.browserNotSupported", lang));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage === "bn" ? "bn-BD" : "en-US";

    recognition.onstart = () => {
      setIsRecognizing(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscription((prev) =>
          prev ? prev + " " + finalTranscript : finalTranscript,
        );
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecognizing(false);
    };

    recognition.onend = () => {
      setIsRecognizing(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [selectedLanguage, lang]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecognizing(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setTranscription("");
      setCurrentTime(0);

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);

      drawWaveform();
      startSpeechRecognition();
    } catch (error) {
      console.error("Recording error:", error);
      toastError(t("voiceNotes.micPermissionDenied", lang));
    }
  }, [drawWaveform, startSpeechRecognition, lang]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      stopSpeechRecognition();
      setShowSaveForm(true);
    }
  }, [isRecording, stopSpeechRecognition]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setCurrentTime((prev) => prev + 1);
        }, 1000);
        drawWaveform();
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      }
    }
  }, [isRecording, isPaused, drawWaveform]);

  const saveNote = useCallback(() => {
    if (!audioBlob) return;

    const audioUrl = URL.createObjectURL(audioBlob);
    const tags = noteTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (editingId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId ? { ...note, title: noteTitle, tags } : note,
        ),
      );
      setEditingId(null);
      toastSuccess(t("voiceNotes.saved", lang));
    } else {
      const newNote: VoiceNote = {
        id: Date.now().toString(),
        title:
          noteTitle || `${t("voiceNotes.title", lang)} ${notes.length + 1}`,
        transcription,
        audioUrl,
        audioBlob,
        duration: currentTime,
        language: selectedLanguage,
        tags,
        createdAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      toastSuccess(t("voiceNotes.saved", lang));
    }

    setShowSaveForm(false);
    setNoteTitle("");
    setNoteTags("");
    setAudioBlob(null);
    setTranscription("");
    setCurrentTime(0);
  }, [
    audioBlob,
    noteTitle,
    noteTags,
    editingId,
    transcription,
    currentTime,
    selectedLanguage,
    notes.length,
    lang,
  ]);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setDeleteId(null);
      if (playingId === id) {
        // eslint-disable-next-line react-hooks/purity
        // eslint-disable-next-line react-hooks/immutability
        stopPlayback();
      }
      toastSuccess(t("voiceNotes.deleted", lang));
    },
    [playingId, lang],
  );

  const startPlayback = useCallback((note: VoiceNote) => {
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current = null;
    }

    const audio = new Audio(note.audioUrl);
    audioRef.current = audio;
    playingAudioRef.current = audio;

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.play();
    setPlayingId(note.id);
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const stopPlayback = useCallback(() => {
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const exportNote = useCallback(
    (note: VoiceNote) => {
      const text = `${note.title}\n\n${t("voiceNotes.transcription", lang)}:\n${note.transcription}\n\n${t("voiceNotes.tags", lang)}: ${note.tags.join(", ")}\n${t("voiceNotes.duration", lang)}: ${formatDuration(note.duration)}`;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess(t("voiceNotes.export", lang));
    },
    [lang, formatDuration],
  );

  const shareNote = useCallback(
    (note: VoiceNote) => {
      const shareText = `${note.title}\n\n${note.transcription}`;
      if (navigator.share) {
        navigator.share({
          title: note.title,
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toastSuccess(t("voiceNotes.copied", lang));
      }
    },
    [lang],
  );

  const startEditing = useCallback((note: VoiceNote) => {
    setEditingId(note.id);
    setNoteTitle(note.title);
    setShowSaveForm(true);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (playingAudioRef.current) playingAudioRef.current.pause();
    };
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Headphones className="h-6 w-6 text-purple-500" />
          {t("voiceNotes.title", lang)}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার কথা বলুন, নোট নিন"
            : "Speak your mind, capture your notes"}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t("voiceNotes.language", lang)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage("bn")}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === "bn"
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setSelectedLanguage("en")}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === "en"
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-6">
          <div className="relative mb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`cursor-pointer w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isRecording ? (
                <Square className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-primary-foreground" />
              )}
            </motion.button>
            {isRecording && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
            )}
          </div>

          <p className="text-3xl font-mono font-bold mb-2">
            {formatDuration(currentTime)}
          </p>

          {isRecording && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={pauseRecording}
                className="cursor-pointer p-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-colors"
              >
                {isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
              </button>
            </div>
          )}

          <div className="w-full max-w-md mt-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={80}
              className="w-full h-20 rounded-lg bg-foreground/5"
            />
            {isRecognizing && (
              <p className="text-xs text-muted-foreground text-center mt-1">
                {t("voiceNotes.recognizing", lang)}
              </p>
            )}
          </div>
        </div>

        {transcription && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-xl bg-foreground/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("voiceNotes.transcription", lang)}
              </span>
              <button
                onClick={() => setTranscription("")}
                className="cursor-pointer p-1 rounded hover:bg-foreground/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm whitespace-pre-wrap">{transcription}</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showSaveForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingId
                ? t("voiceNotes.editTitle", lang)
                : t("voiceNotes.save", lang)}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "শিরোনাম" : "Title"}
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder={t("voiceNotes.titlePlaceholder", lang)}
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("voiceNotes.tags", lang)}
                </label>
                <input
                  type="text"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "যেমন: ব্যক্তিগত, কাজ, আইডিয়া"
                      : "e.g., personal, work, ideas"
                  }
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              {transcription && (
                <div className="p-3 rounded-lg bg-foreground/5">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("voiceNotes.transcription", lang)}:
                  </p>
                  <p className="text-sm">{transcription}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setEditingId(null);
                    setNoteTitle("");
                    setNoteTags("");
                  }}
                  className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm font-medium transition-colors"
                >
                  {t("voiceNotes.no", lang)}
                </button>
                <button
                  onClick={saveNote}
                  className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                  <Check className="h-4 w-4 inline mr-1" />
                  {t("voiceNotes.save", lang)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("voiceNotes.search", lang)}
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={Headphones}
            title={t("voiceNotes.empty", lang)}
            description={t("voiceNotes.emptyDesc", lang)}
          />
        ) : (
          filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() =>
                    playingId === note.id ? stopPlayback() : startPlayback(note)
                  }
                  className="cursor-pointer p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors shrink-0"
                >
                  {playingId === note.id ? (
                    <Pause className="h-5 w-5 text-primary" />
                  ) : (
                    <Play className="h-5 w-5 text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                      {note.language === "bn" ? "বাংলা" : "EN"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {note.transcription ||
                      t("voiceNotes.noTranscription", lang)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(note.duration)}
                    </span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground"
                        >
                          <Tag className="h-3 w-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => startEditing(note)}
                    className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/10 transition-colors text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => exportNote(note)}
                    className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => shareNote(note)}
                    className="cursor-pointer p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        title={t("voiceNotes.confirmDelete", lang)}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
        onConfirm={() => deleteId && deleteNote(deleteId)}
      />
    </motion.div>
  );
}
