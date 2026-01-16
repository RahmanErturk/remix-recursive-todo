import { useState } from "react";
import { Form } from "react-router";
import type { TodoNode } from "~/lib/todos/todoTree";
import { AddSubtodoModal } from "./AddSubtodoModal";

export function TodoItem({ node, depth = 0 }: { node: TodoNode; depth?: number }) {
  const [isSubtodoModalOpen, setIsSubtodoModalOpen] = useState(false);

  const indent = Math.min(depth * 12, 48); // limit indent, when depth is too deep

  return (
    <div style={{ marginLeft: indent }} className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {node.title}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Status: {node.completed ? "Done" : "Open"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSubtodoModalOpen(true)}
            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            Add subtodo
          </button>

          {/* Toggle */}
          <Form method="post">
            <input type="hidden" name="_intent" value="toggle" />
            <input type="hidden" name="id" value={node.id} />
            <input
              type="hidden"
              name="completed"
              value={node.completed ? "0" : "1"}
            />
            <button className="rounded-lg border px-3 py-1.5 text-xs">
              {node.completed ? "Mark open" : "Mark done"}
            </button>
          </Form>

          {/* Delete */}
          <Form method="post">
            <input type="hidden" name="_intent" value="delete" />
            <input type="hidden" name="id" value={node.id} />
            <button className="rounded-lg border px-3 py-1.5 text-xs">
              Delete
            </button>
          </Form>
        </div>
      </div>

      <AddSubtodoModal
        isOpen={isSubtodoModalOpen}
        onClose={() => setIsSubtodoModalOpen(false)}
        parentId={node.id}
        parentTitle={node.title}
      />

      {/* Children */}
      {node.children.length > 0 ? (
        <div className="mt-3 space-y-2">
          {node.children.map((child) => (
            <TodoItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
