import {Course} from '../types';
import {ApiError} from './client';

type RecordData = Record<string, unknown>;
export const asRecord = (value: unknown): RecordData | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as RecordData : undefined;
export const courseEntityId = (value: unknown): string => {
  const record = asRecord(value);
  const id = record ? record._id ?? record.id : value;
  return typeof id === 'string' ? id : '';
};
const text = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const number = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;

export function courseRecords(value: unknown): RecordData[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new ApiError('Course data could not be read. Please try again.', undefined, 'INVALID_COURSE_DATA');
  return value.map(asRecord).filter((record): record is RecordData => Boolean(record));
}

// The existing backend returns { success, data: [...] }. Validate at that boundary.
export function normalizeCourses(value: unknown): Course[] {
  const seen = new Set<string>();
  return courseRecords(value).flatMap(record => {
    const id = courseEntityId(record);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{
      ...record,
      _id: id,
      title: text(record.title) ?? 'Untitled course',
      description: text(record.description) ?? '',
      shortDescription: text(record.shortDescription),
      slug: text(record.slug),
      thumbnail: text(record.thumbnail),
      logoUrl: text(record.logoUrl),
      category: text(record.category),
      level: ['beginner', 'intermediate', 'advanced'].includes(String(record.level)) ? record.level as Course['level'] : undefined,
      isFree: typeof record.isFree === 'boolean' ? record.isFree : undefined,
      isLocked: record.isLocked === true,
      price: number(record.price),
      duration: number(record.duration),
      totalEstimatedMinutes: number(record.totalEstimatedMinutes),
      totalLessons: number(record.totalLessons),
      totalLessonsCount: number(record.totalLessonsCount),
      totalModules: number(record.totalModules),
      moduleCount: number(record.moduleCount),
    }];
  });
}

export function mergeCourseLearning(courses: Course[], progress?: RecordData[], certificates?: RecordData[]): Course[] {
  return courses.map(course => {
    const record = progress?.find(item => courseEntityId(item.course) === course._id);
    const certified = certificates?.some(cert => courseEntityId(cert.course) === course._id && cert.status === 'active');
    const percentage = number(record?.progressPercentage);
    return {...course,
      isEnrolled: progress ? Boolean(record) : undefined,
      progressPercentage: percentage === undefined ? undefined : Math.min(100, percentage),
      completedLessonsCount: Array.isArray(record?.completedLessons) ? new Set(record.completedLessons.map(courseEntityId).filter(Boolean)).size : undefined,
      courseCompleted: record?.courseCompleted === true,
      lastAccessedAt: text(record?.lastAccessedAt),
      learningStatus: record?.courseCompleted === true ? 'completed' : record ? 'in_progress' : progress ? 'not_started' : undefined,
      certified,
    };
  });
}
