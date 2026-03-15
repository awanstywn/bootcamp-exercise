# Code Documentation - Todo App

## Project Overview

This is a fully responsive Todo application built with React, TypeScript, Vite, and drag-and-drop functionality. The app supports dark/light theming and works seamlessly on all device sizes.

---

## 📁 File Structure

### Components (`src/components/`)

#### **Header.tsx**

- **Purpose**: Displays the "TODO" title and theme toggle button
- **Props**:
  - `isDarkMode` (boolean): Current theme mode
  - `toggleTheme` (function): Callback to switch themes
- **Features**:
  - Responsive title with fluid font sizing using `clamp()`
  - Sun/Moon icon toggle for theme switching
  - Auto-scales on different screen sizes

#### **ToDoInput.tsx**

- **Purpose**: Input field for creating new todo items
- **Props**:
  - `isDarkMode` (boolean): Current theme
  - `onAddTodo` (function): Callback when item is added
- **Features**:
  - Submit on Enter key press
  - Trims whitespace before adding
  - Empty circle checkbox (visual only)
  - Responsive text sizing with `clamp()`
- **State**:
  - `inputValue`: Current text being typed

#### **ToDoItem.tsx**

- **Purpose**: Individual todo item with checkbox, text, and delete button
- **Props**:
  - `id` (string): Unique identifier for drag-drop
  - `isDarkMode` (boolean): Current theme
  - `text` (string): Todo description
  - `completed` (boolean): Completion status
  - `onToggle` (function): Called when checkbox clicked
  - `onDelete` (function): Called when delete button clicked
  - `isFirst` (boolean): For top border-radius styling
  - `isLast` (boolean): For bottom border-radius styling
- **Features**:
  - Checkbox with gradient fill when completed
  - Strikethrough text when completed
  - Drag-and-drop support via `@dnd-kit`
  - Hover gradients on uncompleted checkboxes
  - Delete button with opacity transitions
  - Opacity reduces to 0.5 while dragging
- **Drag-Drop**: Uses `useSortable()` hook from @dnd-kit library

#### **ToDoList.tsx** (Reference Component - Not Currently Used)

- **Purpose**: Static list template for displaying todo items
- **Note**: Main app uses dynamic rendering in App.tsx instead

#### **ToDoFilters.tsx** (Reference Component - Not Currently Used)

- **Purpose**: Template component for filter controls
- **Note**: Filtering logic integrated directly into App.tsx

---

## 🎯 Main App Component (`src/App.tsx`)

### Architecture

- **React Hooks**: useState for state, useEffect for theme syncing
- **Drag-Drop**: @dnd-kit library for reordering
- **Styling**: Inline styles + Tailwind CSS for responsiveness
- **State Management**: Local component state (no Redux/Context)

### State Management

```typescript
// Current theme mode (true = dark, false = light)
const [isDarkMode, setIsDarkMode] = useState(true);

// Array of all todos with id, text, and completion status
const [todos, setTodos] = useState<Todo[]>([...]);

// Current active filter view (all/active/completed)
const [filter, setFilter] = useState<FilterType>("all");
```

### Core Functions

#### **toggleTheme()**

- Switches between dark and light modes
- Updates body element with dark-mode/light-mode classes
- Used by Header component theme toggle button

#### **addTodo(text)**

- Creates new todo with unique timestamp ID
- Adds to todos array
- Called by ToDoInput component onEnter

#### **toggleTodo(id)**

- Toggles the `completed` status of a todo
- Called by ToDoItem checkbox click

#### **deleteTodo(id)**

- Removes todo from array by ID
- Called by ToDoItem delete button

#### **clearCompleted()**

- Removes all todos where `completed === true`
- Called by "Clear Completed" button

#### **handleDragEnd(event)**

- Handles @dnd-kit drag-and-drop events
- Reorders todos array based on drag operation
- Maintains all todo data during reordering

#### **getFilteredTodos()**

- Returns todos based on current filter:
  - "all": All todos
  - "active": Todos with `completed === false`
  - "completed": Todos with `completed === true`

#### **activeItemsCount**

- Calculated value: count of todos with `completed === false`
- Displayed in filter bar as "X items left"

### Theme Management

```typescript
useEffect(() => {
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  }
}, [isDarkMode]); // Re-runs when isDarkMode changes
```

This syncs the theme class to the body element so CSS media queries and color schemes update globally.

### Layout Structure

1. **Banner Area** (Background with gradient overlay)
   - Full screen width on mobile via `translateX(-50%)`
   - Contains background image
   - Z-index: 0 (behind content)

2. **Content Area** (Z-index: 10)
   - Header with TODO title & theme toggle
   - ToDoInput field
   - Todo list container with drag-drop
   - Filter bar with controls
   - Drag hint text

### Color Schemes

**Dark Mode (`isDarkMode === true`)**

- Background: `#171823` (deep blue-black)
- Container: `#25273D` (darker blue)
- Text: `#C8CBE7` (light gray)
- Borders: `#393A5A` (medium gray)

**Light Mode (`isDarkMode === false`)**

- Background: `#FFFFFF` (white)
- Container: `#FFFFFF` (white)
- Text: `#494C6B` (dark gray)
- Borders: `#E0E0E0` (light gray)

---

## 🎨 Styling (`src/App.css`)

### Global Setup

- **Font**: Josefin Sans from Google Fonts
- **Root**: Full viewport height, 0 margin/padding
- **Responsive**: Uses CSS media queries and `clamp()` for fluid sizing

### Responsive Breakpoints

| Screen Size | Use Case                                           |
| ----------- | -------------------------------------------------- |
| **768px**   | Tablet/Mobile transition - switches filter layout  |
| **640px**   | Small tablet/landscape mobile - reduce header size |
| **480px**   | Portrait mobile - further reduced sizes            |
| **360px**   | Small phone screens - minimal sizes                |

### Key CSS Classes

#### **.todo-filter-bar-container**

- Desktop layout: shown by default
- Single row: counter | buttons | clear completed
- Hidden on mobile (768px and below)

#### **.todo-filter-bar-mobile**

- Mobile layout: hidden by default
- Two rows: row 1 (counter + clear), row 2 (filter buttons centered)
- Shown on mobile (768px and below)

#### **.banner-area**

- Uses `100vw` (full viewport width) on mobile
- Uses `left: 50% + transform: translateX(-50%)` to center within viewport
- Stretches beyond container padding

#### **Font Sizing with clamp()**

```css
/* Responsive font that scales between min and max */
font-size: clamp(min, preferred, max);

/* Examples used */
clamp(28px, 8vw, 40px)    /* Header title */
clamp(12px, 2.5vw, 14px)  /* Filter text */
clamp(14px, 4vw, 18px)    /* Input & items */
clamp(24px, 7vw, 36px)    /* Small screen title */
```

### Mobile Optimizations (768px and below)

1. **Filter Layout Switch**
   - Desktop: flex row with space-between
   - Mobile: two flex columns with divider

2. **Banner Full Width**
   - Extends to `100vw` instead of container width
   - Centers with `left: 50% + translateX(-50%)`

3. **Body Background**
   - Classes toggle: `body.dark-mode` / `body.light-mode`
   - Ensures color coverage on full mobile viewport

4. **Spacing Adjustments**
   - Reduced padding/margins
   - Adjusted percentages for mobile layout
   - Maintains respons ivity with padding-based spacing

---

## 📦 Dependencies

### Core

- **React**: UI library
- **TypeScript**: Type safety

### Build & Dev

- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **@tailwindcss/vite**: Vite plugin for Tailwind

### Functionality

- **@dnd-kit/core**: Drag-and-drop foundation
- **@dnd-kit/sortable**: Sortable lists for reordering
- **@dnd-kit/utilities**: Helper utilities for drag-drop

---

## 🚀 How It Works - User Actions

### Adding a Todo

1. User types in ToDoInput field
2. Presses Enter key
3. `handleKeyDown` triggers `onAddTodo`
4. `addTodo()` creates new Todo with unique ID
5. New todo added to `todos` array via `setTodos()`
6. Component re-renders with new item

### Toggling Completion

1. User clicks checkbox on ToDoItem
2. `onToggle` callback called
3. `toggleTodo(id)` maps over todos array
4. Toggles `completed` boolean for matching ID
5. Component re-renders with updated styles (strikethrough, gradient)

### Dragging to Reorder

1. User clicks and drags a todo item
2. @dnd-kit `useSortable()` hook tracks movement
3. When dropped, `onDragEnd` fires
4. `handleDragEnd()` finds old and new indices
5. `setTodos()` reorders array
6. Component re-renders in new order

### Deleting a Todo

1. User clicks X button on ToDoItem
2. `onDelete` callback called
3. `deleteTodo(id)` filters out matching todo
4. Component re-renders without deleted item

### Filtering

1. User clicks filter button (All/Active/Completed)
2. `setFilter()` updates filter state
3. `getFilteredTodos()` returns filtered array based on `completed` status
4. Component re-renders with filtered list only

### Theme Toggle

1. User clicks sun/moon icon in Header
2. `toggleTheme()` flips `isDarkMode` state
3. `useEffect` runs and adds/removes body classes
4. CSS color schemes update globally
5. All components inherit new colors

---

## 💡 Key Concepts

### Responsive Typography

Uses CSS `clamp()` instead of fixed pixel sizes or percentage-only sizes. This allows smooth scaling across all screen sizes without media query jumps.

```css
font-size: clamp(14px, 4vw, 18px);
/* Minimum: 14px, Preferred: 4% of viewport width, Maximum: 18px */
```

### Drag-and-Drop with @dnd-kit

- `DndContext`: Wrapper providing drag-drop context
- `SortableContext`: Enables reordering
- `useSortable()`: Hook used by each item for drag state
- `closestCenter`: Collision detection algorithm

### Mobile-First Design

- Desktop styles are default
- Media queries override for smaller screens
- Body element classes toggle for dark/light mode
- Full viewport width (`100vw`) used for banner on mobile

### State Management Pattern

- Single component App.tsx holds all state
- Child components are controlled via props
- Callbacks pass data back up to parent
- Re-renders only when state changes

---

## 🔧 Development Tips

### Adding a New Feature

1. Define state in App.tsx
2. Create function to manage state
3. Pass function + data via props to component
4. Component calls function on user action
5. Add styling in App.css with media queries

### Testing Responsive Design

- Use browser DevTools device emulation
- Test breakpoints: 768px, 640px, 480px, 360px
- Check both dark and light modes
- Test drag-drop on touch devices

### Customizing Themes

- Change color values in App.tsx (gradientColors, backgroundColor)
- Update CSS color schemes in App.css
- Create new background images in assets/

---

## 📋 Summary

**This todo app demonstrates**:
✅ React hooks & component composition  
✅ TypeScript for type safety  
✅ Drag-and-drop with @dnd-kit  
✅ Dark/Light theme system  
✅ Responsive design with clamp() & media queries  
✅ State management without external libraries  
✅ Event handling & filtering  
✅ CSS styling best practices

**Team Guidelines**:

- Keep components small and focused
- Use props for configuration
- Manage state at App.tsx level
- Add comments to complex logic
- Test on multiple screen sizes
- Use semantic HTML structure
