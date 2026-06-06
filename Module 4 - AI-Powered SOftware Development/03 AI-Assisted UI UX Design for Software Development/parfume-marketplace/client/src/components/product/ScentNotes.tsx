/**
 * @file ScentNotes.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ScentNotes operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

interface ScentNotesProps {
  top: string;
  heart: string;
  base: string;
}

const CitrusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v18"></path><path d="M12 12L5 8"></path><path d="M12 12l7-4"></path><path d="M12 12l-5.5 5.5"></path><path d="M12 12l5.5 5.5"></path></svg>;
const FlowerIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c-4 0-4-3-4-3s-2-2-5-2c0 0 2-4 5-4 0 0-1-4 1-5 0 0 4 1 5 1s5-1 5-1c2 1 1 5 1 5 3 0 5 4 5 4s-3 2-5 2c0 0 0 3-4 3"></path><circle cx="12" cy="12" r="2"></circle></svg>;
const WoodIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3v18"></path><path d="M10 3v18"></path><path d="M14 3v18"></path><path d="M18 3v18"></path><path d="M4 12h16"></path></svg>;

export function ScentNotes({ top, heart, base }: ScentNotesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 flex items-center justify-center text-text-muted mb-3">
          <CitrusIcon />
        </div>
        <h4 className="text-sm font-semibold text-text-main mb-2">Top Notes</h4>
        <p className="text-sm text-text-muted">{top}</p>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 flex items-center justify-center text-text-muted mb-3">
          <FlowerIcon />
        </div>
        <h4 className="text-sm font-semibold text-text-main mb-2">Heart Notes</h4>
        <p className="text-sm text-text-muted">{heart}</p>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 flex items-center justify-center text-text-muted mb-3">
          <WoodIcon />
        </div>
        <h4 className="text-sm font-semibold text-text-main mb-2">Base Notes</h4>
        <p className="text-sm text-text-muted">{base}</p>
      </div>
    </div>
  );
}
