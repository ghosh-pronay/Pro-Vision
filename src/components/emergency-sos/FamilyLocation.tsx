import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import { EmergencyContact, fadeUp } from "./types";
import { EmptyState } from "@/components/ui/EmptyState";

interface FamilyLocationProps {
  lang: string;
  contacts: EmergencyContact[];
}

export function FamilyLocation({ lang, contacts }: FamilyLocationProps) {
  const familyContacts = contacts.filter(
    (c) =>
      c.relationship?.toLowerCase().includes("family") ||
      c.relationship?.includes("পরিবার"),
  );

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        {lang === "bn" ? "পরিবারের অবস্থান" : "Family Location"}
      </h2>
      <div className="space-y-2">
        {familyContacts.length === 0 ? (
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
          familyContacts.map((contact) => (
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
  );
}
