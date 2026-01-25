import type { Todo } from "./todo.ts";
import { createTodo } from "./todo.ts";

const DATA_FILE = "./todos.json";

export async function loadTodos(): Promise<Todo[]> {
  const file = Bun.file(DATA_FILE);
  if (!(await file.exists())) {
    return [];
  }
  const content = await file.text();
  return JSON.parse(content) as Todo[];
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await Bun.write(DATA_FILE, JSON.stringify(todos, null, 2));
}

export async function addTodo(title: string): Promise<Todo> {
  const todos = await loadTodos();
  const maxId = todos.reduce((max, t) => Math.max(max, t.id), 0);
  const newTodo = createTodo(maxId + 1, title);
  todos.push(newTodo);
  await saveTodos(todos);
  return newTodo;
}

export async function listTodos(): Promise<Todo[]> {
  return loadTodos();
}

export async function markDone(id: number): Promise<Todo | null> {
  const todos = await loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return null;
  }
  todo.completed = true;
  await saveTodos(todos);
  return todo;
}

export async function removeTodo(id: number): Promise<boolean> {
  const todos = await loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    return false;
  }
  todos.splice(index, 1);
  await saveTodos(todos);
  return true;
}
