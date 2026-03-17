import { db } from "./server/db.js";
import { contentItems } from "./shared/schema.js";
import { eq } from "drizzle-orm";

async function queryContent() {
  try {
    const results = await db.select({
      title: contentItems.title,
      publishStatus: contentItems.publishStatus,
      availableFormats: contentItems.availableFormats
    }).from(contentItems).where(eq(contentItems.title, "Retest Rules PDF"));
    
    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error("Query failed:", e);
  }
}

queryContent();
