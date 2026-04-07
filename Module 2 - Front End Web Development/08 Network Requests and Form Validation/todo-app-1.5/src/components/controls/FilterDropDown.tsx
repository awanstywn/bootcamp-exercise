import useTodoStore from "../../store/useTodoStore";
import type { FilterType, FilterOption } from "../../types/types";

interface FilterDropdownProps {
  /** Callback triggered after a view filter is chosen (e.g., to close the menu) */
  onSelect: () => void;
}

/**
 * Objective: Renders a UI list allowing users to filter tasks by status (All, Active, Completed).
 * Connects directly to the Zustand store, keeping filtering logic scoped and
 * preventing unnecessary re-renders of parent components.
 */
export function FilterDropdown({ onSelect }: FilterDropdownProps) {
  // Extract specific state properties from the store to optimize renders
  const filter = useTodoStore((s) => s.filter);
  const setFilter = useTodoStore((s) => s.setFilter);

  /** Updates the global view filter and executes the selection callback */
  const handleFilter = (type: FilterType) => {
    setFilter(type);
    onSelect();
  };

  /** Predefined visibility filters mapping directly to the global FilterOption type */
  const options: FilterOption[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <>
      <h3 className="text-sm font-bold text-[#9495A5] dark:text-[#5B5E7E] uppercase tracking-wider mb-2">View</h3>
      <div className="flex flex-col items-start gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilter(opt.value)}
            className={`text-left text-base sm:text-[18px] transition-colors duration-200 outline-none focus:outline-none bg-transparent border-none p-0 cursor-pointer ${
              filter === opt.value
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