import type { Route } from "./+types/home";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect, useLoaderData } from "react-router";
import { Form } from "react-router";
import { TodoTree } from "~/components/TodoTree";
import type { TodoView } from "~/lib/todos/todoTree";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recursive Todo" },
    { name: "description", content: "Welcome to Recursive Todo App!" },
  ];
}

type UserView = { id: string; email: string };

type LoaderData = {
  user: UserView | null;
  todos: TodoView[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { readAppwriteSessionSecret } = await import("~/lib/auth-cookie.server");
  const secret = await readAppwriteSessionSecret(request);
  
  if (!secret) return data<LoaderData>({ user: null, todos: [] });

  try {
    const { createSessionAccountClient } = await import("~/lib/appwrite.server");
    const { account } = createSessionAccountClient(secret);
    
    const me = await account.get();
    
    const { listTodos } = await import("~/lib/todos.server");
    const rows = await listTodos(me.$id, secret);

    const todos: TodoView[] = rows.map((row: any) => ({
      id: row.$id,
      title: row.title,
      completed: Boolean(row.completed),
      parentId: row.parentId ?? null,
    }));

    return data<LoaderData>({
      user: { id: me.$id, email: me.email },
      todos,
    });
  } catch {
    // session expired / cookie invalid / unauthorized
    return data<LoaderData>({ user: null, todos: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("_intent") ?? "create");

  const { readAppwriteSessionSecret } = await import("~/lib/auth-cookie.server");
  const secret = await readAppwriteSessionSecret(request);

  if (!secret) return redirect("/signup");

  // Kullanıcıyı doğrula (userId lazım)
  let userId: string;
  try {
    const { createSessionAccountClient } = await import("~/lib/appwrite.server");
    const { account } = createSessionAccountClient(secret);
    const me = await account.get();
    userId = me.$id;
  } catch {
    return redirect("/signup");
  }

  const { createTodo, deleteTodoCascade, setTodoCompletedCascade } = await import("~/lib/todos.server");

  switch (intent) {
    case "create": {
      const title = String(formData.get("title") ?? "").trim();
      const parentIdRaw = formData.get("parentId");
      const parentId = parentIdRaw ? String(parentIdRaw) : null;

      if (title) {
        await createTodo(userId, secret, title, parentId);
      }
      break;
    }

    case "toggle": {
      const id = String(formData.get("id") ?? "");
      const completed = String(formData.get("completed") ?? "") === "1";

      if (id) {
        await setTodoCompletedCascade(userId, secret, id, completed);
      }
      break;
    }

    case "delete": {
      const id = String(formData.get("id") ?? "");
      if (id) {
        await deleteTodoCascade(userId, secret, id);
      }
      break;
    }

    default:
      break;
  }

  return redirect("/");
}

export default function HomeRoute() {
  const { user, todos } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Recursive Todo
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user ? `Signed in as ${user.email}` : "Not signed in"}
            </p>
          </div>

          {user ? (
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
              >
                Logout
              </button>
            </Form>
          ) : null}

        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            {user ? (
              <>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Your todos</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Add tasks and subtasks. Toggle complete, delete items.
                  </p>
                </div>

                <div className="mt-5">
                  <Form method="post" className="flex gap-2">
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
                </div>

                <div className="mt-6">
                  <TodoTree todos={todos} />
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-gray-50 p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Sign in to manage todos
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Log in to access your saved tasks, or create an account to get started.
                </p>              
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    Go to login
                  </a>

                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  >
                    Go to signup
                  </a>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}