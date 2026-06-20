import { v } from "convex/values";
import { query, internalAction } from "./_generated/server";

export interface MoodInsight {
  type: "pattern" | "correlation" | "suggestion" | "trend";
  title: string;
  description: string;
  confidence: number;
}

export const getMoodInsights = query({
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

    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const moods = await ctx.db
      .query("moods")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), monthAgo))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const insights: MoodInsight[] = [];

    if (moods.length >= 7) {
      const moodValues = moods.map((m) => m.value);
      const avg = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
      const recentAvg =
        moodValues.slice(-3).reduce((a, b) => a + b, 0) / 3;

      if (recentAvg > avg + 0.5) {
        insights.push({
          type: "trend",
          title: "Mood Improving",
          description: "Your mood has been improving over the past few days. Keep it up!",
          confidence: 0.8,
        });
      } else if (recentAvg < avg - 0.5) {
        insights.push({
          type: "trend",
          title: "Mood Declining",
          description: "Your mood has been lower recently. Consider activities that boost your wellbeing.",
          confidence: 0.8,
        });
      }

      const moodByDay: Record<number, number[]> = {};
      moods.forEach((m) => {
        const day = new Date(m.date).getDay();
        if (!moodByDay[day]) moodByDay[day] = [];
        moodByDay[day].push(m.value);
      });

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let bestDay = 0;
      let bestAvg = 0;
      let worstDay = 0;
      let worstAvg = 5;

      Object.entries(moodByDay).forEach(([day, values]) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestDay = parseInt(day);
        }
        if (avg < worstAvg) {
          worstAvg = avg;
          worstDay = parseInt(day);
        }
      });

      if (bestDay !== worstDay) {
        insights.push({
          type: "pattern",
          title: "Weekly Mood Pattern",
          description: `You tend to feel best on ${dayNames[bestDay]}s and worst on ${dayNames[worstDay]}s.`,
          confidence: 0.7,
        });
      }
    }

    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length > 0 && moods.length > 0) {
      insights.push({
        type: "correlation",
        title: "Productivity & Mood",
        description: "People who complete tasks regularly tend to report better moods. You're doing great!",
        confidence: 0.6,
      });
    }

    const lowStreakHabits = habits.filter((h) => (h.completedDates?.length || 0) < 3);
    if (lowStreakHabits.length > 0) {
      insights.push({
        type: "suggestion",
        title: "Build Consistency",
        description: `Building habits takes time. Focus on ${lowStreakHabits[0].name} to improve your routine.`,
        confidence: 0.75,
      });
    }

    if (moods.length >= 14) {
      const firstWeekMoods = moods.slice(0, 7);
      const secondWeekMoods = moods.slice(7, 14);
      const firstAvg = firstWeekMoods.reduce((a, b) => a + b.value, 0) / 7;
      const secondAvg = secondWeekMoods.reduce((a, b) => a + b.value, 0) / secondWeekMoods.length;

      if (Math.abs(firstAvg - secondAvg) < 0.3) {
        insights.push({
          type: "pattern",
          title: "Stable Mood",
          description: "Your mood has been quite stable this month. This is a good sign of emotional balance.",
          confidence: 0.85,
        });
      }
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  },
});

export interface HabitInsight {
  type: "streak" | "pattern" | "suggestion" | "milestone";
  title: string;
  description: string;
  habitName: string;
}

export const getHabitInsights = query({
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

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const insights: HabitInsight[] = [];

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    for (const habit of habits) {
      const recentCheckIns = (habit.completedDates || []).filter(
        (c: number) => c > weekAgo,
      );

      const completionRate = recentCheckIns.length / 7;

      if (completionRate >= 0.8) {
        insights.push({
          type: "streak",
          title: "Great Consistency!",
          description: `You've completed ${Math.round(completionRate * 100)}% of your ${habit.name} this week.`,
          habitName: habit.name,
        });
      } else if (completionRate <= 0.3 && (habit.completedDates?.length || 0) > 0) {
        insights.push({
          type: "suggestion",
          title: "Keep Going!",
          description: `Your ${habit.name} streak might be at risk. Try to complete it today!`,
          habitName: habit.name,
        });
      }

      if ((habit.completedDates?.length || 0) === 7) {
        insights.push({
          type: "milestone",
          title: "7-Day Streak!",
          description: `Amazing! You've maintained ${habit.name} for a full week!`,
          habitName: habit.name,
        });
      } else if ((habit.completedDates?.length || 0) === 30) {
        insights.push({
          type: "milestone",
          title: "30-Day Streak!",
          description: `Incredible! ${habit.name} is now a habit. Keep it up!`,
          habitName: habit.name,
        });
      }

      if (recentCheckIns.length > 0) {
        const checkInDays = recentCheckIns.map((c: number) => new Date(c).getDay());
        const dayCounts: Record<number, number> = {};
        checkInDays.forEach((d) => {
          dayCounts[d] = (dayCounts[d] || 0) + 1;
        });

        const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
        if (bestDay) {
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          insights.push({
            type: "pattern",
            title: "Best Day Pattern",
            description: `You're most consistent with ${habit.name} on ${dayNames[parseInt(bestDay[0])]}.`,
            habitName: habit.name,
          });
        }
      }
    }

    const totalHabits = habits.length;
    const activeHabits = habits.filter((h) => (h.completedDates?.length || 0) > 0).length;

    if (totalHabits > 0 && activeHabits / totalHabits < 0.5) {
      insights.push({
        type: "suggestion",
        title: "Focus on Fewer Habits",
        description: "Consider focusing on 2-3 habits at a time for better results.",
        habitName: "General",
      });
    }

    return insights;
  },
});
