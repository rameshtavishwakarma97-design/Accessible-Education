import { db } from "../server/db";
import { contentItems } from "../shared/schema";

async function main() {
  try {
    const items = await db.select({
      id: contentItems.id,
      title: contentItems.title,
      courseOfferingId: contentItems.courseOfferingId,
      publishStatus: contentItems.publishStatus
    }).from(contentItems);
    
    console.log(JSON.stringify(items, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
