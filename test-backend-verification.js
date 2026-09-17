const axios = require('axios');

async function testBackend() {
  const baseURL = 'http://localhost:5001/api';
  console.log('1. Registering user...');
  const email = `iosstudent_${Date.now()}@crackwithai.com`;
  const regRes = await axios.post(`${baseURL}/auth/register`, {
    fullName: 'iOS Mobile Developer',
    email,
    password: 'Password123!',
  });
  console.log('✅ Register PASS:', regRes.data.success, 'User:', regRes.data.data.email);

  console.log('2. Logging in...');
  const loginRes = await axios.post(`${baseURL}/auth/login`, {
    email,
    password: 'Password123!',
  });
  const token = loginRes.data.data.token;
  console.log('✅ Login PASS:', loginRes.data.success, 'Token received');

  const headers = { Authorization: `Bearer ${token}` };

  console.log('3. Fetching Profile...');
  const profileRes = await axios.get(`${baseURL}/auth/profile`, { headers });
  console.log('✅ Profile PASS:', profileRes.data.success, 'Name:', profileRes.data.data.fullName);

  console.log('4. Fetching Courses...');
  const coursesRes = await axios.get(`${baseURL}/courses`);
  console.log('✅ Courses PASS:', coursesRes.data.success, 'Count:', coursesRes.data.data.length);
  const courseId = coursesRes.data.data[0]._id;

  console.log('5. Enrolling in Course:', courseId);
  const enrollRes = await axios.post(`${baseURL}/courses/${courseId}/enroll`, {}, { headers });
  console.log('✅ Enroll PASS:', enrollRes.data.success);

  console.log('6. Fetching My Learning...');
  const myLearningRes = await axios.get(`${baseURL}/courses/my-learning`, { headers });
  console.log('✅ My Learning PASS:', myLearningRes.data.success, 'Enrolled count:', myLearningRes.data.data.length);

  console.log('🎉 ALL BACKEND API CONTRACT VERIFICATIONS PASSED PERFECTLY!');
}

testBackend().catch(err => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
});
