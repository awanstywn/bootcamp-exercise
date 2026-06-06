/**
 * @fileoverview Top navigation bar for authenticated users.
 * 
 * Relations:
 * - Consumes: `useAuth` hook, `lucide-react` icons.
 * - Used by: `DashboardLayout.tsx`.
 * 
 * Logic:
 * - Displays the currently logged-in user's name as a link to the profile page.
 * - Provides the global `Logout` button, which triggers the logout flow via `useAuth()`.
 */
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Link to="/profile" className="flex items-center gap-2 group">
            <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition-colors">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{user?.name}</span>
          </Link>
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
          <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
