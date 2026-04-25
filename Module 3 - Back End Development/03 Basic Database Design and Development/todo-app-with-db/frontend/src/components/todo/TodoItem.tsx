/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: components/todo/TodoItem.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Represents a single interactive task row in the Todo list.
 *   Provides features for completion toggling, inline text editing, 
 *   sharing (short link), and deletion.
 *
 * RELATIONS:
 *   - store/useTodoStore.ts   → Receives actions for data persistence.
 *   - services/shareService.ts → Generates short links for the share feature.
 *   - @dnd-kit/sortable       → Provides drag-and-drop capabilities.
 *
 * HOW IT WORKS:
 *   1. Inline Editing: Double-click (or double-tap on mobile) activates an 
 *      input field. On blur or 'Enter', it updates the store.
 *   2. Optimistic Toggle: Toggling completion updates the UI immediately.
 *   3. Share Feature: Calls the backend to create a unique short link, 
 *      then copies it to the user's clipboard.
 *   4. Drag & Drop: Uses 'useSortable' to handle physics and positioning.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useTodoStore from "../../store/useTodoStore";
import { shareService } from "../../services/shareService";
import type { Todo } from "../../types/types";

type TodoItemProps = {
  todo: Todo;
};

const TodoItem = ({ todo }: TodoItemProps) => {
  // --- STORE ACTIONS ---
  const sort = useTodoStore((s) => s.sort);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const removeTodo = useTodoStore((s) => s.removeTodo);

  // --- LOCAL STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const [isSharing, setIsSharing] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef<number>(0); 

  // --- DRAG & DROP LOGIC ---
  const isDndEnabled = sort === "manual";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDndEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  // --- INLINE EDITING LOGIC ---
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

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.text) {
      updateTodo(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(todo.text);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  // --- MOBILE TOUCH HANDLING ---
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      enterEditMode();
    }
    lastTapRef.current = now;
  };

  // --- SHARE FEATURE ---
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const { shortUrl } = await shareService.createShareLink(todo.id);
      await navigator.clipboard.writeText(shortUrl);
      alert(`Link copied to clipboard: ${shortUrl}`);
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setIsSharing(false);
    }
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
      {/* Drag Handle */}
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

      {/* Completion Toggle */}
      <button
        onClick={() => toggleTodo(todo.id)}
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

      {/* Text Display / Input Field */}
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

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex items-center gap-1" style={{ marginLeft: '24px' }}>
          <button
            onClick={handleShare}
            disabled={isSharing}
            aria-label="Share todo"
            className="shrink-0 cursor-pointer border-none bg-transparent p-1 text-gray-300 dark:text-[#4D5067] hover:text-blue-400 dark:hover:text-blue-400 md:opacity-0 group-hover:opacity-100 transition-all duration-150 focus:outline-none focus:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          <button
            onClick={() => removeTodo(todo.id)}
            aria-label="Delete task"
            className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-gray-300 dark:text-[#4D5067] hover:text-red-400 dark:hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-all duration-150 focus:outline-none focus:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TodoItem;