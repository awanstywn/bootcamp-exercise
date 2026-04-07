import useTodoStore from "../../store/useTodoStore";
import type { SortType, SortOption } from "../../types/types";

interface SortDropdownProps {
  /** Callback triggered after a sort strategy is chosen (e.g., to close the menu) */
  onSelect: () => void;
}

/**
 * Objective: Renders a UI list allowing users to select a task sorting strategy.
 * It connects directly to the Zustand store, keeping sorting logic scoped and
 * preventing unnecessary re-renders of parent components.
 */
export function SortDropdown({ onSelect }: SortDropdownProps) {
  // Extract specific state properties from the store
  const sort = useTodoStore((s) => s.sort);
  const setSort = useTodoStore((s) => s.setSort);

  /** Updates the global sort strategy and executes the selection callback */
  const handleSort = (type: SortType) => {
    setSort(type);
    onSelect();
  };

  /** Predefined sort strategies mapping directly to the global SortOption type */
  const options: SortOption[] = [
    { value: "manual", label: "Custom" },
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "alpha_asc", label: "A-Z" },
    { value: "alpha_desc", label: "Z-A" },
  ];

  return (
    <>
      <h3 className="text-sm font-bold text-[#9495A5] dark:text-[#5B5E7E] uppercase tracking-wider mb-2">Sort By</h3>
      <div className="flex flex-col items-start gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`text-left text-base sm:text-[18px] transition-colors duration-200 outline-none focus:outline-none bg-transparent border-none p-0 cursor-pointer ${
              sort === opt.value
                ? "text-[#3A7CFD] font-bold"
                : "text-[#494C6B] dark:text-[#C8CBE7] hover:text-[#3A7CFD] dark:hover:text-[#E3E4F1]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}