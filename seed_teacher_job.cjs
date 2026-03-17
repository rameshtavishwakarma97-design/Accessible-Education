const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  const match = env.match(/DATABASE_URL=(.*)/);
  if (match) dbUrl = match[1].trim();
}

async function run() {
  const pool = new Pool({ connectionString: dbUrl });
  try {
    const teacherRes = await pool.query("SELECT id FROM users WHERE email = 'anand.rao@university.edu'");
    const teacherId = teacherRes.rows[0].id;
    
    const coRes = await pool.query("SELECT id FROM course_offerings WHERE teachers @> $1", [JSON.stringify([{teacherId}])]);
    if (coRes.rows.length === 0) {
       // If no courses found, assign him one
       const someCo = await pool.query("SELECT id FROM course_offerings LIMIT 1");
       await pool.query("UPDATE course_offerings SET teachers = $1 WHERE id = $2", [JSON.stringify([{teacherId, sectionNames: ['A'], assignedAt: new Date().toISOString()}]), someCo.rows[0].id]);
       coRes.rows = [someCo.rows[0]];
    }
    
    const coId = coRes.rows[0].id;
    const jobRes = await pool.query("SELECT id FROM conversion_jobs WHERE course_offering_id = $1", [coId]);
    if (jobRes.rows.length === 0) {
       // Seed a job for his course
       const ciRes = await pool.query("SELECT id, title FROM content_items WHERE course_offering_id = $1 LIMIT 1", [coId]);
       if (ciRes.rows.length > 0) {
         await pool.query(`
           INSERT INTO conversion_jobs (content_id, course_offering_id, content_title, format_type, status, tier)
           VALUES ($1, $2, $3, 'simplified', 'ready_for_review', 2)
         `, [ciRes.rows[0].id, coId, ciRes.rows[0].title]);
         console.log('Seeded job for teacher.');
       }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
