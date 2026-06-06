/**
 * @file Tabs.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Tabs operations.
 * 
 * @relations
 * Interacts with: react, ../../lib/cn.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import { cn } from "../../lib/cn";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
}

export function Tabs({ tabs, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap py-4 px-6 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "border-text-main text-text-main"
                : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-8">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
