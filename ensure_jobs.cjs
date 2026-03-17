const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env reading
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  const match = env.match(/DATABASE_URL=(.*)/);
  if (match) dbUrl = match[1].trim();
}

async function run() {
  const pool = new Pool({ connectionString: dbUrl });
  try {
    const res = await pool.query('SELECT count(*) FROM conversion_jobs');
    console.log('Jobs count:', res.rows[0].count);
    if (res.rows[0].count === '0') {
      console.log('No jobs found. Seeding one.');
      // Get a course offering and a content item to link it to
      const coRes = await pool.query('SELECT id FROM course_offerings LIMIT 1');
      const ciRes = await pool.query('SELECT id, title FROM content_items LIMIT 1');
      if (coRes.rows.length > 0 && ciRes.rows.length > 0) {
        await pool.query(`
          INSERT INTO conversion_jobs (content_id, course_offering_id, content_title, format_type, status, tier)
          VALUES ($1, $2, $3, 'simplified', 'ready_for_review', 2)
        `, [ciRes.rows[0].id, coRes.rows[0].id, ciRes.rows[0].title]);
        console.log('Seeded a conversion job.');
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
