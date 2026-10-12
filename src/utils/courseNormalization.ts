import { HtmlCourse, HtmlModule, HtmlLesson } from '../types/fullstack';
import { getCourseForTech } from '../data/fullstackHtmlData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cwa_course_cache_';
const memoryCache = new Map<string, HtmlCourse>();

/**
 * Normalizes course data and strips any duplicate modules or duplicate lessons.
 * Ensures consistent IDs, order numbers, and total counters for fast 60fps rendering.
 */
export function normalizeCourse(rawCourse: any): HtmlCourse {
  if (!rawCourse) {
    return {
      _id: 'unknown',
      id: 'unknown',
      title: 'Course',
      slug: 'course',
      description: '',
      category: 'Full Stack',
      level: 'Beginner',
      duration: 120,
      modules: [],
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
    };
  }

  const seenModuleKeys = new Set<string>();
  const cleanModules: HtmlModule[] = [];

  const rawModules: any[] = Array.isArray(rawCourse.modules) ? rawCourse.modules : [];

  for (let mIdx = 0; mIdx < rawModules.length; mIdx++) {
    const rawMod = rawModules[mIdx];
    if (!rawMod) continue;

    const modKey = (rawMod.slug || rawMod._id || rawMod.id || rawMod.title || `mod-${mIdx}`)
      .toString()
      .toLowerCase()
      .trim();

    if (seenModuleKeys.has(modKey)) {
      continue; // Skip duplicate module
    }
    seenModuleKeys.add(modKey);

    const modId = (rawMod._id || rawMod.id || `mod-${mIdx}`).toString();
    const modSlug = (rawMod.slug || `module-${mIdx + 1}`).toString();
    const modTitle = rawMod.title || `Module ${mIdx + 1}`;
    const modOrder = typeof rawMod.order === 'number' ? rawMod.order : mIdx + 1;

    // Deduplicate and normalize lessons within this module
    const seenLessonKeys = new Set<string>();
    const cleanLessons: HtmlLesson[] = [];
    const rawLessons: any[] = Array.isArray(rawMod.lessons) ? rawMod.lessons : [];

    for (let lIdx = 0; lIdx < rawLessons.length; lIdx++) {
      const rawLesson = rawLessons[lIdx];
      if (!rawLesson) continue;

      const lessonKey = (rawLesson.slug || rawLesson._id || rawLesson.id || rawLesson.title || `les-${lIdx}`)
        .toString()
        .toLowerCase()
        .trim();

      if (seenLessonKeys.has(lessonKey)) {
        continue; // Skip duplicate lesson
      }
      seenLessonKeys.add(lessonKey);

      const lesId = (rawLesson._id || rawLesson.id || `les-${mIdx}-${lIdx}`).toString();
      const lesSlug = (rawLesson.slug || `lesson-${mIdx + 1}-${lIdx + 1}`).toString();
      const lesTitle = rawLesson.title || `Lesson ${lIdx + 1}`;
      const lesOrder = typeof rawLesson.order === 'number' ? rawLesson.order : lIdx + 1;

      cleanLessons.push({
        _id: lesId,
        id: lesId,
        slug: lesSlug,
        title: lesTitle,
        order: lesOrder,
        description: rawLesson.description || '',
        learningObjective: rawLesson.learningObjective || '',
        concept: rawLesson.concept || '',
        importantSyntax: rawLesson.importantSyntax || '',
        codeExample: rawLesson.codeExample || '',
        explanation: rawLesson.explanation || rawLesson.codeExplanation || '',
        codeExplanation: rawLesson.codeExplanation || '',
        expectedOutput: rawLesson.expectedOutput || '',
        starterCode: rawLesson.starterCode || '',
        practiceTask: rawLesson.practiceTask || {
          title: lesTitle,
          description: rawLesson.description || lesTitle,
          requirements: [],
          starterCode: rawLesson.starterCode || '',
          expectedOutput: rawLesson.expectedOutput || '',
        },
        moduleId: modId,
        moduleTitle: modTitle,
        courseId: rawCourse._id || rawCourse.id || rawCourse.slug || '',
        completed: Boolean(rawLesson.isCompleted || rawLesson.completed),
      });
    }

    // Sort lessons deterministically by order
    cleanLessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    cleanModules.push({
      _id: modId,
      id: modId,
      slug: modSlug,
      title: modTitle,
      order: modOrder,
      description: rawMod.description || '',
      duration: rawMod.duration || 60,
      courseId: rawCourse._id || rawCourse.id || rawCourse.slug || '',
      lessons: cleanLessons,
    });
  }

  // Sort modules deterministically by order
  cleanModules.sort((a, b) => (a.order || 0) - (b.order || 0));

  const totalLessons = cleanModules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);

  return {
    _id: (rawCourse._id || rawCourse.id || rawCourse.slug || 'course').toString(),
    id: (rawCourse.id || rawCourse._id || rawCourse.slug || 'course').toString(),
    title: rawCourse.title || 'Full Stack Course',
    slug: (rawCourse.slug || 'course').toString(),
    description: rawCourse.description || '',
    category: rawCourse.category || 'Full Stack',
    level: rawCourse.level || 'Beginner to Intermediate',
    duration: rawCourse.duration || 120,
    modules: cleanModules,
    totalLessons: totalLessons > 0 ? totalLessons : (rawCourse.totalLessons || 0),
    completedLessons: rawCourse.completedLessons || 0,
    progressPercentage: rawCourse.progressPercentage || 0,
  };
}

/**
 * Returns instantaneous (0ms) course data using memory cache,
 * falling back to static normalized data so user never waits.
 */
export function getFastCourse(techId: string): HtmlCourse {
  const key = (techId || 'html').toLowerCase().trim();
  const cached = memoryCache.get(key);
  if (cached) {
    return cached;
  }

  const raw = getCourseForTech(key);
  const normalized = normalizeCourse(raw);
  memoryCache.set(key, normalized);
  return normalized;
}

/**
 * Stores fresh API course data into memory and local storage.
 */
export function cacheCourseData(techId: string, course: HtmlCourse): void {
  const key = (techId || 'html').toLowerCase().trim();
  const normalized = normalizeCourse(course);
  memoryCache.set(key, normalized);

  // Async persist to storage in background
  AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(normalized)).catch(() => {});
}

/**
 * Preloads all course data into memory cache for instant navigation.
 */
export function preloadAllCourses(): void {
  const techList = ['html', 'css', 'javascript', 'nodejs', 'expressjs', 'mongodb', 'restapi', 'auth', 'capstone'];
  for (const tech of techList) {
    getFastCourse(tech);
  }
}
