import { motion } from "framer-motion";
import { Plus, Phone, AlertTriangle } from "lucide-react";
import type { EmergencyContact } from "./types";
import { fadeUp } from "./types";

interface EmergencyTabProps {
  emergencyContacts: EmergencyContact[];
  lang: "en" | "bn";
}

export function EmergencyTab({ emergencyContacts, lang }: EmergencyTabProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {lang === "bn" ? "জরুরি যোগাযোগ" : "Emergency Contacts"}
        </h2>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm hover:brightness-110 transition-all">
          <Plus className="size-4" />
          {lang === "bn" ? "যোগ করুন" : "Add"}
        </button>
      </div>

      <div className="space-y-3">
        {emergencyContacts.map((contact) => (
          <motion.div
            key={contact.id}
            variants={fadeUp}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Phone className="size-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {contact.relation}
                  </div>
                </div>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:brightness-110 transition-all"
              >
                {contact.phone}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertTriangle className="size-5" />
          <span className="font-medium">
            {lang === "bn" ? "জরুরি নম্বর" : "Emergency Numbers"}
          </span>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{lang === "bn" ? "পুলিশ" : "Police"}</span>
            <span className="font-medium">999</span>
          </div>
          <div className="flex justify-between">
            <span>{lang === "bn" ? "অগ্নি নির্বাপক" : "Fire Service"}</span>
            <span className="font-medium">999</span>
          </div>
          <div className="flex justify-between">
            <span>{lang === "bn" ? "অ্যাম্বুলেন্স" : "Ambulance"}</span>
            <span className="font-medium">999</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
