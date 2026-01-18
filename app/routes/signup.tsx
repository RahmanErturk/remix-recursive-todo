import type { ActionFunctionArgs } from "react-router";
import { Form, useActionData } from "react-router";
import { data, redirect } from "react-router";
import type { FieldErrors } from "~/lib/validation";
import { validateAuthCredentials } from "~/lib/validation";

type ActionData = {
  fieldErrors?: FieldErrors;
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

  const fieldErrors: ActionData["fieldErrors"] = validateAuthCredentials(email, password, "signup");

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Sign up
        </h1>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Form method="post" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-100"
              />
              {actionData?.fieldErrors?.email ? (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-100"
              />
              {actionData?.fieldErrors?.password ? (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.fieldErrors.password}
                </p>
              ) : null}
            </div>

            {actionData?.formError ? (
              <p className="text-sm text-red-600">{actionData.formError}</p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              Create account
            </button>
          </Form>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a className="font-semibold text-gray-900 hover:underline" href="/login">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
