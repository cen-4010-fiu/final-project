import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { todos } from '@/shared/db/schema';

// Use drizzle-zod to get database types
const baseSchema = createSelectSchema(todos);
const baseInsertSchema = createInsertSchema(todos);

// Make sure our base model is reflected in the docs
export const TodoSchema = baseSchema.openapi('Todo');

/*
 * For create and update, we can omit types we don't need to validate
 */
export const CreateTodoSchema = baseInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    completed: true,
  })
  .openapi('CreateTodo');

export const UpdateTodoSchema = baseInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi('UpdateTodo');
