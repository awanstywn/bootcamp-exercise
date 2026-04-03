import type { TodoArray, SortType } from "../types/types";

/**
 * Pure sort utility. Returns a NEW sorted array (never mutates the original).
 *
 * Sort strategies:
 * - "manual"     → sort ascending by manual_index (drag-and-drop order)
 * - "date_desc"  → sort descending by created_at  (most recent first)
 * - "date_asc"   → sort ascending  by created_at  (oldest first)
 * - "alpha_asc"  → sort ascending  by text        (locale-aware)
 * - "alpha_desc" → sort descending by text        (locale-aware)
 */
export const sortTodos = (todos: TodoArray, sort: SortType): TodoArray => {
  // [...todos] = spread into a new array (never mutate the original)
  const copy = [...todos];

  // switch picks the sorting logic based on the current sort mode
  switch (sort) {
    case "date_desc":
      // .sort() comparator: b - a = descending (newest first)
      return copy.sort((a, b) => b.created_at - a.created_at);

    case "date_asc":
      // a - b = ascending (oldest first)
      return copy.sort((a, b) => a.created_at - b.created_at);

    case "alpha_asc":
      // .localeCompare() handles international characters correctly
      // sensitivity: "base" ignores case differences (a = A)
      return copy.sort((a, b) =>
        a.text.localeCompare(b.text, undefined, { sensitivity: "base" })
      );

    case "alpha_desc":
      return copy.sort((a, b) =>
        b.text.localeCompare(a.text, undefined, { sensitivity: "base" })
      );

    case "manual":
    default:
      // Sort by manual_index (the order set by drag-and-drop)
      return copy.sort((a, b) => a.manual_index - b.manual_index);
  }
};

/**
 * Recomputes all manual_index values after a drag-and-drop reorder.
 * Uses arrayMove result — reassigns sequential indices to keep them clean.
 */
export const reindexManual = (todos: TodoArray): TodoArray =>
  todos.map((t, i) => ({ ...t, manual_index: i }));