import { createRoutesStub } from "react-router";
import { render, screen } from "@testing-library/react";
import { TodoTree } from "./TodoTree";
import type { TodoView } from "~/lib/todos/todoTree";

it("renders nested todos (parent + child)", () => {
  const todos: TodoView[] = [
    { id: "p1", title: "Parent", completed: false, parentId: null },
    { id: "c1", title: "Child", completed: false, parentId: "p1" },
  ];

  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <TodoTree todos={todos} />,
    },
  ]);

  render(<Stub initialEntries={["/"]} />);

  expect(screen.getByText("Parent")).toBeInTheDocument();
  expect(screen.getByText("Child")).toBeInTheDocument();
});

it("applies done styling when completed", () => {
  const todos: TodoView[] = [
    { id: "t1", title: "Done item", completed: true, parentId: null },
  ];

  const Stub = createRoutesStub([
    { path: "/", Component: () => <TodoTree todos={todos} /> },
  ]);

  render(<Stub initialEntries={["/"]} />);

  const titleEl = screen.getByText("Done item");
  expect(titleEl).toHaveClass("line-through");
});
