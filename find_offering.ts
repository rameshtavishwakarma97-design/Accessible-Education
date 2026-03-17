
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function findOffering() {
  try {
    const result = await db.execute(sql`
      SELECT id FROM course_offerings LIMIT 1;
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error executing query:", error);
    process.exit(1);
  }
}

findOffering();
