import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  CreateTodoSchema,
  ErrorSchema,
  IdParam,
  TodoSchema,
  UpdateTodoSchema,
} from '@/shared/schemas';
import { todoService } from './service';

const app = new OpenAPIHono();

// List all todos
app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Todos'],
    summary: 'List all todos',
    responses: {
      200: {
        description: 'Success',
        content: { 'application/json': { schema: z.array(TodoSchema) } },
      },
    },
  }),
  async (c) => {
    const todos = await todoService.list();
    return c.json(todos, 200);
  }
);

// Get a todo by id
app.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Todos'],
    summary: 'Get todo by ID',
    request: { params: IdParam },
    responses: {
      200: {
        description: 'Success',
        content: { 'application/json': { schema: TodoSchema } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const todo = await todoService.getById(id);

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(todo, 200);
  }
);

// Create a new todo
app.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['Todos'],
    summary: 'Create a todo',
    request: {
      body: { content: { 'application/json': { schema: CreateTodoSchema } } },
    },
    responses: {
      201: {
        description: 'Created',
        content: { 'application/json': { schema: TodoSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    const todo = await todoService.create(body);
    return c.json(todo, 201);
  }
);

// Update a todo
app.openapi(
  createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Todos'],
    summary: 'Update a todo',
    request: {
      params: IdParam,
      body: { content: { 'application/json': { schema: UpdateTodoSchema } } },
    },
    responses: {
      200: {
        description: 'Updated',
        content: { 'application/json': { schema: TodoSchema } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const todo = await todoService.update(id, body);

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(todo, 200);
  }
);

// Delete todo by id
app.openapi(
  createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Todos'],
    summary: 'Delete a todo',
    request: { params: IdParam },
    responses: {
      204: { description: 'Deleted' },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const deleted = await todoService.delete(id);

    if (!deleted) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.body(null, 204);
  }
);

export default app;
