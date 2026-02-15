/**
 * User Service
 *
 * Business logic for user account management.
 * Handles password hashing and database operations.
 */

import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, users } from '@/shared/db';
import type { CreateUserSchema, UpdateUserSchema } from '@/shared/schemas';

type CreateInput = z.infer<typeof CreateUserSchema>;
type UpdateInput = z.infer<typeof UpdateUserSchema>;

const HASH_CONFIG = { algorithm: 'bcrypt', cost: 10 } as const;

/**
 * Hashes a plaintext password using bcrypt
 * @param password - Plaintext password
 * @returns Hashed password string
 */
async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, HASH_CONFIG);
}

export const userService = {
  /**
   * Retrieves a user by their username
   * @param username - Unique username to search for
   * @returns User object or undefined if not found
   */
  async getByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user;
  },

  /**
   * Creates a new user account
   * @param data - User registration data
   * @returns Created user object
   */
  async create(data: CreateInput) {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: await hashPassword(data.password),
      })
      .returning();

    return user;
  },

  /**
   * Updates an existing user's profile
   * @param username - Username of account to update
   * @param data - Fields to update
   * @returns Updated user object or undefined if not found
   */
  async update(username: string, data: UpdateInput) {
    const updateData = { ...data };

    // If no fields to update, just return existing user
    if (Object.keys(data).length === 0) {
      return this.getByUsername(username);
    }

    // Hash password if given
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.username, username))
      .returning();

    return user;
  },

  /**
   * Checks if a username is already registered
   * @param username - Username to check
   * @returns True if username exists
   */
  async usernameExists(username: string) {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return !!row;
  },
};
