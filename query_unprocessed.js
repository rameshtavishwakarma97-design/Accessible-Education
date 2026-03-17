import { db } from './server/db.js';
import { contentItems } from './shared/schema.js';
import { ilike, or } from 'drizzle-orm';

async function run() {
  const results = await db.select().from(contentItems).where(
    or(
      ilike(contentItems.title, '%43147'),
      ilike(contentItems.title, '%20773')
    )
  );
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
