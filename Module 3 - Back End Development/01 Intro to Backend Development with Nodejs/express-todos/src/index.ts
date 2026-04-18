import express from "express";
import fs from "fs/promises";

// Create Express app instance
const app = express();

// Server port
const PORT = 3000;

// Parse incoming JSON request bodies
app.use(express.json());

// Path to todos data file (relative to project root)
const TODOS_FILE_PATH = "./todos.json";

// Todo data structure
interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

// Read todos from JSON file
// Returns empty array if file doesn't exist or has errors
const readTodos = async (): Promise<Todo[]> => {
  try {
    const data = await fs.readFile(TODOS_FILE_PATH, "utf-8");
    return JSON.parse(data) as Todo[];
  } catch (error) {
    console.error("Error reading todos:", error);
    return [];
  }
};

// Write todos to JSON file
// Overwrites entire file with formatted JSON
const writeTodos = async (todos: Todo[]): Promise<void> => {
  try {
    await fs.writeFile(TODOS_FILE_PATH, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error("Error writing todos:", error);
  }
};

// GET /todos - Retrieve all todos
app.get("/todos", async (req: express.Request, res: express.Response) => {
  try {
    const todos = await readTodos();
    if (!todos) {
      return res.status(500).json({ error: "Failed to retrieve todos" });
    }
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error in GET /todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /todos/:id - Retrieve a specific todo by ID
app.get("/todos/:id", async (req: express.Request, res: express.Response) => {
  try {
    const idParam = req.params.id;
    // Validate ID exists and is a single string (not array)
    if (!idParam || Array.isArray(idParam)) {
      return res
        .status(400)
        .json({ error: "ID parameter is required and must be a single value" });
    }
    // Convert ID to number and validate it's a valid number
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID must be a valid number" });
    }
    const todos = await readTodos();
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error in GET /todos/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /todos - Create a new todo
app.post("/todos", async (req: express.Request, res: express.Response) => {
  try {
    const { task } = req.body;
    // Validate task is not empty
    if (!task) {
      return res.status(400).json({ error: "Task is required" });
    }
    const todos = await readTodos();
    // Generate new ID: last todo's ID + 1, or 1 if empty
    const lastTodo = todos.length > 0 ? todos[todos.length - 1] : null;
    const newId = lastTodo ? lastTodo.id + 1 : 1;
    // Create and add new todo
    const newTodo: Todo = {
      id: newId,
      task,
      completed: false,
    };
    todos.push(newTodo);
    await writeTodos(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error in POST /todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /todos/:id - Update entire todo (replace all fields)
app.put("/todos/:id", async (req: express.Request, res: express.Response) => {
  try {
    const idParam = req.params.id;
    // Validate ID parameter
    if (!idParam || Array.isArray(idParam)) {
      return res
        .status(400)
        .json({ error: "ID parameter is required and must be a single value" });
    }
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID must be a valid number" });
    }
    const { task, completed } = req.body;
    const todos = await readTodos();
    const todoIndex = todos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }
    const todo = todos[todoIndex];
    // Validate todo was retrieved
    if (!todo) {
      return res.status(500).json({ error: "Failed to retrieve todo" });
    }
    // Update fields only if provided
    if (task !== undefined) {
      todo.task = task;
    }
    if (completed !== undefined) {
      todo.completed = completed;
    }
    await writeTodos(todos);
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error in PUT /todos/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /todos/:id - Partially update todo (update specific fields)
app.patch("/todos/:id", async (req: express.Request, res: express.Response) => {
  try {
    const idParam = req.params.id;
    // Validate ID parameter
    if (!idParam || Array.isArray(idParam)) {
      return res
        .status(400)
        .json({ error: "ID parameter is required and must be a single value" });
    }
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID must be a valid number" });
    }
    const { task, completed } = req.body;
    const todos = await readTodos();
    const todoIndex = todos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }
    const todo = todos[todoIndex];
    // Validate todo was retrieved
    if (!todo) {
      return res.status(500).json({ error: "Failed to retrieve todo" });
    }
    // Update only provided fields
    if (task !== undefined) {
      todo.task = task;
    }
    if (completed !== undefined) {
      todo.completed = completed;
    }
    await writeTodos(todos);
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error in PATCH /todos/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /todos/:id - Delete a todo by ID
app.delete(
  "/todos/:id",
  async (req: express.Request, res: express.Response) => {
    try {
      const idParam = req.params.id;
      // Validate ID parameter
      if (!idParam || Array.isArray(idParam)) {
        return res.status(400).json({
          error: "ID parameter is required and must be a single value",
        });
      }
      const id = parseInt(idParam);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID must be a valid number" });
      }
      const todos = await readTodos();
      const todoIndex = todos.findIndex((t) => t.id === id);
      if (todoIndex === -1) {
        return res.status(404).json({ error: "Todo not found" });
      }
      // Remove todo and return deleted item
      const deletedTodo = todos.splice(todoIndex, 1)[0];
      if (!deletedTodo) {
        return res.status(500).json({ error: "Failed to delete todo" });
      }
      await writeTodos(todos);
      res.status(200).json(deletedTodo);
    } catch (error) {
      console.error("Error in DELETE /todos/:id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Start server and listen on PORT
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
