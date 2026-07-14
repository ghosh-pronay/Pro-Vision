import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Phone,
  MessageCircle,
  Edit3,
  Trash2,
  Plus,
  X,
} from "lucide-react"
import { EmergencyContact, fadeUp } from "./types"
import { EmptyState } from "@/components/ui/EmptyState"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toastSuccess, toastError } from "@/lib/toast-helpers"
import { useState } from "react"

interface ContactsSectionProps {
  lang: string
  contacts: EmergencyContact[]
  sosMessage: string
  locationCoords: { lat: number; lng: number } | null
  onSetContacts: (contacts: EmergencyContact[]) => void
  onDial: (number: string) => void
}

export function ContactsSection({
  lang,
  contacts,
  sosMessage,
  locationCoords,
  onSetContacts,
  onDial,
}: ContactsSectionProps) {
  const [showAddContact, setShowAddContact] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null,
  )
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    relationship: "",
  })
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(
    null,
  )

  const handleSaveContact = () => {
    if (!contactForm.name || !contactForm.phone) {
      toastError(
        lang === "bn"
          ? "নাম এবং ফোন নম্বর দিন"
          : "Name and phone number required",
      )
      return
    }
    if (editingContact) {
      onSetContacts(
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
      )
      toastSuccess(lang === "bn" ? "কনট্যাক্ট আপডেট হয়েছে" : "Contact updated")
    } else {
      onSetContacts([
        ...contacts,
        { _id: Date.now().toString(), ...contactForm },
      ])
      toastSuccess(lang === "bn" ? "কনট্যাক্ট যোগ হয়েছে" : "Contact added")
    }
    setShowAddContact(false)
    setEditingContact(null)
    setContactForm({ name: "", phone: "", relationship: "" })
  }

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setContactForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || "",
    })
    setShowAddContact(true)
  }

  const handleDeleteContact = () => {
    if (!deleteTarget) return
    onSetContacts(contacts.filter((c) => c._id !== deleteTarget._id))
    toastSuccess(
      lang === "bn" ? "কনট্যাক্ট মুছে ফেলা হয়েছে" : "Contact deleted",
    )
    setDeleteTarget(null)
  }

  const handleSendMessage = (contact: EmergencyContact) => {
    const msg = `${sosMessage}${locationCoords ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}` : "Location unavailable"}`
    window.open(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`, "_self")
  }

  return (
    <motion.div variants={fadeUp}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {lang === "bn" ? "জরুরি কনট্যাক্ট" : "Emergency Contacts"}
        </h2>
        <button
          onClick={() => {
            setEditingContact(null)
            setContactForm({ name: "", phone: "", relationship: "" })
            setShowAddContact(true)
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
                  onClick={() => onDial(contact.phone)}
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
                  <MessageCircle className="h-4 w-4" />
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
                  aria-label="Delete contact"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                  className="p-1 cursor-pointer hover:bg-foreground/10 rounded transition-colors"
                  aria-label="Close"
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

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteContact}
        title={lang === "bn" ? "কনট্যাক্ট মুছুন?" : "Delete contact?"}
        description={
          lang === "bn"
            ? `${deleteTarget?.name} মুছে ফেলা হবে।`
            : `${deleteTarget?.name} will be removed.`
        }
      />
    </motion.div>
  )
}
