// app/lib/appwrite.server.ts
import { Client, Account, ID } from "node-appwrite";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

// Admin client: with API key (server-side requests)
export function createAdminAccountClient() {
  const client = new Client()
    .setEndpoint(requireEnv("APPWRITE_ENDPOINT"))
    .setProject(requireEnv("APPWRITE_PROJECT_ID"))
    .setKey(requireEnv("APPWRITE_API_KEY"));

  return {
    client,
    account: new Account(client),
    ID,
  };
}

// Session client: with session secret from cookie (for user-scoped requests)
export function createSessionAccountClient(sessionSecret: string) {
  const client = new Client()
    .setEndpoint(requireEnv("APPWRITE_ENDPOINT"))
    .setProject(requireEnv("APPWRITE_PROJECT_ID"))
    .setSession(sessionSecret);

  return {
    client,
    account: new Account(client),
  };
}
