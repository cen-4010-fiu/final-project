import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connect to our docker container
const client = postgres(process.env.DATABASE_URL!);

// Export our client for querying across the application
export const db = drizzle(client, { schema });
