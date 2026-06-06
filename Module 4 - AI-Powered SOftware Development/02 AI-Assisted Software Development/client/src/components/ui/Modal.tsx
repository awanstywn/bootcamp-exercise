/**
 * @fileoverview Reusable Modal/Dialog overlay component.
 * 
 * Relations:
 * - Consumes: `lucide-react` for the close icon, `cn` utility.
 * - Used by: `ProductsPage.tsx` and `CategoriesPage.tsx` for CRUD operations.
 * 
 * Logic:
 * - Conditionally renders based on the `isOpen` prop.
 * - Displays an overlay background and a centered, elevated box.
 * - Contains a title and an inner container for the `children` (usually a form).
 */
import { X } from "lucide-react";
import React from "react";
import { cn } from "../../utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 sm:p-0">
      <div
        className={cn(
          "relative w-full max-w-lg transform rounded-lg bg-white shadow-xl transition-all sm:my-8",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};
