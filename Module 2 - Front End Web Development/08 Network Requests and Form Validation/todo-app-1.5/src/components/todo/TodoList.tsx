/**
 * TodoList Component
 * 
 * Objective: Renders the active list of tasks and manages the drag-and-drop (DnD) context.
 * Consumes the `useFilteredTodos` hook to receive data that matches the current filters and sort rules.
 * Intelligently binds or disables @dnd-kit sensors depending on whether the app is in "manual" sort mode.
 */

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import useTodoStore from "../../store/useTodoStore";
import { useFilteredTodos } from "../../hooks/useFilteredTodos";
import TodoItem from "./TodoItem";
import EmptyState from "../shared/EmptyState";

const TodoList = () => {
  // Global store configuration and state tracking
  const sort = useTodoStore((s) => s.sort);
  const todos = useTodoStore((s) => s.todos);
  const reorderTodos = useTodoStore((s) => s.reorderTodos);
  
  // Custom hook that provides the already-filtered array of tasks ready for rendering
  const filteredTodos = useFilteredTodos(); 

  // Drag-and-drop is strictly locked out unless the user explicitly chooses "manual" sorting
  const isDndEnabled = sort === "manual";

  // @dnd-kit Sensor configurations defining how drag operations initiate:
  // - Pointer: Requires 5px movement (prevents accidental drags during simple clicks)
  // - Touch: Requires 200ms sustained hold (perfect for mobile scrolling vs dragging)
  // - Keyboard: Allows dragging using Arrow Keys for strict accessibility compliance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }, 
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, 
    })
  );

  // Callback executed after successfully dropping an item
  // Translates the active vs over states into a global state mutation for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    // Updates internal list structure in Zustand / saves to Backend
    reorderTodos(String(active.id), String(over.id)); 
  };

  // Determining whether the list has no tasks at all, or if a filter resulted in an empty array
  const isEmpty = todos.length === 0;
  const isNoResults = !isEmpty && filteredTodos.length === 0;

  return (
    // DndContext wraps everything required to calculate dragging. 
    // Passing an empty array to 'sensors' effectively disables dragging altogether.
    <DndContext
      sensors={isDndEnabled ? sensors : []}
      onDragEnd={handleDragEnd}
    >
      {/* SortableContext scopes the exact item keys that are allowed to transition */}
      <SortableContext
        items={filteredTodos.map((t) => t.objectId as string)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[60px]">
          {/* Conditionally renders an EmptyState component if nothing exists to map */}
          {(isEmpty || isNoResults) ? (
            <EmptyState reason={isEmpty ? "empty" : "no-result"} />
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem key={todo.objectId as string} todo={todo} />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TodoList;