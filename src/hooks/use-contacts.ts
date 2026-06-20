import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";

export function useContacts() {
  const contacts = useQuery(api.contacts.list);
  return {
    contacts: contacts ?? [],
    isLoading: contacts === undefined,
  };
}

export function useCreateContact() {
  const create = useMutation(api.contacts.create);
  return {
    createContact: create,
    isLoading: false,
  };
}

export function useUpdateContact() {
  const update = useMutation(api.contacts.update);
  return {
    updateContact: update,
    isLoading: false,
  };
}

export function useDeleteContact() {
  const remove = useMutation(api.contacts.remove);
  return {
    deleteContact: remove,
    isLoading: false,
  };
}

export function useUpcomingBirthdays() {
  const contacts = useQuery(api.contacts.list);
  const isLoading = contacts === undefined;

  const upcoming = useMemo(() => {
    if (!contacts) return [];

    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return contacts
      .filter((c) => {
        if (!c.birthday) return false;
        const bday = new Date(c.birthday);
        const thisYear = new Date(
          now.getFullYear(),
          bday.getMonth(),
          bday.getDate(),
        );
        if (thisYear < now) thisYear.setFullYear(thisYear.getFullYear() + 1);
        return thisYear <= thirtyDays;
      })
      .sort((a, b) => {
        const aDate = new Date(a.birthday!);
        const bDate = new Date(b.birthday!);
        return (
          new Date(
            now.getFullYear(),
            aDate.getMonth(),
            aDate.getDate(),
          ).getTime() -
          new Date(
            now.getFullYear(),
            bDate.getMonth(),
            bDate.getDate(),
          ).getTime()
        );
      });
  }, [contacts]);

  return { upcoming, isLoading };
}
