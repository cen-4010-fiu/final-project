import { eq } from "drizzle-orm";
import { db, todos } from "@/shared/db";
import type { z } from "zod";
import type { CreateTodoSchema, UpdateTodoSchema } from "@/shared/schemas";

type CreateInput = z.infer<typeof CreateTodoSchema>;
type UpdateInput = z.infer<typeof UpdateTodoSchema>;

export const todoService = {
  async list() {
    // Get all todos, sort by creation date
    return db.query.todos.findMany({
      orderBy: (todos, { desc }) => desc(todos.createdAt),
    });
  },

  async getById(id: string) {
    // Get a particular todo item by its id
    return db.query.todos.findFirst({
      where: eq(todos.id, id),
    });
  },

  async create(data: CreateInput) {
    // Create a new todo item
    const [todo] = await db.insert(todos).values(data).returning();
    return todo;
  },

  async update(id: string, data: UpdateInput) {
    // Update a particular todo item if it exists
    const [todo] = await db
      .update(todos)
      .set(data)
      .where(eq(todos.id, id))
      .returning();
    return todo;
  },

  async delete(id: string) {
    // Delete a particular todo item
    const result = await db.delete(todos).where(eq(todos.id, id)).returning();
    return result.length > 0;
  },
};
