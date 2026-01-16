import { useState } from "react";
import { Form } from "react-router";
import type { TodoNode } from "~/lib/todos/todoTree";
import { AddSubtodoModal } from "./AddSubtodoModal";

export function TodoItem({ node, depth = 0 }: { node: TodoNode; depth?: number }) {
  const [isSubtodoModalOpen, setIsSubtodoModalOpen] = useState(false);

  const indent = Math.min(depth * 12, 48); // limit indent, when depth is too deep

  return (
    <div
      style={{ marginLeft: indent }}
      className={[
        "rounded-xl border p-4 transition",
        node.completed
          ? "border-gray-300 bg-gray-100"
          : "border-gray-300 bg-white hover:border-gray-200 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {/* Toggle checkbox */}
          <Form method="post" className="mt-0.5">
            <input type="hidden" name="_intent" value="toggle" />
            <input type="hidden" name="id" value={node.id} />
            <input type="hidden" name="completed" value={node.completed ? "0" : "1"} />

            <button
              type="submit"
              title={node.completed ? "Mark open" : "Mark done"}
              aria-label={node.completed ? "Mark as open" : "Mark as done"}
              className={[
                "h-5 w-5 rounded border transition focus:outline-none focus:ring-4",
                node.completed
                  ? "border-emerald-600 bg-emerald-600 focus:ring-emerald-200"
                  : "bg-white border-gray-300 hover:border-gray-400 focus:ring-gray-100",
              ].join(" ")}
            >
              {/* White checkmark when completed */}
              {node.completed ? (
                <span className="block text-center text-[12px] leading-5 text-white">✓</span>
              ) : null}
            </button>
          </Form>

          {/* Title + meta */}
          <div className="min-w-0">
            <p
              className={[
                "truncate text-sm font-medium",
                node.completed ? "text-gray-500 line-through" : "text-gray-900",
              ].join(" ")}
            >
              {node.title}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {node.completed ? "Done" : "Open"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSubtodoModalOpen(true)}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Add subtask
          </button>

          {/* Delete */}
          <Form method="post">
            <input type="hidden" name="_intent" value="delete" />
            <input type="hidden" name="id" value={node.id} />
            <button
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
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
