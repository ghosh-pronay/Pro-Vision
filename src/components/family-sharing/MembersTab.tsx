import { motion } from "framer-motion";
import { Plus, UserMinus, Eye, EyeOff } from "lucide-react";
import type { FamilyMember, Role } from "./types";
import { ROLE_CONFIG, fadeUp } from "./types";

interface MembersTabProps {
  members: FamilyMember[];
  isAdmin: boolean;
  lang: "en" | "bn";
  onAddClick: () => void;
  onChangeRole: (memberId: string, role: Role) => void;
  onRemoveMember: (memberId: string) => void;
  onTogglePrivacy: (
    memberId: string,
    field: keyof FamilyMember["privacy"],
  ) => void;
}

export function MembersTab({
  members,
  isAdmin,
  lang,
  onAddClick,
  onChangeRole,
  onRemoveMember,
  onTogglePrivacy,
}: MembersTabProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {lang === "bn" ? "পরিবারের সদস্য" : "Family Members"}
        </h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--pv-blue)] text-white text-sm hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          {lang === "bn" ? "যোগ করুন" : "Add"}
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member) => {
          const roleConfig = ROLE_CONFIG[member.role];
          const RoleIcon = roleConfig.icon;
          return (
            <motion.div
              key={member.id}
              variants={fadeUp}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-foreground/10 flex items-center justify-center text-2xl">
                      {member.avatar}
                    </div>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${roleConfig.color}`}
                    >
                      <RoleIcon className="size-3" />
                      {roleConfig[lang]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && member.role !== "admin" && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          onChangeRole(member.id, e.target.value as Role)
                        }
                        className="bg-transparent border border-foreground/20 rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="admin">
                          {lang === "bn" ? "অ্যাডমিন" : "Admin"}
                        </option>
                        <option value="parent">
                          {lang === "bn" ? "বাবা/মা" : "Parent"}
                        </option>
                        <option value="child">
                          {lang === "bn" ? "সন্তান" : "Child"}
                        </option>
                      </select>
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <UserMinus className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-foreground/10">
                  <div className="text-xs text-muted-foreground mb-2">
                    {lang === "bn"
                      ? "গোপনীয়তা নিয়ন্ত্রণ"
                      : "Privacy Controls"}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["tasks", "expenses", "calendar", "notes"] as const).map(
                      (field) => (
                        <button
                          key={field}
                          onClick={() => onTogglePrivacy(member.id, field)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                            member.privacy[field]
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {member.privacy[field] ? (
                            <Eye className="size-3" />
                          ) : (
                            <EyeOff className="size-3" />
                          )}
                          {field === "tasks" &&
                            (lang === "bn" ? "কাজ" : "Tasks")}
                          {field === "expenses" &&
                            (lang === "bn" ? "খরচ" : "Expenses")}
                          {field === "calendar" &&
                            (lang === "bn" ? "ক্যালেন্ডার" : "Calendar")}
                          {field === "notes" &&
                            (lang === "bn" ? "নোট" : "Notes")}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
