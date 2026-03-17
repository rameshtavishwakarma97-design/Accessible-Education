import fs from 'fs';
import path from 'path';

const ids = [
  "199d5770-9d53-452f-8a46-324cd4cf9fda",
  "6147a314-2352-4fc5-abce-19a03fa77afc"
];

ids.forEach(id => {
  const dir = path.join(process.cwd(), 'uploads', 'converted', id);
  console.log(`Checking ID: ${id}`);
  console.log(`  Directory exists: ${fs.existsSync(dir)}`);
  if (fs.existsSync(dir)) {
    console.log(`  Files: ${fs.readdirSync(dir).join(', ')}`);
  }
});
