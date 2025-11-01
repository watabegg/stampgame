export interface StampCard {
  id: string;
  title: string;
  description: string | null;
  stampCount: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  dailyLimit: boolean;
  isPublic: boolean;
  stampHasDate: boolean;
}

export interface StampEntry {
  id: string;
  cardId: string;
  slot: number;
  stampedBy?: string | null;
  stampedAt: string;
  note?: string | null;
  localDayJst: string;
}

export interface ShareLink {
  id: string;
  cardId: string;
  slug: string;
  canWrite: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface AssignedUser {
  id: string;
  cardId: string;
  userId: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}
