import { Client } from "node-appwrite";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getAppwriteClient() {
  const endpoint = requireEnv("APPWRITE_ENDPOINT");
  const projectId = requireEnv("APPWRITE_PROJECT_ID");

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  return client;
}
