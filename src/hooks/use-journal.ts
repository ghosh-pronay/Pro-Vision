import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";

export function useJournalEntries() {
  const entries = useQuery(api.journal.list);
  return {
    entries: entries ?? [],
    isLoading: entries === undefined,
  };
}

export function useCreateJournalEntry() {
  const create = useMutation(api.journal.create);
  return {
    createEntry: create,
    isLoading: false,
  };
}

export function useUpdateJournalEntry() {
  const update = useMutation(api.journal.update);
  return {
    updateEntry: update,
    isLoading: false,
  };
}

export function useDeleteJournalEntry() {
  const remove = useMutation(api.journal.remove);
  return {
    deleteEntry: remove,
    isLoading: false,
  };
}

export function useJournalStats() {
  const entries = useQuery(api.journal.list);
  const isLoading = entries === undefined;

  const stats = useMemo(() => {
    if (!entries) return { total: 0, thisWeek: 0, thisMonth: 0 };

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return {
      total: entries.length,
      thisWeek: entries.filter((e) => e.createdAt >= weekAgo).length,
      thisMonth: entries.filter((e) => e.createdAt >= monthAgo).length,
    };
  }, [entries]);

  return { stats, isLoading };
}
