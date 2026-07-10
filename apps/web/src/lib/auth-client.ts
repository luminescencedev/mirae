import { createAuthClient } from "better-auth/react";

// Same-origin client — talks to /api/auth/* (proxied to the Worker in dev,
// same Worker in prod).
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
