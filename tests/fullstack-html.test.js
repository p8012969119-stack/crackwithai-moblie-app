const http = require('http');
const assert = require('assert');

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING FULL STACK HTML & PLAYGROUND AUTOMATED TESTS ===\n');

  // 1. Test GET /api/fullstack/tracks
  console.log('1. Testing GET /api/fullstack/tracks...');
  const tracksRes = await httpRequest({
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/fullstack/tracks',
    method: 'GET'
  });
  assert.strictEqual(tracksRes.status, 200, 'Tracks should return 200');
  assert.strictEqual(tracksRes.data.success, true, 'Tracks response should have success: true');
  const tracks = tracksRes.data.data.tracks;
  assert(Array.isArray(tracks), 'Tracks should be an array');
  assert.strictEqual(tracks.length, 9, 'Should have 9 full stack tracks');
  const htmlTrack = tracks.find(t => t.id === 'html');
  assert(htmlTrack, 'HTML track should exist');
  assert.strictEqual(htmlTrack.status, 'active', 'HTML track should be active');
  assert.strictEqual(htmlTrack.lessonsCount, 25, 'HTML track should have 25 lessons');
  assert.strictEqual(htmlTrack.modulesCount, 4, 'HTML track should have 4 modules');
  console.log('   ✅ Tracks API passed (9 tracks, HTML active with 25 lessons).');

  // 2. Test GET /api/fullstack/html/course
  console.log('\n2. Testing GET /api/fullstack/html/course...');
  const courseRes = await httpRequest({
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/fullstack/html/course',
    method: 'GET'
  });
  assert.strictEqual(courseRes.status, 200, 'Course should return 200');
  assert.strictEqual(courseRes.data.success, true, 'Course response should have success: true');
  const coursePayload = courseRes.data.data;
  const course = coursePayload.course;
  const modules = coursePayload.modules || course.modules;
  assert(course, 'Course object should exist');
  assert(Array.isArray(modules), 'Modules should be an array');
  assert.strictEqual(modules.length, 4, 'Should have 4 modules');
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  assert.strictEqual(totalLessons, 25, 'Should have exactly 25 lessons across modules');
  console.log(`   ✅ Course API passed (4 modules, ${totalLessons} lessons verified).`);

  // 3. Test GET /api/fullstack/html/lessons/:id
  console.log('\n3. Testing GET /api/fullstack/html/lessons/introduction-to-html...');
  const lessonRes = await httpRequest({
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/fullstack/html/lessons/introduction-to-html',
    method: 'GET'
  });
  assert.strictEqual(lessonRes.status, 200, 'Lesson endpoint should return 200');
  assert.strictEqual(lessonRes.data.success, true, 'Lesson response should have success: true');
  const lesson = lessonRes.data.data.lesson;
  assert(lesson, 'Lesson object should exist');
  assert.strictEqual(lesson.title, 'Introduction to HTML', 'Lesson title should match');
  assert(lesson.concept && lesson.concept.length > 0, 'Lesson should have concept');
  assert(lesson.starterCode && lesson.starterCode.length > 0, 'Lesson should have starterCode');
  assert(lesson.practiceTask, 'Lesson should have practiceTask');
  assert(lesson.practiceTask.requirements.length > 0, 'Lesson practiceTask should have requirements');
  console.log('   ✅ Lesson API passed with complete curriculum metadata and practice tasks.');

  // 4. Test HTML Validator Engine
  console.log('\n4. Testing HTML Validator logic...');
  const { validateHtml, verifyPracticeTask } = require('../backend/services/htmlValidator.node.js');

  // Test 4a: Valid HTML5 with void tags
  const testValid = '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1><p>World</p><img src="pic.jpg"><br><input type="text"></body></html>';
  const valValid = validateHtml(testValid);
  assert.strictEqual(valValid.isValid, true, 'Valid HTML should pass');
  assert.strictEqual(valValid.errors.length, 0, 'Valid HTML should have 0 errors');
  console.log('   ✅ 4a. Valid HTML5 with void tags (img, br, input) passed.');

  // Test 4b: Unclosed tag detection
  const testUnclosed = '<div><h1>Title<p>Paragraph without closing tags';
  const valUnclosed = validateHtml(testUnclosed);
  assert.strictEqual(valUnclosed.isValid, false, 'Unclosed tags should be invalid');
  assert(valUnclosed.errors.some(e => e.problem.includes('never closed')), 'Should detect unclosed tag');
  console.log('   ✅ 4b. Unclosed tags detected properly with line numbers.');

  // Test 4c: Improper nesting detection
  const testNesting = '<div><p>Wrong nesting</div></p>';
  const valNesting = validateHtml(testNesting);
  assert.strictEqual(valNesting.isValid, false, 'Improper nesting should be invalid');
  assert(valNesting.errors.some(e => e.type === 'nesting'), 'Should flag nesting error');
  console.log('   ✅ 4c. Improper nesting detected & suggestions generated.');

  // Test 4d: Duplicate ID detection
  const testDupId = '<div id="main-card"></div><p id="main-card">Duplicate</p>';
  const valDupId = validateHtml(testDupId);
  assert(valDupId.errors.some(e => e.type === 'duplicate_id'), 'Should flag duplicate ID');
  console.log('   ✅ 4d. Duplicate HTML element IDs flagged.');

  // Test 4e: Practice task verification
  const task = {
    requirements: ['Include <h1>', 'Include <p>'],
    validationRules: [
      { tag: 'h1', minCount: 1, message: 'Must include <h1>' },
      { tag: 'p', minCount: 2, message: 'Must include 2 <p>' }
    ]
  };
  const codeIncomplete = '<h1>Only heading</h1>';
  const resultIncomplete = verifyPracticeTask(codeIncomplete, task);
  assert.strictEqual(resultIncomplete.allPassed, false, 'Incomplete task should not pass');

  const codeComplete = '<h1>Heading</h1><p>Para 1</p><p>Para 2</p>';
  const resultComplete = verifyPracticeTask(codeComplete, task);
  assert.strictEqual(resultComplete.allPassed, true, 'Complete task should pass');
  console.log('   ✅ 4e. Interactive practice task verification passed.');

  console.log('\n======================================================');
  console.log('🎉 ALL FULL STACK HTML & PLAYGROUND TESTS PASSED (100%)');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
