import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DiaryEntry } from "../backend";
import { useActor } from "./useActor";

export function useGetAllEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<DiaryEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getAllEntries();
      return [...entries].sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEntriesByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DiaryEntry[]>({
    queryKey: ["entries", "date", date],
    queryFn: async () => {
      if (!actor || !date) return [];
      const entries = await actor.getEntriesByDate(date);
      return [...entries].sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp),
      );
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useGetAllDatesWithEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["datesWithEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDatesWithEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: DiaryEntry) => {
      if (!actor) throw new Error("Not connected");
      await actor.createEntry(entry);
    },
    onSuccess: (_data, entry) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["datesWithEntries"] });
      queryClient.invalidateQueries({
        queryKey: ["entries", "date", entry.date],
      });
    },
  });
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: DiaryEntry) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateEntry(entry);
    },
    onSuccess: (_data, entry) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({
        queryKey: ["entries", "date", entry.date],
      });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      date,
    }: { entryId: string; date: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteEntry(entryId);
      return date;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["datesWithEntries"] });
      queryClient.invalidateQueries({
        queryKey: ["entries", "date", vars.date],
      });
    },
  });
}
