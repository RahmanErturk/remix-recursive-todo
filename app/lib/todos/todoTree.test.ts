import { describe, expect, it } from "vitest";
import { buildTree } from "./todoTree";
import type { TodoView } from "./todoTree";

describe("buildTree", () => {
  it("converts flat todos into a nested tree", () => {
    const items: TodoView[] = [
      { id: "a", title: "A", completed: false, parentId: null },
      { id: "b", title: "B", completed: false, parentId: "a" },
      { id: "c", title: "C", completed: false, parentId: "a" },
      { id: "d", title: "D", completed: false, parentId: "b" },
    ];

    const roots = buildTree(items);

    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe("a");

    const childIds = roots[0].children.map((x) => x.id).sort();
    expect(childIds).toEqual(["b", "c"]);

    const b = roots[0].children.find((x) => x.id === "b")!;
    expect(b.children).toHaveLength(1);
    expect(b.children[0].id).toBe("d");
  });
});
