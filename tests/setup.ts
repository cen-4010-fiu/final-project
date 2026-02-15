/**
 * Test Setup
 *
 * Global setup that runs before each test file.
 */

import { beforeEach } from 'bun:test';
import { db } from '@/shared/db/client';
import { users } from '@/shared/db/schema';

/**
 * Reset relevant tables before each test
 */
beforeEach(async () => {
  await db.delete(users);
});
