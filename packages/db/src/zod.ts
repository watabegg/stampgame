import { z } from "zod";

export const stampCardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(80),
  description: z.string().max(200).nullable(),
  stampCount: z.number().int().min(0).max(15),
  ownerId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dailyLimit: z.boolean(),
  isPublic: z.boolean(),
  stampHasDate: z.boolean(),
});

export const stampEntrySchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  slot: z.number().int().min(1).max(15),
  stampedBy: z.string().min(1).nullable(),
  stampedAt: z.string().datetime(),
  note: z.string().max(200).nullable(),
  localDayJst: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const shareLinkSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  slug: z.string().min(6).max(32),
  canWrite: z.boolean(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const assignedUserSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  userId: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().max(60).nullable(),
  createdAt: z.string().datetime(),
});

export const createCardInputSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(200).optional(),
  dailyLimit: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  stampHasDate: z.boolean().default(true),
});

export const stampInputSchema = z.object({
  cardId: z.string().uuid(),
  note: z.string().max(200).optional(),
});

export const assignUserInputSchema = z.object({
  cardId: z.string().uuid(),
  userId: z.string().min(1),
});

export const shareLinkInputSchema = z.object({
  cardId: z.string().uuid(),
  canWrite: z.boolean(),
  expiresAt: z.string().datetime().nullable().optional(),
});
