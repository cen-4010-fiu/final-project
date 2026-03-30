/**
 * User Service
 *
 * Business logic for user account management.
 * Handles password hashing and database operations.
 */

import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { creditCards, db, users } from '@/shared/db';
import type {
  CreateCreditCardSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from '@/shared/schemas';

type CreateUserType = z.infer<typeof CreateUserSchema>;
type UpdateUserType = z.infer<typeof UpdateUserSchema>;
type CreateCardType = z.infer<typeof CreateCreditCardSchema>;

const HASH_CONFIG = { algorithm: 'bcrypt', cost: 10 } as const;

/**
 * Hashes sensitive card data using bcrypt
 * @param data - Raw card number or CVV
 * @returns Bcrypt hash string
 */
async function hash(data: string): Promise<string> {
  return Bun.password.hash(data, HASH_CONFIG);
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
  async create(data: CreateUserType) {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: await hash(data.password),
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
  async update(username: string, data: UpdateUserType) {
    const updateData = { ...data };

    // If no fields to update, just return existing user
    if (Object.keys(data).length === 0) {
      return this.getByUsername(username);
    }

    // Hash password if given
    if (updateData.password) {
      updateData.password = await hash(updateData.password);
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

/**
 * Credit Card Service
 */
export const creditCardService = {
  /**
   * Retrieves all credit cards for a user by username.
   *
   * @param username - The user's username
   * @returns Array of safe card objects, or null if user not found
   */
  async getByUsername(username: string): Promise<Array<{
    id: string;
    cardholderName: string;
    lastFour: string;
    expiryDate: string;
    createdAt: Date;
    updatedAt: Date;
  }> | null> {
    // Verify user exists and get ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user[0]) return null;

    const cards = await db
      .select({
        id: creditCards.id,
        cardholderName: creditCards.cardholderName,
        lastFour: creditCards.lastFour,
        expiryDate: creditCards.expiryDate,
        createdAt: creditCards.createdAt,
        updatedAt: creditCards.updatedAt,
      })
      .from(creditCards)
      .where(eq(creditCards.userId, user[0].id))
      .orderBy(creditCards.createdAt);

    return cards;
  },

  /**
   * Creates a new credit card for a user.
   * Hashes and stores only last 4 digits readable.
   *
   * @param username - The user's username
   * @param data - Card data
   * @returns Safe card object or null if user not found
   */
  async create(
    username: string,
    data: CreateCardType
  ): Promise<{
    id: string;
    cardholderName: string;
    lastFour: string;
    expiryDate: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    // Verify user exists
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user[0]) return null;

    const lastFour = data.cardNumber.slice(-4);

    const [card] = await db
      .insert(creditCards)
      .values({
        userId: user[0].id,
        cardholderName: data.cardholderName,
        lastFour,
        cardNumberHash: await hash(data.cardNumber),
        expiryDate: data.expiryDate,
        cvvHash: await hash(data.cvv),
      })
      .returning({
        id: creditCards.id,
        cardholderName: creditCards.cardholderName,
        lastFour: creditCards.lastFour,
        expiryDate: creditCards.expiryDate,
        createdAt: creditCards.createdAt,
        updatedAt: creditCards.updatedAt,
      });

    return card || null;
  },
};
