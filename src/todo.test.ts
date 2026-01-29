import { test, expect, beforeEach, afterEach } from "bun:test";
import { createTodo, completeTodo, type Todo } from "./todo.ts";
import { addTodo, listTodos, markDone, removeTodo, saveTodos } from "./store.ts";
import { unlink } from "node:fs/promises";

const TEST_DATA_FILE = "./todos-test.json";
process.env.TODO_DATA_FILE = TEST_DATA_FILE;

async function cleanupTestFile() {
  try {
    await unlink(TEST_DATA_FILE);
  } catch {
    /* intentionally empty */
  }
}

beforeEach(async () => {
  await cleanupTestFile();
});

afterEach(async () => {
  await cleanupTestFile();
});

test("createTodo creates a todo with correct properties", () => {
  const todo = createTodo(1, "Test task");

  expect(todo.id).toBe(1);
  expect(todo.title).toBe("Test task");
  expect(todo.completed).toBe(false);
  expect(todo.createdAt).toBeDefined();
});

test("completeTodo marks todo as completed", () => {
  const todo = createTodo(1, "Test task");
  const completed = completeTodo(todo);

  expect(completed.completed).toBe(true);
  expect(completed.id).toBe(todo.id);
  expect(completed.title).toBe(todo.title);
});

test("addTodo adds a new todo and persists it", async () => {
  const todo = await addTodo("Buy groceries");

  expect(todo.id).toBe(1);
  expect(todo.title).toBe("Buy groceries");
  expect(todo.completed).toBe(false);

  const todos = await listTodos();
  expect(todos).toHaveLength(1);
  expect(todos[0]?.title).toBe("Buy groceries");
});

test("addTodo increments ID correctly", async () => {
  await addTodo("First task");
  const second = await addTodo("Second task");

  expect(second.id).toBe(2);
});

test("listTodos returns empty array when no todos", async () => {
  const todos = await listTodos();
  expect(todos).toEqual([]);
});

test("listTodos returns all todos", async () => {
  await addTodo("Task 1");
  await addTodo("Task 2");
  await addTodo("Task 3");

  const todos = await listTodos();
  expect(todos).toHaveLength(3);
});

test("markDone marks a todo as completed", async () => {
  await addTodo("Test task");
  const done = await markDone(1);

  expect(done).not.toBeNull();
  expect(done?.completed).toBe(true);

  const todos = await listTodos();
  expect(todos[0]?.completed).toBe(true);
});

test("markDone returns null for non-existent todo", async () => {
  const result = await markDone(999);
  expect(result).toBeNull();
});

test("removeTodo removes a todo", async () => {
  await addTodo("To be removed");
  const success = await removeTodo(1);

  expect(success).toBe(true);

  const todos = await listTodos();
  expect(todos).toHaveLength(0);
});

test("removeTodo returns false for non-existent todo", async () => {
  const result = await removeTodo(999);
  expect(result).toBe(false);
});
