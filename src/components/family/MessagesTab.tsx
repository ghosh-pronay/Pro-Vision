import { motion } from "framer-motion";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { fadeUp } from "./FamilyConstants";
import type { FamilyMember, FamilyMessage } from "./FamilyTypes";

interface MessagesTabProps {
  messages: FamilyMessage[];
  members: FamilyMember[];
  lang: string;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSend: () => void;
  onDelete: (id: string) => void;
}

export default function MessagesTab({
  messages,
  members,
  lang,
  newMessage,
  setNewMessage,
  onSend,
  onDelete,
}: MessagesTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="size-5 text-teal-500" />
        {lang === "bn" ? "বার্তা বোর্ড" : "Message Board"}
      </h2>

      <div className="glass rounded-2xl p-4">
        {/* Messages */}
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="size-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {lang === "bn" ? "এখনো কোনো বার্তা নেই" : "No messages yet"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {lang === "bn"
                  ? "আপনার পরিবারের সাথে কথা বলুন"
                  : "Start a conversation with your family"}
              </p>
            </div>
          ) : (
            [...messages]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((msg) => {
                const author = members.find((m) => m.id === msg.author);
                return (
                  <motion.div
                    key={msg.id}
                    variants={fadeUp}
                    className="flex items-start gap-3 group"
                  >
                    <span className="text-xl mt-1">
                      {author?.avatar || "🧑"}
                    </span>
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {author?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString(
                            lang === "bn" ? "bn-BD" : "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <button
                      onClick={() => onDelete(msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all mt-2"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </motion.div>
                );
              })
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder={
              lang === "bn" ? "একটি বার্তা লিখুন..." : "Type a message..."
            }
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-pink-500/50 transition-all"
          />
          <button
            onClick={onSend}
            disabled={!newMessage.trim()}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
