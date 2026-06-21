import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState } from "react";
import {
  Users,
  Plus,
  Phone,
  Mail,
  Cake,
  Calendar,
  Search,
  Edit3,
  Trash2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Heart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UserCheck,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { validatePhone } from "@/lib/input-sanitizer";
import { toastSuccess, toastError } from "@/lib/toast-helpers";

interface Contact {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  relationship: string;
  birthday?: number;
  lastContacted?: number;
  notes?: string;
  strength?: "close" | "friend" | "acquaintance" | "distant";
  tags?: string[];
}

const RELATIONSHIPS = [
  "Family",
  "Friend",
  "Colleague",
  "Neighbor",
  "Mentor",
  "Client",
  "Other",
];

const STRENGTH_COLORS = {
  close: "text-red-500 bg-red-500/10",
  friend: "text-orange-500 bg-orange-500/10",
  acquaintance: "text-yellow-500 bg-yellow-500/10",
  distant: "text-gray-500 bg-gray-500/10",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CRM() {
  const { lang } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "Friend",
    birthday: "",
    notes: "",
    strength: "friend" as const,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      _id: "1",
      name: "Pronay Ghosh",
      phone: "+880 1712345678",
      email: "pronay@example.com",
      relationship: "Family",
      // eslint-disable-next-line react-hooks/purity
      birthday: Date.now() - 365 * 24 * 60 * 60 * 1000,
      // eslint-disable-next-line react-hooks/purity
      lastContacted: Date.now() - 2 * 24 * 60 * 60 * 1000,
      strength: "close",
      tags: ["family", "important"],
    },
    {
      _id: "2",
      name: "Anika Rahman",
      phone: "+880 1812345678",
      relationship: "Friend",
      // eslint-disable-next-line react-hooks/purity
      lastContacted: Date.now() - 7 * 24 * 60 * 60 * 1000,
      strength: "friend",
      tags: ["college"],
    },
    {
      _id: "3",
      name: "Kabir Ahmed",
      email: "kabir@work.com",
      relationship: "Colleague",
      // eslint-disable-next-line react-hooks/purity
      lastContacted: Date.now() - 14 * 24 * 60 * 60 * 1000,
      strength: "acquaintance",
      tags: ["work"],
    },
  ]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.relationship.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getDaysSinceContact = (lastContacted?: number) => {
    if (!lastContacted) return null;
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - lastContacted;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getUpcomingBirthdays = () => {
    const now = new Date();
    return contacts
      .filter((c) => c.birthday)
      .map((c) => {
        const bday = new Date(c.birthday!);
        const thisYear = new Date(
          now.getFullYear(),
          bday.getMonth(),
          bday.getDate(),
        );
        if (thisYear < now) {
          thisYear.setFullYear(thisYear.getFullYear() + 1);
        }
        const daysUntil = Math.ceil(
          (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return { ...c, daysUntil };
      })
      .filter((c) => c.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const handleSave = () => {
    if (formData.phone && !validatePhone(formData.phone)) {
      toastError(
        lang === "bn" ? "বৈধ ফোন নম্বর দিন" : "Enter a valid phone number",
      );
      return;
    }

    const newContact: Contact = {
      _id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      relationship: formData.relationship,
      birthday: formData.birthday
        ? new Date(formData.birthday).getTime()
        : undefined,
      notes: formData.notes || undefined,
      strength: formData.strength,
      lastContacted: Date.now(),
    };

    if (editingContact) {
      setContacts(
        contacts.map((c) =>
          c._id === editingContact._id ? { ...c, ...newContact } : c,
        ),
      );
      toastSuccess(lang === "bn" ? "সম্পর্ক আপডেট হয়েছে" : "Contact updated");
    } else {
      setContacts([newContact, ...contacts]);
      toastSuccess(lang === "bn" ? "সম্পর্ক যোগ হয়েছে" : "Contact added");
    }

    setShowAddModal(false);
    setEditingContact(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      relationship: "Friend",
      birthday: "",
      notes: "",
      strength: "friend",
    });
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter((c) => c._id !== id));
    toastSuccess(
      lang === "bn" ? "সম্পর্ক মুছে ফেলা হয়েছে" : "Contact deleted",
    );
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone || "",
      email: contact.email || "",
      relationship: contact.relationship,
      birthday: contact.birthday
        ? new Date(contact.birthday).toISOString().split("T")[0]
        : "",
      notes: contact.notes || "",
      strength: contact.strength || "friend",
    });
    setShowAddModal(true);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          {lang === "bn" ? "ব্যক্তিগত সম্পর্ক" : "Personal CRM"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার সম্পর্কগুলো ট্র্যাক করুন"
            : "Track your relationships and never miss important moments"}
        </p>
      </motion.div>

      {upcomingBirthdays.length > 0 && (
        <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Cake className="h-4 w-4 text-pink-500" />
            {lang === "bn" ? "আসন্ন জন্মদিন" : "Upcoming Birthdays"}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {upcomingBirthdays.map((c) => (
              <div
                key={c._id}
                className="flex-shrink-0 rounded-xl bg-foreground/5 p-3 min-w-[140px]"
              >
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.daysUntil === 0
                    ? lang === "bn"
                      ? "আজ!"
                      : "Today!"
                    : `${c.daysUntil} ${lang === "bn" ? "দিন বাকি" : "days"}`}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "bn" ? "খুঁজুন..." : "Search contacts..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm"
          />
        </div>
        <button
          onClick={() => {
            setEditingContact(null);
            setFormData({
              name: "",
              phone: "",
              email: "",
              relationship: "Friend",
              birthday: "",
              notes: "",
              strength: "friend",
            });
            setShowAddModal(true);
          }}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "যোগ করুন" : "Add"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {filteredContacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title={lang === "bn" ? "কোনো সম্পর্ক নেই" : "No contacts yet"}
            description={
              lang === "bn"
                ? "আপনার প্রথম সম্পর্ক যোগ করুন"
                : "Add your first contact to start tracking"
            }
            action={{
              label: lang === "bn" ? "যোগ করুন" : "Add Contact",
              onClick: () => {
                setEditingContact(null);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  relationship: "Friend",
                  birthday: "",
                  notes: "",
                  strength: "friend",
                });
                setShowAddModal(true);
              },
            }}
          />
        ) : (
          filteredContacts.map((contact) => {
            const daysSince = getDaysSinceContact(contact.lastContacted);
            return (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 glass-card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{contact.name}</h3>
                      {contact.strength && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${STRENGTH_COLORS[contact.strength]}`}
                        >
                          {contact.strength}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contact.relationship}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      )}
                      {daysSince !== null && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysSince === 0
                            ? lang === "bn"
                              ? "আজ"
                              : "Today"
                            : `${daysSince}d ${lang === "bn" ? "আগে" : "ago"}`}
                        </span>
                      )}
                    </div>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-foreground/5 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                    >
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(contact._id)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingContact
                  ? lang === "bn"
                    ? "সম্পর্ক সম্পাদনা"
                    : "Edit Contact"
                  : lang === "bn"
                    ? "নতুন সম্পর্ক"
                    : "New Contact"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={lang === "bn" ? "নাম *" : "Name *"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={lang === "bn" ? "ফোন" : "Phone"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={lang === "bn" ? "ইমেইল" : "Email"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <select
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <select
                value={formData.strength}
                onChange={(e) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setFormData({ ...formData, strength: e.target.value as any })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="close">
                  {lang === "bn" ? "ঘনিষ্ঠ" : "Close"}
                </option>
                <option value="friend">
                  {lang === "bn" ? "বন্ধু" : "Friend"}
                </option>
                <option value="acquaintance">
                  {lang === "bn" ? "পরিচিত" : "Acquaintance"}
                </option>
                <option value="distant">
                  {lang === "bn" ? "দূরবর্তী" : "Distant"}
                </option>
              </select>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={lang === "bn" ? "নোট" : "Notes"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]"
              />
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {editingContact
                  ? lang === "bn"
                    ? "সংরক্ষণ"
                    : "Save"
                  : lang === "bn"
                    ? "যোগ করুন"
                    : "Add Contact"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "সম্পর্ক মুছুন?" : "Delete contact?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  );
}
