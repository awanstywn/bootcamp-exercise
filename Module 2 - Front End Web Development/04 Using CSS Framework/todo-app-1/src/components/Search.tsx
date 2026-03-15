import { useState } from "react";

type SearchProps = {
  isDarkMode: boolean;
  onSearch: (searchTerm: string) => void;
};

export function Search({ isDarkMode, onSearch }: SearchProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <div className="search" style={{ width: "100%", maxWidth: "672px" }}>
      <input
        type="text"
        placeholder="Search todos..."
        className="search-input"
        value={searchValue}
        onChange={handleSearchChange}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "6px",
          border: `1px solid ${isDarkMode ? "#393A5A" : "#E0E0E0"}`,
          backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
          color: isDarkMode ? "#C8CBE7" : "#393A4B",
          fontFamily: "Josefin Sans, sans-serif",
          fontSize: "14px",
          boxShadow: isDarkMode
            ? "0px 35px 50px -15px rgba(0, 0, 0, 0.5)"
            : "0px 35px 50px -15px rgba(194, 195, 214, 0.5)",
          outline: "none",
          transition: "all 0.3s ease",
        }}
      />
    </div>
  );
}
