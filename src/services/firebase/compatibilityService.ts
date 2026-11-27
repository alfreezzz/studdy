import type {
    DiscoverableStudyIntent,
    RankedStudyIntent,
    StudyIntent,
} from "@/types/study-intent";

const WEIGHTS = {
  course: 30,
  topic: 20,
  type: 25,
  mode: 10,
  schedule: 15,
};

const normalize = (value: string) => value.trim().toLowerCase();

const calculateCourseScore = (a: StudyIntent, b: StudyIntent): number => {
  return normalize(a.courseName) === normalize(b.courseName) ? 100 : 0;
};

const calculateTopicScore = (a: StudyIntent, b: StudyIntent): number => {
  const topicA = normalize(a.topic);
  const topicB = normalize(b.topic);

  if (topicA === topicB) return 100;

  if (topicA.includes(topicB) || topicB.includes(topicA)) {
    return 75;
  }

  return 0;
};

const calculateTypeScore = (a: StudyIntent, b: StudyIntent): number => {
  if (a.type !== b.type) return 0;

  if (a.type === "peer_mentor") {
    return a.mentorDirection !== b.mentorDirection ? 100 : 0;
  }

  return 100;
};

const calculateModeScore = (a: StudyIntent, b: StudyIntent): number => {
  if (
    a.preferredMode === "both" ||
    b.preferredMode === "both" ||
    a.preferredMode === b.preferredMode
  ) {
    return 100;
  }

  return 0;
};

const calculateScheduleScore = (a: StudyIntent, b: StudyIntent): number => {
  const scheduleA = new Set(a.preferredSchedule);
  const scheduleB = new Set(b.preferredSchedule);

  const intersection = [...scheduleA].filter((item) =>
    scheduleB.has(item),
  ).length;

  const union = new Set([...scheduleA, ...scheduleB]).size;

  if (union === 0) return 0;

  return (intersection / union) * 100;
};

export const calculateCompatibility = (
  current: StudyIntent,
  candidate: DiscoverableStudyIntent,
): number => {
  const other = candidate;

  const score =
    calculateCourseScore(current, other) * WEIGHTS.course +
    calculateTopicScore(current, other) * WEIGHTS.topic +
    calculateTypeScore(current, other) * WEIGHTS.type +
    calculateModeScore(current, other) * WEIGHTS.mode +
    calculateScheduleScore(current, other) * WEIGHTS.schedule;

  return Math.round(score / 100);
};

export const rankStudyIntents = (
  current: StudyIntent,
  candidates: DiscoverableStudyIntent[],
): RankedStudyIntent[] => {
  return [...candidates]
    .map((candidate) => ({
      ...candidate,
      compatibilityScore: calculateCompatibility(current, candidate),
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
