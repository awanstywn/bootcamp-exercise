import type { ReactNode } from "react";
import useTodoStore from "../../store/useTodoStore";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Objective: Root layout wrapper that provides a consistent UI foundation (theme and background) across all routes.
 * 
 * How it works: 
 * Subscribes only to `isDarkMode` from Zustand to inject Tailwind's `dark` class at the top level.
 * Wraps child components in a full-height container to ensure smooth, flicker-free background color transitions.
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
