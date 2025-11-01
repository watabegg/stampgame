export interface Session {
  userId: string;
  email: string;
}

export async function getSession(): Promise<Session | null> {
  // Placeholder for Better Auth integration. API cookie session is expected to be handled server-side.
  return null;
}
