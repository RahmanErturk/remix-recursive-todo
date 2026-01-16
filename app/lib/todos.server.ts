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

export type TodoRow = {
  $id: string;
  title: string;
  completed: boolean;
  parentId?: string | null;
  userId: string;
  $createdAt: string;
};

export async function listRootTodos(userId: string, sessionSecret: string) {
  const { client } = createSessionAccountClient(sessionSecret);
  const db = new TablesDB(client);

  const res = await db.listRows({
    databaseId,
    tableId,
    queries: [
      Query.equal("userId", userId),
      Query.isNull("parentId"),
      Query.orderDesc("$createdAt"),
    ],
  });

  return res.rows as unknown as TodoRow[];
}

export async function createRootTodo(userId: string, sessionSecret: string, title: string) {
  const { client } = createSessionAccountClient(sessionSecret);
  const db = new TablesDB(client);

  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  const row = await db.createRow({
    databaseId,
    tableId,
    rowId: ID.unique(),
    data: { userId, title, completed: false, parentId: null },
    permissions,
  });

  return row;
}
