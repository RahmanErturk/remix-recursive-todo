import type { Route } from "./+types/home";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, Form, data, redirect } from "react-router";
import type { TodoRow } from "~/lib/todos.server";
import { Welcome } from "~/welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recursive Todo" },
    { name: "description", content: "Welcome to Recursive Todo App!" },
  ];
}

type UserView = { id: string; email: string };

type LoaderData = {
  user: UserView | null;
  todos: TodoRow[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { readAppwriteSessionSecret } = await import("~/lib/auth-cookie.server");
  const secret = await readAppwriteSessionSecret(request);
  
  if (!secret) return data<LoaderData>({ user: null, todos: [] });

  try {
    const { createSessionAccountClient } = await import("~/lib/appwrite.server");
    
    const { account } = createSessionAccountClient(secret);
    const me = await account.get();
    
    const { listRootTodos } = await import("~/lib/todos.server");
    const todos = await listRootTodos(me.$id, secret);
    
    return data<LoaderData>({
      user: { id: me.$id, email: me.email },
      todos,
    });
  } catch {
    return data<LoaderData>({ user: null, todos: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();

  if (!title) return redirect("/");

  const { readAppwriteSessionSecret } = await import("~/lib/auth-cookie.server");
  const secret = await readAppwriteSessionSecret(request);
  if (!secret) return redirect("/signup");

  const { createSessionAccountClient } = await import("~/lib/appwrite.server");
  const { account } = createSessionAccountClient(secret);
  const me = await account.get();

  const { createRootTodo } = await import("~/lib/todos.server");
  await createRootTodo(me.$id, secret, title);

  return redirect("/");
}

export default function HomeRoute() {
  const { user, todos } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Recursive Todo
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user ? `Signed in as ${user.email}` : "Not signed in"}
            </p>
          </div>

          {/* Right-side badge */}
          <div
            className={[
              "rounded-full px-3 py-1 text-xs font-medium",
              user ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700",
            ].join(" ")}
          >
            {user ? "Authenticated" : "Guest"}
          </div>
        </div>

        {/* Main card */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            {user ? (
              <>
                {/* Create */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Your todos
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Add a task. Later we’ll support nested subtasks.
                    </p>
                  </div>
                </div>

                <Form method="post" className="mt-5 flex gap-2">
                  <label className="sr-only" htmlFor="title">Title</label>
                  <input
                    name="title"
                    placeholder="e.g. Build signup flow"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    Add
                  </button>
                </Form>

                {/* List */}
                <div className="mt-6">
                  {todos.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                      <p className="text-sm font-medium text-gray-900">
                        No todos yet
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Add your first task to get started.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {todos.map((t) => (
                        <li key={t.$id} className="py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {t.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Status: {t.completed ? "Completed" : "Open"}
                              </p>
                            </div>

                            <div
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-medium",
                                t.completed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-700",
                              ].join(" ")}
                            >
                              {t.completed ? "Done" : "Open"}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-gray-50 p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Sign in to manage todos
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Create an account to start saving your tasks.
                </p>
                <div className="mt-4">
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    Go to signup
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-xs text-gray-500">
          Next: nested subtasks, complete/delete actions, and tests.
        </p>
      </div>
    </div>
  );
}
