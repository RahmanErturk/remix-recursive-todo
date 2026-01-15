import type { ActionFunctionArgs } from "react-router";
import { Form, useActionData } from "react-router";
import { data, redirect } from "react-router";

type ActionData = {
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  formError?: string;
};

function isValidEmail(email: string): boolean {
  // a simple email regex check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: ActionData["fieldErrors"] = {};

  if (!email) fieldErrors.email = "Email is required.";
  else if (!isValidEmail(email)) fieldErrors.email = "Email is not valid.";

  if (!password) fieldErrors.password = "Password is required.";
  else if (password.length < 8) fieldErrors.password = "Password must be at least 8 characters.";

  if (fieldErrors.email || fieldErrors.password) {
    return data<ActionData>({ fieldErrors }, { status: 400 });
  }

  const { createAdminAccountClient } = await import("~/lib/appwrite.server");
  const { setAppwriteSessionCookie } = await import("~/lib/auth-cookie.server");

  try {
    const { account, ID } = createAdminAccountClient();

    // Appwrite: create(userId, email, password, name?)
    await account.create({
      userId: ID.unique(), 
      email, 
      password
    });

    const session = await account.createEmailPasswordSession({ email, password });

    const setCookieHeader = await setAppwriteSessionCookie(session.secret, session.expire);

    return redirect("/", {
      headers: {
        "Set-Cookie": setCookieHeader,
      },
    });
  } catch (err: unknown) {
    console.log(err);
    
    return data<ActionData>(
      { formError: "Signup failed. The email might already be in use." },
      { status: 400 }
    );
  }
}

export default function SignupRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sign up</h1>

      <Form method="post" className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {actionData?.fieldErrors?.email ? (
            <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.email}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {actionData?.fieldErrors?.password ? (
            <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.password}</p>
          ) : null}
        </div>

        {actionData?.formError ? (
          <p className="text-sm text-red-600">{actionData.formError}</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-white"
        >
          Create account
        </button>
      </Form>
    </div>
  );
}
