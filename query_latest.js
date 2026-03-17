import { db } from "./server/db.js";
import { contentItems } from "./shared/schema.js";
import { desc } from "drizzle-orm";

async function queryLatest() {
  try {
    const results = await db.select({
      id: contentItems.id,
      title: contentItems.title,
      publishStatus: contentItems.publishStatus,
      availableFormats: contentItems.availableFormats
    }).from(contentItems).orderBy(desc(contentItems.createdAt)).limit(1);
    
    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error("Query failed:", e);
  }
}

queryLatest();
