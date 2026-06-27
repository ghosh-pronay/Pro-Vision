export function calculateStreak(completedDates: number[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  const sortedDates = [...completedDates]
    .sort((a, b) => b - a)
    .map((d) => new Date(d).setHours(0, 0, 0, 0));
  const uniqueDates = [...new Set(sortedDates)];
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const diff = (uniqueDates[i] as number) - (uniqueDates[i + 1] as number);
    if (diff === 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function formatFocusTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
