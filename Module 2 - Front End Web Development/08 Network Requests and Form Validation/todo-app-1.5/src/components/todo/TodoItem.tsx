/**
 * TodoItem Component
 *
 * Objective: Renders a single interactive task row.
 * Manages local editing state while delegating overarching data mutations
 * (toggle, update, remove, reorder) to the global store.
 * Integrates @dnd-kit to provide drag-and-drop sortable behavior.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useTodoStore from "../../store/useTodoStore";
import type { Todo } from "../../types/types";

type TodoItemProps = {
  todo: Todo;
};

const TodoItem = ({ todo }: TodoItemProps) => {
  // Global store actions and selectors
  const sort = useTodoStore((s) => s.sort);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const removeTodo = useTodoStore((s) => s.removeTodo);

  // Local state for inline text editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Tracks timestamp for mobile double-tap detection
  const lastTapRef = useRef<number>(0); 

  // Drag-and-drop variables
  const isDndEnabled = sort === "manual";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // true while actively dragging
  } = useSortable({ id: todo.objectId as string, disabled: !isDndEnabled });

  // Transforms DnD coordinates into smooth CSS animations
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  // Auto-focus the input instantly upon entering edit mode
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const enterEditMode = () => {
    setEditValue(todo.text);
    setIsEditing(true);
  };

  // Only triggers a backend update if the text was modified and isn't empty
  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.text) {
      updateTodo(todo.objectId as string, trimmed);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(todo.text);
    setIsEditing(false);
  };

  // Keyboard accessibility for inline input (Enter to save, Escape to abort)
  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Emulates double-click logic for touch screens (triggers within 300ms)
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      enterEditMode();
    }
    lastTapRef.current = now;
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, paddingLeft: '24px', paddingRight: '24px' }}
      className={`
        group flex items-center py-4 min-h-[64px]
        border-b border-[#E3E4F1] dark:border-[#393A4B]
        ${isDragging ? "shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] rounded-[5px] border-none bg-white dark:bg-[#25273D]" : ""}
        transition-colors duration-200
      `}
    >
      {/* Drag handler: Only interactive/visible when sorting is manual */}
      {isDndEnabled && (
        <div
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="
            shrink-0 cursor-grab active:cursor-grabbing
            text-gray-300 dark:text-gray-600
            hover:text-gray-400 dark:hover:text-gray-400
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100
            transition-opacity duration-150
          "
          style={{ marginRight: '5px', touchAction: 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
          </svg>
        </div>
      )}

      {/* Completion toggle switch */}
      <button
        onClick={() => toggleTodo(todo.objectId as string)}
        aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        style={{
          background: todo.completed ? "linear-gradient(to right bottom, hsl(192, 100%, 67%), hsl(280, 87%, 65%))" : "transparent",
          marginRight: '24px'
        }}
        className={`
          shrink-0 w-6 h-6 min-w-[24px] rounded-full flex items-center justify-center
          transition-all duration-200 cursor-pointer p-0
          ${
            todo.completed
              ? "border-none"
              : "border border-[#E3E4F1] dark:border-[#393A4B] hover:border-[#a05ce3]"
          }
        `}
      >
        {todo.completed && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>

      {/* Primary content area: displays text or swaps to input field for inline editing */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={cancelEdit}
            aria-label="Edit task text"
            className="w-full bg-transparent border-b border-blue-400 dark:border-blue-500 focus:outline-none pb-px outline-none font-normal leading-normal text-[#393A4B] dark:text-[#C8CBE7]"
            style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "18px", letterSpacing: "-0.25px" }}
          />
        ) : (
          <span
            onDoubleClick={enterEditMode}
            onTouchEnd={handleTouchEnd}
            title="Double-click to edit"
            className={`
              block truncate select-none cursor-default
              transition-colors duration-200 font-normal leading-normal
              ${
                todo.completed
                  ? "line-through text-[#D1D2DA] dark:text-[#4D5067]"
                  : "text-[#393A4B] dark:text-[#C8CBE7]"
              }
            `}
            style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "18px", letterSpacing: "-0.25px" }}
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* Delete button: Only renders outside edit mode to prevent accidental clicks */}
      {!isEditing && (
        <button
          onClick={() => removeTodo(todo.objectId as string)}
          aria-label="Delete task"
          className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-gray-300 dark:text-[#4D5067] hover:text-red-400 dark:hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-all duration-150 focus:outline-none focus:opacity-100"
          style={{ marginLeft: '24px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TodoItem;