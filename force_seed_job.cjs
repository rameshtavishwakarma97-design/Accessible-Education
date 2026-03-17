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
    const tRes = await pool.query("SELECT id, name FROM users WHERE email = 'anand.rao@university.edu'");
    if (tRes.rows.length === 0) { console.error('Teacher not found'); return; }
    const teacherId = tRes.rows[0].id;
    const teacherName = tRes.rows[0].name;

    // Find a course offering and force this teacher onto it
    const coRes = await pool.query("SELECT id FROM course_offerings LIMIT 1");
    const coId = coRes.rows[0].id;
    await pool.query("UPDATE course_offerings SET teachers = $1 WHERE id = $2", [JSON.stringify([{teacherId, sectionNames: ['A'], assignedAt: new Date().toISOString()}]), coId]);
    
    // Create a content item for this offering
    const ciRes = await pool.query(`
      INSERT INTO content_items (course_offering_id, owner_teacher_id, title, type, publish_status)
      VALUES ($1, $2, 'Screenshot Evidence Content', 'pdf', 'converting')
      RETURNING id, title
    `, [coId, teacherId]);
    const ciId = ciRes.rows[0].id;
    const ciTitle = ciRes.rows[0].title;

    // Create a conversion job for it
    await pool.query(`
      INSERT INTO conversion_jobs (content_id, course_offering_id, content_title, teacher_name, format_type, status, tier)
      VALUES ($1, $2, $3, $4, 'simplified', 'ready_for_review', 2)
    `, [ciId, coId, ciTitle, teacherName]);

    console.log('Successfully seeded content and job for teacher Anand Rao');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
