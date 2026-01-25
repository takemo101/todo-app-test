import { addTodo, listTodos, markDone, removeTodo } from "./store.ts";

const [command, ...args] = Bun.argv.slice(2);

async function main() {
  switch (command) {
    case "add": {
      const title = args.join(" ");
      if (!title) {
        console.error("Error: Title is required");
        process.exit(1);
      }
      const todo = await addTodo(title);
      console.log(`Added: [${todo.id}] ${todo.title}`);
      break;
    }

    case "list": {
      const todos = await listTodos();
      if (todos.length === 0) {
        console.log("No todos found.");
        return;
      }
      for (const todo of todos) {
        const status = todo.completed ? "[x]" : "[ ]";
        console.log(`${status} [${todo.id}] ${todo.title}`);
      }
      break;
    }

    case "done": {
      const id = parseInt(args[0] ?? "", 10);
      if (isNaN(id)) {
        console.error("Error: Valid ID is required");
        process.exit(1);
      }
      const todo = await markDone(id);
      if (!todo) {
        console.error(`Error: Todo with ID ${id} not found`);
        process.exit(1);
      }
      console.log(`Completed: [${todo.id}] ${todo.title}`);
      break;
    }

    case "remove": {
      const id = parseInt(args[0] ?? "", 10);
      if (isNaN(id)) {
        console.error("Error: Valid ID is required");
        process.exit(1);
      }
      const success = await removeTodo(id);
      if (!success) {
        console.error(`Error: Todo with ID ${id} not found`);
        process.exit(1);
      }
      console.log(`Removed todo with ID ${id}`);
      break;
    }

    default:
      console.log(`Usage:
  bun run src/cli.ts add <title>   - Add a new todo
  bun run src/cli.ts list          - List all todos
  bun run src/cli.ts done <id>     - Mark todo as completed
  bun run src/cli.ts remove <id>   - Remove a todo`);
      break;
  }
}

main();
