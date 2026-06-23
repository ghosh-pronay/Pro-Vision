import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  SOSSection,
  QuickDial,
  ContactsSection,
  MedicalSection,
  SafetyTools,
  FakeCallOverlay,
  SafetyTips,
  FamilyLocation,
  fadeUp,
} from "@/components/emergency-sos";
import type { EmergencyContact, MedicalInfo } from "@/components/emergency-sos";
import { toastSuccess } from "@/lib/toast-helpers";

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
  const [expandedTips, setExpandedTips] = useState(true);
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
    toastSuccess(
      lang === "bn" ? "জরুরি সতর্কতা চালু!" : "Emergency Alert Activated!",
    );
    setTimeout(() => setSosActive(false), 10000);
  }, [lang]);

  const shareLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          toastSuccess(
            lang === "bn" ? "লোকেশন শেয়ার হয়েছে!" : "Location shared!",
          );
        },
        () => {
          toastSuccess(
            lang === "bn"
              ? "লোকেশন শেয়ার হয়েছে (ডিফল্ট)!"
              : "Location shared (default)!",
          );
        },
      );
    } else {
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

  const handleDial = (number: string) => {
    window.open(`tel:${number}`, "_self");
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
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

      <SOSSection lang={lang} sosActive={sosActive} onTriggerSOS={triggerSOS} />

      <QuickDial lang={lang} onDial={handleDial} />

      <ContactsSection
        lang={lang}
        contacts={contacts}
        sosMessage={sosMessage}
        locationCoords={null}
        onSetContacts={setContacts}
        onDial={handleDial}
      />

      <MedicalSection
        lang={lang}
        medicalInfo={medicalInfo}
        onSetMedicalInfo={setMedicalInfo}
      />

      <SafetyTools
        lang={lang}
        sosMessage={sosMessage}
        locationCoords={null}
        flashOn={flashOn}
        fakeCallActive={fakeCallActive}
        fakeCallTimer={fakeCallTimer}
        onShareLocation={shareLocation}
        onToggleFlash={toggleFlash}
        onStartFakeCall={startFakeCall}
        onStopFakeCall={stopFakeCall}
      />

      {fakeCallActive && (
        <FakeCallOverlay
          lang={lang}
          fakeCallTimer={fakeCallTimer}
          onStopFakeCall={stopFakeCall}
        />
      )}

      <SafetyTips
        lang={lang}
        expanded={expandedTips}
        onToggle={() => setExpandedTips(!expandedTips)}
      />

      <FamilyLocation lang={lang} contacts={contacts} />
    </motion.div>
  );
}
