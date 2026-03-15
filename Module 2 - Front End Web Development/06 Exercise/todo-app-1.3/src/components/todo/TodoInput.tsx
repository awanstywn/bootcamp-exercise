/**
 * TodoInput — New task input field.
 *
 * - Controlled input bound to store.newInput
 * - Submits on Enter key press or click the add (+) button
 * - Validates non-empty input before adding
 * - Clears and re-focuses after submit
 * - Spacer elements align the circle and drag handle with TodoItem layout
 */

import { useRef, type KeyboardEvent } from "react";
import useTodoStore from "../../store/useTodoStore";

export const TodoInput = () => {
  // Read state and actions from global store using selector functions
  const newInput = useTodoStore((s) => s.newInput);     // Current input text
  const setNewInput = useTodoStore((s) => s.setNewInput); // Update input text
  const addTodo = useTodoStore((s) => s.addTodo);       // Add new task action
  const sort = useTodoStore((s) => s.sort);             // Current sort mode (for spacer alignment)

  // useRef gives us direct access to the DOM element (for .focus())
  const inputRef = useRef<HTMLInputElement>(null);

  // addTodo() reads newInput from store, validates, creates Todo, and clears input
  // setTimeout(..., 0) re-focuses the input AFTER React finishes re-rendering
  const handleSubmit = () => {
    addTodo();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative todo-input w-full py-4 flex items-center rounded min-h-[64px] border border-transparent dark:border-[#393A5A] bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
      
      {/* Spacer: aligns with drag handle in TodoItem when sort is manual */}
      {sort === "manual" && <div className="w-4 h-4 flex-shrink-0" style={{ marginRight: '5px' }} />}

      {/* Empty circle: visual alignment with TodoItem checkbox */}
      <div className="w-6 h-6 min-w-[24px] rounded-full border shrink-0 border-[#E3E4F1] dark:border-[#393A4B] transition-colors duration-200" style={{ marginRight: '24px' }} />

      {/* Controlled input: value is always synced with store.newInput */}
      {/* onChange updates store on every keystroke */}
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          placeholder="Create a new todo…"
          value={newInput}
          onChange={(e) => setNewInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-transparent outline-none font-normal leading-normal min-w-0 text-[#393A4B] dark:text-[#C8CBE7] placeholder-[#9495A5] dark:placeholder-gray-500"
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "18px",
            letterSpacing: "-0.25px",
          }}
        />
      </div>

      {/* Ternary: show + button when there's text, otherwise invisible spacer for alignment */}
      {newInput.trim().length > 0 ? (
        <button
          onClick={handleSubmit}
          aria-label="Add task"
          className="shrink-0 text-blue-500 hover:text-blue-400 transition-colors duration-150 outline-none focus:outline-none p-0 bg-transparent border-none cursor-pointer"
          style={{ marginLeft: '24px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      ) : (
        <div className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      )}
    </div>
  );
};

export default TodoInput;