/**
 * @fileoverview Main structural layout for authenticated pages.
 * 
 * Relations:
 * - Consumes: `Header.tsx` and `Sidebar.tsx`.
 * - Used by: `App.tsx` to wrap protected routes.
 * 
 * Logic:
 * - Provides a responsive CSS Grid/Flexbox shell (sidebar on left, header on top, main content area).
 * - The `children` prop represents the dynamically injected page content.
 */
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col md:pl-64">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
