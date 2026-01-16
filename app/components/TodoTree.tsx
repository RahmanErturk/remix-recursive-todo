import type { TodoView } from "~/lib/todos/todoTree";
import { buildTree } from "~/lib/todos/todoTree";
import { TodoItem } from "./TodoItem";

export function TodoTree({ todos }: { todos: TodoView[] }) {
  const roots = buildTree(todos);

  if (roots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm font-medium text-gray-900">No todos yet</p>
        <p className="mt-1 text-sm text-gray-600">Add your first task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roots.map((n) => (
        <TodoItem key={n.id} node={n} />
      ))}
    </div>
  );
}
