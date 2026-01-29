import type { ServerWebSocket } from "bun";
import { addTodo, listTodos, markDone, removeTodo, loadTodos, saveTodos } from "./store.ts";
import type { Todo } from "./todo.ts";
import index from "../public/index.html";

type WebSocketData = { id: string };

interface RouteRequest extends Request {
  params: { id: string };
}

const clients = new Set<ServerWebSocket<WebSocketData>>();

function broadcast(message: { type: string; payload: unknown }) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    client.send(data);
  }
}

async function reorderTodos(orderedIds: number[]): Promise<Todo[]> {
  const todos = await loadTodos();
  const todoMap = new Map(todos.map(t => [t.id, t]));
  const reordered: Todo[] = [];
  
  for (const id of orderedIds) {
    const todo = todoMap.get(id);
    if (todo) {
      reordered.push(todo);
      todoMap.delete(id);
    }
  }
  
  for (const todo of todoMap.values()) {
    reordered.push(todo);
  }
  
  await saveTodos(reordered);
  return reordered;
}

const server = Bun.serve<WebSocketData>({
  port: parseInt(process.env.PORT || "3000"),
  
  routes: {
    "/": index,
    
    "/api/todos": {
      async GET() {
        const todos = await listTodos();
        return Response.json(todos);
      },
      
      async POST(req: Request) {
        const body = await req.json() as { title?: string };
        if (!body.title || typeof body.title !== "string") {
          return Response.json({ error: "Title is required" }, { status: 400 });
        }
        const todo = await addTodo(body.title);
        broadcast({ type: "TODO_ADDED", payload: todo });
        return Response.json(todo, { status: 201 });
      },
    },
    
    "/api/todos/reorder": {
      async POST(req: Request) {
        const body = await req.json() as { orderedIds?: number[] };
        if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
          return Response.json({ error: "orderedIds array is required" }, { status: 400 });
        }
        const todos = await reorderTodos(body.orderedIds);
        broadcast({ type: "TODOS_REORDERED", payload: todos });
        return Response.json(todos);
      },
    },
    
    "/api/todos/:id/done": {
      async PATCH(req: RouteRequest) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return Response.json({ error: "Invalid ID" }, { status: 400 });
        }
        const todo = await markDone(id);
        if (!todo) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }
        broadcast({ type: "TODO_UPDATED", payload: todo });
        return Response.json(todo);
      },
    },
    
    "/api/todos/:id": {
      async DELETE(req: RouteRequest) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return Response.json({ error: "Invalid ID" }, { status: 400 });
        }
        const success = await removeTodo(id);
        if (!success) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }
        broadcast({ type: "TODO_DELETED", payload: { id } });
        return Response.json({ success: true });
      },
    },
  },
  
  websocket: {
    open(ws) {
      clients.add(ws);
      console.log(`WebSocket connected. Total clients: ${clients.size}`);
    },
    
    message(_ws, message) {
      console.log(`Received: ${message}`);
    },
    
    close(ws) {
      clients.delete(ws);
      console.log(`WebSocket disconnected. Total clients: ${clients.size}`);
    },
  },
  
  fetch(req, server) {
    const url = new URL(req.url);
    
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req, {
        data: { id: crypto.randomUUID() },
      });
      if (upgraded) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    
    return new Response("Not Found", { status: 404 });
  },
  
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at http://localhost:${server.port}`);

export { server };
