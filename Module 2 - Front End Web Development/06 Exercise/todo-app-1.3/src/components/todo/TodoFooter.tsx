/**
 * TodoFooter — Footer bar + mobile filter card.
 *
 * Exports:
 * - TodoFooter (default): renders inside the todo card
 *   → shows items count, filter tabs (desktop only), and "Clear Completed" button
 * - MobileFilterBar (named): separate card rendered below the todo card on mobile
 *   → shows filter tabs in their own container (sm:hidden)
 * - FilterButtons (internal): shared filter tab buttons used by both
 */

import useTodoStore from "../../store/useTodoStore";

/** Shared filter buttons — renders All / Active / Completed tabs */
const FilterButtons = () => {
  const filter = useTodoStore((s) => s.filter);
  const setFilter = useTodoStore((s) => s.setFilter);

  // "as const" tells TypeScript this is a literal type ("all"), not just string
  const filterOptions = [
    { value: "all" as const, label: "All" },
    { value: "active" as const, label: "Active" },
    { value: "completed" as const, label: "Completed" },
  ];

  return (
    <>
      {/* .map() renders a button for each filter option */}
      {/* aria-pressed tells screen readers which tab is active */}
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setFilter(option.value)} // Update filter in global store
          aria-pressed={filter === option.value}
          className={`
            font-bold transition-colors duration-150 p-0 border-none bg-transparent cursor-pointer outline-none focus:outline-none focus:ring-0
            ${filter === option.value
              ? "text-[#3A7CFD]"
              : "text-[#9495A5] dark:text-[#5B5E7E] hover:text-[#494C6B] dark:hover:text-[#E3E4F1]"
            }
          `}
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "14px",
            letterSpacing: "-0.19px",
          }}
        >
          {option.label}
        </button>
      ))}
    </>
  );
};

/** TodoFooter — renders inside the main todo card */
const TodoFooter = () => {
  const todos = useTodoStore((s) => s.todos);
  const clearCompleted = useTodoStore((s) => s.clearCompleted);

  // Derived counts: computed from todos array each render
  const activeCount = todos.filter((t) => !t.completed).length; // Count incomplete tasks
  const hasCompleted = todos.some((t) => t.completed); // true if any task is completed

  return (
    <div className="flex items-center justify-between gap-2 py-4 min-h-[64px] text-[#9495A5] dark:text-[#5B5E7E] transition-colors duration-200" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
      <span
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "14px",
          letterSpacing: "-0.19px",
        }}
        className="flex-shrink-0 text-left w-20"
      >
        {activeCount} items left
      </span>

      {/* hidden sm:flex = hidden on mobile, visible as flexbox on desktop (≥640px) */}
      <div className="hidden sm:flex items-center gap-4 justify-center flex-1">
        <FilterButtons />
      </div>

      {/* disabled={!hasCompleted}: button is grayed out when nothing to clear */}
      <button
        onClick={hasCompleted ? clearCompleted : undefined}
        disabled={!hasCompleted}
        className={`
          flex-shrink-0 border-none bg-transparent p-0 outline-none focus:outline-none text-right
          transition-colors duration-150
          ${hasCompleted 
             ? "cursor-pointer text-[#9495A5] dark:text-[#5B5E7E] hover:text-[#494C6B] dark:hover:text-[#E3E4F1]" 
             : "cursor-default text-[#D1D2DA] dark:text-[#4D5067]"
          }
        `}
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "14px",
          letterSpacing: "-0.19px",
        }}
      >
        Clear Completed
      </button>
    </div>
  );
};

/** MobileFilterBar — separate card shown only on mobile (below sm breakpoint) */
export const MobileFilterBar = () => {
  return (
    // sm:hidden = visible only on mobile (<640px); hidden on desktop
    <div
      className="sm:hidden w-full flex items-center justify-center gap-4 min-h-[64px] bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200"
      style={{ borderRadius: "5px" }}
    >
      <FilterButtons />
    </div>
  );
};

export default TodoFooter;