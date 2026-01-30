import { beforeEach } from 'bun:test';
import { db, todos } from '@/shared/db';

// FIXME: I'm resetting the database for these dummy tests, but we shouldn't do this at all long term
beforeEach(async () => {
  await db.delete(todos);
});
