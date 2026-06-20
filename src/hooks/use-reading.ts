import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";

export function useReadingList() {
  const books = useQuery(api.readingList.list);
  return {
    books: books ?? [],
    isLoading: books === undefined,
  };
}

export function useCreateBook() {
  const create = useMutation(api.readingList.create);
  return {
    createBook: create,
    isLoading: false,
  };
}

export function useUpdateBook() {
  const update = useMutation(api.readingList.update);
  return {
    updateBook: update,
    isLoading: false,
  };
}

export function useDeleteBook() {
  const remove = useMutation(api.readingList.remove);
  return {
    deleteBook: remove,
    isLoading: false,
  };
}

export function useReadingStats() {
  const books = useQuery(api.readingList.list);
  const isLoading = books === undefined;

  const stats = useMemo(() => {
    if (!books) return { reading: 0, completed: 0, wantToRead: 0, total: 0 };

    return {
      reading: books.filter((b) => b.status === "reading").length,
      completed: books.filter((b) => b.status === "completed").length,
      wantToRead: books.filter((b) => b.status === "to_read").length,
      total: books.length,
    };
  }, [books]);

  return { stats, isLoading };
}
