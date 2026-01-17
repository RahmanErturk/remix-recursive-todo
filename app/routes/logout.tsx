import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { readAppwriteSessionSecret, clearAppwriteSessionCookie } = await import("~/lib/auth-cookie.server");

  const secret = await readAppwriteSessionSecret(request);

  // Try to delete the current session on Appwrite side (if cookie exists)
  if (secret) {
    try {
      const { createSessionAccountClient } = await import("~/lib/appwrite.server");
      const { account } = createSessionAccountClient(secret);

      // 'current' deletes this device's session 
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // Session may have already expired; doesn't matter, cookie will be cleared anyway
    }
  }

  const setCookie = await clearAppwriteSessionCookie();

  return redirect("/login", {
    headers: { "Set-Cookie": setCookie },
  });
}

// This route won't render, but leaving a default export is good practice
export default function LogoutRoute() {
  return null;
}
