/**
 * @file LoadingSpinner.tsx
 * @description Reusable full-section loading spinner utility. Centered on the viewport
 * and equipped with accessibility flags for assistive technologies.
 */

/**
 * LoadingSpinner component that displays a rotating animated ring centered in its container.
 */
const LoadingSpinner = () => (
  // The wrapper is vertically sized to take up at least 60% of the viewport height (min-h-[60vh]).
  // Flexbox horizontally and vertically aligns the spinner in the middle.
  // role="status" and aria-label="Loading" announce to screen-readers that content is rendering.
  <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading">
    {/* CSS border animation spins this element infinitely (animate-spin) while keeping the top border transparent. */}
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;

