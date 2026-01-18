import { createRoutesStub } from "react-router";
import { render, screen, fireEvent, within } from "@testing-library/react";
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

it("renders toggle checkbox form with correct hidden inputs", () => {
  const todos: TodoView[] = [
    { id: "t1", title: "Task 1", completed: false, parentId: null },
    { id: "t2", title: "Task 2", completed: true, parentId: null },
  ];

  const Stub = createRoutesStub([
    { path: "/", Component: () => <TodoTree todos={todos} /> },
  ]);

  render(<Stub initialEntries={["/"]} />);

  // Open item: checkbox button has aria-label "Mark as done"
  const markDoneBtn = screen.getByLabelText("Mark as done");
  const form1 = markDoneBtn.closest("form");
  expect(form1).toBeTruthy();
  expect(form1!.querySelector('input[name="_intent"][value="toggle"]')).toBeTruthy();
  expect(form1!.querySelector('input[name="id"][value="t1"]')).toBeTruthy();
  expect(form1!.querySelector('input[name="completed"][value="1"]')).toBeTruthy();

  // Completed item: checkbox button has aria-label "Mark as open"
  const markOpenBtn = screen.getByLabelText("Mark as open");
  const form2 = markOpenBtn.closest("form");
  expect(form2).toBeTruthy();
  expect(form2!.querySelector('input[name="id"][value="t2"]')).toBeTruthy();
  expect(form2!.querySelector('input[name="completed"][value="0"]')).toBeTruthy();
});

it("opens and closes the Add subtask modal (and contains correct hidden fields)", () => {
  const todos: TodoView[] = [
    { id: "p1", title: "Parent", completed: false, parentId: null },
  ];

  const Stub = createRoutesStub([
    { path: "/", Component: () => <TodoTree todos={todos} /> },
  ]);

  render(<Stub initialEntries={["/"]} />);

  // Open modal
  const openBtn = screen.getByRole("button", { name: /add subtask/i });
  fireEvent.click(openBtn);

  // Modal dialog should appear (unique)
  const dialog = screen.getByRole("dialog", { name: /add subtask/i });
  expect(dialog).toBeInTheDocument();

  // Modal form should include intent=create and parentId=p1
  const addBtn = within(dialog).getByRole("button", { name: /^add$/i });
  const modalForm = addBtn.closest("form");
  expect(modalForm).toBeTruthy();
  expect(modalForm!.querySelector('input[name="_intent"][value="create"]')).toBeTruthy();
  expect(modalForm!.querySelector('input[name="parentId"][value="p1"]')).toBeTruthy();

  // Close modal with Cancel
  const cancelBtn = within(dialog).getByRole("button", { name: /cancel/i });
  fireEvent.click(cancelBtn);

  // Dialog should be gone
  expect(screen.queryByRole("dialog", { name: /add subtask/i })).toBeNull();
});