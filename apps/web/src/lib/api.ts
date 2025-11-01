import { env } from "@stampgame/config";
import {
  stampCardSchema,
  stampEntrySchema,
  shareLinkSchema,
  profileSchema,
  assignedUserSchema,
  type StampCard,
} from "@stampgame/db";
import { z } from "zod";

const meSchema = z.object({
  profile: profileSchema,
  cards: z.array(stampCardSchema),
  assignedCards: z.array(stampCardSchema),
});

const cardListSchema = z.object({ cards: z.array(stampCardSchema) });
const cardDetailSchema = z.object({
  card: stampCardSchema,
  stamps: z.array(stampEntrySchema),
  shares: z.array(shareLinkSchema),
  assignees: z.array(assignedUserSchema).optional().default([]),
});
const shareResponseSchema = z.object({ share: shareLinkSchema });

export type CardDetail = z.infer<typeof cardDetailSchema>;

async function apiFetch<T>(path: string, init?: RequestInit, schema?: z.ZodSchema<T>) {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || res.statusText);
  }

  if (!schema) return undefined as T;
  const parsed = schema.parse(await res.json());
  return parsed;
}

export async function fetchDashboardCards(): Promise<StampCard[]> {
  const data = await apiFetch("/cards", undefined, cardListSchema);
  return data.cards;
}

export async function fetchMe() {
  return apiFetch("/me", undefined, meSchema);
}

export async function createCard(input: {
  title: string;
  description?: string;
  dailyLimit: boolean;
  isPublic: boolean;
  stampHasDate: boolean;
}) {
  await apiFetch("/cards", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchCardDetail(cardId: string) {
  return apiFetch(`/cards/${cardId}`, undefined, cardDetailSchema);
}

export async function pressStamp(cardId: string, payload: { note?: string; slot?: number }) {
  const data = await apiFetch(
    `/cards/${cardId}/stamps`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    z.object({ stamp: stampEntrySchema })
  );
  return data.stamp;
}

export async function assignUser(cardId: string, userId: string) {
  await apiFetch(`/cards/${cardId}/assignees`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function createShareLink(cardId: string, input: { canWrite: boolean; expiresAt?: string | null }) {
  const data = await apiFetch(
    `/cards/${cardId}/shares`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    shareResponseSchema
  );
  return data.share;
}

export async function fetchPublicCard(slug: string) {
  return apiFetch(`/public/${slug}`, undefined, cardDetailSchema);
}

export type MeResult = Awaited<ReturnType<typeof fetchMe>>;
