export type TodoView = {
  id: string;
  title: string;
  completed: boolean;
  parentId: string | null;
};

export type TodoNode = TodoView & { children: TodoNode[] };

export function buildTree(items: TodoView[]): TodoNode[] {
  // id -> node (copy with children field added)
  const nodeById = new Map<string, TodoNode>();

  // 1) Convert each item to a "node" and store it in the map by id
  for (const item of items) {
    nodeById.set(item.id, { ...item, children: [] });
  }

  // 2) Collect roots and attach children to their parents
  const rootNodes: TodoNode[] = [];

  for (const node of nodeById.values()) {
    const parentId = node.parentId;

    // If no parentId, it's a root
    if (!parentId) {
      rootNodes.push(node);
      continue;
    }

    // If parent exists, add this node to the parent's children list
    const parentNode = nodeById.get(parentId);

    if (parentNode) {
      parentNode.children.push(node);
    } else {
      // If parentId exists but parent is not in the list (edge-case), treat as root
      rootNodes.push(node);
    }
  }

  return rootNodes;
}

