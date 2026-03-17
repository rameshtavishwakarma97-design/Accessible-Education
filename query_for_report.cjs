const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually read .env if it exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.error('Error reading .env:', err);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runQuery() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT title, publish_status, transcript_status, simplified_status, 
             audio_status, high_contrast_status 
      FROM content_items 
      ORDER BY created_at DESC 
      LIMIT 3;
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

runQuery();
