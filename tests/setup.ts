import { beforeEach } from 'bun:test';
import { clearAllTables } from '@/shared/db/testSeed';

beforeEach(async () => {
  await clearAllTables();
});
