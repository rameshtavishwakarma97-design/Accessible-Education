import { storage } from "./server/storage.js";
import { eq } from "drizzle-orm";
import { contentItems } from "./shared/schema.js";
import { db } from "./server/db.js";

async function simulate() {
  try {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.title, "Retest Rules PDF"));
    if (!item) return;

    console.log(`Simulating completion for item: ${item.id}`);
    
    await storage.updateContentItem(item.id, { 
        publishStatus: "published",
        conversionProgress: { tier1: "completed", tier2: "completed" },
        availableFormats: {
            transcript: { path: "fake/path/transcript.txt", status: "completed" },
            simplified: { path: "fake/path/simplified.txt", status: "completed" },
            audio: { path: "fake/path/audio.mp3", status: "completed" }
        },
        formats: ["original", "transcript", "simplified", "audio"]
    });
    
    console.log("Status updated to published with formats");
  } catch (e) {
    console.error("Simulation failed:", e);
  }
}

simulate();
