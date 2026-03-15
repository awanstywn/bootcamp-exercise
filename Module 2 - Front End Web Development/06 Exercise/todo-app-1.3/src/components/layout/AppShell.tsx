import type { ReactNode } from "react";
import useTodoStore from "../../store/useTodoStore";

type AppShellProps = {
  children: ReactNode;
};

/**
 * AppShell — Root layout wrapper.
 * Reads isDarkMode from store and applies Tailwind's "dark" class to enable dark mode styling.
 * Provides the full-viewport background container.
 */
const AppShell = ({ children }: AppShellProps) => {
  const isDarkMode = useTodoStore((s) => s.isDarkMode);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-[#1a1f2e] transition-colors duration-300">
        {children}
      </div>
    </div>
  );
};

export default AppShell;
