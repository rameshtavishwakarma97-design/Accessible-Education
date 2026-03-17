import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Use WebSocket constructor for Node.js (connects over port 443, not 5432)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Prevent unhandled pool errors from crashing the process
pool.on("error", (err: Error) => {
  console.error("Unexpected database pool error:", err.message);
});

export const db = drizzle(pool, { schema });
