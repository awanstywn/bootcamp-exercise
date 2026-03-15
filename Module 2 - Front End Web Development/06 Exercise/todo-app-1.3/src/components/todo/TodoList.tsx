/**
 * TodoList — Core list component that owns the DnD context.
 *
 * Renders filtered/sorted todos from useFilteredTodos() hook.
 * Drag-and-drop is only enabled when sort === "manual" (sensors are empty otherwise).
 *
 * Sensors:
 * - PointerSensor: desktop mouse drag (5px activation distance)
 * - TouchSensor: mobile touch drag (200ms hold delay)
 * - KeyboardSensor: accessible keyboard navigation
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
import EmptyState from "../ui/EmptyState";

const TodoList = () => {
  const sort = useTodoStore((s) => s.sort);
  const todos = useTodoStore((s) => s.todos);
  const reorderTodos = useTodoStore((s) => s.reorderTodos);
  const filteredTodos = useFilteredTodos(); // Already filtered + sorted — ready to render

  // DnD is only allowed when sort is "manual" (other sorts have fixed order)
  const isDndEnabled = sort === "manual";

  // Register three input methods for DnD:
  // - PointerSensor: mouse clicks on desktop (must move 5px before drag starts)
  // - TouchSensor: finger touch on mobile (must hold 200ms before drag starts)
  // - KeyboardSensor: arrow keys for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },  // Prevents accidental drag on click
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }, // Hold 200ms to start drag
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, // Enables arrow-key reordering
    })
  );

  // Called when user drops a dragged item
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event; // active = dragged item, over = target position
    if (!over || active.id === over.id) return; // Dropped on itself or outside — do nothing
    reorderTodos(String(active.id), String(over.id)); // Update order in store
  };

  // Determine empty state reason
  const isEmpty = todos.length === 0;
  const isNoResults = !isEmpty && filteredTodos.length === 0;

  // When sensors={[]} (empty array), DnD is completely disabled
  // This prevents dragging when sort is not "manual"
  return (
    <DndContext
      sensors={isDndEnabled ? sensors : []}  // Pass sensors or empty to disable
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredTodos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[60px]">
          {(isEmpty || isNoResults) ? (
            <EmptyState reason={isEmpty ? "empty" : "no-results"} />
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TodoList;