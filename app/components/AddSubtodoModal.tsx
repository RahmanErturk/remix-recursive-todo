import { Form } from "react-router";

export function AddSubtodoModal(props: {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
  parentTitle: string;
}) {
  const { isOpen, onClose, parentId, parentTitle } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Add subtask</h3>
            <p className="mt-1 text-sm text-gray-600">
              Parent: <span className="font-medium text-gray-900">{parentTitle}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <Form method="post" className="mt-4 space-y-3" onSubmit={onClose}>
          <input type="hidden" name="_intent" value="create" />
          <input type="hidden" name="parentId" value={parentId} />

          <input
            name="title"
            autoFocus
            placeholder="e.g. Write tests"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-100"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              Add
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
