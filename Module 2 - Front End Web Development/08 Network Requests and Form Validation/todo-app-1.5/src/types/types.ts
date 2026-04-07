//--Theme & UI --//
export type ThemeType = boolean;
export type FilterType = "all" | "active" | "completed";
export type SortType = "manual" | "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

//--Todo --//
export interface Todo {
    objectId?: string; //Backendless auto-generated
    ownerId?: string; //Auto-set to logged-in user's objectId
    text: string;
    completed: boolean;
    created_at: number; //Date.now() timestamp
    manual_index: number; //Drag-and-drop position
}

export type TodoArray = Todo[];

//--Component Props--//
export interface HeaderProps {isDarkMode : boolean;}
export type EmptyStateReason = "empty" | "no-result";
export type SortOption = { value: SortType; label: string };
export type FilterOption = { value: FilterType; label: string };

//--Backendless User --//
export interface BackendlessUser {
    objectId: string;
    email: string;
    name: string;
    "user-token": string;
}

//--Auth Form Values --//
export interface SignInFormValues {
    email: string;
    password: string;
}

export interface SignUpFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// ============================================================================
// AUTHENTICATION STORE
// Manages user session, login status, and authentication functions.
// ============================================================================

export interface AuthState {
    /** The currently logged-in user's data. Null when logged out. */
    user: BackendlessUser | null;
    /** The unique security token for the active session. Null when logged out. */
    userToken: string | null;
    /** True if a user is currently logged in, false otherwise. */
    isLoggedIn: boolean;
    /** True if the app is waiting for the server (e.g., verifying a password). */
    isLoading: boolean;
    /** Holds any error messages from failed login/signup attempts. */
    error: string | null;
}

export interface AuthActions {
    /** Logs the user into their account. */
    signIn: (email: string, password: string) => Promise<void>;
    /** creates a new account for the user. Returns true if successful. */
    signUp: (name: string, email: string, password: string) => Promise<boolean>;
    /** Ends the user's session and logs them out. */
    logout: () => Promise<void>;
    /** Reconnects the user if they were already logged in previously. */
    restoreSession: () => Promise<void>;
    /** Clears any existing error messages from the screen. */
    clearError: () => void;
}

/** Combines the state (data) and actions (functions) together into one auth store. */
export type AuthStore = AuthState & AuthActions;

/**
 * TodoStore defines the global state structure managed by Zustand.
 * It contains both application data (state) and the functions to modify it (actions).
 */
export type TodoStore = {
  // ============================================================================
  // APPLICATION STATE
  // ============================================================================

  /** Current theme preference (US-01: true = dark mode, false = light mode). */
  isDarkMode: ThemeType;

  /** Main collection of all user tasks. */
  todos: TodoArray;

  /** Controlled value for the "create new task" input field. */
  newInput: string;

  /** Controlled value for the search bar input. */
  searchInput: string;

  /** Current sorting strategy applied to the list (default is "manual"). */
  sort: SortType;

  /** Current view filter applied to the list (All, Active, or Completed; US-11). */
  filter: FilterType;

  /** True when the store is fetching initial data. */
  isLoading: boolean;

  /** True when the store is syncing data with the backend (updating, adding, deleting). */
  isSyncing: boolean;

  /** Stores any error message that occurs during backend operations. */
  error: string | null;

  // ============================================================================
  // ACTIONS / MUTATIONS
  // ============================================================================

  // --- UI & Preferences ---

  /** Toggles the global theme preference (US-01). */
  toggleTheme: () => void;

  /** Updates the "create new task" input field state. */
  setNewInput: (value: string) => void;

  /** Updates the search text state to filter visible tasks. */
  setSearchInput: (value: string) => void;

  /** Updates the sorting strategy (US-04). */
  setSort: (sort: SortType) => void;

  /** Updates the view filter to show specific task statuses (US-11). */
  setFilter: (filter: FilterType) => void;

  // --- Todo CRUD Operations ---

  /** Creates a new task using the current `newInput` state (US-02). */
  addTodo: () => Promise<void>;

  /** Toggles a specific task's `completed` status (US-06). */
  toggleTodo: (objectId: string) => Promise<void>;

  /** Saves changes after editing a task's text inline (US-07). */
  updateTodo: (objectId: string, text: string) => Promise<void>;

  /** Permanently deletes a single task from the list (US-08). */
  removeTodo: (objectId: string) => Promise<void>;

  /** Clears all tasks currently marked as completed (US-12). */
  clearCompleted: () => Promise<void>;

  // --- Drag & Drop ---

  /**
   * Handles reordering tasks when a drag-and-drop operation completes.
   * Utilizes @dnd-kit/sortable to move the item, reindexes the `manual_index`
   * for all affected tasks, and forces the sorting strategy to "manual".
   *
   * @param activeId - ID of the task being dragged.
   * @param overId - ID of the location where it was dropped (US-09 / US-04d).
   */
  reorderTodos: (activeId: string, overId: string) => Promise<void>;

  /** Fetches initial todos from backend for a specific user. */
  fetchTodos: (ownerId: string) => Promise<void>;

  /** Clears all todos locally (typically used on logout). */
  clearTodos: () => void;
};

