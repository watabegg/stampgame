"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCardDetail,
  fetchDashboardCards,
  fetchMe,
  pressStamp,
  createCard,
  assignUser,
  createShareLink,
  type CardDetail,
} from "../lib/api";
import type { StampCard } from "@stampgame/db";

const dashboardQueryKey = ["cards"] as const;
const meQueryKey = ["me"] as const;

export function useDashboardCards(initialData?: StampCard[]) {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardCards,
    initialData,
  });
}

export function useMe(initialData?: Awaited<ReturnType<typeof fetchMe>>) {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    initialData,
  });
}

export function useCard(cardId: string, initialData?: CardDetail) {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: () => fetchCardDetail(cardId),
    initialData,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function usePressStamp(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { note?: string; slot?: number }) => pressStamp(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });
}

export function useAssignUser(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string }) => assignUser(cardId, input.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
  });
}

export function useCreateShareLink(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { canWrite: boolean; expiresAt?: string | null }) =>
      createShareLink(cardId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
    },
  });
}
