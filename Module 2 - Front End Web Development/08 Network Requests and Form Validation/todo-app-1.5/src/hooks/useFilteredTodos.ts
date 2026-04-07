import useTodoStore from "../store/useTodoStore";
import { sortTodos } from "../utils/sortTodos";
import type { Todo } from "../types/types";
import { useShallow } from "zustand/react/shallow";

/**
 * Objective: A derived state pipeline generating the final display-ready array of Todos.
 * This hook selectively reads from the global store, applying current filters and 
 * sorting strategies on the fly without mutating the core database array.
 */
export const useFilteredTodos = (): Todo[] => {
  /** 
   * `useShallow` Optimization: 
   * Binds to the array via shallow comparison. This forces the UI to only re-render 
   * if these exact four properties change, preventing lag when background state toggles.
   */
  const { todos, searchInput, filter, sort } = useTodoStore(
    useShallow((state) => ({
      todos: state.todos,
      searchInput: state.searchInput,
      filter: state.filter,
      sort: state.sort,
    }))
  );

  /** 
   * Step 1: Status Pipeline
   * Discards tasks from the visual copy that don't match the active/completed view. 
   */
  const byStatus = todos.filter((t: Todo) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true; 
  });

  /** 
   * Step 2: Search Range Pipeline
   * Searches remaining tasks in memory. Standardized with `.toLowerCase()` to be case-insensitive.
   */
  const bySearch = byStatus.filter((t: Todo) =>
    t.text.toLowerCase().includes(searchInput.toLowerCase().trim()),
  );

  /** 
   * Step 3: Output Render
   * Delegates final ordering to our utility and returns the immutable array.
   */
  return sortTodos(bySearch, sort);
};
