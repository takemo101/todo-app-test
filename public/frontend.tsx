import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

type FilterType = "all" | "active" | "completed";

interface WebSocketMessage {
  type: "TODO_ADDED" | "TODO_UPDATED" | "TODO_DELETED" | "TODOS_REORDERED";
  payload: Todo | { id: number } | Todo[];
}

function AddTodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 text-lg font-light"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 disabled:shadow-none disabled:cursor-not-allowed active:scale-95"
        >
          Add
        </button>
      </div>
    </form>
  );
}

function FilterBar({
  filter,
  onFilterChange,
  counts,
}: {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: { all: number; active: number; completed: number };
}) {
  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            filter === key
              ? "text-white"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          {filter === key && (
            <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg animate-fade-in" />
          )}
          <span className="relative flex items-center gap-2">
            {label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                filter === key
                  ? "bg-white/20"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              {counts[key]}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`group relative flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl border transition-all duration-300 animate-slide-in ${
        isDragging
          ? "opacity-50 scale-95 border-violet-500/50"
          : "opacity-100 scale-100 border-slate-200/50 dark:border-slate-700/50"
      } ${
        isDragOver
          ? "border-t-4 border-t-violet-500"
          : ""
      } hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/20`}
    >
      <div className="flex items-center justify-center w-5 h-5 cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
      </div>

      <button
        onClick={onToggle}
        className={`relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
          todo.completed
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent"
            : "border-slate-300 dark:border-slate-600 hover:border-violet-500 dark:hover:border-violet-500"
        }`}
      >
        {todo.completed && (
          <svg
            className="absolute inset-0 w-full h-full p-1 text-white animate-check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-lg transition-all duration-300 ${
          todo.completed
            ? "text-slate-400 dark:text-slate-500 line-through"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {todo.title}
      </span>

      <span className="text-xs text-slate-400 dark:text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {new Date(todo.createdAt).toLocaleDateString()}
      </span>

      <button
        onClick={onDelete}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

function TodoList({
  todos,
  onToggle,
  onDelete,
  draggedId,
  setDraggedId,
  onReorder,
}: {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  draggedId: number | null;
  setDraggedId: (id: number | null) => void;
  onReorder: (fromId: number, toId: number) => void;
}) {
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 text-violet-400 dark:text-violet-500"
          >
            <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
            <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
            <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No tasks yet
        </h3>
        <p className="text-slate-500 dark:text-slate-500">
          Add your first todo to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 todo-list max-h-[60vh] overflow-y-auto pr-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => onToggle(todo.id)}
          onDelete={() => onDelete(todo.id)}
          onDragStart={() => setDraggedId(todo.id)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverId(todo.id);
          }}
          onDragEnd={() => {
            setDraggedId(null);
            setDragOverId(null);
          }}
          onDrop={() => {
            if (draggedId !== null && draggedId !== todo.id) {
              onReorder(draggedId, todo.id);
            }
            setDraggedId(null);
            setDragOverId(null);
          }}
          isDragging={draggedId === todo.id}
          isDragOver={dragOverId === todo.id && draggedId !== todo.id}
        />
      ))}
    </div>
  );
}

function DarkModeToggle({
  darkMode,
  onToggle,
}: {
  darkMode: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
    >
      <span
        className={`absolute top-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
          darkMode ? "left-7" : "left-1"
        }`}
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-violet-500"
          >
            <path
              fillRule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-amber-500"
          >
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.591 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          </svg>
        )}
      </span>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin" />
      </div>
      <p className="mt-4 text-slate-500 dark:text-slate-400">Loading tasks...</p>
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? JSON.parse(stored) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("WebSocket message:", message);

      switch (message.type) {
        case "TODO_ADDED": {
          const todo = message.payload as Todo;
          setTodos((prev) => {
            if (prev.some((t) => t.id === todo.id)) return prev;
            return [...prev, todo];
          });
          break;
        }
        case "TODO_UPDATED": {
          const todo = message.payload as Todo;
          setTodos((prev) =>
            prev.map((t) => (t.id === todo.id ? todo : t))
          );
          break;
        }
        case "TODO_DELETED": {
          const { id } = message.payload as { id: number };
          setTodos((prev) => prev.filter((t) => t.id !== id));
          break;
        }
        case "TODOS_REORDERED": {
          const todos = message.payload as Todo[];
          setTodos(todos);
          break;
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected, reconnecting in 3s...");
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      const data = (await response.json()) as Todo[];
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const newTodo = (await response.json()) as Todo;
      setTodos((prev) => [...prev, newTodo]);
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}/done`, {
        method: "PATCH",
      });
      const updatedTodo = (await response.json()) as Todo;
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const reorderTodos = async (fromId: number, toId: number) => {
    const fromIndex = todos.findIndex((t) => t.id === fromId);
    const toIndex = todos.findIndex((t) => t.id === toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const newTodos = [...todos];
    const removed = newTodos.splice(fromIndex, 1)[0];
    if (!removed) return;
    newTodos.splice(toIndex, 0, removed);

    setTodos(newTodos);

    try {
      await fetch("/api/todos/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newTodos.map((t) => t.id) }),
      });
    } catch (error) {
      console.error("Failed to reorder todos:", error);
      fetchTodos();
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5NDgyZjQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 dark:opacity-20" />

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-16">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
              todos
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Stay organized, stay focused
            </p>
          </div>
          <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </header>

        <div className="space-y-8">
          <AddTodoForm onAdd={addTodo} />

          <FilterBar filter={filter} onFilterChange={setFilter} counts={counts} />

          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
            {isLoading ? (
              <LoadingState />
            ) : (
              <TodoList
                todos={filteredTodos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                draggedId={draggedId}
                setDraggedId={setDraggedId}
                onReorder={reorderTodos}
              />
            )}
          </div>

          {!isLoading && todos.length > 0 && (
            <p className="text-center text-sm text-slate-400 dark:text-slate-600">
              {counts.active} {counts.active === 1 ? "item" : "items"} left
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
