import { createCookie } from "react-router";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const projectId = requireEnv("APPWRITE_PROJECT_ID");

export const appwriteSessionCookie = createCookie(`a_session_${projectId}`, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

// session.expire (ISO string) -> maxAge (seconds)
// React Router cookie serialize options: maxAge in seconds
export function maxAgeFromExpire(expireIso: string): number {
  const expireMs = new Date(expireIso).getTime();
  const nowMs = Date.now();
  const diffSeconds = Math.floor((expireMs - nowMs) / 1000);
  // if expire time is negative, clamp to 0 to avoid immediately expiring the cookie
  return Math.max(0, diffSeconds);
}

// Read session secret from cookie in the Request
export async function readAppwriteSessionSecret(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const secret = await appwriteSessionCookie.parse(cookieHeader);
  return typeof secret === "string" && secret.length > 0 ? secret : null;
}

// Set session secret to Response's Set-Cookie header
export async function setAppwriteSessionCookie(sessionSecret: string, expireIso: string) {
  return appwriteSessionCookie.serialize(sessionSecret, {
    maxAge: maxAgeFromExpire(expireIso),
  });
}

// Clear the cookie for logout
export async function clearAppwriteSessionCookie() {
  return appwriteSessionCookie.serialize("", { maxAge: 0 });
}
