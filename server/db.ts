import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const isNeon = process.env.DATABASE_URL.includes("neon.tech");

let dbInstance: any;

if (isNeon) {
  // Config specific to Neon's WebSocket-based connection
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.on("error", (err: Error) => console.error("Neon database pool error:", err.message));
  dbInstance = drizzleNeon(pool, { schema });
  console.log("[DB] Using Neon Serverless driver over WebSockets");
} else {
  // Standard Postgres driver for other providers like Railway or local
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  pool.on("error", (err: Error) => console.error("Standard database pool error:", err.message));
  dbInstance = drizzlePg(pool, { schema });
  console.log("[DB] Using standard Node-Postgres driver");
}

export const db = dbInstance;
