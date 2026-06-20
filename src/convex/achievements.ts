import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  category: "habits" | "tasks" | "finance" | "focus" | "wellbeing";
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_task", name: "First Step", description: "Complete your first task", icon: "🎯", color: "#3b82f6", requirement: 1, category: "tasks" },
  { id: "task_10", name: "Getting Started", description: "Complete 10 tasks", icon: "📝", color: "#22c55e", requirement: 10, category: "tasks" },
  { id: "task_50", name: "Task Master", description: "Complete 50 tasks", icon: "🏆", color: "#f59e0b", requirement: 50, category: "tasks" },
  { id: "task_100", name: "Legendary", description: "Complete 100 tasks", icon: "👑", color: "#8b5cf6", requirement: 100, category: "tasks" },

  { id: "streak_3", name: "Consistent", description: "3-day streak", icon: "🔥", color: "#ef4444", requirement: 3, category: "habits" },
  { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "⚡", color: "#f97316", requirement: 7, category: "habits" },
  { id: "streak_30", name: "Monthly Champion", description: "30-day streak", icon: "🌟", color: "#eab308", requirement: 30, category: "habits" },
  { id: "streak_100", name: "Century Club", description: "100-day streak", icon: "💎", color: "#06b6d4", requirement: 100, category: "habits" },

  { id: "saver_1000", name: "Saver", description: "Save ৳1,000", icon: "💰", color: "#22c55e", requirement: 1000, category: "finance" },
  { id: "saver_10000", name: "Big Saver", description: "Save ৳10,000", icon: "🏦", color: "#10b981", requirement: 10000, category: "finance" },
  { id: "saver_100000", name: "Wealth Builder", description: "Save ৳1,00,000", icon: "💎", color: "#059669", requirement: 100000, category: "finance" },

  { id: "focus_1h", name: "Focused", description: "1 hour of focus time", icon: "⏱️", color: "#6366f1", requirement: 60, category: "focus" },
  { id: "focus_10h", name: "Deep Worker", description: "10 hours of focus time", icon: "🧠", color: "#8b5cf6", requirement: 600, category: "focus" },
  { id: "focus_100h", name: "Flow State Master", description: "100 hours of focus time", icon: "🧘", color: "#a855f7", requirement: 6000, category: "focus" },

  { id: "mood_7", name: "Mood Tracker", description: "Log mood 7 times", icon: "😊", color: "#f43f5e", requirement: 7, category: "wellbeing" },
  { id: "mood_30", name: "Emotionally Aware", description: "Log mood 30 times", icon: "💝", color: "#ec4899", requirement: 30, category: "wellbeing" },
  { id: "gratitude_7", name: "Grateful", description: "7 gratitude entries", icon: "🙏", color: "#f59e0b", requirement: 7, category: "wellbeing" },
  { id: "gratitude_30", name: "Gratitude Guru", description: "30 gratitude entries", icon: "✨", color: "#eab308", requirement: 30, category: "wellbeing" },
];

export const listUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return userAchievements;
  },
});

export const unlockAchievement = mutation({
  args: { achievementId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("achievementId"), args.achievementId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("userAchievements", {
      userId: user._id,
      achievementId: args.achievementId,
      unlockedAt: Date.now(),
    });
  },
});

export const checkAndUnlockAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    const unlockedIds = new Set(
      (
        await ctx.db
          .query("userAchievements")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect()
      ).map((a) => a.achievementId),
    );

    const newAchievements = [];

    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.category) {
        case "tasks":
          unlocked = completedTasks.length >= achievement.requirement;
          break;
        case "habits": {
          const habits = await ctx.db
            .query("habits")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
          const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
          unlocked = maxStreak >= achievement.requirement;
          break;
        }
        case "finance": {
          const wallets = await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
          const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
          unlocked = totalBalance >= achievement.requirement;
          break;
        }
        case "focus": {
          const sessions = await ctx.db
            .query("focusSessions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
          const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
          unlocked = totalMinutes >= achievement.requirement;
          break;
        }
        case "wellbeing": {
          const moods = await ctx.db
            .query("moods")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
          const gratitudes = await ctx.db
            .query("gratitudeEntries")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
          if (achievement.id.startsWith("mood")) {
            unlocked = moods.length >= achievement.requirement;
          } else if (achievement.id.startsWith("gratitude")) {
            unlocked = gratitudes.length >= achievement.requirement;
          }
          break;
        }
      }

      if (unlocked) {
        const id = await ctx.db.insert("userAchievements", {
          userId: user._id,
          achievementId: achievement.id,
          unlockedAt: Date.now(),
        });
        newAchievements.push({ id, achievementId: achievement.id });
      }
    }

    return newAchievements;
  },
});
