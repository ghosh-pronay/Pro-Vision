import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  Link,
  ExternalLink,
  Edit3,
  Eye,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EyeOff,
  History,
  X,
  Globe,
  Briefcase,
  MapPin,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  jobTitle: string;
  location: string;
  includeEmail: boolean;
  includePhone: boolean;
  includeWebsite: boolean;
  includeJobTitle: boolean;
  includeLocation: boolean;
}

interface QRHistoryItem {
  id: string;
  timestamp: number;
  profileData: ProfileData;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function generateQRPattern(size: number, data: string): boolean[][] {
  const modules: boolean[][] = [];
  const moduleCount = size;

  for (let row = 0; row < moduleCount; row++) {
    modules[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      modules[row][col] = false;
    }
  }

  const drawFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          modules[startRow + r][startCol + c] = true;
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(0, moduleCount - 7);
  drawFinderPattern(moduleCount - 7, 0);

  for (let i = 0; i < moduleCount; i++) {
    if (i === 6 || i === moduleCount - 7) continue;
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const seed = Math.abs(hash);
  let rng = seed;
  const nextRandom = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) continue;
      if (row < 9 && col < 9) continue;
      if (row < 9 && col > moduleCount - 9) continue;
      if (row > moduleCount - 9 && col < 9) continue;
      if (row === 6 || col === 6) continue;

      modules[row][col] = nextRandom() > 0.55;
    }
  }

  return modules;
}

function drawQRCode(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  canvasSize: number,
  fgColor: string,
  bgColor: string,
  margin: number,
) {
  const moduleCount = modules.length;
  const moduleSize = (canvasSize - margin * 2) / moduleCount;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  ctx.fillStyle = fgColor;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;
        ctx.fillRect(x, y, moduleSize + 0.5, moduleSize + 0.5);
      }
    }
  }
}

export default function QRProfile() {
  const { lang } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "qr">("qr");

  const [profile, setProfile] = useState<ProfileData>({
    name: "Pronay Ghosh",
    email: "pronay@example.com",
    phone: "+880 1712-345678",
    bio: lang === "bn" ? "ফুল স্ট্যাক ডেভেলপার" : "Full Stack Developer",
    website: "https://pronay.dev",
    jobTitle: lang === "bn" ? "সফটওয়্যার ইঞ্জিনিয়ার" : "Software Engineer",
    location: lang === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh",
    includeEmail: true,
    includePhone: true,
    includeWebsite: true,
    includeJobTitle: true,
    includeLocation: false,
  });

  const [qrHistory, setQrHistory] = useState<QRHistoryItem[]>([
    {
      id: "1",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      profileData: {
        ...profile,
        name: "Pronay Ghosh",
        bio: "Full Stack Developer",
      },
    },
    {
      id: "2",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      profileData: {
        ...profile,
        name: "Pronay Ghosh",
        bio: "React Developer",
      },
    },
  ]);

  const qrData = useMemo(() => {
    const parts: string[] = [];
    parts.push(`FN:${profile.name}`);
    if (profile.includeJobTitle) parts.push(`TITLE:${profile.jobTitle}`);
    if (profile.includeEmail) parts.push(`EMAIL:${profile.email}`);
    if (profile.includePhone) parts.push(`TEL:${profile.phone}`);
    if (profile.includeWebsite) parts.push(`URL:${profile.website}`);
    if (profile.includeLocation) parts.push(`ADR:${profile.location}`);
    parts.push(`NOTE:${profile.bio}`);
    return `BEGIN:VCARD\nVERSION:3.0\n${parts.join("\n")}\nEND:VCARD`;
  }, [profile]);

  const qrUrl = useMemo(() => {
    return `https://pro-vision.app/profile/${btoa(profile.name).replace(/=/g, "")}`;
  }, [profile.name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;

    const modules = generateQRPattern(25, qrData);
    drawQRCode(ctx, modules, size, "#1e293b", "#ffffff", 16);

    const centerX = size / 2;
    const centerY = size / 2;
    const iconSize = 32;
    const padding = 6;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(
      centerX - iconSize / 2 - padding,
      centerY - iconSize / 2 - padding,
      iconSize + padding * 2,
      iconSize + padding * 2,
      8,
    );
    ctx.fill();

    ctx.fillStyle = "#6366f1";
    ctx.font = `bold ${iconSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("P", centerX, centerY + 2);
  }, [qrData, profile.name]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-profile-${profile.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - QR Profile`,
          text:
            lang === "bn"
              ? `${profile.name} এর QR প্রোফাইল দেখুন`
              : `Check out ${profile.name}'s QR Profile`,
          url: qrUrl,
        });
      } catch {
        console.error("Share failed");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadVCard = () => {
    const blob = new Blob([qrData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${profile.name.replace(/\s+/g, "-").toLowerCase()}.vcf`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToHistory = () => {
    const newItem: QRHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      profileData: { ...profile },
    };
    setQrHistory([newItem, ...qrHistory]);
  };

  const handleRestoreFromHistory = (item: QRHistoryItem) => {
    setProfile(item.profileData);
    setShowHistory(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setQrHistory(qrHistory.filter((h) => h.id !== id));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const toggleFields = [
    {
      key: "includeEmail" as const,
      icon: Mail,
      label: lang === "bn" ? "ইমেইল" : "Email",
    },
    {
      key: "includePhone" as const,
      icon: Phone,
      label: lang === "bn" ? "ফোন" : "Phone",
    },
    {
      key: "includeWebsite" as const,
      icon: Globe,
      label: lang === "bn" ? "ওয়েবসাইট" : "Website",
    },
    {
      key: "includeJobTitle" as const,
      icon: Briefcase,
      label: lang === "bn" ? "পেশা" : "Job Title",
    },
    {
      key: "includeLocation" as const,
      icon: MapPin,
      label: lang === "bn" ? "লোকেশন" : "Location",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <QrCode className="h-6 w-6 text-indigo-500" />
            {lang === "bn" ? "QR প্রোফাইল" : "QR Profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "আপনার প্রোফাইল QR কোড তৈরি ও শেয়ার করুন"
              : "Generate and share your profile QR code"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <History className="h-4 w-4" />
            {lang === "bn" ? "ইতিহাস" : "History"}
          </button>
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            {lang === "bn" ? "এডিট" : "Edit"}
          </button>
        </div>
      </motion.div>

      {showHistory && (
        <motion.div
          variants={fadeUp}
          className="glass rounded-xl p-4 hover-lift"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-400" />
              {lang === "bn" ? "QR ইতিহাস" : "QR History"}
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {qrHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lang === "bn" ? "কোনো ইতিহাস নেই" : "No history yet"}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {qrHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {getInitials(item.profileData.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {item.profileData.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRestoreFromHistory(item)}
                      className="p-1.5 hover:bg-white/10 rounded text-indigo-400"
                      title={lang === "bn" ? "পুনরুদ্ধার" : "Restore"}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHistoryItem(item.id)}
                      className="p-1.5 hover:bg-white/10 rounded text-red-400"
                      title={lang === "bn" ? "মুছুন" : "Delete"}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {showEdit && (
        <motion.div variants={fadeUp} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-indigo-400" />
              {lang === "bn" ? "প্রোফাইল এডিট করুন" : "Edit Profile"}
            </h3>
            <button
              onClick={() => setShowEdit(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "নাম" : "Name"}
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "ইমেইল" : "Email"}
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "ফোন" : "Phone"}
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "ওয়েবসাইট" : "Website"}
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) =>
                  setProfile({ ...profile, website: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "পেশা" : "Job Title"}
              </label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) =>
                  setProfile({ ...profile, jobTitle: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "লোকেশন" : "Location"}
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">
                {lang === "bn" ? "বায়ো" : "Bio"}
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground mb-3">
              {lang === "bn"
                ? "QR কোডে যে তথ্য অন্তর্ভুক্ত করতে চান:"
                : "Info to include in QR code:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {toggleFields.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    setProfile({ ...profile, [key]: !profile[key] })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                    profile[key]
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-white/5 text-muted-foreground border border-white/10"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeUp}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "qr"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <QrCode className="h-4 w-4 inline mr-1.5" />
              QR Code
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <User className="h-4 w-4 inline mr-1.5" />
              {lang === "bn" ? "প্রিভিউ" : "Preview"}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "qr" ? (
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {lang === "bn"
                    ? "এই QR কোড স্ক্যান করে প্রোফাইল দেখুন"
                    : "Scan this QR code to view the profile"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(profile.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.jobTitle}
                    </p>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-sm text-muted-foreground bg-white/5 rounded-lg p-3">
                    {profile.bio}
                  </p>
                )}

                <div className="space-y-2">
                  {profile.includeEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-indigo-400" />
                      <span className="text-muted-foreground">
                        {profile.email}
                      </span>
                    </div>
                  )}
                  {profile.includePhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-indigo-400" />
                      <span className="text-muted-foreground">
                        {profile.phone}
                      </span>
                    </div>
                  )}
                  {profile.includeWebsite && (
                    <div className="flex items-center gap-2 text-sm">
                      <Link className="h-4 w-4 text-indigo-400" />
                      <span className="text-muted-foreground">
                        {profile.website}
                      </span>
                    </div>
                  )}
                  {profile.includeLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-indigo-400" />
                      <span className="text-muted-foreground">
                        {profile.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-indigo-400" />
              {lang === "bn" ? "শেয়ার অপশন" : "Share Options"}
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                  <Download className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {lang === "bn" ? "QR কোড ডাউনলোড" : "Download QR Code"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "bn"
                      ? "PNG ফরম্যাটে সংরক্ষণ করুন"
                      : "Save as PNG file"}
                  </p>
                </div>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                  {copied ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {copied
                      ? lang === "bn"
                        ? "কপি হয়েছে!"
                        : "Copied!"
                      : lang === "bn"
                        ? "লিংক কপি করুন"
                        : "Copy Link"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {qrUrl}
                  </p>
                </div>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {lang === "bn" ? "শেয়ার করুন" : "Share Profile"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {navigator.share
                      ? lang === "bn"
                        ? "সোশ্যাল মিডিয়ায় শেয়ার করুন"
                        : "Share via social media"
                      : lang === "bn"
                        ? "লিংক শেয়ার করুন"
                        : "Copy link to share"}
                  </p>
                </div>
              </button>

              <button
                onClick={handleDownloadVCard}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {lang === "bn" ? "vCard ডাউনলোড" : "Download vCard"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "bn"
                      ? "কনট্যাক্ট ফাইল হিসেবে সংরক্ষণ"
                      : "Save as contact file"}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-400" />
              {lang === "bn" ? "QR কোড তথ্য" : "QR Code Info"}
            </h3>

            <div className="space-y-2">
              {[
                {
                  icon: User,
                  label: lang === "bn" ? "নাম" : "Name",
                  value: profile.name,
                },
                ...(profile.includeEmail
                  ? [
                      {
                        icon: Mail,
                        label: lang === "bn" ? "ইমেইল" : "Email",
                        value: profile.email,
                      },
                    ]
                  : []),
                ...(profile.includePhone
                  ? [
                      {
                        icon: Phone,
                        label: lang === "bn" ? "ফোন" : "Phone",
                        value: profile.phone,
                      },
                    ]
                  : []),
                ...(profile.includeWebsite
                  ? [
                      {
                        icon: Globe,
                        label: lang === "bn" ? "ওয়েবসাইট" : "Website",
                        value: profile.website,
                      },
                    ]
                  : []),
                ...(profile.includeJobTitle
                  ? [
                      {
                        icon: Briefcase,
                        label: lang === "bn" ? "পেশা" : "Job Title",
                        value: profile.jobTitle,
                      },
                    ]
                  : []),
                ...(profile.includeLocation
                  ? [
                      {
                        icon: MapPin,
                        label: lang === "bn" ? "লোকেশন" : "Location",
                        value: profile.location,
                      },
                    ]
                  : []),
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm py-1"
                >
                  <Icon className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-muted-foreground w-16">{label}:</span>
                  <span className="truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveToHistory}
            className="w-full px-4 py-3 glass rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <History className="h-4 w-4" />
            {lang === "bn" ? "ইতিহাসে সংরক্ষণ করুন" : "Save to History"}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
