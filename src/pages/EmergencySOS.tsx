import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Phone,
  MapPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Heart,
  Zap,
  MessageSquare,
  Shield,
  Users,
  Plus,
  Trash2,
  Edit3,
  X,
  Flashlight,
  PhoneIncoming,
  Lightbulb,
  Stethoscope,
  Droplets,
  AlertCircle,
  Pill,
  Ambulance,
  Flame,
  Baby,
  HandHeart,
  Megaphone,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/toast-helpers";

interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relationship?: string;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMERGENCY_NUMBERS = [
  {
    label: "Police",
    number: "999",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Fire",
    number: "999",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    label: "Ambulance",
    number: "999",
    icon: Ambulance,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    label: "RAB",
    number: "01712-111111",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Red Crescent",
    number: "02-87242345",
    icon: HandHeart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    label: "National Emergency",
    number: "999",
    icon: Megaphone,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    label: "Women Helpline",
    number: "01779-554391",
    icon: Users,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    label: "Child Helpline",
    number: "1098",
    icon: Baby,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const SAFETY_TIPS = [
  {
    en: "Always keep your phone charged above 30%",
    bn: "সবসময় ফোন ৩০% চার্জ রাখুন",
  },
  {
    en: "Share your live location with trusted contacts when traveling",
    bn: "ভ্রমণের সময় বিশ্বস্ত সম্পর্কের সাথে লাইভ লোকেশন শেয়ার করুন",
  },
  {
    en: "Learn basic self-defense techniques",
    bn: "মৌলিক আত্মরক্ষা কৌশল শিখুন",
  },
  {
    en: "Keep emergency numbers saved and easily accessible",
    bn: "জরুরি নম্বরগুলো সংরক্ষণ করুন এবং সহজে পাওয়া যায় তা নিশ্চিত করুন",
  },
  {
    en: "Always tell someone where you're going before leaving",
    bn: "বের হওয়ার আগে সবার জানিয়ে রাখুন কোথায় যাচ্ছেন",
  },
  {
    en: "Be aware of your surroundings at all times",
    bn: "সবসময় আপনার পরিবেশ সম্পর্কে সচেতন থাকুন",
  },
  {
    en: "Trust your instincts - if something feels wrong, leave",
    bn: "আপনার অনুভূতি বিশ্বাস করুন - কিছু ভুল মনে হলে চলে যান",
  },
  {
    en: "Keep a small first aid kit with you",
    bn: "একটি ছোট প্রাথমিক চিকিৎসা কিট রাখুন",
  },
  {
    en: "Know the nearest hospital and police station to your home",
    bn: "আপনার বাড়ির নিকটতম হাসপাতাল এবং থানা জানুন",
  },
  {
    en: "Set up ICE (In Case of Emergency) contacts on your phone",
    bn: "ফোনে ICE (জরুরি পরিস্থিতিতে) কনট্যাক্ট সেট আপ করুন",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};

const sosPulse = {
  scale: [1, 1.1, 1],
  boxShadow: [
    "0 0 0 0 rgba(239, 68, 68, 0.7)",
    "0 0 0 20px rgba(239, 68, 68, 0)",
    "0 0 0 0 rgba(239, 68, 68, 0)",
  ],
  transition: { duration: 1.5, repeat: Infinity },
};

export default function EmergencySOS() {
  const { lang } = useLang();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      _id: "1",
      name: lang === "bn" ? "মা" : "Mom",
      phone: "01712345678",
      relationship: lang === "bn" ? "পরিবার" : "Family",
    },
    {
      _id: "2",
      name: lang === "bn" ? "বাবা" : "Dad",
      phone: "01812345678",
      relationship: lang === "bn" ? "পরিবার" : "Family",
    },
  ]);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: "O+",
    allergies: ["Penicillin"],
    medications: [],
    conditions: [],
  });
  const [sosActive, setSosActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallTimer, setFakeCallTimer] = useState(0);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null,
  );
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    relationship: "",
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(
    null,
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [locationShared, setLocationShared] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [expandedTips, setExpandedTips] = useState(true);
  const [quickMessage, setQuickMessage] = useState("");
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const fakeCallInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const sosMessage =
    lang === "bn"
      ? "জরুরি! আমি বিপদে আছি। অনুগ্রহ করে আমাকে সাহায্য করুন। আমার অবস্থান এই লিংকে দেখুন: "
      : "EMERGENCY! I am in danger. Please help me. My location: ";

  useEffect(() => {
    return () => {
      if (fakeCallInterval.current) clearInterval(fakeCallInterval.current);
    };
  }, []);

  const triggerSOS = useCallback(() => {
    setSosActive(true);
    toastError(
      lang === "bn" ? "জরুরি সতর্কতা চালু!" : "Emergency Alert Activated!",
    );
    setTimeout(() => setSosActive(false), 10000);
  }, [lang]);

  const shareLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCoords({ lat: latitude, lng: longitude });
          setLocationShared(true);
          toastSuccess(
            lang === "bn" ? "লোকেশন শেয়ার হয়েছে!" : "Location shared!",
          );
        },
        () => {
          setLocationCoords({ lat: 23.8103, lng: 90.4125 });
          setLocationShared(true);
          toastSuccess(
            lang === "bn"
              ? "লোকেশন শেয়ার হয়েছে (ডিফল্ট)!"
              : "Location shared (default)!",
          );
        },
      );
    } else {
      setLocationCoords({ lat: 23.8103, lng: 90.4125 });
      setLocationShared(true);
      toastSuccess(
        lang === "bn"
          ? "লোকেশন শেয়ার হয়েছে (ডিফল্ট)!"
          : "Location shared (default)!",
      );
    }
  }, [lang]);

  const toggleFlash = useCallback(() => {
    setFlashOn((prev) => {
      const next = !prev;
      toastSuccess(
        next
          ? lang === "bn"
            ? "ফ্ল্যাশ চালু!"
            : "Flash ON!"
          : lang === "bn"
            ? "ফ্ল্যাশ বন্ধ!"
            : "Flash OFF!",
      );
      return next;
    });
  }, [lang]);

  const startFakeCall = useCallback(() => {
    setFakeCallActive(true);
    setFakeCallTimer(30);
    fakeCallInterval.current = setInterval(() => {
      setFakeCallTimer((prev) => {
        if (prev <= 1) {
          if (fakeCallInterval.current) clearInterval(fakeCallInterval.current);
          setFakeCallActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    toastSuccess(lang === "bn" ? "নকল কল শুরু হয়েছে!" : "Fake call started!");
  }, [lang]);

  const stopFakeCall = useCallback(() => {
    if (fakeCallInterval.current) clearInterval(fakeCallInterval.current);
    setFakeCallActive(false);
    setFakeCallTimer(0);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    });
  }, []);

  const handleSaveContact = () => {
    if (!contactForm.name || !contactForm.phone) {
      toastError(
        lang === "bn"
          ? "নাম এবং ফোন নম্বর দিন"
          : "Name and phone number required",
      );
      return;
    }
    if (editingContact) {
      setContacts(
        contacts.map((c) =>
          c._id === editingContact._id
            ? {
                ...c,
                name: contactForm.name,
                phone: contactForm.phone,
                relationship: contactForm.relationship,
              }
            : c,
        ),
      );
      toastSuccess(
        lang === "bn" ? "কনট্যাক্ট আপডেট হয়েছে" : "Contact updated",
      );
    } else {
      setContacts([
        ...contacts,
        { _id: Date.now().toString(), ...contactForm },
      ]);
      toastSuccess(lang === "bn" ? "কনট্যাক্ট যোগ হয়েছে" : "Contact added");
    }
    setShowAddContact(false);
    setEditingContact(null);
    setContactForm({ name: "", phone: "", relationship: "" });
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || "",
    });
    setShowAddContact(true);
  };

  const handleDeleteContact = () => {
    if (!deleteTarget) return;
    setContacts(contacts.filter((c) => c._id !== deleteTarget._id));
    toastSuccess(
      lang === "bn" ? "কনট্যাক্ট মুছে ফেলা হয়েছে" : "Contact deleted",
    );
    setDeleteTarget(null);
  };

  const addToList = (
    field: "allergies" | "medications" | "conditions",
    value: string,
    setter: (v: string) => void,
  ) => {
    if (!value.trim()) return;
    setMedicalInfo({
      ...medicalInfo,
      [field]: [...medicalInfo[field], value.trim()],
    });
    setter("");
  };

  const removeFromList = (
    field: "allergies" | "medications" | "conditions",
    index: number,
  ) => {
    setMedicalInfo({
      ...medicalInfo,
      [field]: medicalInfo[field].filter((_, i) => i !== index),
    });
  };

  const handleDial = (number: string) => {
    window.open(`tel:${number}`, "_self");
  };

  const handleSendMessage = (contact: EmergencyContact) => {
    const msg = `${sosMessage}${locationCoords ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}` : "Location unavailable"}`;
    window.open(
      `sms:${contact.phone}?body=${encodeURIComponent(msg)}`,
      "_self",
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">
            {lang === "bn" ? "জরুরি SOS" : "Emergency SOS"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "bn"
              ? "জরুরি পরিস্থিতিতে দ্রুত সাহায্য পান"
              : "Get help quickly in emergencies"}
          </p>
        </div>
      </motion.div>

      {/* SOS Button */}
      <motion.div variants={fadeUp} className="flex justify-center">
        <motion.button
          animate={sosActive ? sosPulse : pulseAnimation}
          whileTap={{ scale: 0.95 }}
          onClick={triggerSOS}
          className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 
            text-white font-black text-3xl shadow-2xl shadow-red-500/50 
            flex items-center justify-center cursor-pointer
            hover:from-red-600 hover:to-red-800 transition-colors"
        >
          {sosActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-400"
              animate={{ scale: [1, 1.5], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          SOS
        </motion.button>
      </motion.div>

      {/* SOS Active Banner */}
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center"
          >
            <p className="text-red-500 font-bold text-lg">
              {lang === "bn"
                ? "জরুরি সতর্কতা সক্রিয়!"
                : "EMERGENCY ALERT ACTIVE!"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "bn"
                ? "আপনার জরুরি কনট্যাক্টদের বার্তা পাঠানো হচ্ছে..."
                : "Sending alerts to emergency contacts..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Quick Dial */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          {lang === "bn" ? "জরুরি নম্বর" : "Emergency Quick Dial"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMERGENCY_NUMBERS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDial(item.number)}
                className="glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer 
                  hover:bg-foreground/5 transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${item.bg}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-bold">{item.number}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {lang === "bn" ? "জরুরি কনট্যাক্ট" : "Emergency Contacts"}
          </h2>
          <button
            onClick={() => {
              setEditingContact(null);
              setContactForm({ name: "", phone: "", relationship: "" });
              setShowAddContact(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium 
              text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === "bn" ? "যোগ করুন" : "Add"}
          </button>
        </div>

        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title={lang === "bn" ? "কোনো কনট্যাক্ট নেই" : "No contacts yet"}
            description={
              lang === "bn"
                ? "জরুরি কনট্যাক্ট যোগ করুন"
                : "Add emergency contacts for quick access"
            }
          />
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <motion.div
                key={contact._id}
                layout
                className="glass rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contact.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDial(contact.phone)}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 cursor-pointer"
                    title={lang === "bn" ? "কল" : "Call"}
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSendMessage(contact)}
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 cursor-pointer"
                    title={lang === "bn" ? "বার্তা" : "Message"}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="p-2 rounded-lg hover:bg-yellow-500/10 text-yellow-500 cursor-pointer"
                    title={lang === "bn" ? "সম্পাদনা" : "Edit"}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(contact)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer"
                    title={lang === "bn" ? "মুছুন" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Medical Info */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          {lang === "bn" ? "চিকিৎসা তথ্য" : "Medical Info"}
        </h2>

        {/* Blood Type */}
        <div className="mb-4">
          <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
            <Droplets className="h-4 w-4 text-red-500" />
            {lang === "bn" ? "রক্তের গ্রুপ" : "Blood Type"}
          </label>
          <div className="flex flex-wrap gap-2">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                onClick={() =>
                  setMedicalInfo({ ...medicalInfo, bloodType: bt })
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors
                  ${
                    medicalInfo.bloodType === bt
                      ? "bg-red-500 text-white"
                      : "bg-foreground/5 hover:bg-foreground/10 text-muted-foreground"
                  }`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <MedicalList
          lang={lang}
          title={lang === "bn" ? "অ্যালার্জি" : "Allergies"}
          icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
          items={medicalInfo.allergies}
          value={newAllergy}
          onChange={setNewAllergy}
          onAdd={() => addToList("allergies", newAllergy, setNewAllergy)}
          onRemove={(i) => removeFromList("allergies", i)}
          placeholder={
            lang === "bn" ? "অ্যালার্জি যোগ করুন..." : "Add allergy..."
          }
        />

        {/* Medications */}
        <MedicalList
          lang={lang}
          title={lang === "bn" ? "ওষুধ" : "Medications"}
          icon={<Pill className="h-4 w-4 text-blue-500" />}
          items={medicalInfo.medications}
          value={newMedication}
          onChange={setNewMedication}
          onAdd={() =>
            addToList("medications", newMedication, setNewMedication)
          }
          onRemove={(i) => removeFromList("medications", i)}
          placeholder={lang === "bn" ? "ওষুধ যোগ করুন..." : "Add medication..."}
        />

        {/* Conditions */}
        <MedicalList
          lang={lang}
          title={lang === "bn" ? "অবস্থা" : "Conditions"}
          icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
          items={medicalInfo.conditions}
          value={newCondition}
          onChange={setNewCondition}
          onAdd={() => addToList("conditions", newCondition, setNewCondition)}
          onRemove={(i) => removeFromList("conditions", i)}
          placeholder={
            lang === "bn" ? "অবস্থা যোগ করুন..." : "Add condition..."
          }
        />
      </motion.div>

      {/* Safety Tools */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {lang === "bn" ? "নিরাপত্তা সরঞ্জাম" : "Safety Tools"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Share Location */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={shareLocation}
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

          {/* Flash Alert */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleFlash}
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

          {/* Fake Call */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fakeCallActive ? stopFakeCall : startFakeCall}
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

          {/* Quick Message */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowQuickMessage(!showQuickMessage)}
            className="glass rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-foreground/5"
          >
            <MessageSquare className="h-6 w-6 text-gray-500" />
            <span className="text-xs font-medium text-center">
              {lang === "bn" ? "দ্রুত বার্তা" : "Quick Message"}
            </span>
          </motion.button>
        </div>

        {/* Quick Message Panel */}
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
                  <MessageSquare className="h-3.5 w-3.5" />
                  {lang === "bn" ? "বার্তা পাঠান" : "Send SMS"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fake Call Overlay */}
      <AnimatePresence>
        {fakeCallActive && (
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
              onClick={stopFakeCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer
                shadow-lg shadow-red-500/50 mb-8"
            >
              <Phone className="h-8 w-8 text-white rotate-[135deg]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Tips */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <button
          onClick={() => setExpandedTips(!expandedTips)}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {lang === "bn" ? "নিরাপত্তা টিপস" : "Safety Tips"}
          </h2>
          {expandedTips ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expandedTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {SAFETY_TIPS.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5"
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-yellow-500">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lang === "bn" ? tip.bn : tip.en}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Family Location */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {lang === "bn" ? "পরিবারের অবস্থান" : "Family Location"}
        </h2>
        <div className="space-y-2">
          {contacts.filter(
            (c) =>
              c.relationship?.toLowerCase().includes("family") ||
              c.relationship?.includes("পরিবার"),
          ).length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                lang === "bn" ? "পরিবারের কনট্যাক্ট নেই" : "No family contacts"
              }
              description={
                lang === "bn"
                  ? "পরিবারের সদস্যদের অবস্থান দেখতে কনট্যাক্ট যোগ করুন"
                  : "Add family contacts to see their locations"
              }
            />
          ) : (
            contacts
              .filter(
                (c) =>
                  c.relationship?.toLowerCase().includes("family") ||
                  c.relationship?.includes("পরিবার"),
              )
              .map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-foreground/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lang === "bn"
                          ? "লোকেশন শেয়ার করেনি"
                          : "Location not shared"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-500">
                    {lang === "bn" ? "অনলাইন" : "Offline"}
                  </span>
                </div>
              ))
          )}
        </div>
      </motion.div>

      {/* Add/Edit Contact Modal */}
      <AnimatePresence>
        {showAddContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddContact(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingContact
                    ? lang === "bn"
                      ? "কনট্যাক্ট সম্পাদনা"
                      : "Edit Contact"
                    : lang === "bn"
                      ? "নতুন কনট্যাক্ট"
                      : "New Contact"}
                </h3>
                <button
                  onClick={() => setShowAddContact(false)}
                  className="p-1 cursor-pointer"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "নাম" : "Name"} *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
                    placeholder={lang === "bn" ? "নাম লিখুন" : "Enter name"}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "ফোন নম্বর" : "Phone Number"} *
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "সম্পর্ক" : "Relationship"}
                  </label>
                  <input
                    type="text"
                    value={contactForm.relationship}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        relationship: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
                    placeholder={
                      lang === "bn"
                        ? "যেমন: পরিবার, বন্ধু"
                        : "e.g. Family, Friend"
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 py-2 rounded-xl border text-sm font-medium hover:bg-foreground/5 cursor-pointer"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSaveContact}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 cursor-pointer"
                >
                  {editingContact
                    ? lang === "bn"
                      ? "আপডেট"
                      : "Update"
                    : lang === "bn"
                      ? "যোগ করুন"
                      : "Add"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDeleteContact}
        title={lang === "bn" ? "কনট্যাক্ট মুছুন?" : "Delete contact?"}
        description={
          lang === "bn"
            ? `${deleteTarget?.name} মুছে ফেলা হবে।`
            : `${deleteTarget?.name} will be removed.`
        }
      />
    </motion.div>
  );
}

interface MedicalListProps {
  lang: string;
  title: string;
  icon: React.ReactNode;
  items: string[];
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

function MedicalList({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lang,
  title,
  icon,
  items,
  value,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}: MedicalListProps) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
        {icon}
        {title}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
        />
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/5 text-sm"
            >
              {item}
              <button
                onClick={() => onRemove(i)}
                className="cursor-pointer text-muted-foreground hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
