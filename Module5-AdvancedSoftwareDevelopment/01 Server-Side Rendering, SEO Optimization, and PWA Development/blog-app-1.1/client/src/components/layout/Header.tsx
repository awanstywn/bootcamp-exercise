import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-slate-900 border-b-2 border-slate-900 pb-1'
    : 'hover:text-slate-900 pb-1 border-b-2 border-transparent';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthStore();

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const hasFetchedCategories = useRef(false);

  useEffect(() => {
    if (!hasFetchedCategories.current) {
      hasFetchedCategories.current = true;
      api
        .get('/content/categories')
        .then((res) => setCategories(res.data))
        // eslint-disable-next-line no-console
        .catch(console.error);
    }
  }, []);

  // Clear search form when navigating to any page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <header className="bg-white border-b border-surface-200 py-4 px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-900 rounded text-white flex items-center justify-center font-bold">
          B
        </div>
        <Link to="/" className="font-bold text-xl font-serif tracking-normal">
          BlogApp
        </Link>
      </div>
      <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 items-center">
        <NavLink to="/" className={navLinkClass}>
          Home
        </NavLink>
        <div className="relative group cursor-pointer py-4 -my-4">
          <NavLink to="/categories" className={navLinkClass}>
            <div className="flex items-center gap-1">
              Categories
              <svg
                className="w-4 h-4 group-hover:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </NavLink>
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 shadow-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col z-50 py-1">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <NavLink to="/tags" className={navLinkClass}>
          Tags
        </NavLink>
        <NavLink to="/about" className={navLinkClass}>
          About
        </NavLink>
      </nav>

      <div className="flex gap-4 items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              setSearchQuery('');
            }
          }}
          className="hidden lg:flex relative"
        >
          <input
            name="q"
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors w-48"
          />
          <button type="submit" className="absolute right-3 top-2.5">
            <svg
              className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
        </form>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/posts"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={() => logout()}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-slate-900 text-white px-5 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
