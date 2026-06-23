import {
  Shield,
  Users,
  User,
  Heart,
  Volume2,
  Flame,
  Truck,
} from "lucide-react";

export interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const EMERGENCY_NUMBERS = [
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
    icon: Truck,
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
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    label: "National Emergency",
    number: "999",
    icon: Volume2,
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
    icon: User,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export const SAFETY_TIPS = [
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

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const sosPulse = {
  scale: [1, 1.1, 1],
  boxShadow: [
    "0 0 0 0 rgba(239, 68, 68, 0.7)",
    "0 0 0 20px rgba(239, 68, 68, 0)",
    "0 0 0 0 rgba(239, 68, 68, 0)",
  ],
  transition: { duration: 1.5, repeat: Infinity },
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};
