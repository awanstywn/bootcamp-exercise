/**
 * Search — Search input with Sort and Filter icon buttons.
 *
 * Layout: [Search input] [Sort button] [Filter button]
 * - Search input: bound to store.searchInput, real-time filtering
 * - Sort button: opens SortDropdown overlay
 * - Filter button: opens FilterDropdown overlay
 *
 * Responsive:
 * - Mobile: smaller buttons (48px), tighter gap
 * - Desktop: larger buttons (64px), wider gap
 */

import { useState, useRef, useEffect } from "react";
import useTodoStore from "../store/useTodoStore";
import { SortDropdown } from "./ui/SortDropDown";
import { FilterDropdown } from "./ui/FilterDropDown";

export function Search() {
  // Destructure the search state and setter from global store
  const { searchInput, setSearchInput } = useTodoStore();
  
  // Local state for dropdown visibility (not in global store — it's local UI)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);  // Ref to detect clicks outside the dropdown
  
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when user clicks anywhere outside
  // useEffect with [] runs once on mount, returns cleanup function on unmount
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // .contains() checks if the click target is inside the dropdown ref
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup on unmount
    };
  }, []);

  const handleClear = () => {
    setSearchInput("");
  };

  return (
    <div className="w-full flex items-center gap-2 sm:gap-4 relative">
      {/* Search input */}
      <div className="relative search-input flex-1 py-2 sm:py-4 flex items-center rounded h-12 sm:h-auto sm:min-h-[64px] gap-6 border border-transparent dark:border-[#393A5A] bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
      {/* Real-time search: every keystroke updates store → useFilteredTodos recalculates → list re-renders */}
      <input
        type="text"
        placeholder="Search todos..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="flex-1 bg-transparent outline-none font-normal leading-normal min-w-0 text-[#393A4B] dark:text-[#C8CBE7] placeholder-[#9495A5] dark:placeholder-gray-500"
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "18px",
          letterSpacing: "-0.25px",
        }}
      />
      
      {/* Conditional rendering: only show clear (×) button when search field has text */}
      {searchInput.length > 0 && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search"
          className="shrink-0 text-[#9495A5] hover:text-[#494C6B] dark:text-[#5B5E7E] dark:hover:text-[#E3E4F1] transition-colors duration-150 outline-none focus:outline-none flex items-center justify-center p-0 bg-transparent border-none cursor-pointer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>

    {/* Sort button + dropdown */}
    <div className="relative" ref={sortRef}>
      <button
        onClick={() => setIsSortOpen(!isSortOpen)}
        className="flex items-center justify-center w-12 h-12 sm:w-[64px] sm:h-[64px] rounded border border-transparent dark:border-[#393A5A] bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200 text-[#9495A5] dark:text-[#5B5E7E] hover:text-[#494C6B] dark:hover:text-[#E3E4F1] cursor-pointer"
        aria-label="Sort"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Conditional rendering: dropdown appears only when isSortOpen is true */}
      {/* onSelect callback closes the dropdown after user picks an option */}
      {isSortOpen && (
        <div className="absolute right-0 top-[60px] sm:top-[80px] w-[220px] rounded-lg p-5 flex flex-col gap-5 border border-[#E0E1EC] dark:border-[#2D2E45] bg-[#F0F1F7] dark:bg-[#1A1B2E] shadow-[0px_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0px_10px_40px_rgba(0,0,0,0.4)] z-50">
          <SortDropdown onSelect={() => setIsSortOpen(false)} />
        </div>
      )}
    </div>

    {/* Filter button + dropdown */}
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center justify-center w-12 h-12 sm:w-[64px] sm:h-[64px] rounded border border-transparent dark:border-[#393A5A] bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200 text-[#9495A5] dark:text-[#5B5E7E] hover:text-[#494C6B] dark:hover:text-[#E3E4F1] cursor-pointer"
        aria-label="Filter"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6" />
        </svg>
      </button>

      {isFilterOpen && (
        <div className="absolute right-0 top-[60px] sm:top-[80px] w-[220px] rounded-lg p-5 flex flex-col gap-5 border border-[#E0E1EC] dark:border-[#2D2E45] bg-[#F0F1F7] dark:bg-[#1A1B2E] shadow-[0px_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0px_10px_40px_rgba(0,0,0,0.4)] z-50">
          <FilterDropdown onSelect={() => setIsFilterOpen(false)} />
        </div>
      )}
    </div>
  </div>
  );
}
