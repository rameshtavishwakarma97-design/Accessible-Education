import { chromium } from '@playwright/test';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'http://localhost:54321';
const PASS = 'password123';
const STUDENT_EMAIL = 'maya.sharma@university.edu';
const TEACHER_EMAIL = 'anand.rao@university.edu';
const ADMIN_EMAIL = 'priya.patel@university.edu';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  
  console.log('Starting screenshot capture...');

  // --- TEACHER FLOW ---
  const teacherPage = await context.newPage();
  await teacherPage.goto(BASE_URL + '/login');
  await teacherPage.fill('[data-testid="input-email"]', TEACHER_EMAIL);
  await teacherPage.fill('[data-testid="input-password"]', PASS);
  await teacherPage.click('[data-testid="button-sign-in"]');
  await teacherPage.waitForURL('**/teacher/dashboard');
  console.log('Logged in as Teacher');

  // 1. Teacher Upload Modal (Step 3)
  await teacherPage.click('[data-testid^="card-course-"]');
  await teacherPage.waitForURL('**/teacher/courses/**');
  await teacherPage.click('[data-testid="button-upload-content"]');
  await teacherPage.fill('[data-testid="input-content-title"]', 'Screenshot Test File');
  await teacherPage.click('[data-testid="button-upload-next"]'); // Step 1 -> 2
  await teacherPage.click('[data-testid="button-upload-next"]'); // Step 2 -> 3
  await teacherPage.waitForSelector('text=Drop file here or click to browse');
  await teacherPage.screenshot({ path: 'image_1.png' });
  console.log('Captured image_1.png');
  await teacherPage.keyboard.press('Escape'); // Close modal

  // 6. Delete Impact Modal
  await teacherPage.click('[data-testid^="button-delete-"]');
  await teacherPage.waitForSelector('role=dialog');
  await teacherPage.screenshot({ path: 'image_6.png' });
  console.log('Captured image_6.png');
  await teacherPage.keyboard.press('Escape'); // Close modal

  // 4. Teacher Conversion Queue
  await teacherPage.goto(BASE_URL + '/teacher/conversions');
  await teacherPage.waitForSelector('[data-testid^="row-job-"]', { timeout: 15000 });
  await teacherPage.click('[data-testid^="row-job-"]');
  await teacherPage.waitForSelector('text=Approve', { timeout: 10000 });
  await teacherPage.screenshot({ path: 'image_4.png' });
  console.log('Captured image_4.png');


  // --- STUDENT FLOW ---
  const studentPage = await context.newPage();
  await studentPage.goto(BASE_URL + '/login');
  await studentPage.fill('[data-testid="input-email"]', STUDENT_EMAIL);
  await studentPage.fill('[data-testid="input-password"]', PASS);
  await studentPage.click('[data-testid="button-sign-in"]');
  await studentPage.waitForURL('**/student/dashboard');
  console.log('Logged in as Student');

  // 7. Student Dashboard
  await studentPage.screenshot({ path: 'image_7.png' });
  console.log('Captured image_7.png');

  // 2. Student Content Viewer with format dropdown open
  await studentPage.click('[data-testid^="row-content-"]');
  await studentPage.waitForURL('**/student/content/**');
  await studentPage.click('[data-testid="select-format"]');
  await studentPage.waitForSelector('[role="listbox"]');
  await studentPage.screenshot({ path: 'image_2.png' });
  console.log('Captured image_2.png');


  // --- ADMIN FLOW ---
  const adminPage = await context.newPage();
  await adminPage.goto(BASE_URL + '/login');
  await adminPage.fill('[data-testid="input-email"]', ADMIN_EMAIL);
  await adminPage.fill('[data-testid="input-password"]', PASS);
  await adminPage.click('[data-testid="button-sign-in"]');
  await adminPage.waitForURL('**/admin/dashboard');
  console.log('Logged in as Admin');

  // 5. Admin Enrollment Dashboard
  await adminPage.goto(BASE_URL + '/admin/enrollment');
  await adminPage.waitForSelector('[data-testid="tabs-enrollment"]');
  await adminPage.screenshot({ path: 'image_5.png' });
  console.log('Captured image_5.png');


  // --- 3. DB Query Screenshot ---
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8');
      const match = env.match(/DATABASE_URL=(.*)/);
      if (match) dbUrl = match[1].trim();
    }
  }

  const pool = new Pool({ connectionString: dbUrl });
  const dbRes = await pool.query(`
    SELECT title, publish_status, transcript_status, simplified_status, 
           audio_status, high_contrast_status 
    FROM content_items 
    ORDER BY created_at DESC 
    LIMIT 2;
  `);
  await pool.end();

  const html = `
    <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 20px; background: white; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h2>DB Query Result: Recent Content Items</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Publish Status</th>
            <th>Transcript</th>
            <th>Simplified</th>
            <th>Audio</th>
            <th>High Contrast</th>
          </tr>
        </thead>
        <tbody>
          ${dbRes.rows.map(row => `
            <tr>
              <td>${row.title}</td>
              <td>${row.publish_status}</td>
              <td>${row.transcript_status}</td>
              <td>${row.simplified_status}</td>
              <td>${row.audio_status}</td>
              <td>${row.high_contrast_status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  const dbPage = await context.newPage();
  await dbPage.setContent(html);
  await dbPage.screenshot({ path: 'image_3.png' });
  console.log('Captured image_3.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
