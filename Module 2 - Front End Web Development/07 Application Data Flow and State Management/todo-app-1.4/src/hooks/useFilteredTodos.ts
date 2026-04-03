import useTodoStore from "../store/useTodoStore";
import { sortTodos } from "../utils/sortTodos";
import type { Todo } from "../types/types";

/**
 * useFilteredTodos — Derived state hook
 *
 * Returns the final display-ready array of todos.
 * Applies a 3-step pipeline:
 *   1. Filter by completion status (all / active / completed)
 *   2. Filter by search query (case-insensitive substring match)
 *   3. Sort by active SortType
 */
export const useFilteredTodos = (): Todo[] => {
  // Read all needed state from store in one call
  // This hook re-runs whenever any of these 4 values change
  const { todos, searchInput, filter, sort } = useTodoStore();

  // Step 1: Filter by completion status
  // .filter() creates a new array with only the items that pass the test
  const byStatus = todos.filter((t: Todo) => {
    if (filter === "active") return !t.completed;    // Keep only incomplete
    if (filter === "completed") return t.completed;   // Keep only completed
    return true; // "all" — keep everything
  });

  // Step 2: Filter by search query
  // .includes() checks if the search text exists anywhere in the todo text
  // Both are lowercased for case-insensitive matching
  const bySearch = byStatus.filter((t: Todo) =>
    t.text.toLowerCase().includes(searchInput.toLowerCase().trim()),
  );

  // Step 3: Sort the filtered results and return
  // sortTodos() returns a new sorted array (doesn't mutate bySearch)
  return sortTodos(bySearch, sort);
};
