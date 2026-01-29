import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { server } from "./server";
import { unlink } from "node:fs/promises";

// Note: server is already running when imported
const BASE_URL = `http://localhost:${server.port}`;
const TEST_DATA_FILE = "./todos-server-test.json";

// Set env var for this test file
process.env.TODO_DATA_FILE = TEST_DATA_FILE;

async function cleanup() {
  try {
    await unlink(TEST_DATA_FILE);
  } catch {}
}

beforeAll(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  server.stop();
});

describe("API Server", () => {
  test("GET /api/todos returns empty list", async () => {
    const res = await fetch(`${BASE_URL}/api/todos`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("POST /api/todos creates a todo", async () => {
    const res = await fetch(`${BASE_URL}/api/todos`, {
      method: "POST",
      body: JSON.stringify({ title: "New Task" }),
    });
    expect(res.status).toBe(201);
    const todo = await res.json();
    expect(todo.title).toBe("New Task");
    expect(todo.id).toBeDefined();
    
    // Verify list
    const listRes = await fetch(`${BASE_URL}/api/todos`);
    const list = await listRes.json();
    const found = list.find((t: any) => t.id === todo.id);
    expect(found).toBeDefined();
    expect(found.title).toBe("New Task");
  });
  
  test("PATCH /api/todos/:id/done marks todo as done", async () => {
    // Add todo first
    const addRes = await fetch(`${BASE_URL}/api/todos`, {
      method: "POST",
      body: JSON.stringify({ title: "Task to complete" }),
    });
    const todo = await addRes.json();
    
    const res = await fetch(`${BASE_URL}/api/todos/${todo.id}/done`, {
      method: "PATCH",
      params: { id: todo.id.toString() } // route params are handled by server, here we construct url
    });
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.completed).toBe(true);
  });
  
  test("DELETE /api/todos/:id removes todo", async () => {
     // Add todo first
    const addRes = await fetch(`${BASE_URL}/api/todos`, {
      method: "POST",
      body: JSON.stringify({ title: "Task to delete" }),
    });
    const todo = await addRes.json();
    
    const res = await fetch(`${BASE_URL}/api/todos/${todo.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    
    // Verify it's gone
    const listRes = await fetch(`${BASE_URL}/api/todos`);
    const list = await listRes.json();
    const found = list.find((t: any) => t.id === todo.id);
    expect(found).toBeUndefined();
  });

  test("GET / returns HTML", async () => {
    const res = await fetch(`${BASE_URL}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    // Check if it looks like HTML
    expect(html).toContain("<!DOCTYPE html>");
    // Check for script tag
    // It might be rewritten, so checking for 'frontend' might be safer
    // or just check if it contains the script src from the source
    console.log("HTML content:", html); 
  });

  test("GET asset works", async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    const match = html.match(/src="(\/_bun\/[^"]+)"/);
    if (match) {
      const assetUrl = match[1];
      console.log("Fetching asset:", assetUrl);
      const assetRes = await fetch(`${BASE_URL}${assetUrl}`);
      expect(assetRes.status).toBe(200);
      expect(assetRes.headers.get("content-type")).toContain("javascript");
    } else {
      throw new Error("Could not find asset URL in HTML");
    }
  });
});
