/**
 * TodoInput Component
 *
 * Objective: Renders a controlled text input for creating new tasks. 
 * Connects to the global store to manage input state and dispatch the add action.
 */

import { useRef, type KeyboardEvent } from "react";
import useTodoStore from "../../store/useTodoStore";

export const TodoInput = () => {
  // Select state and actions from the global store
  const isSyncing = useTodoStore((s) => s.isSyncing);
  const newInput = useTodoStore((s) => s.newInput);
  const setNewInput = useTodoStore((s) => s.setNewInput);
  const addTodo = useTodoStore((s) => s.addTodo);
  const sort = useTodoStore((s) => s.sort);

  // Reference for manually re-focusing the input field
  const inputRef = useRef<HTMLInputElement>(null);

  // Submits the new task after basic validation and resets focus
  const handleSubmit = async () => {
    // Prevent duplicate submissions or adding empty tasks
    if (isSyncing || newInput.trim().length === 0) return; 

    await addTodo();
    
    // Defer focus reset to ensure DOM updates are complete
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Triggers form submission on "Enter" key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative todo-input w-full py-4 flex items-center rounded min-h-[64px] border border-transparent dark:border-[#393A5A] bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
      
      {/* Spacer to maintain vertical alignment with the manual drag handle in TodoItem */}
      {sort === "manual" && <div className="w-4 h-4 shrink-0" style={{ marginRight: '5px' }} />}

      {/* Decorative empty circle styled to match the checkbox in TodoItem */}
      <div className="w-6 h-6 min-w-[24px] rounded-full border shrink-0 border-[#E3E4F1] dark:border-[#393A4B] transition-colors duration-200" style={{ marginRight: '24px' }} />

      {/* Controlled input actively syncing value to store */}
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          placeholder={isSyncing ? "Saving..." : "Create a new todo…"}
          disabled={isSyncing}
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

      {/* Conditionally renders Submit button if input has text, otherwise renders a spacer */}
      {newInput.trim().length > 0 ? (
        <button
          onClick={handleSubmit}
          disabled={isSyncing}
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