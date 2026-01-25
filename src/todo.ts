export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export function createTodo(id: number, title: string): Todo {
  return {
    id,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function completeTodo(todo: Todo): Todo {
  return {
    ...todo,
    completed: true,
  };
}
