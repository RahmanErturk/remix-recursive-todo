// app/lib/todos.server.ts
import { TablesDB, Permission, Role, Query, ID } from "node-appwrite";
import { createSessionAccountClient } from "~/lib/appwrite.server";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const databaseId = requireEnv("APPWRITE_DATABASE_ID");
const tableId = requireEnv("APPWRITE_TODOS_TABLE_ID");

type TodoRow = {
  $id: string;
  title: string;
  completed: boolean;
  parentId?: string | null;
  userId: string;
  $createdAt: string;
  $updatedAt: string;
};

// Get all todos for user (root + children)
export async function listTodos(userId: string, sessionSecret: string) {
  const { client } = createSessionAccountClient(sessionSecret);
  const tablesDB = new TablesDB(client);

  const res = await tablesDB.listRows({
    databaseId,
    tableId,
    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
    ],
  });

  return res.rows as unknown as TodoRow[];
}

// Create root or child todo (parentId null or string)
export async function createTodo(
  userId: string,
  sessionSecret: string,
  title: string,
  parentId: string | null
) {
  const { client } = createSessionAccountClient(sessionSecret);
  const tablesDB = new TablesDB(client);

  return tablesDB.createRow({
    databaseId,
    tableId,
    rowId: ID.unique(),
    data: { userId, title, completed: false, parentId },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
}

export async function setTodoCompleted(
  userId: string,
  sessionSecret: string,
  rowId: string,
  completed: boolean
) {
  const { client } = createSessionAccountClient(sessionSecret);
  const tablesDB = new TablesDB(client);

  // if we don't set permissions param, the existing row permissions “inherit”
  return tablesDB.updateRow({
    databaseId,
    tableId,
    rowId,
    data: { completed },
  });
}

export async function deleteTodo(
  userId: string,
  sessionSecret: string,
  rowId: string
) {
  const { client } = createSessionAccountClient(sessionSecret);
  const tablesDB = new TablesDB(client);

  return tablesDB.deleteRow({ databaseId, tableId, rowId });
}
