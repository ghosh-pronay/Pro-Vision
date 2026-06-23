import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  Users,
  UserPlus,
  Trash2,
  ArrowRight,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBanglaCurrency } from "@/lib/bangla-numbers";
import {
  type Bill,
  type Friend,
  fadeUp,
  slideIn,
  formatCurrency,
} from "./types";

interface BalancesTabProps {
  bills: Bill[];
  friends: Friend[];
  netBalances: { from: string; to: string; amount: number }[];
  t: (key: string) => string;
  onShowAddFriend: () => void;
  onDeleteFriend: (id: string) => void;
}

export function BalancesTab({
  bills,
  friends,
  netBalances,
  t,
  onShowAddFriend,
  onDeleteFriend,
}: BalancesTabProps) {
  const { lang } = useLang();

  return (
    <motion.div
      key="balances"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      variants={fadeUp}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          {t("billSplit.whoOwesWhom")}
        </h3>

        {netBalances.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title={t("billSplit.noBalances")}
            description={t("billSplit.noBalancesDesc")}
          />
        ) : (
          netBalances.map((tx, i) => (
            <motion.div
              key={`${tx.from}-${tx.to}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-red-500">
                      {tx.from.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{tx.from}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "bn" ? "দিতে হবে" : "owes"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatCurrency(
                        tx.amount,
                        undefined,
                        formatBanglaCurrency,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">{tx.to}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "bn" ? "পাবেন" : "receives"}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-500">
                      {tx.to.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("billSplit.friendList")}
          </h3>
          <button
            onClick={onShowAddFriend}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs hover:bg-foreground/5"
          >
            <UserPlus className="h-3 w-3" />
            {t("billSplit.addFriend")}
          </button>
        </div>

        {friends.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t("billSplit.noFriends")}
            description={t("billSplit.noFriendsDesc")}
            action={{
              label: t("billSplit.addFriend"),
              onClick: onShowAddFriend,
            }}
          />
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <motion.div
                key={friend._id}
                variants={slideIn}
                className="glass rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {friend.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    {friend.phone && (
                      <p className="text-xs text-muted-foreground">
                        {friend.phone}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteFriend(friend._id)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
