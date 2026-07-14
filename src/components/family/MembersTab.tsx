import { motion } from "framer-motion"
import { Users, Trash2, Cake, UserPlus } from "lucide-react"
import { ROLE_CONFIG, fadeUp } from "./FamilyConstants"
import type { FamilyMember } from "./FamilyTypes"

interface MembersTabProps {
  members: FamilyMember[]
  lang: string
  onAddClick: () => void
  onDelete: (id: string) => void
}

export default function MembersTab({
  members,
  lang,
  onAddClick,
  onDelete,
}: MembersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="size-5 text-pink-500" />
          {lang === "bn" ? "পরিবারের সদস্য" : "Family Members"}
        </h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          <UserPlus className="size-4" />
          {lang === "bn" ? "সদস্য যোগ করুন" : "Add Member"}
        </button>
      </div>

      {members.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {lang === "bn"
              ? "এখনো কোনো পরিবারের সদস্য নেই"
              : "No family members yet"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {lang === "bn"
              ? "আপনার প্রথম পরিবারের সদস্য যোগ করুন"
              : "Add your first family member"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((member) => (
            <motion.div
              key={member.id}
              variants={fadeUp}
              className="glass rounded-2xl p-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{member.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${ROLE_CONFIG[member.role].color}`}
                  >
                    {ROLE_CONFIG[member.role][lang as "en" | "bn"]}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(member.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                  aria-label="Remove member"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {member.birthday && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Cake className="size-3" />
                  {new Date(member.birthday).toLocaleDateString(
                    lang === "bn" ? "bn-BD" : "en-US",
                    { month: "long", day: "numeric" },
                  )}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
