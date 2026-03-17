import { storage } from "./server/storage.js";
import { eq } from "drizzle-orm";
import { contentItems } from "./shared/schema.js";
import { db } from "./server/db.js";

async function trigger() {
  try {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.title, "Retest Rules PDF"));
    if (!item) {
      console.log("Item not found");
      return;
    }

    console.log(`Triggering conversion for item: ${item.id}`);
    
    // Simulate what the route would do if it actually enqueued
    // Since there's no worker, we'll see if we can at least update the status
    await storage.updateContentItem(item.id, { 
        publishStatus: "converting",
        conversionProgress: { tier1: "in_progress", tier2: "in_progress" }
    });
    
    console.log("Status updated to converting");
  } catch (e) {
    console.error("Trigger failed:", e);
  }
}

trigger();
