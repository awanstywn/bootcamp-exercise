import type { TodoArray, SortType } from "../types/types";

/**
 * Objective: Provides a pure utility function to sort an array of Todo items 
 * safely without mutating the original array.
 *
 * Sort Strategies:
 * - "manual"     : Drag-and-drop order (by manual_index)
 * - "date_desc"  : Newest first (by created_at)
 * - "date_asc"   : Oldest first (by created_at)
 * - "alpha_asc"  : A-Z (case-insensitive)
 * - "alpha_desc" : Z-A (case-insensitive)
 */
export const sortTodos = (todos: TodoArray, sort: SortType): TodoArray => {
  const copy = [...todos];

  switch (sort) {
    case "date_desc":
      return copy.sort((a, b) => b.created_at - a.created_at);

    case "date_asc":
      return copy.sort((a, b) => a.created_at - b.created_at);

    case "alpha_asc":
      return copy.sort((a, b) =>
        a.text.localeCompare(b.text, undefined, { sensitivity: "base" })
      );

    case "alpha_desc":
      return copy.sort((a, b) =>
        b.text.localeCompare(a.text, undefined, { sensitivity: "base" })
      );

    case "manual":
    default:
      return copy.sort((a, b) => a.manual_index - b.manual_index);
  }
};

/**
 * Objective: Recomputes and assigns sequential manual_index values for all items.
 * Used to clean up and normalize indices after a user finishes a drag-and-drop operation.
 */
export const reindexManual = (todos: TodoArray): TodoArray =>
  todos.map((t, i) => ({ ...t, manual_index: i }));