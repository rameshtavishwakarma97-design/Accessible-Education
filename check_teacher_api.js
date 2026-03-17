const BASE_URL = 'http://localhost:54321';
const PASS = 'password123';
const TEACHER_EMAIL = 'anand.rao@university.edu';

async function check() {
  const loginRes = await fetch(BASE_URL + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEACHER_EMAIL, password: PASS })
  });
  const { token } = await loginRes.json();
  
  const jobsRes = await fetch(BASE_URL + '/api/conversions/my-queue', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const jobs = await jobsRes.json();
  console.log('Jobs for teacher:', JSON.stringify(jobs, null, 2));
}
check();
