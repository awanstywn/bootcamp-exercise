/**
 * SortDropdown — Sort options rendered inside the dropdown overlay.
 *
 * Options: Manual Drag & Drop, Newest First, Oldest First, A to Z, Z to A
 * Active option is highlighted in blue with a checkmark.
 * Calls onSelect() after choosing to close the dropdown.
 *
 * Styling: theme-aware — light grey in light mode, dark in dark mode.
 */

import useTodoStore from "../../store/useTodoStore";
import type { SortType, SortOption } from "../../types/types";

type SortDropdownProps = {
  onSelect?: () => void;
};

export function SortDropdown({ onSelect }: SortDropdownProps) {
  const { sort, setSort } = useTodoStore();

  const sortOptions: SortOption[] = [
    { value: "manual", label: "Manual Drag & Drop" },
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "alpha_asc", label: "A to Z" },
    { value: "alpha_desc", label: "Z to A" },
  ];

  const handleSelect = (value: SortType) => {
    setSort(value);
    onSelect?.();
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className="text-xs uppercase tracking-wider font-bold mb-1 px-2 text-[#9495A5] dark:text-[#6B6D8A]"
        style={{ fontFamily: "'Josefin Sans', sans-serif" }}
      >
        Sort by
      </div>
      <div className="flex flex-col">
        {sortOptions.map((option) => {
          const isActive = sort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                group flex items-center justify-between w-full text-left px-2 py-3 mt-1 rounded-md text-base font-medium border-none cursor-pointer outline-none transition-all duration-200
                ${isActive 
                  ? "bg-[#E0E1EC] dark:bg-[#2D2E45] text-[#3A7CFD]"
                  : "bg-transparent text-[#494C6B] dark:text-[#C8CBE7] hover:bg-[#E0E1EC]/60 dark:hover:bg-[#2D2E45]/60 hover:text-[#393A4B] dark:hover:text-white"
                }
              `}
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                {option.label}
              </span>
              {isActive && (
                <svg className="w-5 h-5 text-[#3A7CFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}