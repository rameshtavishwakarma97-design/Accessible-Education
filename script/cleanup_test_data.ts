import { db } from "../server/db";
import { contentItems, conversionJobs, contentProgress } from "../shared/schema";
import { eq, or, like } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function cleanup() {
  try {
    console.log("Starting cleanup of automated test scraps...");
    
    // Find all content items that look like test scraps
    // We'll search for 'test', 'automated', '43grg45', 'cdcdcv'
    const scraps = await db.select().from(contentItems).where(
      or(
        like(contentItems.title, "%Test%"),
        like(contentItems.title, "%Automated%"),
        like(contentItems.title, "43grg45"),
        like(contentItems.title, "cdcdcv")
      )
    );
    
    console.log(`Found ${scraps.length} scrap items to delete.`);
    
    for (const item of scraps) {
      console.log(`Deleting scrap: ${item.title} (ID: ${item.id})`);
      
      // 1. Delete associated conversion jobs
      await db.delete(conversionJobs).where(eq(conversionJobs.contentId, item.id));
      
      // 2. Delete associated progress
      await db.delete(contentProgress).where(eq(contentProgress.contentId, item.id));
      
      // 3. Delete the content item itself
      await db.delete(contentItems).where(eq(contentItems.id, item.id));
      
      // 4. Delete the original file if it exists localy
      if (item.originalFilename) {
          // This is harder to track but we can try to find files in uploads/
          // based on the timestamp prefix
      }
      
      // 5. Delete the converted directory
      const convertedDir = path.join(process.cwd(), 'uploads', 'converted', item.id);
      if (fs.existsSync(convertedDir)) {
          console.log(`Removing directory: ${convertedDir}`);
          fs.rmSync(convertedDir, { recursive: true, force: true });
      }
    }
    
    // Also clean up loose files in uploads/ that match the test pattern
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
        if (file.includes('automated-test-content.txt') || file.includes('test-upload.txt')) {
            const filePath = path.join(uploadsDir, file);
            console.log(`Deleting file: ${filePath}`);
            fs.unlinkSync(filePath);
        }
    }

    console.log("Cleanup completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
